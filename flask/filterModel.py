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
    
    # relevance_result = relevance_pipeline(content[:512])
    # relevance_score = relevance_result[0]['score']
    # relevance_label = relevance_result[0]['label']
    # is_relevant = relevance_label == 'LABEL_1' and relevance_score > 0.7
    # return is_relevant

# Function to analyze sentiment
def analyze_sentiment(content):
    #result = sentiment_pipeline(content[:512])[0]
    result = sentiment_pipeline(content)[0]
    sentiment = result['label']
    sentiment_confidence = result['score']
    return sentiment, sentiment_confidence

# Flask route to handle POST requests for analysis
@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    results = data.get("results", [])
    association_name = data.get("filterName")
    association_number = data.get("associationNumber")
   
    analysis_results = []

    for result in results:
        title = result['title']
        content = result.get('content', '')
        keyword = result['keyword']

        text_to_analyze, analysis_method = process_texts(title, content)

        # Check relevance using NLP model
        is_relevance, relevance_confidence = analyze_relevance(text_to_analyze, association_name, association_number, keyword)

        # Default values for sentiment
        sentiment_confidence = 0.0
        is_negative = False

        sentiment, sentiment_confidence = analyze_sentiment(text_to_analyze)
        is_negative = sentiment
        
        # if is_relevance:
        #     sentiment, sentiment_confidence = analyze_sentiment(text_to_analyze)
        #     is_negative = sentiment == 'NEGATIVE'
        
     
        # Append analyzed data
        analysis_results.append({
            "title": result['title'],
            "link": result['link'],
            "analysis_method": analysis_method,
            "is_relevance": is_relevance,
            "relevance_confidence": relevance_confidence,
            "is_negative": is_negative,
            "sentiment_confidence": sentiment_confidence,
        })

         # Print each result to verify the values (for debugging)
        print("Result:", analysis_results[-1])
     

    # Determine the final answer based on negative content
    has_negative_content = any(res['is_negative'] for res in analysis_results if res['is_relevance'])
    response = "Negative content found" if has_negative_content else "No negative content"

        # Print the analysis results for debugging
    print({
        "analysis_results": analysis_results,
        "response": response,
    })

    return jsonify({
        "analysis_results": analysis_results,
        "response": response,
    })

if __name__ == '__main__':
    app.run(host='localhost', port=9000, debug=True)