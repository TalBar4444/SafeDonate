"""
Flask API for analyzing text content related to associations/NPOs.

This module provides functionality to analyze text content for mentions of associations/NPOs
and evaluate the sentiment and relevance of those mentions. It uses natural language processing
and fuzzy string matching to identify associations, legal terms, and analyze sentiment.

Key Features:
- Text preprocessing and normalization
- Name and association detection using fuzzy matching
- Legal term identification near association mentions  
- Sentiment analysis of relevant text segments
- Scoring system for relevance based on multiple factors

The API exposes a single endpoint '/analyze' that accepts POST requests with text content
and returns analysis results including relevance scores and sentiment.

Dependencies:
- Flask
- RapidFuzz
- Transformers
- Unicodedata
- Re
"""

from flask import Flask, request, jsonify
import re
from rapidfuzz import fuzz, process
import unicodedata
from transformers import pipeline

app = Flask(__name__)

# Initialize Sentiment Analysis Pipeline
sentiment_pipeline = pipeline("sentiment-analysis", model='dicta-il/dictabert-sentiment')

NEGATIVE_LEGAL_TERMS = [
    'חשד', 'הונאה', 'הונאת', 'עבירה', 'פלילי', 'פלילית', 'פסק דין', 'אשם', 'התנהלות שאיננה תקינה', 'נאשם',
    'תרמית', 'הלבנת הון', 'שוחד', 'מרמה', 'זיוף', 'גניבה', 'פירוק', 
    'מעצר', 'עיקול', 'תביעה', 'תלונה', 'חקירה', 'עבריין',
    'הפרה', 'עונש', 'פשע', 'פשיעה', 'הרשעה', 'ליקוי', 'טרור'
]
# List of association variations to check
association_variations = ['עמותה', 'עמותת', 'ער', 'עמותות', 'לעמותת', 'בעמותת', 'בעמותה', 'העמותה', 'ארגון']

