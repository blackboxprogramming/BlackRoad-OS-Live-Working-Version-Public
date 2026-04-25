# BlackRoad Platform Bootstrap

BlackRoad platform bootstrap provides scriptable infrastructure setup and a unified agent provider interface across Cloudflare, GitHub, and model providers (Ollama, Anthropic, OpenAI). It is built for repeatability, auditability, and least-privilege operations.

## Quickstart

```bash
cd /Users/alexa/blackroad-platform
./install.sh
```

Edit `.env` with required values, then run the setup scripts:

```bash
./cloudflare/setup-cloudflare.sh all
./github/setup-github.sh all
```

## Provider Usage

The agent interface is a single function call:

```bash
provider_call "$PROVIDER" "$SYSTEM_PROMPT" "$USER_PROMPT"
```

Defaults are local-first. If `PROVIDER` is empty or `auto`, the selector uses Ollama when available, then Anthropic, then OpenAI.

Example:

```bash
PROVIDER=ollama ./agents/analyst.sh "Summarize this system."
PROVIDER=anthropic ./agents/planner.sh "Draft an execution plan."
```

## Directory Layout

```
blackroad-platform/
  cloudflare/
    setup-cloudflare.sh
    tunnel.template.yml
    README.md
  github/
    setup-github.sh
    README.md
  agents/
    planner.sh
    analyst.sh
  lib/
    common.sh
    providers/
      ollama.sh
      anthropic.sh
      openai.sh
      provider.sh
  .github/
    workflows/
  install.sh
  .env.example
```

## Security Model

- No secrets are committed to Git. Use `.env` and `.secrets/` (ignored by `.gitignore`).
- Cloudflare Access service tokens are written to `.secrets/` with restricted permissions.
- API tokens are scoped for least privilege and separated for read vs write.

## Cloudflare Setup

See `cloudflare/README.md` for the security model, environment separation, and required variables.

## GitHub Setup

See `github/README.md` for org/repo responsibilities and GitHub Actions configuration.

## Workflow Checks

- `shellcheck` runs on shell scripts.
- Releases publish on `v*` tags.
