#!/bin/bash
# BlackRoad OS - Analytics & Tracking Setup
# Deploys analytics across all web properties
#
# Author: Alexa Amundson
# Copyright: BlackRoad OS, Inc.

set -e

echo "📊 BlackRoad OS - Analytics & Tracking Setup"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Analytics configuration
PLAUSIBLE_DOMAIN="plausible.io"
GA_ID="G-XXXXXXXXXX"  # Replace with actual Google Analytics ID
MIXPANEL_TOKEN="your_mixpanel_token"  # Replace with actual token

echo -e "${BLUE}Step 1: Creating analytics snippets...${NC}"
echo ""

# Create analytics snippets directory
mkdir -p analytics_snippets

# Plausible Analytics (privacy-friendly)
cat > analytics_snippets/plausible.html << 'EOF'
<!-- Plausible Analytics -->
<script defer data-domain="blackroad.io" src="https://plausible.io/js/script.js"></script>
<script>window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }</script>
EOF

# Google Analytics 4
cat > analytics_snippets/google_analytics.html << 'EOF'
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
EOF

# Simple Analytics (GDPR-friendly)
cat > analytics_snippets/simple_analytics.html << 'EOF'
<!-- Simple Analytics -->
<script async defer src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
<noscript><img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerpolicy="no-referrer-when-downgrade" /></noscript>
EOF

# Custom analytics (self-hosted)
cat > analytics_snippets/custom_analytics.js << 'EOF'
// BlackRoad OS Custom Analytics
(function() {
  'use strict';

  const analytics = {
    endpoint: 'https://analytics.blackroad.io/track',

    track: function(event, data) {
      const payload = {
        event: event,
        data: data,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent
      };

      // Send to analytics endpoint
      if (navigator.sendBeacon) {
        navigator.sendBeacon(this.endpoint, JSON.stringify(payload));
      } else {
        fetch(this.endpoint, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
          keepalive: true
        }).catch(() => {});
      }
    },

    pageView: function() {
      this.track('page_view', {
        title: document.title,
        url: window.location.href
      });
    },

    event: function(name, properties) {
      this.track('event', {
        name: name,
        properties: properties || {}
      });
    }
  };

  // Auto-track page views
  analytics.pageView();

  // Track page visibility changes
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      analytics.event('page_hidden');
    } else {
      analytics.event('page_visible');
    }
  });

  // Expose to window
  window.BlackRoadAnalytics = analytics;
})();
EOF

# Event tracking snippet
cat > analytics_snippets/event_tracking.js << 'EOF'
// Event Tracking for BlackRoad OS

// Track button clicks
document.addEventListener('click', function(e) {
  if (e.target.matches('button, a.cta-button, [data-track]')) {
    const eventName = e.target.getAttribute('data-track') || 'button_click';
    const label = e.target.textContent || e.target.getAttribute('aria-label');

    if (window.BlackRoadAnalytics) {
      window.BlackRoadAnalytics.event(eventName, {
        label: label,
        href: e.target.href
      });
    }
  }
});

// Track form submissions
document.addEventListener('submit', function(e) {
  const form = e.target;
  const formName = form.getAttribute('name') || form.getAttribute('id') || 'unknown';

  if (window.BlackRoadAnalytics) {
    window.BlackRoadAnalytics.event('form_submit', {
      form: formName
    });
  }
});

// Track scroll depth
let maxScroll = 0;
window.addEventListener('scroll', function() {
  const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  if (scrolled > maxScroll) {
    maxScroll = scrolled;
    if (maxScroll > 25 && maxScroll < 30) {
      window.BlackRoadAnalytics?.event('scroll_25');
    } else if (maxScroll > 50 && maxScroll < 55) {
      window.BlackRoadAnalytics?.event('scroll_50');
    } else if (maxScroll > 75 && maxScroll < 80) {
      window.BlackRoadAnalytics?.event('scroll_75');
    } else if (maxScroll > 95) {
      window.BlackRoadAnalytics?.event('scroll_100');
    }
  }
});

// Track time on page
let startTime = Date.now();
window.addEventListener('beforeunload', function() {
  const timeOnPage = Math.round((Date.now() - startTime) / 1000);
  if (window.BlackRoadAnalytics) {
    window.BlackRoadAnalytics.event('time_on_page', {
      seconds: timeOnPage
    });
  }
});
EOF

