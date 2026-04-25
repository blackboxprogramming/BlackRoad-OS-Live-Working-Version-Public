"""
BlackRoad NanoGPT -- Custom BPE Tokenizer.

Byte-Pair Encoding tokenizer trained on BlackRoad corpus.
Vocabulary size: 4096 tokens.
"""

import json
import re
from collections import Counter


# Pre-tokenization pattern: split on whitespace boundaries, punctuation, digits
# Similar to GPT-2's pattern but simpler
PAT = re.compile(r"""[ ]?[a-zA-Z_][a-zA-Z0-9_]*|[ ]?[0-9]+|[^\s\w]|\s+""")


class BPETokenizer:
    """Byte-Pair Encoding tokenizer."""

    def __init__(self):
        self.merges = {}       # (int, int) -> int
        self.vocab = {}        # int -> bytes
        self.inverse_vocab = {}  # bytes -> int

    def train(self, text, vocab_size=4096):
        """Train BPE on text corpus."""
        assert vocab_size >= 256, "vocab_size must be >= 256 (byte-level base)"
        num_merges = vocab_size - 256

        # start with byte-level tokens (0-255)
        tokens = list(text.encode('utf-8'))
        self.vocab = {i: bytes([i]) for i in range(256)}

        for i in range(num_merges):
            # count adjacent pairs
            pairs = Counter()
            for j in range(len(tokens) - 1):
                pairs[(tokens[j], tokens[j + 1])] += 1

            if not pairs:
                break

            # find most frequent pair
            top_pair = max(pairs, key=pairs.get)
            new_id = 256 + i
            self.merges[top_pair] = new_id
            self.vocab[new_id] = self.vocab[top_pair[0]] + self.vocab[top_pair[1]]

            # merge in token list
            tokens = self._merge(tokens, top_pair, new_id)

            if (i + 1) % 500 == 0:
                print(f"  merge {i + 1}/{num_merges} | vocab size: {256 + i + 1} | tokens remaining: {len(tokens)}")

        # build inverse vocab
        self.inverse_vocab = {v: k for k, v in self.vocab.items()}

        print(f"Tokenizer trained: {len(self.vocab)} tokens, {len(self.merges)} merges")
        return tokens

    def _merge(self, tokens, pair, new_id):
        """Replace all occurrences of pair with new_id in token list."""
        merged = []
        i = 0
        while i < len(tokens):
            if i < len(tokens) - 1 and tokens[i] == pair[0] and tokens[i + 1] == pair[1]:
                merged.append(new_id)
                i += 2
            else:
                merged.append(tokens[i])
                i += 1
        return merged

    def encode(self, text):
        """Encode text to token ids."""
        tokens = list(text.encode('utf-8'))

        while len(tokens) >= 2:
            pairs = set()
            for i in range(len(tokens) - 1):
                pairs.add((tokens[i], tokens[i + 1]))

            # find the pair with lowest merge index (earliest learned = most frequent)
            mergeable = {}
            for pair in pairs:
                if pair in self.merges:
                    mergeable[pair] = self.merges[pair]

            if not mergeable:
                break

            # merge the pair that was learned earliest (lowest new_id)
            best_pair = min(mergeable, key=mergeable.get)
            tokens = self._merge(tokens, best_pair, self.merges[best_pair])

        return tokens

    def decode(self, tokens):
        """Decode token ids to text."""
        byte_sequence = b''.join(self.vocab[t] for t in tokens)
        return byte_sequence.decode('utf-8', errors='replace')

    def save(self, path):
        """Save tokenizer to JSON file."""
        data = {
            'vocab_size': len(self.vocab),
            'merges': {f"{a},{b}": v for (a, b), v in self.merges.items()},
            'vocab': {str(k): list(v) for k, v in self.vocab.items()},
        }
        with open(path, 'w') as f:
            json.dump(data, f)
        print(f"Tokenizer saved to {path}")

    @classmethod
    def load(cls, path):
        """Load tokenizer from JSON file."""
        with open(path) as f:
            data = json.load(f)

        tok = cls()
        tok.merges = {
            (int(k.split(',')[0]), int(k.split(',')[1])): v
            for k, v in data['merges'].items()
        }
        tok.vocab = {int(k): bytes(v) for k, v in data['vocab'].items()}
        tok.inverse_vocab = {v: k for k, v in tok.vocab.items()}
        return tok

    def __len__(self):
        return len(self.vocab)


if __name__ == '__main__':
    # Quick test
    text = "Hello, BlackRoad! #!/bin/bash\necho 'test'"
    tok = BPETokenizer()
    tok.train(text, vocab_size=280)
    encoded = tok.encode(text)
    decoded = tok.decode(encoded)
    print(f"Original:  {text!r}")
    print(f"Encoded:   {encoded[:20]}... ({len(encoded)} tokens)")
    print(f"Decoded:   {decoded!r}")
    assert decoded == text, "Round-trip failed!"
    print("Round-trip OK")
