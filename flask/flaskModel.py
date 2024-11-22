from flask import Flask, request, jsonify
import re
from rapidfuzz import fuzz, process
import unicodedata
from transformers import pipeline

app = Flask(__name__)

# Initialize Sentiment Analysis Pipeline
sentiment_pipeline = pipeline("sentiment-analysis", model='dicta-il/dictabert-sentiment')

# Add this near the top with other global variables
NEGATIVE_LEGAL_TERMS = [
    'חשד', 'הונאה', 'הונאת', 'עבירה', 'פלילי', 'פלילית', 'פסק דין', 'אשם',
    'תרמית', 'הלבנת הון', 'שוחד', 'מרמה', 'זיוף', 'גניבה',
    'מעצר', 'עיקול', 'תביעה', 'תלונה', 'חקירה', 'עבריין',
    'הפרה', 'עונש', 'פשע', 'פשיעה', 'הרשעה', 'עבריינות','טרור'
]

def remove_dates(content):
    # Remove common date patterns
    content = re.sub(r'\d{1,2} ב?([א-ת]+)׳? \d{4}', '', content)  # Matches "21 במאי 2023" and "1 באפר׳ 2023"
    content = re.sub(r'\d{1,2}/\d{1,2}/\d{2,4}', '', content)      # Matches "05/08/2015"
    content = re.sub(r'\d{1,2}(-|\.)\d{1,2}(-|\.)\d{2,4}', '', content) # Matches "21.05.2023"
    return content.strip()

def reduce_spaces(content):
    return re.sub(r'\s+', ' ', content).strip()

def normalize_text(content):
    # Replace ellipses and normalize punctuation
    # Normalize Unicode (e.g., convert special Hebrew forms)
    content = unicodedata.normalize('NFKC', content)
    # Remove special symbols but keep important Hebrew punctuation
    content = re.sub(r'[^\w\s.,:()א-ת-/"׳]', '', content)
    # Normalize common Hebrew variations
    content = re.sub(r'״', '"', content)
    content = re.sub(r'׳', "'", content)
    return content.strip()

def split_sentences(text):
    # Replace multiple consecutive spaces with a single space
    text = ' '.join(text.split())
    text = text.replace('...', '.')
    return text

def process_snippet(content):
    content = remove_dates(content)       # Step 1: Remove dates
    content = reduce_spaces(content)      # Step 2: Reduce spaces
    content = normalize_text(content)     # Step 3: Normalize text
    sentences = split_sentences(content)  # Step 4: Split sentences
    return sentences

def check_name_in_text(text, name):
    similarity = fuzz.partial_ratio(name, text)
    score = (similarity / 100) * 30 if similarity >= 80 else 0
    print(f"\n=== Name Match Analysis ===")
    print(f"Text: {text[:100]}...")
    print(f"Name: {name}")
    print(f"Similarity: {similarity}%")
    print(f"Score: {score:.2f}/30")
    return score

    # Check if filter_name appears near variations of עמותה
def check_name_near_association(text, association_name, filter_name):
    words = text.split()
    text_str = ' '.join(words)

    print(f"\n=== Association Proximity Analysis ===")
    print(f"Text: {text_str[:100]}...")
    print(f"Association Name: {association_name}")
    print(f"Filter Name: {filter_name}")

    # First check if (ע"ר) appears right after the name
    # Check for exact association name or filter name with ע"ר variations
    if association_name in text_str or \
       f"{filter_name} (ע\"ר)" in text_str or \
       f"{filter_name} )ע\"ר(" in text_str or \
       f"{filter_name} (ע ר)" in text_str or \
       f"{filter_name} (ע~ר)" in text_str or \
       f"{filter_name} ע\"ר" in text_str:
        print("Found exact match with ע\"ר variation")
        print("Score: 40/40")
        return 40

    # Find positions of name matches
    name_positions = []
    for i, word in enumerate(words):
        similarity = fuzz.partial_ratio(word, filter_name)
        if similarity > 80:
            name_positions.append(i)

    if not name_positions:
        print("No name matches found")
        print("Score: 0/40")
        return 0

    max_score = 0
    
    for name_pos in name_positions:
        # If name appears at start, there are no words before it to check
        if name_pos == 0:
            continue
            
        # Get range of positions before the name to check
        start_pos = name_pos - 5 if name_pos >= 5 else 0
        
        # Check words before the name position
        for i in range(start_pos, name_pos):
            # Skip if there's a sentence break between
            text_between = ' '.join(words[i:name_pos])
            if '.' in text_between:
                continue
                
            word = words[i]
            for variation in association_variations:
                similarity = fuzz.partial_ratio(word, variation)
                if similarity > 85:
                    distance = name_pos - i
                    
                    if distance == 1:
                        score = 35  # Very close
                    elif distance == 2:
                        score = 30  # Close
                    elif distance <= 4:
                        score = 20  # Moderately close
                    else:
                        score = 10  # Further
                    
                    max_score = max(max_score, score)
                    print(f"Found association term '{variation}' at distance {distance}")
                    print(f"Current max score: {max_score}/40")

    print(f"Final association proximity score: {max_score}/40")
    return max_score

def calculate_keyword_score(text_title, text_content):
    print("\n=== Keyword Analysis ===")
    for text in [text_title, text_content]:
        for term in NEGATIVE_LEGAL_TERMS:
            match = process.extractOne(term, [text], scorer=fuzz.partial_ratio)
            if match[1] >= 80:
                print(f"Found negative term: {term}")
                print(f"Similarity: {match[1]}%")
                print("Score: 30/30")
                return 30

    print("No negative term matches found")
    print("Score: 0/30")
    return 0

