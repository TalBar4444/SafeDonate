#import logging
from flask import Flask, request, jsonify
from bs4 import BeautifulSoup
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification


app = Flask(__name__)

# Initialize Sentiment Analysis Pipeline
sentiment_pipeline = pipeline("sentiment-analysis", model='dicta-il/dictabert-sentiment')

# Initialize Relevance Classification Pipeline
relevance_tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
relevance_model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased")
relevance_pipeline = pipeline("text-classification", model=relevance_model, tokenizer=relevance_tokenizer)
#logging.basicConfig(filename='analysis_results.log', level=logging.DEBUG, format='%(message)s')

# Check if content is empty or contains specific strings
def process_texts(title, content):
    if not content or content in ['denied by modsecurity', 'No content found']:
        text_to_analyze = title
        analysis_method = "title"
    else:
        text_to_analyze = f"{title} {content}"
        analysis_method = "title and content"
    
    return text_to_analyze, analysis_method

# Function to analyze relevance
def analyze_relevance(content, association_name, association_number, keyword, relevance_threshold=0.45):
    query = f"{association_name} {association_number} {keyword}"
    relevance_result = relevance_pipeline(f"{content[:512]} {query}")[0] 
    relevance_confidence = relevance_result['score'] 
    is_relevance = relevance_result['label'] == 'RELEVANT' and relevance_confidence > relevance_threshold
    return is_relevance, relevance_confidence

# Function to analyze sentiment
def analyze_sentiment(title, content, keyword):
    # Analyze title sentiment
    title_result = sentiment_pipeline(title)[0]
    title_sentiment = title_result['label']
    title_confidence = title_result['score']

    # Analyze content sentiment if it exists
    content_sentiment = None
    content_confidence = 0
    if content and len(content.strip()) > 0:
        content_result = sentiment_pipeline(content[:512])[0]
        content_sentiment = content_result['label'] 
        content_confidence = content_result['score']

    # If keyword provided, check if it appears in negative contexts
    keyword_sentiment = None
    if keyword and content:
        # Look for keyword in surrounding context
        keyword_contexts = [s for s in content.split('.') if keyword in s]
        if keyword_contexts:
            keyword_result = sentiment_pipeline('. '.join(keyword_contexts))[0]
            keyword_sentiment = keyword_result['label']

    # Determine overall sentiment
    # Prioritize negative signals
    if (title_sentiment == 'Negative' and title_confidence > 0.6) or \
       (content_sentiment == 'Negative' and content_confidence > 0.6) or \
       keyword_sentiment == 'Negative':
        final_sentiment = 'Negative'
        final_confidence = max(title_confidence, content_confidence)
    else:
        final_sentiment = 'Neutral'
        final_confidence = max(title_confidence, content_confidence)

    return final_sentiment, final_confidence

# Flask route to handle POST requests for analysis
@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        results = data.get("results", [])
        association_name = data.get("filterName")
        association_number = data.get("associationNumber")
        debug_results = []
        analysis_results = []

        for result in results:
            try:
                title = result['title']
                content = result.get('content', '')
                keyword = result['keyword']

                # Ensure proper encoding of Hebrew text
                title = str(title)
                content = str(content) if content else ''

                text_to_analyze, analysis_method = process_texts(title, content)

                # Debug print with safe encoding
                print("Sentiment Analysis Results:")
                print(f"Title: {title.encode('utf-8').decode('utf-8')}")
                print(f"Content: {content.encode('utf-8').decode('utf-8')}")
                
                # Check relevance using NLP model
                is_relevance, relevance_confidence = analyze_relevance(text_to_analyze, association_name, association_number, keyword)

                # Get sentiment analysis results
                sentiment, sentiment_confidence = analyze_sentiment(title, content, keyword)
                
                # Print sentiment analysis results for debugging
                print(f"Sentiment: {sentiment}")
                print(f"Confidence: {sentiment_confidence}")
                print("---")
            
                # Append all analyzed data for printing
                debug_results.append({
                    "title": result['title'],
                    "link": result['link'],
                    "content": result['content'],
                    "analysis_method": analysis_method,
                    "is_relevance": is_relevance,
                    "relevance_confidence": relevance_confidence,
                    "sentiment": sentiment,
                    "sentiment_confidence": sentiment_confidence,
                })
                
                if sentiment == 'Negative':
                    analysis_results.append({
                        "title": result['title'],
                        "link": result['link'],
                        "sentiment": sentiment,
                        "sentiment_confidence": sentiment_confidence,
                    })
                        
            except Exception as e:
                print(f"Error processing result: {str(e)}")
                continue  # Skip to next result if there's an error

        # Filter to only negative results for the response
        debug_results = [res for res in debug_results if res['sentiment'] == 'Negative']

        # Print all analysis results for debugging
        print("Final Analysis Results:")
        print({
            "analysis_results": debug_results,
        })

        return jsonify({
            "analysis_results": analysis_results,  # Return only negative results
        })

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='localhost', port=9000, debug=True)