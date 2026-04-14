// BlackRoad OS — Broadcast Operating System
// Modular worker: assembles components at request time

import CSS from './css/main.css';
import BODY from './html/body.html';
import PRODUCTS_PAGE from './html/products.html';
import MOCKUPS_PAGE from './html/mockups.html';
import MOCKUP_BASE_CSS from './mockups/mockup-base.css';
import NETWORK_MAP_JS from './js/network-map.txt';
import HERO_IMAGE from './data/hero-image.txt';
import CHANNELS from './data/channels.txt';
import DRIFT from './js/drift.txt';
import GUIDE from './js/guide.txt';
import GHOSTS from './js/ghosts.txt';
import VIEWER from './js/viewer.txt';
import PRIMETIME from './js/primetime.txt';
import CHAT from './js/chat.txt';
import TICKER from './js/ticker.txt';
import BOOT from './js/boot.txt';

// Auto-generated mockup imports
import MOCKUP_animations from './mockups/animations.html';
import MOCKUP_asana_mockup from './mockups/asana-mockup.html';
import MOCKUP_backlog_mockup from './mockups/backlog-mockup.html';
import MOCKUP_backroad_feed from './mockups/backroad-feed.html';
import MOCKUP_backroad_gallery from './mockups/backroad-gallery.html';
import MOCKUP_backroad_stories from './mockups/backroad-stories.html';
import MOCKUP_backroad_tube from './mockups/backroad-tube.html';
import MOCKUP_blackroad_brand_guide from './mockups/blackroad-brand-guide.html';
import MOCKUP_blackroad_home_mockup from './mockups/blackroad-home-mockup.html';
import MOCKUP_brand_verifier from './mockups/brand-verifier.html';
import MOCKUP_carkeys_app_mockup from './mockups/carkeys-app-mockup.html';
import MOCKUP_classroom_mockup from './mockups/classroom-mockup.html';
import MOCKUP_clickup_mockup from './mockups/clickup-mockup.html';
import MOCKUP_docs_mockup from './mockups/docs-mockup.html';
import MOCKUP_domain_api_blackroad_io from './mockups/domain-api-blackroad-io.html';
import MOCKUP_domain_blackroad_company from './mockups/domain-blackroad-company.html';
import MOCKUP_domain_blackroadai_com from './mockups/domain-blackroadai-com.html';
import MOCKUP_domain_blackroadinc_us from './mockups/domain-blackroadinc-us.html';
import MOCKUP_domain_brand_blackroad_io from './mockups/domain-brand-blackroad-io.html';
import MOCKUP_domain_docs_blackroad_io from './mockups/domain-docs-blackroad-io.html';
import MOCKUP_domain_status_blackroad_io from './mockups/domain-status-blackroad-io.html';
import MOCKUP_facebook_mockup from './mockups/facebook-mockup.html';
import MOCKUP_google_drive_mockup from './mockups/google-drive-mockup.html';
import MOCKUP_hello_world from './mockups/hello-world.html';
import MOCKUP_hq_skyscraper_mockup from './mockups/hq-skyscraper-mockup.html';
import MOCKUP_icon_library from './mockups/icon-library.html';
import MOCKUP_infographics from './mockups/infographics.html';
import MOCKUP_instagram_mockup from './mockups/instagram-mockup.html';
import MOCKUP_linear_mockup from './mockups/linear-mockup.html';
import MOCKUP_linkedin_mockup from './mockups/linkedin-mockup.html';
import MOCKUP_loom_mockup from './mockups/loom-mockup.html';
import MOCKUP_memory_gate_mockup from './mockups/memory-gate-mockup.html';
import MOCKUP_miro_mockup from './mockups/miro-mockup.html';
import MOCKUP_mockup_gallery from './mockups/mockup-gallery.html';
import MOCKUP_netflix_mockup from './mockups/netflix-mockup.html';
import MOCKUP_notion_mockup from './mockups/notion-mockup.html';
import MOCKUP_officeroad_mockup from './mockups/officeroad-mockup.html';
import MOCKUP_oneway_mockup from './mockups/oneway-mockup.html';
import MOCKUP_os_desktop_mockup from './mockups/os-desktop-mockup.html';
import MOCKUP_railway_mockup from './mockups/railway-mockup.html';
import MOCKUP_roadamp_mockup from './mockups/roadamp-mockup.html';
import MOCKUP_roadapi_mockup from './mockups/roadapi-mockup.html';
import MOCKUP_roadarcade_mockup from './mockups/roadarcade-mockup.html';
import MOCKUP_roadboard_mockup from './mockups/roadboard-mockup.html';
import MOCKUP_roadchat_app_mockup from './mockups/roadchat-app-mockup.html';
import MOCKUP_roadchat_mockup from './mockups/roadchat-mockup.html';
import MOCKUP_roaddb_mockup from './mockups/roaddb-mockup.html';
import MOCKUP_roaddeploy_mockup from './mockups/roaddeploy-mockup.html';
import MOCKUP_roadid_mockup from './mockups/roadid-mockup.html';
import MOCKUP_roadie_room from './mockups/roadie-room.html';
import MOCKUP_roadie_tutor_mockup from './mockups/roadie-tutor-mockup.html';
import MOCKUP_roadim_mockup from './mockups/roadim-mockup.html';
import MOCKUP_roadlimewire_mockup from './mockups/roadlimewire-mockup.html';
import MOCKUP_roadmsn_mockup from './mockups/roadmsn-mockup.html';
import MOCKUP_roadnapster_mockup from './mockups/roadnapster-mockup.html';
import MOCKUP_roadpay_mockup from './mockups/roadpay-mockup.html';
import MOCKUP_roadphone_mockup from './mockups/roadphone-mockup.html';
import MOCKUP_roadradio_mockup from './mockups/roadradio-mockup.html';
import MOCKUP_roadsearch_mockup from './mockups/roadsearch-mockup.html';
import MOCKUP_roadspace_mockup from './mockups/roadspace-mockup.html';
import MOCKUP_roadstock_mockup from './mockups/roadstock-mockup.html';
import MOCKUP_roadview_communities from './mockups/roadview-communities.html';
import MOCKUP_roadweather_mockup from './mockups/roadweather-mockup.html';
import MOCKUP_roadwork_mockup from './mockups/roadwork-mockup.html';
import MOCKUP_roster_mockup from './mockups/roster-mockup.html';
import MOCKUP_schoology_mockup from './mockups/schoology-mockup.html';
import MOCKUP_snapchat_mockup from './mockups/snapchat-mockup.html';
import MOCKUP_spotify_mockup from './mockups/spotify-mockup.html';
import MOCKUP_stats_mockup from './mockups/stats-mockup.html';
import MOCKUP_tiktok_mockup from './mockups/tiktok-mockup.html';
import MOCKUP_trello_mockup from './mockups/trello-mockup.html';
import MOCKUP_twitter_mockup from './mockups/twitter-mockup.html';
import MOCKUP_vault_mockup from './mockups/vault-mockup.html';
import MOCKUP_vercel_mockup from './mockups/vercel-mockup.html';
import MOCKUP_video_decode from './mockups/video-decode.html';
import MOCKUP_video_globe from './mockups/video-globe.html';
import MOCKUP_video_origin from './mockups/video-origin.html';
import MOCKUP_video_parade from './mockups/video-parade.html';
import MOCKUP_video_pulse from './mockups/video-pulse.html';
import MOCKUP_video_race from './mockups/video-race.html';
import MOCKUP_video_robot_vs from './mockups/video-robot-vs.html';
import MOCKUP_video_warp from './mockups/video-warp.html';
import MOCKUP_youtube_mockup from './mockups/youtube-mockup.html';

