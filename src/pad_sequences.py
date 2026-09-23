import numpy as np

def pad_sequence(sequence, max_len = 500):
    sequence = sequence[:max_len]

    padded = np.zeros(max_len, dtype=np.float32)

    padded[:len(sequence)] = sequence

    return padded