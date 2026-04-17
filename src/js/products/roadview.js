(function(){
  BR.toast('RoadView — Sovereign Search');
  var inputs = document.querySelectorAll('input[type="search"],input[type="text"],input');
  inputs.forEach(function(s) {
    s.placeholder = 'Search everything...';
    s.onkeydown = function(e) {
      if (e.key === 'Enter') {
        BR.chat('Search for: ' + this.value).then(function(r) {
          var d = document.getElementById('rv-results');
          if (!d) { d = document.createElement('div'); d.id = 'rv-results'; s.parentNode.appendChild(d); }
          d.innerHTML = '<div style="padding:12px;color:#888;font-size:14px">' + r + '</div>';
          BR.toast('Results loaded');
        });
      }
    };
  });
})();
