# Google Drive Upload Instructions

## Method 1: Web Upload (Manual)

1. Visit [Google Drive](https://drive.google.com)
2. Sign in to:
   - blackroad.systems@gmail.com
   - amundsonalexa@gmail.com
3. Create folder: "BlackRoad Documentation"
4. Upload entire `blackroad-docs-sync/` folder
5. Share folder (view access) with both emails

## Method 2: Google Drive CLI (Automated)

### Install rclone

```bash
# macOS
brew install rclone

# Linux
curl https://rclone.org/install.sh | sudo bash
```

### Configure rclone

```bash
# Start configuration
rclone config

# Follow prompts:
# - n (new remote)
# - name: blackroad-systems
# - type: drive
# - client_id: (press Enter for defaults)
# - client_secret: (press Enter)
# - scope: 1 (full access)
# - service_account_file: (press Enter)
# - Edit advanced config: n
# - Use auto config: y (opens browser)
# - Sign in with blackroad.systems@gmail.com
# - Configure as team drive: n
# - Confirm: y

# Repeat for amundsonalexa@gmail.com
```

### Upload to Google Drive

```bash
# Upload to blackroad.systems@gmail.com
rclone copy ~/blackroad-docs-sync blackroad-systems:BlackRoad-Documentation -v

# Upload to amundsonalexa@gmail.com
rclone copy ~/blackroad-docs-sync amundsonalexa:BlackRoad-Documentation -v
```

### Sync (continuous updates)

```bash
# Sync changes only
rclone sync ~/blackroad-docs-sync blackroad-systems:BlackRoad-Documentation -v
```

## Method 3: Share Compressed Archive

```bash
# Archive already created at:
~/blackroad-docs-sync.tar.gz

# Email to:
# - blackroad.systems@gmail.com
# - amundsonalexa@gmail.com

# Or upload to:
# - WeTransfer
# - Dropbox
# - Google Drive web interface
```

## Folder Structure on Google Drive

```
BlackRoad Documentation/
├── master-guides/
├── deployment-scripts/
├── product-docs/
│   ├── roadauth/
│   ├── roadapi/
│   ├── ... (24 products total)
├── integration-guides/
└── INDEX.md
```

## Sharing Settings

**Recommended:**
- Folder visibility: Private
- Share with: blackroad.systems@gmail.com, amundsonalexa@gmail.com
- Permission: View/Download (read-only)

**For Team Access:**
- Create shared drive: "BlackRoad Team"
- Add members
- Upload to shared drive

## Automatic Sync (Optional)

Create a cron job for weekly syncs:

```bash
# Edit crontab
crontab -e

# Add weekly Sunday midnight sync
0 0 * * 0 ~/sync-to-google-drive.sh && rclone sync ~/blackroad-docs-sync blackroad-systems:BlackRoad-Documentation
```

🖤🛣️ Documentation synced to Google Drive
