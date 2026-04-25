#!/usr/bin/env python3
"""
Investor Pitch Deck Generator
Creates HTML presentation from metrics and financial data

Author: Alexa Amundson
Copyright: BlackRoad OS, Inc.
"""

import json
from datetime import datetime

def load_all_data():
    """Load all necessary data files"""
    data = {}

    files = {
        'kpis': '../kpis.json',
        'history': '../complete_history.json',
        'financial': 'revenue_projections.json',
        'investor': 'investor_deck_data.json'
    }

    for key, path in files.items():
        try:
            with open(path, 'r') as f:
                data[key] = json.load(f)
        except FileNotFoundError:
            print(f"⚠️  {path} not found")
            data[key] = {}

    return data

def generate_pitch_deck_html(data):
    """Generate complete pitch deck as HTML presentation"""

    kpis = data.get('kpis', {}).get('data', {})
    history = data.get('history', {}).get('data', {})
    financial = data.get('financial', {}).get('data', {})
    investor = data.get('investor', {}).get('slide_data', {})

    html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BlackRoad OS - Investor Pitch Deck</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #000;
            color: #fff;
            overflow-x: hidden;
        }

        .slide {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 60px;
            position: relative;
        }

        .slide-bg-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .slide-bg-dark {
            background: #1a1a2e;
        }

        h1 {
            font-size: 4em;
            margin-bottom: 20px;
            font-weight: bold;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .slide-bg-gradient h1,
        .slide-bg-gradient h2 {
            background: white;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        h2 {
            font-size: 3em;
            margin-bottom: 40px;
            text-align: center;
        }

        h3 {
            font-size: 2em;
            margin-bottom: 20px;
            color: #667eea;
        }

        .tagline {
            font-size: 1.8em;
            font-style: italic;
            opacity: 0.9;
            margin-bottom: 60px;
            text-align: center;
        }

        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            width: 100%;
            max-width: 1200px;
            margin: 40px 0;
        }

        .metric-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            transition: transform 0.3s;
        }

        .metric-card:hover {
            transform: translateY(-10px);
            background: rgba(255, 255, 255, 0.08);
        }

        .metric-value {
            font-size: 3em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }

        .metric-label {
            font-size: 1.2em;
            opacity: 0.8;
        }

        .bullet-list {
            list-style: none;
            font-size: 1.5em;
            line-height: 2;
            max-width: 800px;
        }

        .bullet-list li {
            padding-left: 40px;
            position: relative;
            margin-bottom: 20px;
        }

        .bullet-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #28a745;
            font-weight: bold;
            font-size: 1.5em;
        }

        .timeline {
            width: 100%;
            max-width: 1000px;
            margin: 40px 0;
        }

        .timeline-item {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-left: 4px solid #667eea;
            border-radius: 8px;
        }

        .timeline-date {
            font-weight: bold;
            color: #667eea;
            min-width: 120px;
        }

        .cta-button {
            display: inline-block;
            padding: 20px 60px;
            font-size: 1.5em;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            margin-top: 40px;
            transition: transform 0.3s;
        }

        .cta-button:hover {
            transform: scale(1.1);
        }

        .slide-number {
            position: absolute;
            bottom: 20px;
            right: 40px;
            opacity: 0.5;
            font-size: 1.2em;
        }

        .footer {
            position: absolute;
            bottom: 20px;
            left: 40px;
            opacity: 0.7;
            font-size: 0.9em;
        }

        table {
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 1.3em;
            min-width: 600px;
        }

        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        th {
            background: rgba(102, 126, 234, 0.2);
            font-weight: bold;
        }

        @media print {
            .slide {
                page-break-after: always;
            }
        }
    </style>
</head>
<body>
"""

    # Slide 1: Title
    html += """
    <div class="slide slide-bg-gradient">
        <h1>BlackRoad OS</h1>
        <p class="tagline">"The road isn't made. It's remembered."</p>
        <div style="font-size: 1.5em; margin-top: 40px;">
            <p><strong>AI Infrastructure & Multi-Agent Orchestration</strong></p>
            <p style="margin-top: 20px;">Investor Presentation</p>
            <p style="margin-top: 10px; opacity: 0.8;">""" + datetime.now().strftime('%B %Y') + """</p>
        </div>
        <div class="footer">© 2023-2025 BlackRoad OS, Inc.</div>
        <div class="slide-number">1</div>
    </div>