def remove_hyphens(text):
    """
    Removes hyphens and normalizes whitespace in text.
    Returns cleaned text string.
    """
    text = str(text)
    text = unicodedata.normalize('NFKC', text)
    text = re.sub(r'\s+-\s+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def process_snippet_for_relevance(text):
    """
    Processes text for relevance analysis by removing dates, phone numbers,
    and special characters while preserving meaningful punctuation.
    Returns cleaned text string.
    """
    text = str(text)
    text = unicodedata.normalize('NFKC', text)
    text = re.sub(r'\d{1,2} ב?([א-ת]+)׳? \d{4}', '', text) # Matches "21 במאי 2023" and "1 באפר׳ 2023"
    text = re.sub(r'\d{1,2}/\d{1,2}/\d{2,4}', '', text) # Matches "05/08/2015"
    text = re.sub(r'\d{1,2}(-|\.)\d{1,2}(-|\.)\d{2,4}', '', text) # Matches "21.05.2023"
    text = re.sub(r'(?:\+972-?|0)(?:[23489]|5[0-9]|77)-?\d{7}', '', text)  # Israeli phone numbers
    text = re.sub(r'\d{2,3}-\d{7}', '', text) # Generic phone format   
    text = re.sub(r'\.{3}', '⚡', text) # Replace 3 dots with rare character ⚡
    text = re.sub(r'[^א-תA-Za-z0-9\s⚡]', '', text)
    text = re.sub(r'⚡', '.', text)
    text = re.sub(r'\s+', ' ', text)  
    return text.strip()

def process_snippet_for_sentiment(text):
    """
    Processes text for sentiment analysis by removing dates and normalizing
    punctuation while preserving sentence structure.
    Returns cleaned text string.
    """
    text = re.sub(r'\d{1,2} ב?([א-ת]+)׳? \d{4}', '', text)
    text = re.sub(r'\d{1,2}/\d{1,2}/\d{2,4}', '', text)
    text = re.sub(r'\d{1,2}(-|\.)\d{1,2}(-|\.)\d{2,4}', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    text = unicodedata.normalize('NFKC', text)
    text = re.sub(r'[^\w\s.,:()א-ת/"׳-]', '', text)
    text = re.sub(r'\s+-\s+', ' ', text)
    text = re.sub(r'״', '"', text)
    text = re.sub(r'׳', "'", text)
    return ' '.join(text.split()).replace('...', '.')


def find_name_positions(text, filter_name):
    """
    Finds positions of name matches in text using fuzzy string matching.
    Returns list of tuples containing start and end positions of matches.
    """
    words = text.split()
    name_words = filter_name.split()
    positions = []
    
    for i in range(len(words)):
        if i + len(name_words) > len(words):
            continue
        potential_match = ' '.join(words[i:i + len(name_words)])
        if fuzz.ratio(potential_match, filter_name) >= 85:
            end_pos = i + len(name_words) - 1
            positions.append((i, end_pos))
    return positions


def check_name_near_association(text, association_name, filter_name, name_positions):
    """
    Checks if association terms appear near name mentions in text.
    Returns relevance score based on proximity.
    """
    if association_name in text:
        return 40
    if not name_positions:
        return 0

    words = text.split()
    for start_pos, _ in name_positions:
        check_start = max(0, start_pos - 5)
        for i in range(start_pos, check_start - 1, -1):
            if '.' in ' '.join(words[i:start_pos]):
                continue
            if words[i] in association_variations:
                return get_score_by_distance(start_pos - i)
            for variation in association_variations:
                if fuzz.ratio(words[i], variation) > 85:
                    return get_score_by_distance(start_pos - i)
    return 0

def get_score_by_distance(distance):
    """
    Calculates relevance score based on word distance.
    Returns integer score value.
    """
    if distance == 1: return 35 # Very close
    if distance == 2: return 30 # Close
    if distance <= 4: return 20 # Moderately close
    return 10 # Further


def check_legal_terms_near_name(text_str, name_positions):
    """
    Checks for legal terms appearing near name mentions in text.
    Returns score if legal terms found, 0 otherwise.
    """
    if not name_positions:
        return 0
    words = text_str.split()
    
    for start_pos, end_pos in name_positions:
        for i in range(start_pos - 1, -1, -1):
            word = words[i]
            for term in NEGATIVE_LEGAL_TERMS:
                if fuzz.ratio(word.strip(), term.strip()) > 85:
                    return 25
            if '.' in ' '.join(words[i:start_pos]):
                break
                
        for i in range(end_pos + 1, len(words)):
            word = words[i].rstrip('.')
            for term in NEGATIVE_LEGAL_TERMS:
                if fuzz.ratio(word.strip(), term.strip()) > 85:
                    return 25
            if '.' in ' '.join(words[end_pos:i+1]):
                break
    return 0

def analyze_sentiment(text, negative_score):
    """
    Analyzes sentiment of text using transformer model.
    Returns True if sentiment is negative or neutral with negative context.
    """
    result = sentiment_pipeline(text[:512])[0]
    return result['label'] == 'Negative' or (result['label'] == 'Neutral' and negative_score > 0)

# Flask route to handle POST requests for analysis
@app.route('/analyze', methods=['POST'])
def analyze():
    """
    API endpoint for analyzing text content.
    Accepts POST request with JSON containing text content and association details.
    Returns analysis results including relevance scores and filtered content.
    """
    try:
        data = request.get_json()
        results = data.get("results", [])
        association_name = data.get("associationName")
        filter_name = data.get("filterName")
        
        # Pre-process names once instead of multiple times
        sentiment_filter_name = remove_hyphens(filter_name)
        clean_assoc_name = process_snippet_for_relevance(association_name)
        clean_filter_name = process_snippet_for_relevance(filter_name)
        
        relevant_results = []

        for result in results:
            try:
                title = str(result.get('title', ''))
                content = str(result.get('content', ''))
                if not title and not content:
                    continue

                # Process text once
                new_title = process_snippet_for_relevance(title)
                new_content = process_snippet_for_relevance(content)

                # Check name presence first - if no name found, skip further processing
                title_name_positions = find_name_positions(new_title, clean_filter_name)
                content_name_positions = find_name_positions(new_content, clean_filter_name)
                
                if not title_name_positions and not content_name_positions:
                    continue

                # Calculate name score only if positions were found
                title_name_score = 30 if title_name_positions else 0
                content_name_score = 30 if content_name_positions else 0
                name_score = max(title_name_score, content_name_score)

                # Check association proximity only if name was found
                title_association_score = check_name_near_association(new_title, clean_assoc_name, clean_filter_name, title_name_positions)
                content_association_score = check_name_near_association(new_content, clean_assoc_name, clean_filter_name, content_name_positions)
                association_score = max(title_association_score, content_association_score)

                if association_score == 0:
                    continue

                # Check legal terms only if both name and association were found
                title_legal_terms_score = check_legal_terms_near_name(new_title, title_name_positions)
                content_legal_terms_score = check_legal_terms_near_name(new_content, content_name_positions)
                legal_terms_score = max(title_legal_terms_score, content_legal_terms_score)

                if legal_terms_score == 0:
                    continue

                total_score = name_score + association_score + legal_terms_score

                # Perform sentiment analysis only if all other criteria are met
                title_sentiment = process_snippet_for_sentiment(title)
                content_sentiment = process_snippet_for_sentiment(content)

                title_sentiment_position = find_name_positions(title_sentiment, sentiment_filter_name)
                content_sentiment_position = find_name_positions(content_sentiment, sentiment_filter_name)

                title_sentiment_legal_terms_score = check_legal_terms_near_name(title_sentiment, title_sentiment_position)
                content_sentiment_legal_terms_score = check_legal_terms_near_name(content_sentiment, content_sentiment_position)

                if title_sentiment_legal_terms_score == 0 and content_sentiment_legal_terms_score == 0:
                    continue

                title_sentiment_result = analyze_sentiment(title_sentiment, title_sentiment_legal_terms_score)
                content_sentiment_result = analyze_sentiment(content_sentiment, content_sentiment_legal_terms_score)
                
                if not title_sentiment_result and not content_sentiment_result:
                    continue

                relevant_results.append({
                    'title': title_sentiment,
                    'link': result['link'],
                    'content': content_sentiment,
                    'keyword': result['keyword'],
                    'relevance_score': total_score,
                })

            except Exception as e:
                print(f"Error processing result: {str(e)}")
                continue

        relevant_results.sort(key=lambda x: x['relevance_score'], reverse=True)
        return jsonify({"analyzeResults": relevant_results})

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='localhost', port=9000, debug=True)