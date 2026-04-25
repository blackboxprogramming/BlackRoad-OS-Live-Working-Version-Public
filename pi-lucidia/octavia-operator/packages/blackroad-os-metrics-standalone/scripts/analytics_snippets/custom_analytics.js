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
