(function(){
  const weekdays = ['一','二','三','四','五','六','日'];

  function createCalendar({els, storage, levelLabel, makeReport, openPanel}){
    let viewDate = new Date();
    viewDate.setDate(1);
    let selectedDate = storage.todayKey();

    function renderCalendar(){
      els.calendarGrid.innerHTML = '';
      weekdays.forEach(w => {
        const el = document.createElement('div');
        el.className = 'weekday';
        el.textContent = w;
        els.calendarGrid.appendChild(el);
      });
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      els.monthTitle.textContent = `${year} 年 ${month + 1} 月`;
      const first = new Date(year, month, 1);
      const startBlank = (first.getDay() + 6) % 7;
      const days = new Date(year, month + 1, 0).getDate();
      for(let i = 0; i < startBlank; i += 1){
        const blank = document.createElement('button');
        blank.className = 'day blank';
        els.calendarGrid.appendChild(blank);
      }
      for(let day = 1; day <= days; day += 1){
        const key = storage.dateKey(new Date(year, month, day));
        const data = storage.store.history[key];
        const cell = document.createElement('button');
        cell.className = 'day';
        if(key === storage.todayKey()) cell.classList.add('today');
        if(key === selectedDate) cell.classList.add('selected');
        if(data && data.done) cell.classList.add('has-done');
        cell.innerHTML = `<span class="date-num">${day}</span>${data && data.done ? `<span class="paw">🐾 ${data.done}</span>` : ''}`;
        cell.addEventListener('click', () => {
          selectedDate = key;
          renderCalendar();
          renderDayDetail();
          openPanel('bottom');
        });
        els.calendarGrid.appendChild(cell);
      }
    }

    function renderDayDetail(){
      const d = storage.dayData(selectedDate);
      const tasks = (d.tasks || []).slice(0, 4);
      els.dayDetail.innerHTML = `<div class="detail-date">${storage.prettyDate(selectedDate)}</div>
        <div class="detail-line">状态：${window.DuangState.stateMap[d.state] || d.state || '未记录'}</div>
        <div class="detail-line">完成动作：<b>${d.done}</b> 个　狗毛：<b>${d.fur}</b> 根</div>
        <div class="detail-line">${makeReport(selectedDate)}</div>
        <ul class="task-list">${tasks.length ? tasks.map(t => `<li>${t.completedAt || t.time || ''}　${t.text}<br><span style="color:#8a6e55">${levelLabel[t.level] || ''} / ${t.kind || ''}</span></li>`).join('') : '<li>暂无任务记录。</li>'}</ul>`;
    }

    function prevMonth(){viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); renderDayDetail()}
    function nextMonth(){viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); renderDayDetail()}
    function todayMonth(){viewDate = new Date(); viewDate.setDate(1); selectedDate = storage.todayKey(); renderCalendar(); renderDayDetail()}
    function render(){renderCalendar(); renderDayDetail()}

    return {render, renderCalendar, renderDayDetail, prevMonth, nextMonth, todayMonth};
  }

  window.DuangCalendar = {createCalendar};
})();
