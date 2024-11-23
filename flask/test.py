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

# Sample test data
test_data = {
    "results": [
        {
            "title": 'ת"פ 61682/12/14 - מדינת ישראל נגד אברהם ישראל',
            "content": '20 ביולי 2023 — בשנת 2008 או בסמוך לכך, הוקמה עמותת בת בשם "עמותת חזון ישעיה מרכזי חינוך ורווחה", אשר הלכה למעשה נוהלה על ידי הנאשם. יעודה ועיסוקה של העמותה ...',
            "link": "http://example.com",
            "keyword": "פירוק"
        },
        {
            "title": 'הפיקוח על מחירי המזון והפיקוח על מחירי מוצרי חלב ...',
            "content": '... הפרת חוק הפיקוח. במקרים בהן מתקבלות תלונות על מחירי מוצרים שאינם בפיקוח, הן אינן מטופלות במחוזות, כיוון שלמעשה לא מתקיימת הפרה ... ארגון לתת-סיוע הומניטרי ישראלי ...',
            "link": "http://example2.com", 
            "keyword": "הפרה"
        }
    ],
    "associationName": 'חזון ישעיה- מרכזי חינוך ורווחה (ע"ר)',
    "filterName": 'חזון ישעיה- מרכזי חינוך ורווחה',
    "associationNumber": "580454940"
}

def remove_hyphens(text):
    # Convert to string if not already
    text = str(text)
    # Normalize unicode characters
    text = unicodedata.normalize('NFKC', text)
    # Remove standalone hyphens surrounded by spaces
    text = re.sub(r'\s+-\s+', ' ', text)
    # Remove multiple spaces
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def process_snippet_for_relevance(text):
    # Convert to string if not already
    text = str(text)
    # First normalize unicode characters
    text = unicodedata.normalize('NFKC', text)
    # Remove common date patterns
    text = re.sub(r'\d{1,2} ב?([א-ת]+)׳? \d{4}', '', text)  # Matches "21 במאי 2023" and "1 באפר׳ 2023"
    text = re.sub(r'\d{1,2}/\d{1,2}/\d{2,4}', '', text)      # Matches "05/08/2015"
    text = re.sub(r'\d{1,2}(-|\.)\d{1,2}(-|\.)\d{2,4}', '', text) # Matches "21.05.2023"
    # Remove phone numbers in various formats
    text = re.sub(r'(?:\+972-?|0)(?:[23489]|5[0-9]|77)-?\d{7}', '', text)  # Israeli phone numbers
    text = re.sub(r'\d{2,3}-\d{7}', '', text)  # Generic phone format   
    # Replace 3 dots with rare character ⚡
    text = re.sub(r'\.{3}', '⚡', text)
    # Keep only Hebrew letters, English letters, numbers, spaces and our rare character
    text = re.sub(r'[^א-תA-Za-z0-9\s⚡]', '', text)
    # Replace rare character back with single dot
    text = re.sub(r'⚡', '.', text)
    # Remove multiple spaces
    text = re.sub(r'\s+', ' ', text)  
    return text.strip()

# Remove common date patterns
def remove_dates(content):   
    content = re.sub(r'\d{1,2} ב?([א-ת]+)׳? \d{4}', '', content)  # Matches "21 במאי 2023" and "1 באפר׳ 2023"
    content = re.sub(r'\d{1,2}/\d{1,2}/\d{2,4}', '', content)      # Matches "05/08/2015"
    content = re.sub(r'\d{1,2}(-|\.)\d{1,2}(-|\.)\d{2,4}', '', content) # Matches "21.05.2023"
    return content.strip()

def reduce_spaces(content):
    return re.sub(r'\s+', ' ', content).strip()

