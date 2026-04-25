#!/bin/bash
# Quick Dial - Speed dial for favorite agents

FAVORITES=(
    "mercury:Mercury (revenue specialist)"
    "cece:Cece (coordinator)"
    "erebus:Erebus (infrastructure weaver)"
    "atlas:Atlas (system architect)"
    "prometheus:Prometheus (monitoring)"
)

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              📞 QUICK DIAL - FAVORITE AGENTS 📞               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

for i in "${!FAVORITES[@]}"; do
    IFS=':' read -r shortcode desc <<< "${FAVORITES[$i]}"
    echo "  $((i+1)). [$shortcode] $desc"
done

echo ""
echo "Select agent (1-${#FAVORITES[@]}) or type name:"
read -r choice

if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#FAVORITES[@]}" ]; then
    IFS=':' read -r shortcode desc <<< "${FAVORITES[$((choice-1))]}"
    ~/blackroad-agent-dial/agent-dial.sh call "$shortcode"
else
    ~/blackroad-agent-dial/agent-dial.sh call "$choice"
fi