const MOCKUP_FILES = {
  'animations': MOCKUP_animations,
  'asana-mockup': MOCKUP_asana_mockup,
  'backlog-mockup': MOCKUP_backlog_mockup,
  'backroad-feed': MOCKUP_backroad_feed,
  'backroad-gallery': MOCKUP_backroad_gallery,
  'backroad-stories': MOCKUP_backroad_stories,
  'backroad-tube': MOCKUP_backroad_tube,
  'blackroad-brand-guide': MOCKUP_blackroad_brand_guide,
  'blackroad-home-mockup': MOCKUP_blackroad_home_mockup,
  'brand-verifier': MOCKUP_brand_verifier,
  'carkeys-app-mockup': MOCKUP_carkeys_app_mockup,
  'classroom-mockup': MOCKUP_classroom_mockup,
  'clickup-mockup': MOCKUP_clickup_mockup,
  'docs-mockup': MOCKUP_docs_mockup,
  'domain-api-blackroad-io': MOCKUP_domain_api_blackroad_io,
  'domain-blackroad-company': MOCKUP_domain_blackroad_company,
  'domain-blackroadai-com': MOCKUP_domain_blackroadai_com,
  'domain-blackroadinc-us': MOCKUP_domain_blackroadinc_us,
  'domain-brand-blackroad-io': MOCKUP_domain_brand_blackroad_io,
  'domain-docs-blackroad-io': MOCKUP_domain_docs_blackroad_io,
  'domain-status-blackroad-io': MOCKUP_domain_status_blackroad_io,
  'facebook-mockup': MOCKUP_facebook_mockup,
  'google-drive-mockup': MOCKUP_google_drive_mockup,
  'hello-world': MOCKUP_hello_world,
  'hq-skyscraper-mockup': MOCKUP_hq_skyscraper_mockup,
  'icon-library': MOCKUP_icon_library,
  'infographics': MOCKUP_infographics,
  'instagram-mockup': MOCKUP_instagram_mockup,
  'linear-mockup': MOCKUP_linear_mockup,
  'linkedin-mockup': MOCKUP_linkedin_mockup,
  'loom-mockup': MOCKUP_loom_mockup,
  'memory-gate-mockup': MOCKUP_memory_gate_mockup,
  'miro-mockup': MOCKUP_miro_mockup,
  'mockup-gallery': MOCKUP_mockup_gallery,
  'netflix-mockup': MOCKUP_netflix_mockup,
  'notion-mockup': MOCKUP_notion_mockup,
  'officeroad-mockup': MOCKUP_officeroad_mockup,
  'oneway-mockup': MOCKUP_oneway_mockup,
  'os-desktop-mockup': MOCKUP_os_desktop_mockup,
  'railway-mockup': MOCKUP_railway_mockup,
  'roadamp-mockup': MOCKUP_roadamp_mockup,
  'roadapi-mockup': MOCKUP_roadapi_mockup,
  'roadarcade-mockup': MOCKUP_roadarcade_mockup,
  'roadboard-mockup': MOCKUP_roadboard_mockup,
  'roadchat-app-mockup': MOCKUP_roadchat_app_mockup,
  'roadchat-mockup': MOCKUP_roadchat_mockup,
  'roaddb-mockup': MOCKUP_roaddb_mockup,
  'roaddeploy-mockup': MOCKUP_roaddeploy_mockup,
  'roadid-mockup': MOCKUP_roadid_mockup,
  'roadie-room': MOCKUP_roadie_room,
  'roadie-tutor-mockup': MOCKUP_roadie_tutor_mockup,
  'roadim-mockup': MOCKUP_roadim_mockup,
  'roadlimewire-mockup': MOCKUP_roadlimewire_mockup,
  'roadmsn-mockup': MOCKUP_roadmsn_mockup,
  'roadnapster-mockup': MOCKUP_roadnapster_mockup,
  'roadpay-mockup': MOCKUP_roadpay_mockup,
  'roadphone-mockup': MOCKUP_roadphone_mockup,
  'roadradio-mockup': MOCKUP_roadradio_mockup,
  'roadsearch-mockup': MOCKUP_roadsearch_mockup,
  'roadspace-mockup': MOCKUP_roadspace_mockup,
  'roadstock-mockup': MOCKUP_roadstock_mockup,
  'roadview-communities': MOCKUP_roadview_communities,
  'roadweather-mockup': MOCKUP_roadweather_mockup,
  'roadwork-mockup': MOCKUP_roadwork_mockup,
  'roster-mockup': MOCKUP_roster_mockup,
  'schoology-mockup': MOCKUP_schoology_mockup,
  'snapchat-mockup': MOCKUP_snapchat_mockup,
  'spotify-mockup': MOCKUP_spotify_mockup,
  'stats-mockup': MOCKUP_stats_mockup,
  'tiktok-mockup': MOCKUP_tiktok_mockup,
  'trello-mockup': MOCKUP_trello_mockup,
  'twitter-mockup': MOCKUP_twitter_mockup,
  'vault-mockup': MOCKUP_vault_mockup,
  'vercel-mockup': MOCKUP_vercel_mockup,
  'video-decode': MOCKUP_video_decode,
  'video-globe': MOCKUP_video_globe,
  'video-origin': MOCKUP_video_origin,
  'video-parade': MOCKUP_video_parade,
  'video-pulse': MOCKUP_video_pulse,
  'video-race': MOCKUP_video_race,
  'video-robot-vs': MOCKUP_video_robot_vs,
  'video-warp': MOCKUP_video_warp,
  'youtube-mockup': MOCKUP_youtube_mockup,
};

