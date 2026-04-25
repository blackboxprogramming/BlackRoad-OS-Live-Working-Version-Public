"""
BlackRoad NanoGPT -- Training Loop.

Trains the GPT model on prepared binary data with:
- Cosine learning rate schedule with warmup
- Gradient accumulation
- Periodic checkpointing and validation
- JSONL training logs
- Sample generation during training
- --dry-run mode for validation
- --resume for checkpoint recovery
"""

import argparse
import json
import math
import os
import time

import numpy as np
import torch
import yaml

from model import GPT
from tokenizer import BPETokenizer


def load_config(config_path):
    """Load training configuration from YAML."""
    with open(config_path) as f:
        return yaml.safe_load(f)


def load_data(path, block_size):
    """Memory-map binary token file."""
    tokens = np.memmap(path, dtype=np.uint16, mode='r')
    return tokens


def get_batch(data, batch_size, block_size, device):
    """Sample a random batch from data."""
    n = len(data) - block_size - 1
    ix = torch.randint(n, (batch_size,))
    x = torch.stack([torch.from_numpy(data[i:i + block_size].astype(np.int64)) for i in ix])
    y = torch.stack([torch.from_numpy(data[i + 1:i + 1 + block_size].astype(np.int64)) for i in ix])
    return x.to(device), y.to(device)


@torch.no_grad()
def estimate_loss(model, train_data, val_data, config, device):
    """Estimate train and val loss over multiple batches."""
    model.eval()
    results = {}
    batch_size = config['training']['batch_size']
    block_size = config['model']['block_size']
    n_batches = config['eval']['val_batches']

    for name, data in [('train', train_data), ('val', val_data)]:
        losses = []
        for _ in range(n_batches):
            x, y = get_batch(data, batch_size, block_size, device)
            _, loss = model(x, y)
            losses.append(loss.item())
        results[name] = sum(losses) / len(losses)

    model.train()
    return results


def get_lr(step, config):
    """Cosine learning rate schedule with warmup."""
    warmup_steps = config['training']['warmup_steps']
    lr = config['training']['learning_rate']
    min_lr = config['training']['min_learning_rate']

    # warmup
    if step < warmup_steps:
        return lr * (step + 1) / warmup_steps

    # cosine decay (we don't know total steps exactly, use a large horizon)
    # this decays smoothly; training can stop at any point
    decay_steps = 100000  # large enough horizon
    progress = min((step - warmup_steps) / decay_steps, 1.0)
    coeff = 0.5 * (1.0 + math.cos(math.pi * progress))
    return min_lr + coeff * (lr - min_lr)


def save_checkpoint(model, optimizer, step, epoch, best_val_loss, config, path):
    """Save training checkpoint."""
    checkpoint = {
        'model_state_dict': model.state_dict(),
        'optimizer_state_dict': optimizer.state_dict(),
        'step': step,
        'epoch': epoch,
        'best_val_loss': best_val_loss,
        'model_config': config['model'],
    }
    torch.save(checkpoint, path)


def load_checkpoint(path, model, optimizer, device):
    """Load training checkpoint."""
    checkpoint = torch.load(path, map_location=device, weights_only=False)
    model.load_state_dict(checkpoint['model_state_dict'])
    optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
    return checkpoint['step'], checkpoint['epoch'], checkpoint['best_val_loss']


def generate_sample(model, tokenizer, prompt, max_tokens, temperature, top_k, device):
    """Generate a text sample from the model."""
    model.eval()
    tokens = tokenizer.encode(prompt)
    idx = torch.tensor([tokens], dtype=torch.long, device=device)
    out = model.generate(idx, max_new_tokens=max_tokens, temperature=temperature, top_k=top_k)
    text = tokenizer.decode(out[0].tolist())
    model.train()
    return text


def log_entry(log_path, entry):
    """Append a JSONL log entry."""
    with open(log_path, 'a') as f:
        f.write(json.dumps(entry) + '\n')