def normalize_text(content):
    content = unicodedata.normalize('NFKC', content) # Normalize Unicode (e.g., convert special Hebrew forms)
    content = re.sub(r'[^\w\s.,:()א-ת/"׳-]', '', content) # Remove special symbols but keep important Hebrew punctuation and hyphens
    content = re.sub(r'\s+-\s+', ' ', content) # Remove standalone hyphens surrounded by spaces
    content = re.sub(r'״', '"', content) # Normalize common Hebrew variations
    content = re.sub(r'׳', "'", content)
    return content.strip()

def split_sentences(text):
    # Replace multiple consecutive spaces with a single space
    text = ' '.join(text.split())
    text = text.replace('...', '.')
    return text

def process_snippet_for_sentiment(content):
    content = remove_dates(content)       # Step 1: Remove dates
    content = reduce_spaces(content)      # Step 2: Reduce spaces
    content = normalize_text(content)     # Step 3: Normalize text
    sentences = split_sentences(content)  # Step 4: Split sentences
    return sentences

def check_name_in_text(text, name):
    similarity = fuzz.partial_ratio(name, text)
    score = (similarity / 100) * 30 if similarity >= 80 else 0
    print(f"Name match score: {score:.2f}/30, Name: {name}, Text: {text}")
    return score

def find_name_positions(text, filter_name):
    """Find all positions where filter_name appears in text, returning positions of first word
    Args:
        text (str): Text to search in
        filter_name (str): Name to search for
    Returns:
        list: List of positions (indices) where name appearances start"""
    words = text.split()
    text_str = ' '.join(words)
    name_words = filter_name.split()
    positions = []
    print(f"\nSearching for name: {filter_name}")
    print(f"Text: {text_str}")
    for i in range(len(words)):
        if i + len(name_words) > len(words):
            continue
        
        potential_match = ' '.join(words[i:i + len(name_words)])
        similarity = fuzz.ratio(potential_match, filter_name)
        print(f"Checking position {i}: '{potential_match}' - similarity: {similarity}")
        if similarity >= 85:
            end_pos = i + len(name_words) - 1
            if i < len(words) and words[i][0] == '.':
                i += 1
            if end_pos < len(words) and words[end_pos][-1] == '.':
                end_pos -= 1
            positions.append((i, end_pos))
            print(f"Found match at positions {i} to {end_pos}")
    print(f"Found {len(positions)} matches at positions: {positions}")
    return positions
    # Check if filter_name appears near variations of עמותה
def check_name_near_association(text, association_name, filter_name, name_positions):
    words = text.split()
    text_str = ' '.join(words)

    print(f"\nChecking name near association...")
    print(f"Text: {text_str}")

    # First check if (ע"ר) appears right after the name
    # Check for exact association name or filter name with ע"ר variations
    if association_name in text_str:
        print("Found exact match with ע\"ר variation - returning score 40")
        return 40

    if not name_positions:
        print("No name positions found - returning 0")
        return 0

    max_score = 0    

    # Find positions of name matches
    for name_pos in name_positions:
        start_pos = name_pos[0]
        print(f"\nChecking name position: {start_pos}")
        
        # Get range of positions before the name to check (up to 5 positions)
        check_start = max(0, start_pos - 5)
        print(f"Checking words from position {start_pos} to {check_start}")
        
        # Check words before the name position, starting from closest
        for i in range(start_pos, check_start - 1, -1):
            # Skip if there's a sentence break between
            text_between = ' '.join(words[i:start_pos])
            if '.' in text_between:
                print(f"Found sentence break between positions {i} and {start_pos} - skipping")
                continue
                
            word = words[i]
            print(f"Checking word: {word}")
            
            # Check for exact matches with association variations
            if word in association_variations:
                distance = start_pos - i
                score = get_score_by_distance(distance)
                print(f"Found exact match '{word}' at distance {distance} - score: {score}")
                return score  # Return immediately when finding closest match
            
            # Check for similar matches
            for variation in association_variations:
                similarity = fuzz.ratio(word, variation)
                print(f"Checking against variation '{variation}' - similarity: {similarity}")
                if similarity > 85:
                    distance = start_pos - i
                    score = get_score_by_distance(distance)
                    print(f"Found similar match '{word}' at distance {distance} - score: {score}")
                    return score  # Return immediately when finding closest match

    print(f"Final association proximity score: {max_score}/40, Name: {filter_name}, Text: {text_str}")
    return max_score

