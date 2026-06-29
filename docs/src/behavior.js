(function(){
  function createBehaviorSystem({ui, stateMachine, animation, data}){
    let roaming = false;
    let drag = null;
    let pendingPointer = null;
    let lastTrailAt = 0;
    let lastNearReaction = 0;
    let sleepQueued = false;

    function isUserActive(){return ui.getInactiveMs() < 8000}

    function nudgePetRandomly(){
      if(roaming || ui.isAnyPanelOpen() || ui.getInactiveMs() < 16000 || animation.isHighPriorityAnimationPlaying(5)) return;
      const petWrap = ui.els.petWrap;
      const srect = ui.els.stage.getBoundingClientRect();
      const rect = petWrap.getBoundingClientRect();
      const currentX = rect.left - srect.left + rect.width / 2;
      const currentY = rect.top - srect.top + rect.height / 2;
      const x = Math.max(120, Math.min(srect.width - 120, currentX + (Math.random() * 180 - 90)));
      const y = Math.max(160, Math.min(srect.height - 100, currentY + (Math.random() * 90 - 45)));
      roaming = true;
      petWrap.classList.add('roaming');
      animation.playAnimation('walk');
      petWrap.style.left = x + 'px';
      petWrap.style.top = y + 'px';
      petWrap.style.transform = 'translate(-50%,-50%)';
      window.setTimeout(() => { petWrap.classList.remove('roaming'); roaming = false; }, 1200);
    }

    function startAutoLoops(){
      window.setInterval(() => {
        if(isUserActive() || drag || ui.isAnyPanelOpen() || animation.isHighPriorityAnimationPlaying(5)) return;
        const actions = stateMachine.getConfig().randomAnimations;
        if(actions && actions.length && Math.random() < .55) animation.playAnimation(ui.sample(actions));
      }, 6500);

      window.setInterval(() => {
        if(drag || sleepQueued || animation.isHighPriorityAnimationPlaying(8)) return;
        if(ui.getInactiveMs() > 45000 && stateMachine.getState() !== 'sleep'){
          sleepQueued = true;
          animation.queueAnimation('watchYou');
          animation.queueAnimation('yawn');
          ui.say(ui.sample(data.lines.sleep));
          window.setTimeout(() => {
            stateMachine.setPetState('sleep', {say:false});
            sleepQueued = false;
          }, 2300);
        }
      }, 4000);

      window.setInterval(() => {
        if(!drag && Math.random() < .3) nudgePetRandomly();
      }, 7000);
    }

    function bindDrag(){
      const petWrap = ui.els.petWrap;
      petWrap.addEventListener('pointerdown', e => {
        ui.touch();
        petWrap.setPointerCapture(e.pointerId);
        const rect = petWrap.getBoundingClientRect();
        pendingPointer = {startX:e.clientX, startY:e.clientY, dx:e.clientX - rect.left, dy:e.clientY - rect.top};
      });
      petWrap.addEventListener('pointermove', e => {
        if(!pendingPointer && !drag) return;
        if(!drag){
          const moved = Math.hypot(e.clientX - pendingPointer.startX, e.clientY - pendingPointer.startY);
          if(moved < 6) return;
          drag = {dx:pendingPointer.dx, dy:pendingPointer.dy};
          pendingPointer = null;
          petWrap.dataset.draggedUntil = String(Date.now() + 350);
          petWrap.classList.add('dragging');
          stateMachine.setPetState('dragging', {say:false});
          animation.playAnimation('drag', {force:true});
          ui.say(ui.sample(data.lines.drag));
        }
        const srect = ui.els.stage.getBoundingClientRect();
        let x = e.clientX - srect.left - drag.dx + petWrap.offsetWidth / 2;
        let y = e.clientY - srect.top - drag.dy + petWrap.offsetHeight / 2;
        x = Math.max(90, Math.min(srect.width - 90, x));
        y = Math.max(120, Math.min(srect.height - 80, y));
        petWrap.style.left = x + 'px';
        petWrap.style.top = y + 'px';
        petWrap.style.transform = 'translate(-50%,-50%)';
        if(Date.now() - lastTrailAt > 115){
          lastTrailAt = Date.now();
          ui.floater('🐾');
        }
      });
      function endDrag(){
        pendingPointer = null;
        if(!drag) return;
        drag = null;
        petWrap.dataset.draggedUntil = String(Date.now() + 350);
        petWrap.classList.remove('dragging');
        animation.playAnimation('land', {force:true});
        stateMachine.setPetState('idle', {say:false});
      }
      petWrap.addEventListener('pointerup', endDrag);
      petWrap.addEventListener('pointercancel', endDrag);
    }

    function bindPointerNear(){
      ui.stage.addEventListener('pointermove', e => {
        if(Date.now() - lastNearReaction < 6500 || ui.getInactiveMs() < 1800 || drag) return;
        const rect = ui.els.petWrap.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const distance = Math.hypot(e.clientX - cx, e.clientY - cy);
        if(distance < 150 && !animation.isHighPriorityAnimationPlaying(5)){
          lastNearReaction = Date.now();
          animation.playAnimation(Math.random() < .5 ? 'watchYou' : 'headTilt');
        }
      });
    }

    return {startAutoLoops, bindDrag, bindPointerNear, nudgePetRandomly, isDragging:() => !!drag};
  }

  window.DuangBehavior = {createBehaviorSystem};
})();
