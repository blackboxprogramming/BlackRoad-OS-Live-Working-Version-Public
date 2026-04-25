# BlackRoad OS - Deploy Keys

> **Generated**: 2025-11-29
> **Location**: ~/.ssh/blackroad-deploy/

## Deploy Keys for Satellite Repo Sync

These keys enable the monorepo to push changes to satellite repositories.

### Key Locations

| Repo | Private Key | Public Key |
|------|-------------|------------|
| blackroad-os-infra | ~/.ssh/blackroad-deploy/infra | ~/.ssh/blackroad-deploy/infra.pub |
| blackroad-os-core | ~/.ssh/blackroad-deploy/core | ~/.ssh/blackroad-deploy/core.pub |
| blackroad-os-operator | ~/.ssh/blackroad-deploy/operator | ~/.ssh/blackroad-deploy/operator.pub |

---

## Public Keys (Add to GitHub Repos)

### blackroad-os-infra
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINgPG/wFrB84H6IAIeDH7lKbHfAa3+6l6hUWVUTEpISj deploy-infra@blackroad.systems
```

### blackroad-os-core
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPAx1L5spDV+ZdQjgA0beDib+fUa1lqzhKw9sUlfToGG deploy-core@blackroad.systems
```

### blackroad-os-operator
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIB8Hm32vsfRJtuAJAGkILePRfAQUMyrL5XdWTehsEOXT deploy-operator@blackroad.systems
```

---

## Setup Instructions

### Step 1: Enable Deploy Keys on Repos

1. Go to each repo in GitHub:
   - https://github.com/BlackRoad-OS/blackroad-os-infra/settings
   - https://github.com/BlackRoad-OS/blackroad-os-core/settings
   - https://github.com/BlackRoad-OS/blackroad-os-operator/settings

2. Navigate to: Settings → Deploy keys

3. Click "Add deploy key"

4. Paste the corresponding public key (above)

5. **Check "Allow write access"**

6. Click "Add key"

### Step 2: Add Private Keys to Monorepo Secrets

1. Go to: https://github.com/blackboxprogramming/BlackRoad-Operating-System/settings/secrets/actions

2. Click "New repository secret"

3. Add each private key:

| Secret Name | Value (from file) |
|-------------|-------------------|
| INFRA_DEPLOY_KEY | Contents of ~/.ssh/blackroad-deploy/infra |
| CORE_DEPLOY_KEY | Contents of ~/.ssh/blackroad-deploy/core |
| OPERATOR_DEPLOY_KEY | Contents of ~/.ssh/blackroad-deploy/operator |

### Step 3: Verify Setup

After adding keys, trigger a sync workflow:
```bash
gh workflow run sync-satellites.yml -R blackboxprogramming/BlackRoad-Operating-System
```

---

## Security Notes

- Private keys are stored locally at `~/.ssh/blackroad-deploy/`
- Never commit private keys to version control
- Keys are ed25519 format (modern, secure)
- Each key is scoped to a single repository

---

## Regenerating Keys

If keys are compromised:

```bash
# Remove old keys
rm -rf ~/.ssh/blackroad-deploy/

# Generate new keys
ssh-keygen -t ed25519 -C "deploy-infra@blackroad.systems" -f ~/.ssh/blackroad-deploy/infra -N ""
ssh-keygen -t ed25519 -C "deploy-core@blackroad.systems" -f ~/.ssh/blackroad-deploy/core -N ""
ssh-keygen -t ed25519 -C "deploy-operator@blackroad.systems" -f ~/.ssh/blackroad-deploy/operator -N ""

# Then update GitHub deploy keys and secrets
```
