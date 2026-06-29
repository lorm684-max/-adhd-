(function(){
  const STORE_KEY = 'duangduang_pet_v07_history';

  function pad(n){return String(n).padStart(2,'0')}
  function dateKey(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
  function todayKey(){return dateKey(new Date())}
  function prettyDate(key){
    const [y,m,d] = key.split('-');
    return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`;
  }

  function loadStore(){
    const base = {history:{}, total:0};
    const oldRaw = localStorage.getItem('duangduang_pet_v06_history');
    const raw = localStorage.getItem(STORE_KEY) || oldRaw;
    if(!raw) return base;
    try{return {...base, ...JSON.parse(raw)}}catch(e){return base}
  }

  function createStorage(){
    const store = loadStore();
    function save(){localStorage.setItem(STORE_KEY, JSON.stringify(store))}
    function dayData(key=todayKey()){
      if(!store.history[key]) store.history[key] = {fur:0,done:0,state:'idle',tasks:[],updatedAt:Date.now()};
      return store.history[key];
    }
    function calcStreak(){
      let d = new Date();
      let count = 0;
      while(true){
        const key = dateKey(d);
        const data = store.history[key];
        if(!data || !data.done) break;
        count += 1;
        d.setDate(d.getDate()-1);
      }
      return count;
    }
    return {store, save, dayData, calcStreak, dateKey, todayKey, prettyDate};
  }

  window.DuangStorage = {createStorage};
})();