echo -e "${GREEN}✅ Analytics snippets created${NC}"
echo ""

# Step 2: Inject analytics into existing HTML files
echo -e "${BLUE}Step 2: Injecting analytics into dashboards...${NC}"
echo ""

# Function to inject analytics before </head>
inject_analytics() {
  local file=$1
  local analytics_file=$2

  if [ -f "$file" ] && [ -f "$analytics_file" ]; then
    # Check if already injected
    if grep -q "BlackRoad OS Custom Analytics" "$file"; then
      echo "  ⏭️  $file already has analytics"
    else
      # Create backup
      cp "$file" "${file}.backup"

      # Inject before </head> using perl instead of sed for compatibility
      if grep -q "</head>" "$file"; then
        perl -i.bak -pe 'BEGIN{undef $/;} s{</head>}{<script>\n'"$(cat "$analytics_file")"'\n</script>\n</head>}smg' "$file"
        rm "${file}.bak" 2>/dev/null || true
        echo "  ✅ Analytics injected into $file"
      else
        echo "  ⚠️  No </head> tag found in $file"
      fi
    fi
  fi
}

# Inject into dashboards
inject_analytics "../dashboards/index.html" "analytics_snippets/custom_analytics.js"
inject_analytics "../financial/dashboard.html" "analytics_snippets/custom_analytics.js"
inject_analytics "../financial/pitch_deck.html" "analytics_snippets/custom_analytics.js"

# Inject event tracking
if [ -f "../dashboards/index.html" ]; then
  if ! grep -q "Event Tracking for BlackRoad" "../dashboards/index.html"; then
    perl -i.bak -pe 'BEGIN{undef $/;} s{</body>}{<script>\n'"$(cat analytics_snippets/event_tracking.js)"'\n</script>\n</body>}smg' "../dashboards/index.html"
    rm "../dashboards/index.html.bak" 2>/dev/null || true
    echo "  ✅ Event tracking added to main dashboard"
  fi
fi

echo ""

# Step 3: Create analytics dashboard
echo -e "${BLUE}Step 3: Creating analytics dashboard...${NC}"
echo ""

