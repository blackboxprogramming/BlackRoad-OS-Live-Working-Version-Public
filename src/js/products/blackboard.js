(function(){
  BR.toast('BlackBoard — Education Studio');
  var q = document.querySelector('main,[class*="content"]') || document.body;
  var quiz = document.createElement('div');
  quiz.style.cssText = 'padding:16px;border-top:1px solid #191919;margin-top:16px;';
  quiz.innerHTML = '<div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px">QUIZ MODE</div>' +
    '<div style="font-size:16px;color:#d4d4d4;margin-bottom:16px">What is sovereignty in computing?</div>' +
    '<textarea id="bb-a" rows="3" placeholder="Your answer..." style="width:100%;background:#0a0a0a;border:1px solid #222;color:#d4d4d4;padding:12px;border-radius:8px;font-size:14px;resize:none"></textarea>' +
    '<button id="bb-submit" style="margin-top:8px;background:#1a1a1a;border:1px solid #333;color:#999;padding:8px 20px;border-radius:6px;cursor:pointer;font-size:13px">Submit Answer</button>';
  q.appendChild(quiz);
  document.getElementById('bb-submit').onclick = function() {
    BR.chat(document.getElementById('bb-a').value).then(function(r) {
      BR.toast('Graded');
      var d = document.createElement('div');
      d.style.cssText = 'padding:12px;margin-top:12px;background:#0a0a0a;border:1px solid #191919;border-radius:8px;color:#888;font-size:13px';
      d.textContent = r;
      quiz.appendChild(d);
    });
  };
})();
