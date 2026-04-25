"""
BlackRoad NanoGPT -- Data Preparation.

Crawls BlackRoad monorepo, collects authored content,
trains a BPE tokenizer, and encodes data to binary files.
"""

import json
import os
import sys

import numpy as np
import yaml

from tokenizer import BPETokenizer

# Directories to skip entirely (forks, deps, generated)
SKIP_DIRS = {
    '.git', '__pycache__', 'node_modules', '.next', '.vercel',
    'dist', 'build', '.cache', '.tox', 'venv', '.venv', 'env',
    '.eggs', '*.egg-info', '.mypy_cache', '.pytest_cache',
    # Fork repos to exclude
    'blackroad-vllm', 'blackbox-n8n', 'blackbox-airbyte',
    'blackbox-activepieces', 'blackbox-prefect', 'blackbox-temporal',
    'blackbox-huginn', 'blackbox-dolphinscheduler', 'blackbox-kestra',
}

# File extensions to include
EXTENSIONS = {'.md', '.py', '.sh', '.js', '.ts', '.yaml', '.yml', '.json', '.css', '.html'}

# Max file size (500 KB)
MAX_FILE_SIZE = 500 * 1024


def should_skip_dir(dirname):
    """Check if directory should be skipped."""
    return dirname in SKIP_DIRS or dirname.startswith('.')


def collect_files(source_dir):
    """Walk source_dir and collect all eligible text files."""
    files = []
    for root, dirs, filenames in os.walk(source_dir):
        # Filter dirs in-place to prune traversal
        dirs[:] = [d for d in dirs if not should_skip_dir(d)]

        for fname in filenames:
            ext = os.path.splitext(fname)[1].lower()
            if ext not in EXTENSIONS:
                continue

            fpath = os.path.join(root, fname)

            try:
                size = os.path.getsize(fpath)
            except OSError:
                continue

            if size > MAX_FILE_SIZE or size == 0:
                continue

            files.append(fpath)

    return sorted(files)


def read_file(path):
    """Read a file, returning its text or None on failure."""
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    except (OSError, UnicodeDecodeError):
        return None


def collect_corpus(source_dir):
    """Collect all text from eligible files into a single string."""
    files = collect_files(source_dir)
    print(f"Found {len(files)} eligible files")

    corpus_parts = []
    total_bytes = 0
    ext_counts = {}

    for fpath in files:
        text = read_file(fpath)
        if text is None or len(text.strip()) < 10:
            continue

        ext = os.path.splitext(fpath)[1].lower()
        ext_counts[ext] = ext_counts.get(ext, 0) + 1

        # Add file separator for context
        corpus_parts.append(text)
        total_bytes += len(text.encode('utf-8'))

    corpus = '\n\n'.join(corpus_parts)

    print(f"\nCorpus statistics:")
    print(f"  Files included: {len(corpus_parts)}")
    print(f"  Total size: {total_bytes / 1024 / 1024:.1f} MB")
    print(f"  Extensions:")
    for ext, count in sorted(ext_counts.items(), key=lambda x: -x[1]):
        print(f"    {ext}: {count} files")

    return corpus


def main():
    # Load config
    config_path = os.path.join(os.path.dirname(__file__), 'train_config.yaml')
    with open(config_path) as f:
        config = yaml.safe_load(f)

    source_dir = config['data']['source_dir']
    vocab_size = config['tokenizer']['vocab_size']
    val_split = config['data']['val_split']
    data_dir = os.path.join(os.path.dirname(__file__), 'data')

    os.makedirs(data_dir, exist_ok=True)

    print(f"Source directory: {source_dir}")
    print(f"Vocab size: {vocab_size}")
    print(f"Val split: {val_split}")
    print()

    # Step 1: Collect corpus
    print("=" * 60)
    print("Step 1: Collecting corpus...")
    print("=" * 60)
    corpus = collect_corpus(source_dir)

    if len(corpus) < 1000:
        print("ERROR: Corpus too small. Check source_dir.")
        sys.exit(1)

    # Step 2: Train tokenizer
    print()
    print("=" * 60)
    print("Step 2: Training BPE tokenizer...")
    print("=" * 60)
    tokenizer = BPETokenizer()
    tokenizer.train(corpus, vocab_size=vocab_size)

    tokenizer_path = os.path.join(data_dir, 'tokenizer.json')
    tokenizer.save(tokenizer_path)

    # Step 3: Encode corpus
    print()
    print("=" * 60)
    print("Step 3: Encoding corpus...")
    print("=" * 60)
    tokens = tokenizer.encode(corpus)
    print(f"Total tokens: {len(tokens):,}")

    tokens_array = np.array(tokens, dtype=np.uint16)

    # Step 4: Train/val split
    split_idx = int(len(tokens_array) * (1.0 - val_split))
    train_tokens = tokens_array[:split_idx]
    val_tokens = tokens_array[split_idx:]

    print(f"Train tokens: {len(train_tokens):,}")
    print(f"Val tokens: {len(val_tokens):,}")

    # Step 5: Save binary files
    train_path = os.path.join(data_dir, 'train.bin')
    val_path = os.path.join(data_dir, 'val.bin')

    train_tokens.tofile(train_path)
    val_tokens.tofile(val_path)

    print(f"\nSaved: {train_path} ({os.path.getsize(train_path) / 1024 / 1024:.1f} MB)")
    print(f"Saved: {val_path} ({os.path.getsize(val_path) / 1024 / 1024:.1f} MB)")

    # Step 6: Save metadata
    meta = {
        'vocab_size': len(tokenizer),
        'total_tokens': len(tokens),
        'train_tokens': len(train_tokens),
        'val_tokens': len(val_tokens),
        'val_split': val_split,
        'source_dir': source_dir,
        'corpus_bytes': len(corpus.encode('utf-8')),
    }

    meta_path = os.path.join(data_dir, 'meta.json')
    with open(meta_path, 'w') as f:
        json.dump(meta, f, indent=2)

    print(f"Saved: {meta_path}")
    print()
    print("Data preparation complete!")


if __name__ == '__main__':
    main()