def get_score_by_distance(distance):
    if distance == 1:
        score = 35  # Very close
        print(f"Very close match (distance=1) - score: 35")
    elif distance == 2:
        score = 30  # Close
        print(f"Close match (distance=2) - score: 30")
    elif distance <= 4:
        score = 20  # Moderately close
        print(f"Moderately close match (distance={distance}) - score: 20")
    else:
        score = 10  # Further
        print(f"Further match (distance={distance}) - score: 10")
    return score


def check_term_similarity(test_term, similarity_threshold = 85):
    for term in NEGATIVE_LEGAL_TERMS:
        similarity = fuzz.ratio(test_term.strip(), term.strip())
        if similarity > similarity_threshold:
            print(f"Found similar term: '{test_term}' matches '{term}' with {similarity}% similarity")
            return True, similarity
    return False, 0 

def check_legal_terms_near_name(text_str, name_positions):
    if not name_positions:
        return 0
        
    words = text_str.split()
    
    for start_pos, end_pos in name_positions:
        print(f"Checking legal terms around name at positions {start_pos}-{end_pos}")
        
        # Check before name position
        check_start = 0
        for i in range(start_pos - 1, check_start - 1, -1):
            # Check single word
            word = words[i]
            print(f"Checking word before name: {word}")
            
            # Check single word matches
            is_match, similarity = check_term_similarity(word)
            if is_match:
                return 25 * (similarity / 100)
            
            # Check two-word phrases
            if i < start_pos - 1:
                two_word_phrase = f"{word} {words[i+1]}"
                print(f"Checking phrase before name: {two_word_phrase}")
                is_match, similarity = check_term_similarity(two_word_phrase)
                if is_match:
                    return 25 * (similarity / 100)
                    
                # Check three-word phrases
                if i < start_pos - 2:
                    three_word_phrase = f"{word} {words[i+1]} {words[i+2]}"
                    print(f"Checking phrase before name: {three_word_phrase}")
                    is_match, similarity = check_term_similarity(three_word_phrase)
                    if is_match:
                        return 25 * (similarity / 100)
            
            # Check for sentence break
            text_between = ' '.join(words[i:start_pos])
            if '.' in text_between:
                print("Found sentence break before name - stopping backward check")
                break
        
        # Check after name position            
        for i in range(end_pos + 1, len(words)-2):
            # Check single word
            word = words[i].rstrip('.')
            print(f"Checking word after name: {word}")
            
            # Check single word matches
            is_match, similarity = check_term_similarity(word)
            if is_match:
                return 25 * (similarity / 100)
            
            # Check two-word phrases
            two_word_phrase = f"{word} {words[i+1].rstrip('.')}"
            print(f"Checking phrase after name: {two_word_phrase}")
            is_match, similarity = check_term_similarity(two_word_phrase)
            if is_match:
                return 25 * (similarity / 100)
                
            # Check three-word phrases
            three_word_phrase = f"{word} {words[i+1].rstrip('.')} {words[i+2].rstrip('.')}"
            print(f"Checking phrase after name: {three_word_phrase}")
            is_match, similarity = check_term_similarity(three_word_phrase)
            if is_match:
                return 25 * (similarity / 100)
            
            # Check for sentence break
            text_between = ' '.join(words[end_pos:i+1])
            if '.' in text_between:
                print("Found sentence break after name - stopping forward check")
                break
                    
    print("No negative legal terms found near name")
    return 0

