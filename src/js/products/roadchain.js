(function(){
  var l = BR.store.get('roadchain.ledger', []);
  if (!l.length) {
    BR.items.add('roadchain.ledger', {type:'genesis', data:'BlackRoad OS Genesis Block', hash:'0000'});
    BR.items.add('roadchain.ledger', {type:'transaction', data:'Founder stake: 10,000,000 shares', hash:Date.now().toString(36)});
  }
  BR.toast('RoadChain — ' + BR.items.list('roadchain.ledger').length + ' blocks');
})();
