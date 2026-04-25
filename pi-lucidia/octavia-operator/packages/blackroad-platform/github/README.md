# GitHub Bootstrap

This bootstrap creates the BlackRoad org repos, configures environments, and injects secrets with approval gates for production.

## Repositories

- `blackroad-cli`: CLI tooling and local automation
- `blackroad-agents`: agent definitions, prompts, and orchestration logic
- `blackroad-infra`: infrastructure scripts, provisioning, and IaC
- `blackroad-docs`: platform documentation and runbooks

## Actions and CI

This repository includes default workflows under `.github/workflows/`:

- Shellcheck for bash scripts
- Release tagging on `v*` tags

Copy these workflows into each repo to standardize CI.

## Environments

`dev` and `prod` environments are created in each repo. `prod` requires approval reviewers from `GITHUB_PROD_REVIEWER_*`.

## Run

```bash
./github/setup-github.sh all
```

## Environment Variables

- `GITHUB_ORG`
- `GITHUB_VISIBILITY`
- `GITHUB_PROD_REVIEWER_USERNAMES` or `GITHUB_PROD_REVIEWER_IDS`
- `CLOUDFLARE_API_TOKEN`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
