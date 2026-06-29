(function(){
  const storage = window.DuangStorage.createStorage();
  const data = window.DuangData;
  const ui = window.DuangUI.createUI({storage, levelLabel:data.levelLabel});
  const animation = window.DuangAnimations.createAnimationManager(ui.els.petImg);
  const stateMachine = window.DuangState.createStateMachine({animation, storage, ui, lines:data.lines});
  const calendar = window.DuangCalendar.createCalendar({
    els:ui.els,
    storage,
    levelLabel:data.levelLabel,
    makeReport:ui.makeReport,
    openPanel:ui.openPanel
  });
  ui.setCalendar(calendar);
  const tasks = window.DuangTasks.createTaskSystem({data, storage, ui, stateMachine, animation});
  const behavior = window.DuangBehavior.createBehaviorSystem({ui, stateMachine, animation, data});

  let timerSeconds = 60;
  let remaining = 60;
  let timerId = null;
  let clickBurst = 0;
  let clickBurstTimer = null;
  let clickSuppressUntil = 0;

  function renderTime(){
    const m = String(Math.floor(remaining / 60)).padStart(2, '0');
    const s = String(remaining % 60).padStart(2, '0');
    ui.els.timeDisplay.textContent = `${m}:${s}`;
  }

  function setTimer(seconds){
    timerSeconds = seconds;
    remaining = seconds;
    renderTime();
    ui.touch();
    ui.openPanel('right');
  }

  function startTimer(){
    ui.touch();
    ui.openPanel('right');
    const btn = document.getElementById('startTimerBtn');
    if(timerId){
      clearInterval(timerId);
      timerId = null;
      btn.textContent = '开始盯梢';
      return;
    }
    ui.say('杜望正在盯着你。倒计时结束前，杜包不许宣布世界毁灭。', true);
    btn.textContent = '暂停盯梢';
    timerId = setInterval(() => {
      remaining -= 1;
      renderTime();
      if(remaining <= 0){
        clearInterval(timerId);
        timerId = null;
        remaining = timerSeconds;
        renderTime();
        btn.textContent = '开始盯梢';
        ui.say('时间到。杜包请如实交代：动了没有？');
        ui.floater('⏱');
      }
    }, 1000);
  }

  function resetToday(){
    const today = storage.dayData();
    today.fur = 0;
    today.done = 0;
    today.tasks = [];
    today.updatedAt = Date.now();
    storage.save();
    ui.renderAll();
    ui.say('今日记录已清空。杜望不追责，但会记仇三秒。');
    ui.openPanel('top');
  }

  function handlePetClick(){
    const draggedUntil = Number(ui.els.petWrap.dataset.draggedUntil || 0);
    if(Date.now() < clickSuppressUntil || Date.now() < draggedUntil || behavior.isDragging()) return;
    ui.touch();
    if(stateMachine.wakeIfSleeping()) return;
    clickBurst += 1;
    if(clickBurstTimer) clearTimeout(clickBurstTimer);
    clickBurstTimer = setTimeout(() => { clickBurst = 0; }, 2200);
    if(clickBurst >= 3){
      clickBurst = 0;
      animation.playAnimation('tooMuchPet', {force:true});
      ui.say(data.lines.tooMuchPet[0]);
      ui.floater('👀');
      return;
    }
    animation.playAnimation('petHappy');
    ui.say(ui.sample(data.lines.pet));
    ui.floater('🐾');
  }

  function bindEvents(){
    const mobileScrim = document.getElementById('mobileScrim');
    function openMobilePanel(panelName){
      document.querySelectorAll('.edge-panel.open').forEach(panel => panel.classList.remove('open'));
      document.querySelector(`[data-panel="${panelName}"]`)?.classList.add('open');
      document.body.classList.add('mobile-panel-open');
      ui.touch();
    }
    function closeMobilePanels(){
      ui.closePanels();
      document.body.classList.remove('mobile-panel-open');
    }
    document.querySelectorAll('[data-toggle-panel]').forEach(btn => btn.addEventListener('click', e => {
      e.stopPropagation();
      document.querySelector(`[data-panel="${btn.dataset.togglePanel}"]`)?.classList.toggle('open');
      document.body.classList.toggle('mobile-panel-open', !!document.querySelector('.edge-panel.open'));
      ui.touch();
    }));
    document.addEventListener('click', e => {
      if(e.target.closest('.edge-panel')) return;
      if(e.target.closest('.mobile-dock')) return;
      closeMobilePanels();
    });
    document.querySelectorAll('[data-mobile-panel]').forEach(btn => btn.addEventListener('click', e => {
      e.stopPropagation();
      openMobilePanel(btn.dataset.mobilePanel);
    }));
    mobileScrim?.addEventListener('click', closeMobilePanels);
    document.getElementById('newTaskBtn').addEventListener('click', tasks.newTask);
    document.getElementById('newTaskBtnLeft').addEventListener('click', tasks.newTask);
    document.getElementById('customTaskForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const text = document.getElementById('customTaskText').value.trim();
      const level = document.getElementById('customTaskLevel').value;
      const kind = document.getElementById('customTaskKind').value.trim() || '自定义';
      if(!text){
        ui.say('杜包先写一句任务，不用宏大，能动一下就行。', true);
        return;
      }
      tasks.setCustomTask({text, level, kind});
      document.getElementById('customTaskText').value = '';
    });
    document.getElementById('completeBtn').addEventListener('click', tasks.completeTask);
    document.getElementById('failBtn').addEventListener('click', tasks.failTask);
    document.getElementById('startTimerBtn').addEventListener('click', startTimer);
    document.querySelectorAll('[data-timer]').forEach(btn => btn.addEventListener('click', () => setTimer(Number(btn.dataset.timer))));
    document.getElementById('petBtn').addEventListener('click', () => {
      ui.touch();
      animation.playAnimation('petHappy');
      ui.say(ui.sample(data.lines.pet));
      ui.floater('🐶');
    });
    document.getElementById('mobilePetBtn')?.addEventListener('click', e => {
      e.stopPropagation();
      closeMobilePanels();
      ui.touch();
      animation.playAnimation('petHappy');
      ui.say(ui.sample(data.lines.pet));
      ui.floater('🐶');
    });
    document.getElementById('resetBtn').addEventListener('click', resetToday);
    ui.els.stateButtons.addEventListener('click', e => {
      const btn = e.target.closest('button[data-state]');
      if(!btn) return;
      ui.touch();
      const previous = stateMachine.getState();
      stateMachine.setPetState(btn.dataset.state);
      if((previous === 'low' || previous === 'sleep') && btn.dataset.state !== 'low' && btn.dataset.state !== 'sleep') animation.playAnimation('getUp', {force:true});
      if(btn.dataset.state === 'low') animation.playAnimation('watchYou');
      ui.openPanel('left');
    });
    document.getElementById('prevMonth').addEventListener('click', calendar.prevMonth);
    document.getElementById('nextMonth').addEventListener('click', calendar.nextMonth);
    document.getElementById('todayMonth').addEventListener('click', calendar.todayMonth);
    ui.els.petWrap.addEventListener('click', handlePetClick);
    ui.els.petWrap.addEventListener('dblclick', e => {
      e.preventDefault();
      clickSuppressUntil = Date.now() + 300;
      animation.queueAnimation('getUp');
      tasks.newTask();
    });
    ui.els.petWrap.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        handlePetClick();
      }
    });
  }

  function init(){
    bindEvents();
    behavior.bindDrag();
    behavior.bindPointerNear();
    behavior.startAutoLoops();
    renderTime();
    ui.renderAll();
    stateMachine.setPetState('idle', {say:false});
    setTimeout(() => ui.floater('🐾'), 800);
    window.duangduang = {animation, stateMachine, tasks, behavior, storage};
    if('serviceWorker' in navigator && location.protocol !== 'file:'){
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    }
  }

  init();
})();