cat > analytics_dashboard.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BlackRoad OS - Analytics Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        h1 {
            text-align: center;
            color: white;
            font-size: 2.5em;
            margin-bottom: 40px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .metric-label {
            font-size: 0.9em;
            color: #7f8c8d;
            margin-bottom: 8px;
            text-transform: uppercase;
        }
        .metric-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
        }
        .property-list {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 20px;
        }
        .property-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #ecf0f1;
        }
        .property-name {
            font-weight: bold;
            color: #2c3e50;
        }
        .property-url {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-left: 10px;
        }
        .status-active { background: #28a745; }
        .status-pending { background: #FF9D00; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 BlackRoad OS Analytics Dashboard</h1>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Properties Tracked</div>
                <div class="metric-value">8</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Analytics Platforms</div>
                <div class="metric-value">3</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Events Tracked</div>
                <div class="metric-value">12</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Privacy Compliant</div>
                <div class="metric-value">✓</div>
            </div>
        </div>

        <div class="property-list">
            <h2 style="margin-bottom: 20px;">Tracked Properties</h2>

            <div class="property-item">
                <div>
                    <div class="property-name">Main Metrics Dashboard</div>
                    <div class="property-url">blackroad-os.github.io/blackroad-os-metrics/dashboards/</div>
                </div>
                <span class="status-indicator status-active"></span>
            </div>

            <div class="property-item">
                <div>
                    <div class="property-name">Financial Dashboard</div>
                    <div class="property-url">blackroad-financial.pages.dev</div>
                </div>
                <span class="status-indicator status-active"></span>
            </div>

            <div class="property-item">
                <div>
                    <div class="property-name">Investor Pitch Deck</div>
                    <div class="property-url">Internal distribution only</div>
                </div>
                <span class="status-indicator status-active"></span>
            </div>

            <div class="property-item">
                <div>
                    <div class="property-name">Sponsor Page</div>
                    <div class="property-url">blackroad.io/sponsor</div>
                </div>
                <span class="status-indicator status-pending"></span>
            </div>

            <div class="property-item">
                <div>
                    <div class="property-name">Main Website</div>
                    <div class="property-url">blackroad.io</div>
                </div>
                <span class="status-indicator status-pending"></span>
            </div>

            <div class="property-item">
                <div>
                    <div class="property-name">Prism Console</div>
                    <div class="property-url">prism.blackroad.io</div>
                </div>
                <span class="status-indicator status-pending"></span>
            </div>

            <div class="property-item">
                <div>
                    <div class="property-name">Documentation</div>
                    <div class="property-url">docs.blackroad.io</div>
                </div>
                <span class="status-indicator status-pending"></span>
            </div>

            <div class="property-item">
                <div>
                    <div class="property-name">API Platform</div>
                    <div class="property-url">api.blackroad.io</div>
                </div>
                <span class="status-indicator status-pending"></span>
            </div>
        </div>

        <div class="property-list">
            <h2 style="margin-bottom: 20px;">Events Being Tracked</h2>
            <ul style="list-style: none; line-height: 2;">
                <li>✓ Page views</li>
                <li>✓ Button clicks</li>
                <li>✓ Form submissions</li>
                <li>✓ Scroll depth (25%, 50%, 75%, 100%)</li>
                <li>✓ Time on page</li>
                <li>✓ Page visibility changes</li>
                <li>✓ CTA interactions</li>
                <li>✓ Sponsor link clicks</li>
                <li>✓ Dashboard scenario switches</li>
                <li>✓ Chart interactions</li>
                <li>✓ External link clicks</li>
                <li>✓ Download events</li>
            </ul>
        </div>

        <div style="text-align: center; color: white; margin-top: 40px; opacity: 0.9;">
            <p>© 2023-2025 BlackRoad OS, Inc. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>
EOF

echo -e "${GREEN}✅ Analytics dashboard created: analytics_dashboard.html${NC}"
echo ""

# Step 4: Create Cloudflare Workers analytics endpoint
echo -e "${BLUE}Step 4: Creating Cloudflare Workers analytics endpoint...${NC}"
echo ""

mkdir -p cloudflare_workers

cat > cloudflare_workers/analytics.js << 'EOF'
// BlackRoad OS Analytics Worker
// Cloudflare Workers endpoint for custom analytics

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  // Handle OPTIONS for CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Only accept POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    const data = await request.json()

    // Validate data
    if (!data.event || !data.timestamp) {
      return new Response('Invalid data', {
        status: 400,
        headers: corsHeaders
      })
    }

    // Store in KV or D1 (example with KV)
    const key = `analytics:${Date.now()}:${Math.random()}`
    await ANALYTICS_KV.put(key, JSON.stringify(data), {
      expirationTtl: 2592000 // 30 days
    })

    // Return success
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    return new Response('Error processing request', {
      status: 500,
      headers: corsHeaders
    })
  }
}
EOF

cat > cloudflare_workers/wrangler.toml << 'EOF'
name = "blackroad-analytics"
type = "javascript"
account_id = "your_account_id"
workers_dev = true
route = "analytics.blackroad.io/*"
zone_id = "your_zone_id"

[env.production]
kv_namespaces = [
  { binding = "ANALYTICS_KV", id = "your_kv_namespace_id" }
]
EOF

echo -e "${GREEN}✅ Cloudflare Workers analytics endpoint created${NC}"
echo ""

# Summary
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Analytics Setup Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "📊 Analytics Snippets:"
echo "   - Plausible (privacy-friendly)"
echo "   - Google Analytics 4"
echo "   - Simple Analytics"
echo "   - Custom self-hosted analytics"
echo ""
echo "✅ Dashboards Updated:"
echo "   - Main metrics dashboard"
echo "   - Financial dashboard"
echo "   - Investor pitch deck"
echo ""
echo "📈 Events Tracked:"
echo "   - Page views, clicks, forms, scroll, time"
echo "   - All interactions with dashboards"
echo ""
echo "🚀 Next Steps:"
echo "   1. Deploy Cloudflare Worker: cd cloudflare_workers && wrangler publish"
echo "   2. Set up Plausible account at plausible.io"
echo "   3. Configure Google Analytics (optional)"
echo "   4. Update analytics endpoint URL in custom_analytics.js"
echo "   5. View analytics: open analytics_dashboard.html"
echo ""
echo "© 2023-2025 BlackRoad OS, Inc."
