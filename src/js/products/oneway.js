(function(){
  BR.toast('OneWay — Data Export. Click content to select for export.');
  document.addEventListener('click', function(e) {
    if (e.target.closest('#br-nav')) return;
    e.target.style.outline = e.target.style.outline ? '' : '1px solid #555';
  });
})();
