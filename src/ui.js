(function(){
  function createUI({storage, levelLabel}){
    const els = {
      stage:document.getElementById('stage'),
      bubble:document.getElementById('bubble'),
      floaters:document.getElementById('floaters'),
      petWrap:document.getElementById('petWrap'),
      petImg:document.getElementById('petImg'),
      currentStateBadge:document.getElementById('currentStateBadge'),
      stateButtons:document.getElementById('stateButtons'),
      taskLevel:document.getElementById('taskLevel'),
      taskText:document.getElementById('taskText'),
      taskKind:document.getElementById('taskKind'),
      taskRule:document.getElementById('taskRule'),
      timeDisplay:document.getElementById('timeDisplay'),
      furCount:document.getElementById('furCount'),
      doneCount:document.getElementById('doneCount'),
      streakCount:document.getElementById('streakCount'),
      report:document.getElementById('report'),
      calendarGrid:document.getElementById('calendarGrid'),
      monthTitle:document.getElementById('monthTitle'),
      dayDetail:document.getElementById('dayDetail')
    };
    let lastInteraction = Date.now();
    let calendar = null;

    function sample(arr){return arr[Math.floor(Math.random() * arr.length)]}
    function touch(){lastInteraction = Date.now()}
    function getInactiveMs(){return Date.now() - lastInteraction}
    function say(text, small = false){
      els.bubble.textContent = text;
      els.bubble.classList.toggle('small', small || text.length > 38);
      els.bubble.classList.remove('pop');
      void els.bubble.offsetWidth;
      els.bubble.classList.add('pop');
    }
    function openPanel(name){document.querySelector(`[data-panel="${name}"]`)?.classList.add('open')}
    function closePanels(){document.querySelectorAll('.edge-panel.open').forEach(p => p.classList.remove('open'))}
    function isAnyPanelOpen(){return !!document.querySelector('.edge-panel.open, .edge-panel:hover')}
    function setVisualState(state, label){
      els.stage.className = 'stage state-' + state;
      els.currentStateBadge.textContent = label || state;
    }
    function syncStateButtons(state){
      [...els.stateButtons.querySelectorAll('.btn')].forEach(btn => btn.classList.toggle('active', btn.dataset.state === state));
    }
    function floater(symbol){
      const span = document.createElement('span');
      span.className = 'floater';
      span.textContent = symbol;
      const rect = els.petWrap.getBoundingClientRect();
      const srect = els.stage.getBoundingClientRect();
      span.style.left = (rect.left - srect.left + rect.width / 2 + (Math.random() * 120 - 60)) + 'px';
      span.style.top = (rect.top - srect.top + rect.height / 2 + (Math.random() * 40 - 20)) + 'px';
      els.floaters.appendChild(span);
      window.setTimeout(() => span.remove(), 1400);
    }
    function setTaskCard(task, label, rule){
      els.taskLevel.textContent = label;
      els.taskText.textContent = task.text;
      els.taskKind.textContent = task.kind;
      els.taskRule.textContent = rule;
    }
    function makeReport(key = storage.todayKey()){
      const d = storage.dayData(key);
      if(d.done === 0) return key === storage.todayKey() ? '尚未开庭。杜包先动一下，杜望再宣布判决。' : '这天没有留下狗爪印。可能在休眠，也可能在精神离家出走。';
      if(d.done <= 2) return `经杜望审理，这天完成 ${d.done} 个小动作。虽然精神疑似离家出走，但身体仍有微弱响应，判定：低配复活。`;
      if(d.done <= 5) return `这天完成 ${d.done} 个小动作，狗毛累计 ${d.fur} 根。考虑到启动困难客观存在，杜望判定：有救，暂缓自责。`;
      return `这天完成 ${d.done} 个小动作，狗毛 ${d.fur} 根。此等表现接近突然正常，杜望建议不要声张。`;
    }
    function renderStats(){
      const today = storage.dayData();
      els.furCount.textContent = today.fur;
      els.doneCount.textContent = today.done;
      els.streakCount.textContent = storage.calcStreak();
      els.report.textContent = makeReport(storage.todayKey());
    }
    function renderAll(){
      renderStats();
      calendar?.render();
    }
    function setCalendar(nextCalendar){calendar = nextCalendar}

    return {els, stage:els.stage, sample, touch, getInactiveMs, say, openPanel, closePanels, isAnyPanelOpen, setVisualState, syncStateButtons, floater, setTaskCard, makeReport, renderStats, renderAll, setCalendar};
  }

  window.DuangUI = {createUI};
})();
