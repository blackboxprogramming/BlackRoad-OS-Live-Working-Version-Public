(function(){
  BR.toast('RoadCode — Code Editor');
  var editors = document.querySelectorAll('textarea,[class*="editor"],[class*="code"]');
  editors.forEach(function(e) {
    e.style.fontFamily = 'JetBrains Mono, monospace';
    e.style.fontSize = '13px';
    e.style.tabSize = '2';
    if (!e.value && !e.textContent) {
      e.value = '// Welcome to RoadCode\n// Start coding...\n\nfunction hello() {\n  console.log("Build anything.");\n}\n\nhello();';
    }
  });
})();
