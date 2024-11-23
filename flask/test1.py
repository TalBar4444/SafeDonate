from rapidfuzz import fuzz

# Define the target string and text
target_string = "ארגון לתת סיוע הומניטרי ישראלי"
text = "ארגון לתת סיוע הומניטרי ישראלי הינו ארגון נחמד מאוד. הארגון לתת סיוע הומניטרי ישראלי אוהבת לתת. בעמותה זו ארגון לתת סיוע יש הרבה חברים."

# Set similarity threshold
similarity_threshold = 90

# Initialize a count for approximate appearances
approximate_count = 0

# Define the sliding window length as the length of the target string
window_length = len(target_string)

# Slide through the text with a window of the target string's length
for i in range(len(text) - window_length + 1):
    # Extract the current window substring
    substring = text[i:i + window_length]
    
    # Calculate the similarity score
    similarity = fuzz.partial_ratio(target_string, substring)
    
    # Increment the count if the similarity is above the threshold
    if similarity >= similarity_threshold:
        approximate_count += 1

print("Approximate appearances:", approximate_count)