def main():
    parser = argparse.ArgumentParser(description='Train BlackRoad NanoGPT')
    parser.add_argument('--config', default='train_config.yaml', help='Config file path')
    parser.add_argument('--dry-run', action='store_true', help='Validate config and run 5 steps')
    parser.add_argument('--resume', type=str, default=None, help='Resume from checkpoint path')
    args = parser.parse_args()

    # Load config
    config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), args.config)
    config = load_config(config_path)

    device = config['hardware']['device']
    batch_size = config['training']['batch_size']
    block_size = config['model']['block_size']
    grad_accum = config['training']['gradient_accumulation_steps']

    # Setup directories
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ckpt_dir = os.path.join(base_dir, config['checkpointing']['dir'])
    log_dir = os.path.join(base_dir, config['logging']['dir'])
    sample_dir = os.path.join(base_dir, config['logging']['sample_dir'])
    os.makedirs(ckpt_dir, exist_ok=True)
    os.makedirs(log_dir, exist_ok=True)
    os.makedirs(sample_dir, exist_ok=True)

    log_path = os.path.join(log_dir, 'train_log.jsonl')

    # Load data
    print("Loading data...")
    data_dir = os.path.join(base_dir, 'data')
    meta_path = os.path.join(data_dir, 'meta.json')
    with open(meta_path) as f:
        meta = json.load(f)

    train_data = load_data(os.path.join(data_dir, 'train.bin'), block_size)
    val_data = load_data(os.path.join(data_dir, 'val.bin'), block_size)

    print(f"Train tokens: {len(train_data):,}")
    print(f"Val tokens: {len(val_data):,}")

    # Load tokenizer
    tokenizer = BPETokenizer.load(os.path.join(data_dir, 'tokenizer.json'))
    print(f"Tokenizer vocab: {len(tokenizer)}")

    # Build model
    print("Building model...")
    model = GPT(config['model'])
    model = model.to(device)
    print(f"Parameters: {model.count_parameters()}")

    # Memory estimate
    param_bytes = sum(p.numel() * p.element_size() for p in model.parameters())
    print(f"Model memory: {param_bytes / 1024 / 1024:.1f} MB")

    # Optimizer
    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=config['training']['learning_rate'],
        betas=(config['training']['beta1'], config['training']['beta2']),
        weight_decay=config['training']['weight_decay'],
    )

    # Resume from checkpoint
    start_step = 0
    start_epoch = 0
    best_val_loss = float('inf')

    if args.resume:
        print(f"Resuming from {args.resume}...")
        start_step, start_epoch, best_val_loss = load_checkpoint(
            args.resume, model, optimizer, device
        )
        print(f"Resumed at step {start_step}, epoch {start_epoch}, best_val_loss {best_val_loss:.4f}")

    # Calculate steps per epoch
    tokens_per_step = batch_size * block_size
    steps_per_epoch = len(train_data) // tokens_per_step
    max_epochs = config['training']['max_epochs']
    total_steps = steps_per_epoch * max_epochs

    print(f"\nTraining config:")
    print(f"  Batch size: {batch_size} x {grad_accum} accumulation = {batch_size * grad_accum} effective")
    print(f"  Block size: {block_size}")
    print(f"  Steps/epoch: {steps_per_epoch:,}")
    print(f"  Total steps: {total_steps:,} ({max_epochs} epochs)")
    print(f"  Checkpoint every: {config['checkpointing']['every_n_steps']} steps")

    if args.dry_run:
        print(f"\n{'=' * 60}")
        print("DRY RUN: Running 5 steps to validate...")
        print(f"{'=' * 60}")
        max_steps = 5
    else:
        max_steps = total_steps

    print(f"\nStarting training...")
    print(f"{'=' * 60}")

    model.train()
    step = start_step
    epoch = start_epoch
    t0 = time.time()

    while step < start_step + max_steps:
        epoch = step // steps_per_epoch

        # Gradient accumulation loop
        optimizer.zero_grad()
        accum_loss = 0.0

        for micro_step in range(grad_accum):
            x, y = get_batch(train_data, batch_size, block_size, device)
            _, loss = model(x, y)
            loss = loss / grad_accum
            loss.backward()
            accum_loss += loss.item()

        # Gradient clipping
        grad_clip = config['training']['grad_clip']
        if grad_clip > 0:
            torch.nn.utils.clip_grad_norm_(model.parameters(), grad_clip)

        # Update learning rate
        lr = get_lr(step, config)
        for param_group in optimizer.param_groups:
            param_group['lr'] = lr

        optimizer.step()
        step += 1

        # Logging
        if step % config['logging']['log_every_n_steps'] == 0:
            dt = time.time() - t0
            tokens_per_sec = (batch_size * block_size * grad_accum) / dt if dt > 0 else 0

            entry = {
                'step': step,
                'epoch': epoch,
                'train_loss': round(accum_loss, 4),
                'lr': round(lr, 8),
                'dt_ms': round(dt * 1000, 1),
                'tokens_per_sec': round(tokens_per_sec, 1),
            }
            log_entry(log_path, entry)

            print(
                f"step {step:>6d} | epoch {epoch:>2d} | "
                f"loss {accum_loss:.4f} | lr {lr:.2e} | "
                f"{dt * 1000:.0f}ms | {tokens_per_sec:.0f} tok/s"
            )
            t0 = time.time()

        # Evaluation
        if step % config['eval']['every_n_steps'] == 0 and not args.dry_run:
            losses = estimate_loss(model, train_data, val_data, config, device)
            val_perplexity = math.exp(losses['val']) if losses['val'] < 20 else float('inf')

            entry = {
                'step': step,
                'epoch': epoch,
                'eval_train_loss': round(losses['train'], 4),
                'eval_val_loss': round(losses['val'], 4),
                'val_perplexity': round(val_perplexity, 2),
            }
            log_entry(log_path, entry)

            print(
                f"  EVAL | train_loss {losses['train']:.4f} | "
                f"val_loss {losses['val']:.4f} | "
                f"val_ppl {val_perplexity:.2f}"
            )

            # Save best checkpoint
            if losses['val'] < best_val_loss:
                best_val_loss = losses['val']
                best_path = os.path.join(ckpt_dir, 'checkpoint_best.pt')
                save_checkpoint(model, optimizer, step, epoch, best_val_loss, config, best_path)
                print(f"  NEW BEST | val_loss {best_val_loss:.4f} -> saved {best_path}")

        # Periodic checkpoint
        if step % config['checkpointing']['every_n_steps'] == 0 and not args.dry_run:
            ckpt_path = os.path.join(ckpt_dir, f'checkpoint_{step:06d}.pt')
            save_checkpoint(model, optimizer, step, epoch, best_val_loss, config, ckpt_path)
            print(f"  CHECKPOINT saved: {ckpt_path}")

            # Clean old checkpoints
            keep_n = config['checkpointing']['keep_last_n']
            ckpts = sorted([
                f for f in os.listdir(ckpt_dir)
                if f.startswith('checkpoint_') and f != 'checkpoint_best.pt'
            ])
            for old_ckpt in ckpts[:-keep_n]:
                os.remove(os.path.join(ckpt_dir, old_ckpt))

        # Generate samples
        if step % config['logging']['sample_every_n_steps'] == 0 and not args.dry_run:
            prompts = ['#!/bin/bash\n', '# BlackRoad', '## ', 'def ']
            sample_path = os.path.join(sample_dir, f'sample_step_{step:06d}.txt')
            with open(sample_path, 'w') as f:
                for prompt in prompts:
                    text = generate_sample(
                        model, tokenizer, prompt,
                        max_tokens=config['logging']['sample_length'],
                        temperature=config['logging']['sample_temperature'],
                        top_k=config['logging']['sample_top_k'],
                        device=device,
                    )
                    f.write(f"--- Prompt: {prompt!r} ---\n{text}\n\n")
            print(f"  SAMPLES saved: {sample_path}")

    if args.dry_run:
        print(f"\n{'=' * 60}")
        print("DRY RUN COMPLETE")
        print(f"  Model: {model.count_parameters()} parameters")
        print(f"  Memory: {param_bytes / 1024 / 1024:.1f} MB model weights")
        print(f"  Final loss: {accum_loss:.4f}")
        print(f"  Config validated successfully")
        print(f"{'=' * 60}")
    else:
        # Final checkpoint
        final_path = os.path.join(ckpt_dir, 'checkpoint_final.pt')
        save_checkpoint(model, optimizer, step, epoch, best_val_loss, config, final_path)
        print(f"\nTraining complete!")
        print(f"  Total steps: {step}")
        print(f"  Best val loss: {best_val_loss:.4f}")
        print(f"  Final checkpoint: {final_path}")
        print(f"  Best checkpoint: {os.path.join(ckpt_dir, 'checkpoint_best.pt')}")


if __name__ == '__main__':
    main()
