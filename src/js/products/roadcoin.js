(function(){
  BR.store.set('roadcoin.balance', BR.store.get('roadcoin.balance', 1000));
  BR.toast('RoadCoin — ROAD balance: ' + BR.store.get('roadcoin.balance'));
})();
