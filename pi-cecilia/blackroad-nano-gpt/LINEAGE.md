# BlackRoad NanoGPT -- Lineage & Documentation

## Model Identity

| Field | Value |
|-------|-------|
| **ID** | `research/alexa/blackroad-nano-gpt` |
| **Name** | BlackRoad NanoGPT |
| **Version** | 0.1.0 |
| **Stage** | Research |
| **Parameters** | ~20.4M |
| **Architecture** | GPT-2-style decoder-only transformer |
| **Framework** | Pure PyTorch (CPU-only) |

## Lineage

**This model is trained from scratch.** No upstream model weights, no fine-tuning, no transfer learning. Every parameter is initialized randomly and trained on BlackRoad-authored content.

```
[Random Initialization]
        |
        v
[BlackRoad Corpus: ~25-30MB of .md, .py, .sh, .js, .ts, .yaml]
        |
        v
[Custom BPE Tokenizer: 4096 tokens]
        |
        v
[GPT-2 Architecture: 6 layers, 8 heads, 512 dim]
        |
        v
[Train on Cecilia Pi 5: ~9 days, 15 epochs]
        |
        v
[blackroad-nano-gpt v0.1.0]
```

## Training Data

Source: `/Users/alexa/blackroad` (the BlackRoad monorepo)

### Included
- `.md` files (documentation, READMEs, planning docs)
- `.py` files (Python scripts, agents, tools)
- `.sh` files (shell scripts, CLI tools)
- `.js` / `.ts` files (JavaScript/TypeScript code)
- `.yaml` / `.yml` files (configuration files)

### Excluded
- Fork directories (vllm, airbyte, n8n, temporal, etc.)
- `node_modules/`, `.git/`, `__pycache__/`
- Binary files and files > 500KB
- Any file not authored by BlackRoad

### Data Volume
- Raw text: ~25-30 MB
- BPE tokens: ~8M
- Train/val split: 90/10

## Architecture Details

```
Token Embeddings (4096 x 512)
Position Embeddings (512 x 512)
    |
    v
[Block x 6]
    ├── LayerNorm
    ├── CausalSelfAttention (8 heads, 64 dim/head)
    ├── Residual Connection
    ├── LayerNorm
    ├── MLP (512 -> 2048 -> 512, GELU)
    └── Residual Connection
    |
    v
LayerNorm
    |
    v
Language Model Head (512 -> 4096)
```

Parameter count breakdown:
- Token embeddings: 4096 x 512 = 2.1M
- Position embeddings: 512 x 512 = 0.26M
- Per block: ~1.6M x 6 = 9.4M
  - Attention Q/K/V: 3 x 512 x 512 = 0.79M
  - Attention output: 512 x 512 = 0.26M
  - MLP up: 512 x 2048 = 1.05M
  - MLP down: 2048 x 512 = 1.05M
  - LayerNorms: negligible
- Final LayerNorm: negligible
- LM head (weight-tied with embeddings): 0
- **Total: ~20.4M parameters**

## Training Configuration

| Parameter | Value |
|-----------|-------|
| Batch size | 4 |
| Gradient accumulation | 8 steps |
| Effective batch size | 32 |
| Learning rate | 6e-4 (cosine decay to 6e-5) |
| Warmup | 200 steps |
| Weight decay | 0.1 |
| Gradient clipping | 1.0 |
| Epochs | 15 |

## Hardware

| Component | Specification |
|-----------|---------------|
| Device | Cecilia (Raspberry Pi 5) |
| CPU | Cortex-A76, 4-core @ 2.4GHz |
| RAM | 8 GB |
| Storage | 457 GB NVMe |
| Accelerator | Hailo-8 (26 TOPS, not used for training) |
| Python | 3.13.5 |

## What This Model Can Do

After training, the model will be able to:
- Generate plausible BlackRoad-style shell scripts
- Complete markdown documentation patterns
- Produce CLI-style output with BlackRoad color codes
- Mimic YAML configuration structures
- Generate text that follows BlackRoad naming conventions

## What This Model Cannot Do

- Answer questions accurately
- Write semantically correct code
- Reason about problems
- Follow instructions
- Any task requiring understanding beyond pattern matching

This is a proof-of-concept for model sovereignty, not a production assistant.

## Sovereignty Statement

Every component of this model is owned by BlackRoad OS, Inc.:
- Training data: BlackRoad-authored content
- Tokenizer: Custom BPE, trained on BlackRoad corpus
- Architecture: Implemented from scratch in PyTorch
- Weights: Trained from random initialization
- Hardware: BlackRoad-owned Raspberry Pi fleet
- Code: Written for BlackRoad infrastructure
