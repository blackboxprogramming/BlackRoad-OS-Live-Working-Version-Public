# Browser State — Active Sessions & Cookies
## Scanned: 2026-04-13

---

## Active Firefox Profile: 8zlq7hjf.default-release (837 cookies)

### BlackRoad Ecosystem Cookies
| Domain | Cookie | Type |
|--------|--------|------|
| .blackroad.io | cf_clearance | CF bot protection |
| .blackroadinc.us | cf_clearance | CF bot protection |
| .blackroad.company | cf_clearance | CF bot protection |
| .blackroad.me | cf_clearance | CF bot protection |
| .blackroad.network | cf_clearance | CF bot protection |
| .blackroad.systems | cf_clearance | CF bot protection |
| .blackroadai.com | cf_clearance | CF bot protection |
| .blackroadquantum.com | cf_clearance | CF bot protection |
| .lucidia.earth | cf_clearance | CF bot protection |
| portal.blackroad.io | __clerk_redirect_count | Clerk auth redirect |

**9 domains have CF challenge cookies. 1 has Clerk cookie. Zero have session tokens (no one has logged in via auth.blackroad.io).**

### Clerk (Auth Provider) Cookies
| Domain | Cookie | Notes |
|--------|--------|-------|
| .dear-vulture-2.clerk.accounts.dev | __cf_bm (x2) | Clerk CF protection |
| .clerk-nextjs-ivory.vercel.app | __client_uat_vcOdfQZS | Clerk client user |
| .clerk-nextjs-ivory.vercel.app | __client_uat | Clerk client user |
| clerk-nextjs-ivory.vercel.app | __clerk_db_jwt_vcOdfQZS | Clerk JWT |
| clerk-nextjs-ivory.vercel.app | __clerk_db_jwt | Clerk JWT |
| .img.clerk.com | __cf_bm | Clerk CDN |

### Stripe (Payments) — Fully Authenticated
| Domain | Cookie | Notes |
|--------|--------|-------|
| dashboard.stripe.com | __Host-auth_token | Live dashboard session |
| dashboard.stripe.com | __Host-session | Dashboard session |
| dashboard.stripe.com | __Host-cliauth_token | CLI auth token |
| access.stripe.com | __Host-session + __Host-auth_token | Access portal |
| connect.stripe.com | __Host-session | Connect portal |
| marketplace.stripe.com | __Host-session + __Host-auth_token | Marketplace |
| support.stripe.com | __Host-session + __Host-auth_token | Support |
| docs.stripe.com | __Host-session + __Host-auth_token + sandbox | Docs |
| support-conversations.stripe.com | __Host-session | Support chat |
| .stripe.com | __Secure-sid, __Secure-has_logged_in, machine_identifier, cid, handoff | Core Stripe |
| .buy.stripe.com | __stripe_mid, __stripe_sid | Payment links (tested!) |
| m.stripe.com | m (x4) | Mobile/metrics |
| checkout-cookies.stripe.com | __Host-LinkSession | Checkout flow |
| .stripecdn.com | _gcl_au, _gid, _ga, _pxvid, _px3 | Analytics + bot detection |

### GitHub — Fully Authenticated as blackboxprogramming
| Domain | Cookie | Notes |
|--------|--------|-------|
| .github.com | logged_in = yes | Confirmed logged in |
| .github.com | dotcom_user = blackboxprogramming | Username |
| .github.com | _octo | Session ID |
| .github.com | GHCC | Consent: Required+Analytics+Social |
| github.com | saved_user_sessions | Multi-session |
| github.com | user_session + __Host-user_session_same_site | Active session |
| github.com | _device_id | Device fingerprint |
| github.com | integration_setup_state | OAuth integration state |

### Google — Fully Authenticated (multiple services)
| Domain | Cookies | Services |
|--------|---------|----------|
| .google.com | SID, HSID, SSID, APISID, SAPISID, NID, AEC, SNID | Core Google auth |
| .google.com | __Secure-1PSID, __Secure-3PSID, __Secure-1PSIDTS, __Secure-3PSIDTS, SIDCC | Secure variants |
| accounts.google.com | LSID, __Host-1PLSID, __Host-3PLSID, __Host-GAPS, ACCOUNT_CHOOSER, LSOLH | Account management |
| mail.google.com | OSID, __Secure-OSID, __Host-GMAIL_SCH_* | Gmail |
| chat.google.com | OSID, __Secure-OSID | Google Chat |
| meet.google.com | OSID, __Secure-OSID | Google Meet |
| drive.google.com | OSID, __Secure-OSID | Google Drive |
| drive.usercontent.google.com | OSID, __Secure-OSID | Drive content |
| .docs.google.com | OSID, __Secure-OSID | Google Docs |
| play.google.com | OSID, __Secure-OSID | Play Store |
| chromewebstore.google.com | OSID, __Secure-OSID | Chrome Web Store |

### Cloudflare — Fully Authenticated
| Domain | Cookie | Notes |
|--------|--------|-------|
| .cloudflare.com | __cf_logged_in = 1 | Confirmed logged in |
| .cloudflare.com | CF_VERIFIED_DEVICE_* | Device verification |
| dash.cloudflare.com | vses2 | Dashboard session |
| dash.cloudflare.com | curr-account | Account JSON (BlackRoad OS, Inc.) |
| dash.cloudflare.com | oauth2_authentication_csrf_insecure | OAuth state |
| dash.cloudflare.com | dark-mode = off | Preference |
| dash.cloudflare.com | cf-locale = en-US | Locale |
| .cloudflare.com | zaraz-consent, sparrow_id | Analytics/telemetry |

### localStorage
**Zero BlackRoad localStorage entries found.** No br_token, no user sessions, no app state stored. This confirms no one has completed a sign-in flow through auth.blackroad.io.

## Summary

| Service | Auth State | Cookie Count |
|---------|-----------|-------------|
| Stripe | FULL ACCESS (dashboard, connect, marketplace, docs, support) | ~20 |
| GitHub | FULL ACCESS (blackboxprogramming, logged_in=yes) | ~8 |
| Google | FULL ACCESS (Gmail, Drive, Meet, Chat, Docs, Play) | ~40 |
| Cloudflare | FULL ACCESS (dash, logged_in=1) | ~15 |
| Clerk | PARTIAL (redirect cookie, JWT present) | ~6 |
| BlackRoad sites | CF challenge only (no auth sessions) | ~9 |

**Total BlackRoad-relevant cookies: ~98 across 6 service providers**
**BlackRoad auth sessions: 0** (the auth system exists but hasn't been used from this browser)
