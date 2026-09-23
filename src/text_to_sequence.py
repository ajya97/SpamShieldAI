import json

def text_to_sequence(text, word_index_path, oov_token="<OOV>"):

    with open(word_index_path, "r", encoding="utf-8") as f:
        word_index = json.load(f)

    words = text.lower().split()

    oov_id = word_index.get(oov_token, 1)

    sequence = [
        word_index.get(word, oov_id)
        for word in words
    ]

    return sequence