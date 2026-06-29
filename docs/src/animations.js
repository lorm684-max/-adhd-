(function(){
  const ASSETS = {
    idle:'assets/duangduang/idle.png',
    adhd:'assets/duangduang/adhd.png',
    low:'assets/duangduang/low.png',
    stuck:'assets/duangduang/stuck.png',
    anxious:'assets/duangduang/anxious.png',
    task:'assets/duangduang/task.png',
    happy:'assets/duangduang/happy.png',
    failed:'assets/duangduang/failed.png',
    sleep:'assets/duangduang/sleep.png',
    smug:'assets/duangduang/smug.png',
    sad:'assets/duangduang/sad.png',
    idleHeadtilt:'assets/duangduang/idle_headtilt.png',
    blinkSoft:'assets/duangduang/blink_soft.png',
    dragHang:'assets/duangduang/drag_hang.png',
    petHappy:'assets/duangduang/pet_happy.png',
    yawnSleepy:'assets/duangduang/yawn_sleepy.png',
    watchYou:'assets/duangduang/watch_you.png',
    getUp:'assets/duangduang/get_up.png',
    walkStep:'assets/duangduang/walk_step.png',
    lookBack:'assets/duangduang/look_back.png'
  };

  const animationRegistry = {
    idle:{frames:[ASSETS.idle], fps:1, loop:true, priority:1},
    adhd:{frames:[ASSETS.adhd], fps:1, loop:true, priority:1},
    low:{frames:[ASSETS.low], fps:1, loop:true, priority:1},
    stuck:{frames:[ASSETS.stuck], fps:1, loop:true, priority:1},
    anxious:{frames:[ASSETS.anxious], fps:1, loop:true, priority:1},
    task:{frames:[ASSETS.task], fps:1, loop:true, priority:8},
    happy:{frames:[ASSETS.happy, ASSETS.petHappy, ASSETS.happy], fps:5, loop:false, priority:9, next:'currentState'},
    failed:{frames:[ASSETS.failed, ASSETS.sad, ASSETS.failed], fps:4, loop:false, priority:6, next:'currentState'},
    sleep:{frames:[ASSETS.sleep], fps:1, loop:true, priority:5},
    smug:{frames:[ASSETS.smug], fps:1, loop:true, priority:1},
    blink:{frames:[ASSETS.idle, ASSETS.blinkSoft, ASSETS.idle], fps:6, loop:false, priority:3, next:'currentState'},
    headTilt:{frames:[ASSETS.idle, ASSETS.idleHeadtilt, ASSETS.idle], fps:4, loop:false, priority:3, next:'currentState'},
    lookBack:{frames:[ASSETS.lookBack, ASSETS.idleHeadtilt, ASSETS.lookBack], fps:4, loop:false, priority:4, next:'currentState'},
    watchYou:{frames:[ASSETS.watchYou, ASSETS.idleHeadtilt], fps:3, loop:false, priority:4, next:'currentState'},
    yawn:{frames:[ASSETS.watchYou, ASSETS.yawnSleepy, ASSETS.sleep], fps:2, loop:false, priority:5, next:'currentState'},
    sleepBreath:{frames:[ASSETS.sleep, ASSETS.yawnSleepy, ASSETS.sleep], fps:2, loop:true, priority:5},
    getUp:{frames:[ASSETS.sleep, ASSETS.getUp, ASSETS.idle], fps:4, loop:false, priority:6, next:'currentState'},
    getTask:{frames:[ASSETS.getUp, ASSETS.task], fps:4, loop:false, priority:8, next:'currentState'},
    petHappy:{frames:[ASSETS.idleHeadtilt, ASSETS.petHappy, ASSETS.idleHeadtilt], fps:6, loop:false, priority:7, next:'currentState'},
    tooMuchPet:{frames:[ASSETS.lookBack, ASSETS.smug, ASSETS.lookBack], fps:5, loop:false, priority:7, next:'currentState'},
    drag:{frames:[ASSETS.dragHang], fps:1, loop:true, priority:10},
    land:{frames:[ASSETS.dragHang, ASSETS.walkStep, ASSETS.idle], fps:5, loop:false, priority:10, next:'currentState'},
    walk:{frames:[ASSETS.idleHeadtilt, ASSETS.walkStep, ASSETS.idleHeadtilt], fps:5, loop:false, priority:4, next:'currentState'},
    happyJump:{frames:[ASSETS.happy, ASSETS.petHappy, ASSETS.happy, ASSETS.petHappy], fps:7, loop:false, priority:9, next:'currentState'}
  };

  function createAnimationManager(petImg, hooks = {}){
    let current = null;
    let baseAnimation = 'idle';
    const queue = [];

    function preloadAnimations(){
      const urls = new Set();
      Object.values(animationRegistry).forEach(anim => anim.frames.forEach(frame => urls.add(frame)));
      urls.forEach(src => { const img = new Image(); img.src = src; });
    }

    function paint(src){
      if(!petImg || !src || petImg.dataset.currentFrame === src) return;
      petImg.dataset.currentFrame = src;
      petImg.classList.add('switching');
      window.setTimeout(() => {
        petImg.src = src;
        requestAnimationFrame(() => petImg.classList.remove('switching'));
      }, 45);
    }

    function stopAnimation(){
      if(current && current.timer) clearInterval(current.timer);
      current = null;
    }

    function setBaseAnimation(name){
      if(!animationRegistry[name]) name = 'idle';
      baseAnimation = name;
      if(!current || current.priority <= 1) playAnimation(baseAnimation, {force:true});
    }

    function returnToCurrentState(){
      playAnimation(baseAnimation, {force:true});
    }

    function finish(anim){
      stopAnimation();
      if(queue.length){
        const next = queue.shift();
        playAnimation(next.name, next.options);
        return;
      }
      if(anim.next === 'currentState') returnToCurrentState();
    }

    function playAnimation(name, options = {}){
      const anim = animationRegistry[name];
      if(!anim) return false;
      const priority = options.priority ?? anim.priority ?? 1;
      if(current && current.priority > priority && !options.force) return false;
      stopAnimation();
      current = {name, priority, frameIndex:0, timer:null, startedAt:Date.now()};
      hooks.onAnimationStart?.(name, anim);
      const fps = Math.max(1, options.fps || anim.fps || 1);
      const duration = 1000 / fps;
      const tick = () => {
        if(!current) return;
        paint(anim.frames[current.frameIndex]);
        current.frameIndex += 1;
        if(current.frameIndex >= anim.frames.length){
          if(options.loop ?? anim.loop){
            current.frameIndex = 0;
          }else{
            hooks.onAnimationEnd?.(name, anim);
            finish(anim);
          }
        }
      };
      tick();
      if((options.loop ?? anim.loop) || anim.frames.length > 1) current.timer = setInterval(tick, duration);
      return true;
    }

    function queueAnimation(name, options = {}){
      if(!animationRegistry[name]) return;
      queue.push({name, options});
      if(!current || current.priority <= 1) {
        const next = queue.shift();
        playAnimation(next.name, next.options);
      }
    }

    function isHighPriorityAnimationPlaying(min = 5){
      return !!current && current.priority >= min;
    }

    function getCurrentAnimation(){return current ? {...current} : null}

    preloadAnimations();
    return {playAnimation, stopAnimation, queueAnimation, setBaseAnimation, returnToCurrentState, preloadAnimations, isHighPriorityAnimationPlaying, getCurrentAnimation, registry:animationRegistry, assets:ASSETS};
  }

  window.DuangAnimations = {ASSETS, animationRegistry, createAnimationManager};
})();