"""

    # Slide 2: The Problem
    html += """
    <div class="slide slide-bg-dark">
        <h2>The Problem</h2>
        <ul class="bullet-list">
            <li>AI infrastructure is complex and expensive</li>
            <li>Multi-agent coordination is manual and error-prone</li>
            <li>Cloud costs are spiraling out of control</li>
            <li>Compliance and audit trails are afterthoughts</li>
            <li>Developer productivity is limited by tooling</li>
        </ul>
        <div class="slide-number">2</div>
    </div>
"""

    # Slide 3: The Solution
    html += """
    <div class="slide slide-bg-dark">
        <h2>The Solution</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div style="font-size: 3em; margin-bottom: 10px;">🤖</div>
                <h3>Multi-Agent</h3>
                <p>76 autonomous agents working in harmony with 94.2% success rate</p>
            </div>
            <div class="metric-card">
                <div style="font-size: 3em; margin-bottom: 10px;">🔒</div>
                <h3>PS-SHA-∞</h3>
                <p>Cryptographic verification with infinite audit trails</p>
            </div>
            <div class="metric-card">
                <div style="font-size: 3em; margin-bottom: 10px;">⚡</div>
                <h3>Edge-First</h3>
                <p>40% cost reduction via local inference with cloud fallback</p>
            </div>
            <div class="metric-card">
                <div style="font-size: 3em; margin-bottom: 10px;">💬</div>
                <h3>Conversational</h3>
                <p>Natural language deployment and DevOps automation</p>
            </div>
        </div>
        <div class="slide-number">3</div>
    </div>
"""

    # Slide 4: Traction
    eng = kpis.get('engineering', {})
    ops = kpis.get('operations', {})

    html += f"""
    <div class="slide slide-bg-gradient">
        <h2>Traction</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">$26.8M</div>
                <div class="metric-label">Revenue Generated</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">1.38M</div>
                <div class="metric-label">Lines of Code</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">{eng.get('total_repositories', 53)}</div>
                <div class="metric-label">Active Repositories</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">76</div>
                <div class="metric-label">AI Agents</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">{ops.get('uptime_percentage', 99.7)}%</div>
                <div class="metric-label">Uptime</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">$5M</div>
                <div class="metric-label">Proprietary IP Value</div>
            </div>
        </div>
        <div class="slide-number">4</div>
    </div>
"""

    # Slide 5: Revenue Model
    if financial and 'projections' in financial:
        proj = financial['projections'].get('total_projections', {})
        y1_real = proj.get('year_1_realistic', {})
        y3_real = proj.get('year_3_realistic', {})

        html += f"""
    <div class="slide slide-bg-dark">
        <h2>Revenue Model</h2>
        <table>
            <thead>
                <tr>
                    <th>Revenue Stream</th>
                    <th>Year 1</th>
                    <th>Year 3</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Employment Income</td>
                    <td>${y1_real.get('breakdown', {}).get('job', 180000):,}</td>
                    <td>${y3_real.get('breakdown', {}).get('job', 200000):,}</td>
                </tr>
                <tr>
                    <td>Open Source Sponsorships</td>
                    <td>${y1_real.get('breakdown', {}).get('sponsorships', 6000):,}</td>
                    <td>${y3_real.get('breakdown', {}).get('sponsorships', 30000):,}</td>
                </tr>
                <tr>
                    <td>Commercial Licensing</td>
                    <td>${y1_real.get('breakdown', {}).get('licensing', 50000):,}</td>
                    <td>${y3_real.get('breakdown', {}).get('licensing', 150000):,}</td>
                </tr>
                <tr>
                    <td>Consulting & Integration</td>
                    <td>${y1_real.get('breakdown', {}).get('consulting', 100000):,}</td>
                    <td>${y3_real.get('breakdown', {}).get('consulting', 200000):,}</td>
                </tr>
                <tr>
                    <td>Priority Support</td>
                    <td>${y1_real.get('breakdown', {}).get('support', 60000):,}</td>
                    <td>${y3_real.get('breakdown', {}).get('support', 120000):,}</td>
                </tr>
                <tr>
                    <td>SaaS Platform</td>
                    <td>${y1_real.get('breakdown', {}).get('saas', 60000):,}</td>
                    <td>${y3_real.get('breakdown', {}).get('saas', 250000):,}</td>
                </tr>
                <tr style="border-top: 2px solid #667eea; font-weight: bold;">
                    <td>Total</td>
                    <td>${y1_real.get('total_annual', 456000):,}</td>
                    <td>${y3_real.get('total_annual', 950000):,}</td>
                </tr>
            </tbody>
        </table>
        <p style="margin-top: 20px; font-size: 1.3em; text-align: center;">
            <strong>Profit Margins:</strong> 85-99% (low overhead, high value)
        </p>
        <div class="slide-number">5</div>
    </div>
