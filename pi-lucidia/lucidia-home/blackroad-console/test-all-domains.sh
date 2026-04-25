#!/bin/bash
# Test all BlackRoad domains for Pi deployment
# Usage: ./test-all-domains.sh

DOMAINS=(
  "console.blackroad.io"
  "app.blackroad.io"
  "os.blackroad.io"
  "desktop.blackroad.io"
  "console.blackroad.systems"
  "os.blackroad.systems"
  "desktop.blackroad.systems"
  "console.blackroad.me"
  "os.blackroad.me"
  "desktop.blackroad.me"
  "console.blackroad.network"
  "os.blackroad.network"
  "desktop.blackroad.network"
  "console.blackroadai.com"
  "os.blackroadai.com"
  "desktop.blackroadai.com"
  "console.blackroadquantum.com"
  "os.blackroadquantum.com"
  "desktop.blackroadquantum.com"
  "console.lucidia.studio"
  "os.lucidia.studio"
  "desktop.lucidia.studio"
  "console.lucidia.earth"
  "os.lucidia.earth"
  "desktop.lucidia.earth"
  "blackroadinc.us"
)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Testing all BlackRoad domains for Pi"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

WORKING=0
NOT_WORKING=0
NO_BANNER=0

for domain in "${DOMAINS[@]}"; do
  printf "%-40s " "$domain"

  status=$(curl -s -o /dev/null -w "%{http_code}" https://$domain/ --connect-timeout 5 --max-time 10 2>/dev/null)

  if [[ "$status" == "200" ]]; then
    # Check for Pi banner
    if curl -s https://$domain/ 2>/dev/null | grep -q "HELLO FROM PI"; then
      echo "✅ Pi Active"
      ((WORKING++))
    else
      echo "⚠️  200 (no Pi banner)"
      ((NO_BANNER++))
    fi
  elif [[ "$status" == "000" ]]; then
    echo "❌ Connection failed"
    ((NOT_WORKING++))
  else
    echo "❌ HTTP $status"
    ((NOT_WORKING++))
  fi
done

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary:"
echo "  ✅ Working from Pi:     $WORKING"
echo "  ⚠️  Working (no banner): $NO_BANNER"
echo "  ❌ Not working:         $NOT_WORKING"
echo "  📊 Total tested:        ${#DOMAINS[@]}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ $WORKING -gt 0 ]]; then
  echo
  echo "🎉 $WORKING domain(s) successfully serving from Pi!"
fi

if [[ $NOT_WORKING -gt 0 ]] || [[ $NO_BANNER -gt 0 ]]; then
  echo
  echo "📝 Next steps:"
  if [[ $NOT_WORKING -gt 0 ]]; then
    echo "  1. Update DNS records to point to tunnel CNAME"
    echo "     See: CLOUDFLARE_DNS_SETUP.md"
  fi
  if [[ $NO_BANNER -gt 0 ]]; then
    echo "  2. Deploy latest console with Pi banner"
    echo "     Run: ./deploy-to-pi.sh"
  fi
fi