def contains_negative_legal_terms(text):
    """Check if text contains any negative legal terms using fuzzy matching"""
    if not text:
        return False, None, 0
    
    max_similarity = 0
    matched_term = None
    
    for term in NEGATIVE_LEGAL_TERMS:
        similarity = fuzz.partial_ratio(term, text)
        if similarity > max_similarity:
            max_similarity = similarity
            matched_term = term
    
    # Consider it a match if similarity is over 85%
    if max_similarity >= 85:
        return True, matched_term, max_similarity
    return False, None, max_similarity

def analyze_sentiment(title, content, keyword):
    print("\n=== Sentiment Analysis ===")
    
    print("Title Analysis:")
    title_result = sentiment_pipeline(title[:512])[0]
    title_sentiment = title_result['label']
    title_confidence = title_result['score']
    print(f"- Sentiment: {title_sentiment}")
    print(f"- Confidence: {title_confidence:.2f}")

    content_sentiment = None
    content_confidence = 0
    if content and len(content.strip()) > 0:
        print("\nContent Analysis:")
        content_result = sentiment_pipeline(content[:512])[0]
        content_sentiment = content_result['label'] 
        content_confidence = content_result['score']
        print(f"- Sentiment: {content_sentiment}")
        print(f"- Confidence: {content_confidence:.2f}")

    # Check for negative legal terms
    print("\nNegative Terms Check:")
    title_has_negative, title_term, title_similarity = contains_negative_legal_terms(title)
    content_has_negative, content_term, content_similarity = contains_negative_legal_terms(content)
    
    if title_has_negative:
        print(f"- Title: Found '{title_term}' (similarity: {title_similarity:.2f}%)")
    if content_has_negative:
        print(f"- Content: Found '{content_term}' (similarity: {content_similarity:.2f}%)")

    # Determine overall sentiment with new rules
    final_sentiment = 'Neutral'
    final_confidence = max(title_confidence, content_confidence)

    # Rule 1: Model predicts negative with moderate confidence
    if (title_sentiment == 'Negative' and title_confidence > 0.5) or \
       (content_sentiment == 'Negative' and content_confidence > 0.5):
        final_sentiment = 'Negative'
    
    # Rule 2: Contains negative legal terms with high similarity
    elif title_has_negative or content_has_negative:
        final_sentiment = 'Negative'
        # Boost confidence based on fuzzy match similarity
        term_confidence = max(title_similarity, content_similarity) / 100
        
        # Boost confidence if both model and terms indicate negative
        if (title_sentiment == 'Negative' or content_sentiment == 'Negative'):
            final_confidence = max(final_confidence, term_confidence, 0.8)
        else:
            final_confidence = max(final_confidence, term_confidence)
    
    print("\nFinal Analysis:")
    print(f"- Sentiment: {final_sentiment}")
    print(f"- Confidence: {final_confidence:.2f}")
    return final_sentiment, final_confidence

# Flask route to handle POST requests for analysis
@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        results = data.get("results", [])
        association_name = data.get("associationName")
        filter_name = data.get("filterName")
        association_number = data.get("associationNumber")
        relevant_results = []

        for result in results:
            try:
                print("\n" + "="*50)
                print(f"Analyzing Result: {result['title'][:100]}...")
                print("="*50)
                
                title = result['title']
                content = result['content']
                keyword = result['keyword']

                # Ensure proper encoding of Hebrew text
                title = str(title)
                content = str(content) if content else ''
            
                new_title = process_snippet(title)
                new_content = process_snippet(content)

                title_name_score = check_name_in_text(new_title, filter_name)
                content_name_score = check_name_in_text(new_content, filter_name)
                name_score = max(title_name_score, content_name_score)
            
                if name_score == 0:
                    print("\nSkipping: No name match found")
                    continue

                title_association_score = check_name_near_association(new_title, association_name, filter_name)
                content_association_score = check_name_near_association(new_content, association_name, filter_name)
                association_score = max(title_association_score, content_association_score)

                if association_score == 0:
                    print("\nSkipping: No association proximity match found")
                    continue

                keyword_score = calculate_keyword_score(new_title, new_content)
                
                if keyword_score == 0:
                    print("\nSkipping: No keyword match found")
                    continue
                
                # Calculate total score (max 100)
                total_score = name_score + association_score + keyword_score

                print("\n=== Final Score Breakdown ===")
                print(f"Name Match Score:           {name_score:>6.2f}/30")
                print(f"Association Proximity Score: {association_score:>6.2f}/40")
                print(f"Keyword Match Score:        {keyword_score:>6.2f}/30")
                print("-" * 40)
                print(f"Total Score:                {total_score:>6.2f}/100")
                
                # Get sentiment analysis results
                sentiment, sentiment_confidence = analyze_sentiment(new_title, new_content, keyword)
                
                if sentiment == 'Negative':
                    print("\nResult added to relevant results (Negative sentiment)")
                    relevant_results.append({
                        'title': new_title,
                        'link': result['link'],
                        'content': new_content,
                        'keyword': keyword,
                        'score': total_score,
                        'sentiment_confidence': sentiment_confidence
                    })
                else:
                    print("\nResult skipped (Non-negative sentiment)")

            except Exception as e:
                print(f"\nError processing result: {str(e)}")
                continue  # Skip to next result if there's an error

        # Sort results by score in descending order
        relevant_results.sort(key=lambda x: x['score'], reverse=True)
        
        return jsonify({"analyzeResults": relevant_results})

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({"error": str(e)}), 500

# List of association variations to check
association_variations = ['עמותה', 'עמותת', 'ע"ר', '(ע"ר)', '(ע ר)', '(ע~ר)', ')ע"ר(', 'עמותות', 'לעמותת', 'בעמותת', 'בעמותה', 'העמותה','ארגון']

if __name__ == '__main__':
    app.run(host='localhost', port=9000, debug=True)