"""
BlackRoad NanoGPT -- Text Generation.

Load a trained checkpoint and generate text with temperature/top-k sampling.
"""

import argparse
import os

import torch

from model import GPT
from tokenizer import BPETokenizer


def main():
    parser = argparse.ArgumentParser(description='Generate text from BlackRoad NanoGPT')
    parser.add_argument('--checkpoint', required=True, help='Path to checkpoint .pt file')
    parser.add_argument('--tokenizer', default=None, help='Path to tokenizer.json (default: data/tokenizer.json)')
    parser.add_argument('--prompt', default='#!/bin/bash\n', help='Text prompt to start generation')
    parser.add_argument('--max-tokens', type=int, default=512, help='Maximum tokens to generate')
    parser.add_argument('--temperature', type=float, default=0.8, help='Sampling temperature')
    parser.add_argument('--top-k', type=int, default=40, help='Top-k sampling (0 = disabled)')
    parser.add_argument('--num-samples', type=int, default=1, help='Number of samples to generate')
    args = parser.parse_args()

    base_dir = os.path.dirname(os.path.abspath(__file__))

    # Load tokenizer
    tokenizer_path = args.tokenizer or os.path.join(base_dir, 'data', 'tokenizer.json')
    tokenizer = BPETokenizer.load(tokenizer_path)
    print(f"Tokenizer loaded: {len(tokenizer)} tokens")

    # Load checkpoint
    print(f"Loading checkpoint: {args.checkpoint}")
    checkpoint = torch.load(args.checkpoint, map_location='cpu', weights_only=False)
    model_config = checkpoint['model_config']

    # Build model and load weights
    model = GPT(model_config)
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()

    print(f"Model: {model.count_parameters()} parameters")
    print(f"Trained for {checkpoint['step']} steps (epoch {checkpoint['epoch']})")
    print(f"Best val loss: {checkpoint['best_val_loss']:.4f}")
    print()

    # Generate
    top_k = args.top_k if args.top_k > 0 else None

    for i in range(args.num_samples):
        if args.num_samples > 1:
            print(f"--- Sample {i + 1}/{args.num_samples} ---")

        tokens = tokenizer.encode(args.prompt)
        idx = torch.tensor([tokens], dtype=torch.long)

        with torch.no_grad():
            out = model.generate(
                idx,
                max_new_tokens=args.max_tokens,
                temperature=args.temperature,
                top_k=top_k,
            )

        text = tokenizer.decode(out[0].tolist())
        print(text)

        if args.num_samples > 1:
            print()


if __name__ == '__main__':
    main()
