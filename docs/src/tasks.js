(function(){
  function createTaskSystem({data, storage, ui, stateMachine, animation}){
    let currentTask = null;
    let currentLevelIndex = 1;

    function chooseLevel(){
      const state = stateMachine.getState();
      const bias = stateMachine.getConfig(state).taskBias || stateMachine.getConfig('idle').taskBias;
      const level = ui.sample(bias);
      currentLevelIndex = data.levelOrder.indexOf(level);
      return level;
    }

    function chooseTask(level){
      const item = ui.sample(data.pools[level]);
      currentTask = {
        level,
        text:item[0],
        kind:item[1],
        time:new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'})
      };
      ui.setTaskCard(currentTask, data.levelLabel[level], '完成不了就降级');
      stateMachine.setPetState('task', {say:false});
      animation.playAnimation('getTask', {force:true});
      ui.say(ui.sample(data.lines.task));
      ui.floater('📄');
      ui.openPanel('right');
    }

    function newTask(){
      ui.touch();
      chooseTask(chooseLevel());
    }

    function failTask(){
      ui.touch();
      currentLevelIndex = Math.max(0, currentLevelIndex - 1);
      const level = data.levelOrder[currentLevelIndex];
      stateMachine.setPetState('failed', {say:false});
      animation.playAnimation('failed', {force:true});
      ui.say(ui.sample(data.lines.failed));
      ui.openPanel('right');
      window.setTimeout(() => chooseTask(level), 780);
    }

    function completeTask(){
      ui.touch();
      const today = storage.dayData();
      today.fur += 1;
      today.done += 1;
      today.state = stateMachine.getState();
      today.updatedAt = Date.now();
      if(currentTask) today.tasks.unshift({...currentTask, completedAt:new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'})});
      today.tasks = today.tasks.slice(0, 12);
      storage.store.total = (storage.store.total || 0) + 1;
      storage.save();
      ui.renderAll();
      stateMachine.setPetState('happy', {say:false});
      ui.stage.classList.add('celebrate');
      window.setTimeout(() => ui.stage.classList.remove('celebrate'), 800);
      animation.playAnimation('happyJump', {force:true});
      ui.say(ui.sample(data.lines.happy));
      ['★','✓','🐶'].forEach((x, i) => window.setTimeout(() => ui.floater(x), i * 110));
      ui.openPanel('top');
      window.setTimeout(() => stateMachine.setPetState('idle', {say:false}), 1500);
    }

    return {newTask, failTask, completeTask, getCurrentTask:() => currentTask};
  }

  window.DuangTasks = {createTaskSystem};
})();
