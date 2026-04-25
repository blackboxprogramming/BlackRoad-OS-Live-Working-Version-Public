# Mobile Skill Installation Guide

> Install BlackRoad skills on your phone via the Claude app

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation Steps (Mobile)](#installation-steps-mobile)
- [Installation Steps (Desktop/Browser)](#installation-steps-desktopbrowser)
- [Verifying Installation](#verifying-installation)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## Overview

BlackRoad skills (`.skill` files) can be installed directly from your phone using the Claude mobile app. Once installed, a skill is attached to your account and works across **all** your devices — mobile, desktop, and browser.

---

## Prerequisites

| Requirement | Details |
|-------------|---------|
| **Claude App** | Latest version from App Store (iOS) or Google Play (Android) |
| **Skill File** | A `.skill` file downloaded to your device |
| **Account** | Signed-in Claude account |

---

## Installation Steps (Mobile)

### Step 1: Download the `.skill` File

Download the `.skill` file to your phone. It will appear in your device's Downloads folder or Files app.

### Step 2: Open the Claude App

Launch the Claude app on your phone and make sure you're signed in.

### Step 3: Navigate to Skills Settings

1. Tap your **profile icon** or open the **Settings** menu
2. Look for **Skills** or **Manage Skills** in the settings list
3. Tap to open the Skills management screen

### Step 4: Install the Skill

1. Tap the **+** or **Install** button
2. Browse to and select the `.skill` file from your device storage
3. Confirm the installation when prompted

### Step 5: Confirm Activation

The skill should now appear in your installed skills list with an active status.

---

## Installation Steps (Desktop/Browser)

If the **Skills** section isn't visible in the mobile app settings (it can vary by app version), install from desktop instead — the skill syncs to your account and will work everywhere, including mobile.

### Via Desktop/Browser

1. Open [claude.ai](https://claude.ai) in your browser
2. Go to **Settings** → **Skills**
3. Click **Install Skill** and upload the `.skill` file
4. The skill is now available on all your devices, including mobile

### Via CLI

```bash
# Install from a local file
blackroad-skills install ./my-skill.skill

# Install from the BlackRoad registry
blackroad-skills install my-skill

# Install a specific version
blackroad-skills install my-skill@1.0.0
```

---

## Verifying Installation

After installation, verify the skill is active:

### On Mobile

1. Open Claude app → **Settings** → **Skills**
2. Confirm the skill appears in the list with an **Active** badge

### On Desktop

1. Open Claude → **Settings** → **Skills**
2. The skill should show as **Installed** with its version number

### Via CLI

```bash
# List installed skills
blackroad-skills list

# Check a specific skill
blackroad-skills info my-skill
```

---

## Troubleshooting

### Skills Section Not Visible on Mobile

The Skills settings UI may not be fully available on all mobile app versions. If you don't see it:

1. **Update the app** — make sure you have the latest version
2. **Use desktop instead** — install via browser at [claude.ai](https://claude.ai); the skill syncs to your account and works on mobile automatically
3. **Check your account tier** — some features require specific account types

### Skill File Won't Open

| Issue | Solution |
|-------|----------|
| File not recognized | Ensure the file extension is `.skill` |
| Download incomplete | Re-download the file and check file size |
| Permission denied | Move the file to a location the app can access (e.g., Downloads) |

### Skill Installed but Not Working

1. **Restart the app** — close and reopen the Claude app
2. **Check compatibility** — the skill may require a newer app version
3. **Re-install** — remove the skill and install it again
4. **Check logs** — run `blackroad-skills logs my-skill` from CLI for details

### Sync Issues Across Devices

Skills are account-level — once installed, they should appear on all devices signed in with the same account. If not:

1. Sign out and sign back in on the affected device
2. Check your internet connection
3. Wait a few minutes for sync to propagate

---

## FAQ

### Does it matter where I install the skill?

No. Skills install to your **account**, not your device. Install from mobile, desktop, or CLI — the skill becomes available everywhere you're signed in.

### Can I install skills offline?

You need an internet connection for the initial installation (to register the skill with your account). After installation, skill availability depends on the specific skill's requirements.

### How do I uninstall a skill?

- **Mobile**: Settings → Skills → tap the skill → **Remove**
- **Desktop**: Settings → Skills → click the skill → **Uninstall**
- **CLI**: `blackroad-skills uninstall my-skill`

### Where can I find skills to install?

| Source | URL |
|--------|-----|
| BlackRoad Registry | `https://registry.blackroad.io/skills` |
| CLI Search | `blackroad-skills search "keyword"` |
| GitHub | Check BlackRoad-OS organization repos |

### Is this my first skill install?

If you've never installed a skill before, the steps above are all you need. The process is the same whether it's your first or fiftieth. Once you get the first one going, the rest are straightforward.

---

## Related Documentation

- [SKILLS.md](SKILLS.md) — Full Skills SDK documentation
- [ONBOARDING.md](ONBOARDING.md) — New developer quick start
- [FAQ.md](FAQ.md) — General frequently asked questions
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — Common issues and solutions

---

*Last updated: 2026-02-28*