"""

    # Slide 6: Market Opportunity
    html += """
    <div class="slide slide-bg-dark">
        <h2>Market Opportunity</h2>
        <div style="max-width: 900px;">
            <div style="margin: 40px 0;">
                <h3>Total Addressable Market (TAM)</h3>
                <p style="font-size: 1.3em; line-height: 1.8;">
                    AI infrastructure market projected at <strong>$200B by 2030</strong>
                </p>
            </div>
            <div style="margin: 40px 0;">
                <h3>Serviceable Addressable Market (SAM)</h3>
                <p style="font-size: 1.3em; line-height: 1.8;">
                    Enterprise AI orchestration & edge computing: <strong>$25B by 2028</strong>
                </p>
            </div>
            <div style="margin: 40px 0;">
                <h3>Serviceable Obtainable Market (SOM)</h3>
                <p style="font-size: 1.3em; line-height: 1.8;">
                    Target 0.1% market share: <strong>$25M annual revenue</strong>
                </p>
            </div>
        </div>
        <div class="slide-number">6</div>
    </div>
"""

    # Slide 7: Competitive Advantages
    html += """
    <div class="slide slide-bg-gradient">
        <h2>Competitive Advantages</h2>
        <ul class="bullet-list">
            <li><strong>Proven Execution:</strong> 1.38M LOC, 53 repos, 99.7% uptime</li>
            <li><strong>Proprietary IP:</strong> $5M in trade secrets (PS-SHA-∞, multi-agent)</li>
            <li><strong>Technical Depth:</strong> 76 autonomous agents with 94.2% success</li>
            <li><strong>Sales Background:</strong> $26.8M revenue track record</li>
            <li><strong>Cost Efficiency:</strong> 40% reduction via edge-first architecture</li>
        </ul>
        <div class="slide-number">7</div>
    </div>
"""

    # Slide 8: Roadmap
    html += """
    <div class="slide slide-bg-dark">
        <h2>Roadmap</h2>
        <div class="timeline">
            <div class="timeline-item">
                <div class="timeline-date">Q1 2025</div>
                <div>
                    <strong>Launch Monetization</strong><br>
                    GitHub Sponsors, commercial licensing, first $1K MRR
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-date">Q2 2025</div>
                <div>
                    <strong>Scale Services</strong><br>
                    Consulting packages, priority support, first $10K MRR
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-date">Q3-Q4 2025</div>
                <div>
                    <strong>SaaS Launch</strong><br>
                    Multi-agent platform beta, reach $20K MRR, full-time transition
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-date">2026</div>
                <div>
                    <strong>Scale to $1M ARR</strong><br>
                    Enterprise deals, platform scaling, team expansion
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-date">2027</div>
                <div>
                    <strong>Series A</strong><br>
                    $3.5M revenue, proven market fit, ready for acceleration
                </div>
            </div>
        </div>
        <div class="slide-number">8</div>
    </div>
