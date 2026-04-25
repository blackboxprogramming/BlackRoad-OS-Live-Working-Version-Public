#!/bin/bash
clear
cat <<'MENU'

  🧿🧿🧿 HAILO-8 (26 TOPS) 🧿🧿🧿

  📊 1  Detect Hailo Devices
  🖥️  2  cecilia Hailo Status
  🖥️  3  (reserved)
  🧠 4  Run Inference Test
  📷 5  Camera → Object Detection
  📋 6  List HailoRT Models
  🔧 7  hailortcli Info
  📦 8  Check hailo-tappas
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) echo "  🧿 Scanning for Hailo devices..."
     hailortcli scan 2>/dev/null || echo "  ⚠️  hailortcli not found (try on Pi)"; read -p "  ↩ ";;
  2) echo "  🖥️  cecilia Hailo:"; ssh -o ConnectTimeout=3 cecilia "hailortcli scan 2>/dev/null && hailortcli fw-control identify 2>/dev/null" || echo "  ⚠️  Offline"; read -p "  ↩ ";;
  3) echo "  ⚠️  No other confirmed Hailo-8 nodes"; read -p "  ↩ ";;
  4) echo "  🧠 Running inference benchmark..."
     ssh -o ConnectTimeout=3 cecilia "hailortcli benchmark --hef /usr/share/hailo-models/yolov5m_wo_spp_60p.hef 2>/dev/null" || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  5) echo "  📷 Starting detection pipeline on cecilia..."
     ssh -o ConnectTimeout=3 cecilia "cd /opt/hailo-tappas 2>/dev/null && ls apps/ 2>/dev/null" || echo "  ⚠️  tappas not found"; read -p "  ↩ ";;
  6) echo "  📋 Available HEF models:"
     ssh -o ConnectTimeout=3 cecilia "ls /usr/share/hailo-models/*.hef 2>/dev/null || ls ~/hailo-models/*.hef 2>/dev/null" || echo "  ⚠️  None found"; read -p "  ↩ ";;
  7) ssh -o ConnectTimeout=3 cecilia "hailortcli fw-control identify 2>/dev/null" || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  8) ssh -o ConnectTimeout=3 cecilia "dpkg -l | grep hailo 2>/dev/null" || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./hailo.sh
