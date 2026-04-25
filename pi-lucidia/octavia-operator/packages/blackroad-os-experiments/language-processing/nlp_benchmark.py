#!/usr/bin/env python3
"""
BLACKROAD LANGUAGE PROCESSING BENCHMARK
Natural language processing and text analysis benchmarks
Tests tokenization, embeddings, semantic analysis, transformers-style computations
"""

import numpy as np
import time
import socket
import re
import json
from collections import Counter
from typing import List, Dict, Tuple

class NLPBenchmark:
    def __init__(self):
        self.node = socket.gethostname()
        self.results = {}

        print(f"\n{'='*70}")
        print(f"📝 BLACKROAD LANGUAGE PROCESSING BENCHMARK")
        print(f"{'='*70}\n")
        print(f"Node: {self.node}\n")

        # Sample text corpus (Lorem ipsum + technical content)
        self.corpus = """
        The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet.
        Quantum computing leverages quantum mechanical phenomena such as superposition and entanglement to process information.
        Machine learning algorithms learn patterns from data to make predictions and decisions without being explicitly programmed.
        Natural language processing enables computers to understand, interpret, and generate human language in a valuable way.
        Cryptography protects information by transforming it into an unreadable format, only those with a special key can decrypt it.
        Mathematics is the study of numbers, quantities, shapes, and patterns, fundamental to science and engineering.
        The golden ratio appears in nature, art, and architecture, approximately equal to 1.618033988749895.
        Artificial intelligence aims to create machines that can perform tasks requiring human intelligence.
        Deep learning uses neural networks with many layers to extract higher-level features from raw input.
        Distributed computing splits complex problems across multiple machines working in parallel.
        """ * 100  # Repeat for larger corpus

    def benchmark_tokenization(self):
        """Text tokenization performance"""
        print("🔤 TOKENIZATION PERFORMANCE\n")

        # Word tokenization
        start = time.perf_counter()
        words = re.findall(r'\b\w+\b', self.corpus.lower())
        elapsed = time.perf_counter() - start

        tokens_per_sec = len(words) / elapsed

        print(f"  Word tokenization:")
        print(f"    Tokens: {len(words):,}")
        print(f"    Time: {elapsed*1000:.2f} ms")
        print(f"    Throughput: {tokens_per_sec:,.0f} tokens/sec\n")

        # Character tokenization
        start = time.perf_counter()
        chars = list(self.corpus.lower())
        elapsed = time.perf_counter() - start

        chars_per_sec = len(chars) / elapsed

        print(f"  Character tokenization:")
        print(f"    Characters: {len(chars):,}")
        print(f"    Time: {elapsed*1000:.2f} ms")
        print(f"    Throughput: {chars_per_sec:,.0f} chars/sec\n")

        # Sentence tokenization
        start = time.perf_counter()
        sentences = re.split(r'[.!?]+', self.corpus)
        sentences = [s.strip() for s in sentences if s.strip()]
        elapsed = time.perf_counter() - start

        print(f"  Sentence tokenization:")
        print(f"    Sentences: {len(sentences):,}")
        print(f"    Time: {elapsed*1000:.2f} ms\n")

        self.results['tokenization'] = {
            'tokens_per_sec': tokens_per_sec,
            'chars_per_sec': chars_per_sec
        }

        return words

    def benchmark_vocabulary(self, words: List[str]):
        """Vocabulary building and analysis"""
        print("📚 VOCABULARY ANALYSIS\n")

        # Build vocabulary
        start = time.perf_counter()
        vocab = Counter(words)
        elapsed = time.perf_counter() - start

        print(f"  Vocabulary building:")
        print(f"    Unique words: {len(vocab):,}")
        print(f"    Total words: {sum(vocab.values()):,}")
        print(f"    Time: {elapsed*1000:.2f} ms\n")

        # Most common words
        print("  Most common words:")
        for word, count in vocab.most_common(10):
            print(f"    {word:>20}: {count:>6,}")
        print()

        # Word frequency distribution
        start = time.perf_counter()
        frequencies = np.array(list(vocab.values()))
        mean_freq = np.mean(frequencies)
        std_freq = np.std(frequencies)
        elapsed = time.perf_counter() - start

        print(f"  Frequency statistics:")
        print(f"    Mean: {mean_freq:.2f}")
        print(f"    Std: {std_freq:.2f}")
        print(f"    Min: {np.min(frequencies)}")
        print(f"    Max: {np.max(frequencies)}\n")

        self.results['vocabulary'] = {
            'unique_words': len(vocab),
            'total_words': sum(vocab.values())
        }

        return vocab

    def benchmark_embeddings(self, vocab: Counter):
        """Word embedding generation (simulated)"""
        print("🎯 WORD EMBEDDINGS (Simulated)\n")

        # Simulate creating word embeddings
        embedding_dim = 300  # Standard word2vec dimension
        vocab_size = len(vocab)

        print(f"  Generating embeddings:")
        print(f"    Vocabulary size: {vocab_size:,}")
        print(f"    Embedding dim: {embedding_dim}\n")

        # Initialize random embeddings (simulates trained embeddings)
        start = time.perf_counter()
        embeddings = np.random.randn(vocab_size, embedding_dim).astype(np.float32)
        # Normalize
        embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)
        elapsed = time.perf_counter() - start

        print(f"  Initialization time: {elapsed*1000:.2f} ms")
        print(f"  Memory: {embeddings.nbytes / 1e6:.2f} MB\n")

        # Compute cosine similarities (most expensive operation)
        print("  Computing pairwise similarities (sample):")

        # Sample 1000 words for similarity
        sample_size = min(1000, vocab_size)
        sample_embeddings = embeddings[:sample_size]

        start = time.perf_counter()
        similarities = sample_embeddings @ sample_embeddings.T
        elapsed = time.perf_counter() - start

        print(f"    Matrix size: {sample_size}×{sample_size}")
        print(f"    Time: {elapsed*1000:.2f} ms")
        print(f"    Throughput: {sample_size*sample_size/elapsed:,.0f} similarities/sec\n")

        # Find most similar pairs
        print("  Most similar word pairs (simulated):")
        # Set diagonal to -1 to exclude self-similarity
        np.fill_diagonal(similarities, -1)

        for _ in range(5):
            idx = np.unravel_index(np.argmax(similarities), similarities.shape)
            sim = similarities[idx]
            similarities[idx] = -1  # Mark as used
            print(f"    Pair {idx}: similarity = {sim:.4f}")
        print()

        self.results['embeddings'] = {
            'vocab_size': vocab_size,
            'embedding_dim': embedding_dim,
            'similarities_per_sec': sample_size*sample_size/elapsed
        }

        return embeddings

    def benchmark_attention_mechanism(self):
        """Transformer-style attention mechanism"""
        print("🎯 ATTENTION MECHANISM (Transformer-style)\n")

        # Simulate attention computation like in BERT/GPT
        seq_length = 512  # Typical sequence length
        d_model = 768  # Hidden dimension (BERT-base)
        num_heads = 12  # Number of attention heads

        print(f"  Configuration:")
        print(f"    Sequence length: {seq_length}")
        print(f"    Model dimension: {d_model}")
        print(f"    Attention heads: {num_heads}\n")

        # Generate random input (simulates token embeddings)
        X = np.random.randn(seq_length, d_model).astype(np.float32)

        # Query, Key, Value projections
        print("  Computing Q, K, V projections:")
        start = time.perf_counter()

        d_k = d_model // num_heads
        Q = np.random.randn(seq_length, d_model).astype(np.float32)
        K = np.random.randn(seq_length, d_model).astype(np.float32)
        V = np.random.randn(seq_length, d_model).astype(np.float32)

        elapsed = time.perf_counter() - start
        print(f"    Time: {elapsed*1000:.2f} ms\n")

        # Multi-head attention
        print("  Multi-head attention computation:")
        start = time.perf_counter()

        # Reshape for multi-head
        Q_heads = Q.reshape(seq_length, num_heads, d_k)
        K_heads = K.reshape(seq_length, num_heads, d_k)
        V_heads = V.reshape(seq_length, num_heads, d_k)

        # Compute attention scores for each head
        for head in range(num_heads):
            Q_h = Q_heads[:, head, :]
            K_h = K_heads[:, head, :]
            V_h = V_heads[:, head, :]

            # Attention scores: softmax(QK^T / sqrt(d_k))
            scores = Q_h @ K_h.T / np.sqrt(d_k)

            # Softmax
            exp_scores = np.exp(scores - np.max(scores, axis=1, keepdims=True))
            attention = exp_scores / np.sum(exp_scores, axis=1, keepdims=True)

            # Apply attention to values
            output = attention @ V_h

        elapsed = time.perf_counter() - start

        # Calculate operations
        # QK^T: seq_length^2 * d_k operations per head
        # Softmax: seq_length^2 operations per head
        # Attention @ V: seq_length^2 * d_k operations per head
        ops_per_head = 2 * seq_length**2 * d_k + seq_length**2
        total_ops = ops_per_head * num_heads
        gflops = total_ops / elapsed / 1e9

        print(f"    Time: {elapsed*1000:.2f} ms")
        print(f"    Operations: {total_ops:,}")
        print(f"    Performance: {gflops:.2f} GFLOPS\n")

        self.results['attention'] = {
            'sequence_length': seq_length,
            'gflops': gflops
        }

    def benchmark_text_generation(self):
        """Simulated text generation (like GPT)"""
        print("✍️  TEXT GENERATION (Simulated)\n")

        # Vocabulary and parameters
        vocab_size = 50000  # GPT-2 vocab size
        context_length = 1024
        embedding_dim = 768

        print(f"  Model parameters:")
        print(f"    Vocabulary: {vocab_size:,}")
        print(f"    Context length: {context_length}")
        print(f"    Embedding dim: {embedding_dim}\n")

        # Simulate token generation
        num_tokens_to_generate = 100

        print(f"  Generating {num_tokens_to_generate} tokens:\n")

        start = time.perf_counter()

        for i in range(num_tokens_to_generate):
            # Simulate forward pass through transformer
            # Input: current context
            context = np.random.randn(min(i+1, context_length), embedding_dim)

            # Attention computation (simplified)
            scores = context @ context.T
            # Softmax
            exp_scores = np.exp(scores - np.max(scores, axis=1, keepdims=True))
            attention = exp_scores / np.sum(exp_scores, axis=1, keepdims=True)

            # Output projection
            output = attention @ context

            # Logits over vocabulary
            logits = output[-1] @ np.random.randn(embedding_dim, vocab_size)

            # Sample next token (argmax for speed)
            next_token = np.argmax(logits)

        elapsed = time.perf_counter() - start

        tokens_per_sec = num_tokens_to_generate / elapsed

        print(f"  Generation complete:")
        print(f"    Tokens: {num_tokens_to_generate}")
        print(f"    Time: {elapsed:.3f} seconds")
        print(f"    Throughput: {tokens_per_sec:.2f} tokens/sec\n")

        self.results['text_generation'] = {
            'tokens_per_sec': tokens_per_sec
        }

    def benchmark_semantic_search(self, embeddings):
        """Semantic search using embeddings"""
        print("🔍 SEMANTIC SEARCH\n")

        num_docs = len(embeddings)
        print(f"  Document corpus: {num_docs:,} documents\n")

        # Simulate search queries
        num_queries = 1000

        print(f"  Running {num_queries:,} search queries:\n")

        start = time.perf_counter()

        for _ in range(num_queries):
            # Random query embedding
            query = np.random.randn(embeddings.shape[1])
            query = query / np.linalg.norm(query)

            # Compute similarities
            similarities = embeddings @ query

            # Top-k retrieval (k=10)
            top_k = np.argsort(similarities)[-10:][::-1]

        elapsed = time.perf_counter() - start

        queries_per_sec = num_queries / elapsed

        print(f"  Search performance:")
        print(f"    Queries: {num_queries:,}")
        print(f"    Time: {elapsed:.3f} seconds")
        print(f"    Throughput: {queries_per_sec:,.0f} queries/sec\n")

        self.results['semantic_search'] = {
            'queries_per_sec': queries_per_sec
        }

    def benchmark_sentiment_analysis(self):
        """Simulated sentiment analysis"""
        print("😊 SENTIMENT ANALYSIS (Simulated)\n")

        # Sample sentences
        sentences = [
            "This is absolutely amazing and wonderful!",
            "I hate this terrible horrible thing.",
            "The weather is nice today.",
            "Quantum computing is revolutionary.",
            "This product is disappointing and broken.",
        ] * 200  # 1000 sentences

        print(f"  Analyzing {len(sentences)} sentences:\n")

        # Simulate sentiment scoring
        start = time.perf_counter()

        sentiments = []
        for sentence in sentences:
            # Simple word-based sentiment (simulated)
            words = sentence.lower().split()

            # Positive/negative word counts (simulated)
            positive_score = sum(1 for w in words if any(pos in w for pos in
                ['good', 'great', 'amazing', 'wonderful', 'love', 'excellent', 'nice', 'revolutionary']))
            negative_score = sum(1 for w in words if any(neg in w for neg in
                ['bad', 'terrible', 'horrible', 'hate', 'awful', 'disappointing', 'broken']))

            sentiment = positive_score - negative_score
            sentiments.append(sentiment)

        elapsed = time.perf_counter() - start

        sentences_per_sec = len(sentences) / elapsed

        print(f"  Analysis complete:")
        print(f"    Sentences: {len(sentences)}")
        print(f"    Time: {elapsed*1000:.2f} ms")
        print(f"    Throughput: {sentences_per_sec:,.0f} sentences/sec")
        print(f"    Positive: {sum(1 for s in sentiments if s > 0)}")
        print(f"    Negative: {sum(1 for s in sentiments if s < 0)}")
        print(f"    Neutral: {sum(1 for s in sentiments if s == 0)}\n")

        self.results['sentiment_analysis'] = {
            'sentences_per_sec': sentences_per_sec
        }

    def run_all_benchmarks(self):
        """Run complete NLP benchmark suite"""
        print(f"\n{'='*70}")
        print("RUNNING COMPREHENSIVE NLP BENCHMARKS")
        print(f"{'='*70}\n")

        start_total = time.perf_counter()

        words = self.benchmark_tokenization()
        print(f"{'='*70}\n")

        vocab = self.benchmark_vocabulary(words)
        print(f"{'='*70}\n")

        embeddings = self.benchmark_embeddings(vocab)
        print(f"{'='*70}\n")

        self.benchmark_attention_mechanism()
        print(f"{'='*70}\n")

        self.benchmark_text_generation()
        print(f"{'='*70}\n")

        self.benchmark_semantic_search(embeddings)
        print(f"{'='*70}\n")

        self.benchmark_sentiment_analysis()
        print(f"{'='*70}\n")

        elapsed_total = time.perf_counter() - start_total

        print(f"\n{'='*70}")
        print(f"🏆 NLP BENCHMARK COMPLETE - {self.node}")
        print(f"{'='*70}\n")
        print(f"Total time: {elapsed_total:.3f} seconds")
        print(f"Benchmarks run: {len(self.results)}")
        print(f"\n✅ Language processing benchmark complete!\n")

        return self.results

if __name__ == '__main__':
    benchmark = NLPBenchmark()
    results = benchmark.run_all_benchmarks()

    # Save results
    with open('/tmp/nlp_benchmark_results.json', 'w') as f:
        json.dump({
            'node': socket.gethostname(),
            'results': results
        }, f, indent=2, default=str)

    print(f"Results saved to /tmp/nlp_benchmark_results.json\n")
