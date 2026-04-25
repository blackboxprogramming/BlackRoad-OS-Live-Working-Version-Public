"""
BlackRoad NanoGPT -- GPT-2-style decoder-only transformer.

Pure PyTorch implementation, ~20.4M parameters.
Designed to train from scratch on BlackRoad corpus on Raspberry Pi 5.
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F


class CausalSelfAttention(nn.Module):
    """Multi-head causal (masked) self-attention."""

    def __init__(self, config):
        super().__init__()
        assert config['n_embd'] % config['n_head'] == 0
        self.n_head = config['n_head']
        self.n_embd = config['n_embd']
        self.head_dim = self.n_embd // self.n_head

        self.c_attn = nn.Linear(self.n_embd, 3 * self.n_embd)
        self.c_proj = nn.Linear(self.n_embd, self.n_embd)
        self.attn_dropout = nn.Dropout(config['dropout'])
        self.resid_dropout = nn.Dropout(config['dropout'])

        # causal mask
        self.register_buffer(
            'bias',
            torch.tril(torch.ones(config['block_size'], config['block_size']))
            .view(1, 1, config['block_size'], config['block_size'])
        )

    def forward(self, x):
        B, T, C = x.size()

        qkv = self.c_attn(x)
        q, k, v = qkv.split(self.n_embd, dim=2)

        q = q.view(B, T, self.n_head, self.head_dim).transpose(1, 2)
        k = k.view(B, T, self.n_head, self.head_dim).transpose(1, 2)
        v = v.view(B, T, self.n_head, self.head_dim).transpose(1, 2)

        att = (q @ k.transpose(-2, -1)) * (1.0 / math.sqrt(self.head_dim))
        att = att.masked_fill(self.bias[:, :, :T, :T] == 0, float('-inf'))
        att = F.softmax(att, dim=-1)
        att = self.attn_dropout(att)

        y = att @ v
        y = y.transpose(1, 2).contiguous().view(B, T, C)
        y = self.resid_dropout(self.c_proj(y))
        return y


class MLP(nn.Module):
    """Feed-forward network with GELU activation."""

    def __init__(self, config):
        super().__init__()
        self.c_fc = nn.Linear(config['n_embd'], 4 * config['n_embd'])
        self.c_proj = nn.Linear(4 * config['n_embd'], config['n_embd'])
        self.dropout = nn.Dropout(config['dropout'])
        self.gelu = nn.GELU()

    def forward(self, x):
        x = self.gelu(self.c_fc(x))
        x = self.dropout(self.c_proj(x))
        return x


class Block(nn.Module):
    """Transformer block: layernorm -> attention -> residual -> layernorm -> mlp -> residual."""

    def __init__(self, config):
        super().__init__()
        self.ln_1 = nn.LayerNorm(config['n_embd'])
        self.attn = CausalSelfAttention(config)
        self.ln_2 = nn.LayerNorm(config['n_embd'])
        self.mlp = MLP(config)

    def forward(self, x):
        x = x + self.attn(self.ln_1(x))
        x = x + self.mlp(self.ln_2(x))
        return x


class GPT(nn.Module):
    """GPT-2-style language model."""

    def __init__(self, config):
        super().__init__()
        self.config = config
        self.block_size = config['block_size']

        self.transformer = nn.ModuleDict(dict(
            wte=nn.Embedding(config['vocab_size'], config['n_embd']),
            wpe=nn.Embedding(config['block_size'], config['n_embd']),
            drop=nn.Dropout(config['dropout']),
            h=nn.ModuleList([Block(config) for _ in range(config['n_layer'])]),
            ln_f=nn.LayerNorm(config['n_embd']),
        ))
        self.lm_head = nn.Linear(config['n_embd'], config['vocab_size'], bias=False)

        # weight tying: share embedding weights with lm_head
        self.transformer.wte.weight = self.lm_head.weight

        self.apply(self._init_weights)

        # scale residual projections per GPT-2 paper
        for pn, p in self.named_parameters():
            if pn.endswith('c_proj.weight'):
                torch.nn.init.normal_(p, mean=0.0, std=0.02 / math.sqrt(2 * config['n_layer']))

        n_params = sum(p.numel() for p in self.parameters())
        # subtract the tied weights (counted once via lm_head, once via wte)
        n_params -= self.transformer.wpe.weight.numel()
        self.n_params = n_params

    def _init_weights(self, module):
        if isinstance(module, nn.Linear):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                torch.nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)

    def forward(self, idx, targets=None):
        B, T = idx.size()
        assert T <= self.block_size, f"Sequence length {T} exceeds block_size {self.block_size}"

        pos = torch.arange(0, T, dtype=torch.long, device=idx.device)

        tok_emb = self.transformer.wte(idx)
        pos_emb = self.transformer.wpe(pos)
        x = self.transformer.drop(tok_emb + pos_emb)

        for block in self.transformer.h:
            x = block(x)

        x = self.transformer.ln_f(x)
        logits = self.lm_head(x)

        loss = None
        if targets is not None:
            loss = F.cross_entropy(logits.view(-1, logits.size(-1)), targets.view(-1))

        return logits, loss

    @torch.no_grad()
    def generate(self, idx, max_new_tokens, temperature=1.0, top_k=None):
        """Autoregressive generation with temperature and optional top-k sampling."""
        for _ in range(max_new_tokens):
            # crop to block_size if needed
            idx_cond = idx if idx.size(1) <= self.block_size else idx[:, -self.block_size:]

            logits, _ = self(idx_cond)
            logits = logits[:, -1, :] / temperature

            if top_k is not None:
                v, _ = torch.topk(logits, min(top_k, logits.size(-1)))
                logits[logits < v[:, [-1]]] = float('-inf')

            probs = F.softmax(logits, dim=-1)
            idx_next = torch.multinomial(probs, num_samples=1)
            idx = torch.cat((idx, idx_next), dim=1)

        return idx

    def count_parameters(self):
        """Return human-readable parameter count."""
        n = self.n_params
        if n >= 1e6:
            return f"{n / 1e6:.1f}M"
        elif n >= 1e3:
            return f"{n / 1e3:.1f}K"
        return str(n)
