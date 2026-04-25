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
