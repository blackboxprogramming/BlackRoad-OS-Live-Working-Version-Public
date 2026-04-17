(function(){
  BR.toast('RoadSide — Support Desk');
  var t = document.querySelector('main,[class*="content"]') || document.body;
  var f = document.createElement('div');
  f.style.cssText = 'padding:16px;border-top:1px solid #191919;margin-top:16px;';
  f.innerHTML = '<input id="rs-ticket" placeholder="Describe your issue..." style="width:100%;background:#0a0a0a;border:1px solid #222;color:#d4d4d4;padding:12px;border-radius:8px;font-size:14px">' +
    '<button id="rs-submit" style="margin-top:8px;background:#1a1a1a;border:1px solid #333;color:#999;padding:8px 20px;border-radius:6px;cursor:pointer">Submit Ticket</button>';
  t.appendChild(f);
  document.getElementById('rs-submit').onclick = function() {
    BR.items.add('roadside.tickets', {text: document.getElementById('rs-ticket').value, status: 'open'});
    document.getElementById('rs-ticket').value = '';
    BR.toast('Ticket #' + BR.items.list('roadside.tickets').length + ' created');
  };
})();