def analyze_sentiment(text, negative_score):
    text_result = sentiment_pipeline(text[:512])[0]
    text_sentiment = text_result['label']
    text_confidence = text_result['score']
    print(f"Text sentiment: {text_sentiment} with confidence {text_confidence}")

    if text_sentiment == 'Negative':
        print(f"Found Negative sentiment in text: {text} with confidence {text_confidence}")
        return True

    elif text_sentiment == 'Neutral' and negative_score > 0:
        print(f"Found Neutral sentiment in text: {text} with confidence {text_confidence} but keyword score: {negative_score}") #change it
        return True
    
    else:
        print(f"Found Positive sentiment in text: {text} with confidence {text_confidence}")
        return False

def analyze_results(data):
    try:
        results = data.get("results", [])
        association_name = data.get("associationName")
        filter_name = data.get("filterName")
        association_number = data.get("associationNumber")
        relevant_results = []

        sentiment_filter_name = remove_hyphens(filter_name)
        clean_assoc_name = process_snippet_for_relevance(association_name)
        clean_filter_name = process_snippet_for_relevance(filter_name)

        print("\nProcessing results...")
        for result in results:
            try:
                title = result['title']
                content = result['content']
                keyword = result['keyword']

                title = str(title) if title else ''
                content = str(content) if content else ''

                new_title = process_snippet_for_relevance(title)
                new_content = process_snippet_for_relevance(content)

                print(f"Title: {new_title}")
                print(f"Content: {new_content}")
                print(f"Keyword: {keyword}")

                title_name_score = check_name_in_text(new_title, clean_filter_name)
                content_name_score = check_name_in_text(new_content, clean_filter_name)
                name_score = max(title_name_score, content_name_score)

                print(f"title score: {title_name_score}")
                print(f"content score: {content_name_score}")
                    
                if name_score == 0:
                    continue

                title_name_positions = find_name_positions(new_title, clean_filter_name)
                content_name_positions = find_name_positions(new_content, clean_filter_name)
                if not title_name_positions and not content_name_positions:
                    continue

                title_association_score = check_name_near_association(new_title, clean_assoc_name, clean_filter_name, title_name_positions)
                content_association_score = check_name_near_association(new_content, clean_assoc_name, clean_filter_name, content_name_positions)
                association_score = max(title_association_score, content_association_score)

                print(f"title association score: {title_association_score}")
                print(f"content association score: {content_association_score}")

                if association_score == 0:
                    continue

                title_legal_terms_score = check_legal_terms_near_name(new_title, title_name_positions) 
                content_legal_terms_score = check_legal_terms_near_name(new_content, content_name_positions)
                legal_terms_score = max(title_legal_terms_score, content_legal_terms_score)
        
                if legal_terms_score == 0:
                    continue

                total_score = name_score + association_score + legal_terms_score
                print(f"Updated score: {total_score}")

                print("Preparing sentiment analysis...")

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
                sentiment_confidence = max(title_sentiment_result, content_sentiment_result)

                if not title_sentiment_result and not content_sentiment_result:
                    continue
            
                print("-" * 80)
                relevant_results.append({
                    'title': title_sentiment,
                    'link': result['link'],
                    'content': content_sentiment,
                    'keyword': result['keyword'],
                    'relevance_score': total_score,
                    'sentiment_confidence': sentiment_confidence
                })

            except Exception as e:
                print(f"Error processing result: {str(e)}")
                continue

        relevant_results.sort(key=lambda x: x['relevance_score'], reverse=True)
        print(f"\nFound {len(relevant_results)} relevant results")
        return relevant_results

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return []

if __name__ == "__main__":
    # Run analysis on test data
    results = analyze_results(test_data)
    print("\nAnalysis Results:")
    for result in results:
        print(f"\nTitle: {result['title']}")
        print(f"Content: {result['content']}")
        print(f"Keyword: {result['keyword']}")
        print(f"Score: {result['relevance_score']}")
        print(f"Sentiment: {result['sentiment_confidence']}")