"""

    # Slide 9: Team
    html += """
    <div class="slide slide-bg-dark">
        <h2>Team</h2>
        <div style="max-width: 800px; text-align: center;">
            <h3>Alexa Louise Amundson</h3>
            <p style="font-size: 1.3em; margin: 20px 0; opacity: 0.9;">
                Founder & Chief Architect
            </p>
            <ul class="bullet-list" style="text-align: left; margin-top: 40px;">
                <li>$26.8M revenue generated in sales career</li>
                <li>Self-taught engineer: 1.38M LOC across 53 repositories</li>
                <li>Built 76-agent orchestration system from scratch</li>
                <li>Developed 5 proprietary technologies worth $5M</li>
                <li>99.7% uptime across production infrastructure</li>
            </ul>
            <p style="margin-top: 40px; font-size: 1.2em;">
                <strong>Advisory Board:</strong> Actively building relationships with AI/ML and enterprise infrastructure leaders
            </p>
        </div>
        <div class="slide-number">9</div>
    </div>
"""

    # Slide 10: The Ask
    html += """
    <div class="slide slide-bg-gradient">
        <h2>The Ask</h2>
        <div style="max-width: 800px;">
            <div style="margin: 40px 0; font-size: 1.5em; line-height: 1.8;">
                <p><strong>Seeking:</strong> Strategic partners and/or funding</p>
                <p><strong>Use of Funds:</strong></p>
                <ul style="list-style: none; margin-left: 40px;">
                    <li>✓ Full-time development on BlackRoad OS</li>
                    <li>✓ Sales & marketing acceleration</li>
                    <li>✓ Enterprise partnership development</li>
                    <li>✓ Infrastructure scaling</li>
                    <li>✓ Team expansion (2-3 key hires)</li>
                </ul>
            </div>
            <div style="margin-top: 60px; text-align: center;">
                <p style="font-size: 1.8em; margin-bottom: 20px;"><strong>Let's build the future of AI infrastructure together.</strong></p>
                <a href="mailto:blackroad.systems@gmail.com" class="cta-button">Let's Talk</a>
            </div>
        </div>
        <div class="slide-number">10</div>
    </div>
"""

    # Slide 11: Contact
    html += """
    <div class="slide slide-bg-dark">
        <h2>Contact</h2>
        <div style="font-size: 1.5em; line-height: 2.5; text-align: center;">
            <p><strong>Alexa Amundson</strong></p>
            <p>Founder & CEO, BlackRoad OS, Inc.</p>
            <p style="margin-top: 40px;">
                📧 <a href="mailto:blackroad.systems@gmail.com" style="color: #667eea;">blackroad.systems@gmail.com</a>
            </p>
            <p>
                🌐 <a href="https://blackroad.io" style="color: #667eea;">blackroad.io</a>
            </p>
            <p>
                💼 <a href="https://linkedin.com/in/alexaamundson" style="color: #667eea;">linkedin.com/in/alexaamundson</a>
            </p>
            <p>
                🐙 <a href="https://github.com/blackboxprogramming" style="color: #667eea;">github.com/blackboxprogramming</a>
            </p>
            <p style="margin-top: 60px; font-size: 1.2em; opacity: 0.8;">
                📍 Lakeville, Minnesota
            </p>
        </div>
        <div class="footer">© 2023-2025 BlackRoad OS, Inc. All Rights Reserved. | Confidential</div>
        <div class="slide-number">11</div>
    </div>
"""

    html += """
</body>
</html>
"""

    return html

def main():
    print("📊 Generating investor pitch deck...")

    data = load_all_data()

    html = generate_pitch_deck_html(data)

    with open('pitch_deck.html', 'w') as f:
        f.write(html)

    print("✅ Pitch deck generated: financial/pitch_deck.html")
    print("\n📋 To use:")
    print("  1. Open pitch_deck.html in browser")
    print("  2. Present in fullscreen mode")
    print("  3. Print to PDF for distribution")
    print("  4. Send to: investors, partners, advisors")
    print("\n© 2023-2025 BlackRoad OS, Inc. - Confidential")

if __name__ == "__main__":
    main()