const HEAD = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<title>BlackRoad OS — Broadcast Operating System</title>
<meta name="description" content="The first Broadcast OS. Live channels, Prime Time events, and 27 AI agents. Instead of scrolling, you watch.">
<link rel="icon" href="https://images.blackroad.io/pixel-art/road-logo.png">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>`;

const TAIL = `</body></html>`;

function buildPage() {
  return HEAD
    + CSS
    + '</style></head><body>'
    + BODY
    + '<script>' + NETWORK_MAP_JS + '</script>'
    + '<script>'
    + HERO_IMAGE + '\n'
    + CHANNELS + '\n'
    + DRIFT + '\n'
    + GUIDE + '\n'
    + GHOSTS + '\n'
    + VIEWER + '\n'
    + PRIMETIME + '\n'
    + CHAT + '\n'
    + TICKER + '\n'
    + BOOT
    + '</script>'
    + TAIL;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\//, '').replace(/\/$/, '');

    // Products page
    if (path === 'products') {
      return new Response(PRODUCTS_PAGE, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Mockups gallery
    if (path === 'mockups') {
      return new Response(MOCKUPS_PAGE, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Individual mockup files: /mockups/youtube-mockup
    if (path.startsWith('mockups/')) {
      const slug = path.replace('mockups/', '');
      if (slug === 'mockup-base.css') {
        return new Response(MOCKUP_BASE_CSS, {
          headers: { 'Content-Type': 'text/css; charset=utf-8' }
        });
      }
      const file = MOCKUP_FILES[slug];
      if (file) {
        return new Response(file, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
    }

    // Main OS + app.dev routes
    if (!path || path === '' || path.startsWith('app.dev')) {
      return new Response(buildPage(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // 404
    return new Response('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>404 — BlackRoad OS</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#fff;font-family:monospace;font-size:14px;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center}h1{font-size:48px;margin-bottom:8px;color:#222}p{color:#555}a{color:#888}</style></head><body><div><h1>404</h1><p>Page not found</p><p style="margin-top:12px"><a href="/">Back to os.blackroad.io</a></p></div></body></html>', {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};
