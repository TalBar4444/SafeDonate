import requests
from flask import Flask, request, jsonify
from bs4 import BeautifulSoup
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification

app = Flask(__name__)

# Initialize Sentiment Analysis Pipeline
sentiment_pipeline = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")

# Initialize Relevance Classification Pipeline
relevance_tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
relevance_model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased")
relevance_pipeline = pipeline("text-classification", model=relevance_model, tokenizer=relevance_tokenizer)

# Function to fetch content from a URL
def fetch_content(url):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10) 
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, "html.parser")
        paragraphs = soup.find_all("p")
        content = " ".join([p.get_text() for p in paragraphs])
        return content
    
    except requests.RequestException as e:
        print(f"Failed to fetch content from URL: {e}")
        return None

# Function to analyze sentiment
def analyze_sentiment(content):
    result = sentiment_pipeline(content[:512])
    sentiment = result[0]['label']
    return sentiment

# Function to analyze relevance
def analyze_relevance(content, query):
    relevance_result = relevance_pipeline(content[:512])
    relevance_score = relevance_result[0]['score']
    relevance_label = relevance_result[0]['label']
    is_relevant = relevance_label == 'LABEL_1' and relevance_score > 0.7
    return is_relevant

# Flask route to handle POST requests for analysis
@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    results = data.get("results", [])
    association_number = data.get("associationNumber")
    
    response_data = []
    
    for result in results:
        keyword = result.get("keyword")
        links_info = result.get("results", [])

        keyword_data = {"keyword": keyword, "results": []}

        for link_info in links_info:
            link = link_info.get("link")
            title = link_info.get("title")
            
            # Fetch the content of each link
            content = fetch_content(link)
            if content:
                sentiment = analyze_sentiment(content)
                relevance = analyze_relevance(content, query=keyword)

                # Append analyzed data
                keyword_data["results"].append({
                    "title": title,
                    "link": link,
                    "sentiment": sentiment,
                    "relevance": "Relevant" if relevance else "Not Relevant"
                })
            else:
                keyword_data["results"].append({
                    "title": title,
                    "link": link,
                    "sentiment": "Content not available",
                    "relevance": "Content not available"
                })

        response_data.append(keyword_data)
    
     # Add the association number to the response
    response = {
        "results": response_data,
        "associationNumber": association_number
    }
    # Return the analysis results as JSON
    return jsonify(response), 200

if __name__ == '__main__':
    app.run(host='localhost', port=9000, debug=True)