#!/bin/bash
# Update all BlackRoad DNS records to point to Pi tunnel
# Usage: CLOUDFLARE_API_TOKEN=your_token ./update-all-dns.sh

set -euo pipefail

TUNNEL_TARGET="90ad32b8-d87b-42ac-9755-9adb952bb78a.cfargotunnel.com"

# Check for API token
if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
    echo "❌ Error: CLOUDFLARE_API_TOKEN not set"
    echo ""
    echo "Get your API token from: https://dash.cloudflare.com/profile/api-tokens"
    echo "Required permissions: Zone.DNS (Edit)"
    echo ""
    echo "Usage: CLOUDFLARE_API_TOKEN=your_token ./update-all-dns.sh"
    exit 1
fi

# Zone IDs (you'll need to fill these in)
declare -A ZONES=(
    ["blackroad.io"]=""
    ["blackroad.systems"]=""
    ["blackroad.me"]=""
    ["blackroad.network"]=""
    ["blackroadai.com"]=""
    ["blackroadquantum.com"]=""
    ["lucidia.studio"]=""
    ["lucidia.earth"]=""
    ["blackroadinc.us"]=""
)

# Subdomains to create/update (except blackroadinc.us which is root)
SUBDOMAINS=("console" "app" "os" "desktop")

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  BlackRoad DNS Update - Pi Tunnel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Tunnel Target: $TUNNEL_TARGET"
echo ""

# Function to get zone ID
get_zone_id() {
    local zone_name="$1"
    curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$zone_name" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" | jq -r '.result[0].id'
}

# Function to list DNS records
get_dns_records() {
    local zone_id="$1"
    local record_name="$2"
    curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records?name=$record_name" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json"
}

# Function to create DNS record
create_dns_record() {
    local zone_id="$1"
    local record_name="$2"
    local record_type="CNAME"
    local content="$TUNNEL_TARGET"

    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{\"type\":\"$record_type\",\"name\":\"$record_name\",\"content\":\"$content\",\"ttl\":1,\"proxied\":true}"
}

# Function to update DNS record
update_dns_record() {
    local zone_id="$1"
    local record_id="$2"
    local record_name="$3"
    local record_type="CNAME"
    local content="$TUNNEL_TARGET"

    curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records/$record_id" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{\"type\":\"$record_type\",\"name\":\"$record_name\",\"content\":\"$content\",\"ttl\":1,\"proxied\":true}"
}

# First, get all zone IDs
echo "📡 Fetching zone IDs..."
for zone in "${!ZONES[@]}"; do
    zone_id=$(get_zone_id "$zone")
    if [[ -n "$zone_id" && "$zone_id" != "null" ]]; then
        ZONES[$zone]=$zone_id
        echo "  ✅ $zone: $zone_id"
    else
        echo "  ❌ $zone: Not found or no access"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Updating DNS records..."
echo ""

UPDATED=0
CREATED=0
FAILED=0

# Update subdomains for each zone
for zone in "${!ZONES[@]}"; do
    zone_id="${ZONES[$zone]}"

    if [[ -z "$zone_id" || "$zone_id" == "" ]]; then
        echo "⏭️  Skipping $zone (no zone ID)"
        continue
    fi

    # Special handling for blackroadinc.us (root domain)
    if [[ "$zone" == "blackroadinc.us" ]]; then
        echo "Processing root domain: $zone"

        # Get existing record
        result=$(get_dns_records "$zone_id" "$zone")
        record_id=$(echo "$result" | jq -r '.result[0].id // empty')

        if [[ -n "$record_id" && "$record_id" != "null" ]]; then
            # Update existing record
            response=$(update_dns_record "$zone_id" "$record_id" "$zone")
            if echo "$response" | jq -e '.success' > /dev/null; then
                echo "  ✅ Updated: $zone"
                ((UPDATED++))
            else
                error=$(echo "$response" | jq -r '.errors[0].message // "Unknown error"')
                echo "  ❌ Failed to update $zone: $error"
                ((FAILED++))
            fi
        else
            # Create new record
            response=$(create_dns_record "$zone_id" "$zone")
            if echo "$response" | jq -e '.success' > /dev/null; then
                echo "  ✅ Created: $zone"
                ((CREATED++))
            else
                error=$(echo "$response" | jq -r '.errors[0].message // "Unknown error"')
                echo "  ❌ Failed to create $zone: $error"
                ((FAILED++))
            fi
        fi
        continue
    fi

    # Process subdomains
    for subdomain in "${SUBDOMAINS[@]}"; do
        fqdn="$subdomain.$zone"
        echo "Processing: $fqdn"

        # Get existing record
        result=$(get_dns_records "$zone_id" "$fqdn")
        record_id=$(echo "$result" | jq -r '.result[0].id // empty')

        if [[ -n "$record_id" && "$record_id" != "null" ]]; then
            # Update existing record
            response=$(update_dns_record "$zone_id" "$record_id" "$fqdn")
            if echo "$response" | jq -e '.success' > /dev/null; then
                echo "  ✅ Updated: $fqdn"
                ((UPDATED++))
            else
                error=$(echo "$response" | jq -r '.errors[0].message // "Unknown error"')
                echo "  ❌ Failed to update $fqdn: $error"
                ((FAILED++))
            fi
        else
            # Create new record
            response=$(create_dns_record "$zone_id" "$fqdn")
            if echo "$response" | jq -e '.success' > /dev/null; then
                echo "  ✅ Created: $fqdn"
                ((CREATED++))
            else
                error=$(echo "$response" | jq -r '.errors[0].message // "Unknown error"')
                echo "  ❌ Failed to create $fqdn: $error"
                ((FAILED++))
            fi
        fi

        # Small delay to avoid rate limiting
        sleep 0.5
    done
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo "  ✅ Updated:  $UPDATED"
echo "  ✅ Created:  $CREATED"
echo "  ❌ Failed:   $FAILED"
echo "  📊 Total:    $((UPDATED + CREATED + FAILED))"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ $((UPDATED + CREATED)) -gt 0 ]]; then
    echo ""
    echo "✅ DNS update complete!"
    echo ""
    echo "⏱️  Wait 1-5 minutes for DNS propagation, then run:"
    echo "   ./test-all-domains.sh"
    echo ""
fi
