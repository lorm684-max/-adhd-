(function(){
  const PetState = {
    IDLE:'idle',
    ADHD:'adhd',
    LOW:'low',
    STUCK:'stuck',
    ANXIOUS:'anxious',
    TASK:'task',
    HAPPY:'happy',
    FAILED:'failed',
    SLEEP:'sleep',
    SMUG:'smug',
    DRAGGING:'dragging'
  };

  const stateMap = {
    idle:'普通待机', adhd:'脑子乱飞', low:'低电量', stuck:'启动不了', anxious:'焦虑了',
    task:'叼任务', happy:'完成任务', failed:'任务降级', sleep:'睡觉', smug:'欠揍巡逻', dragging:'被拎起来'
  };

  const stateConfig = {
    idle:{baseAnimation:'idle', randomAnimations:['blink','headTilt','lookBack','watchYou'], taskBias:['mushroom','human'], linesKey:'idle'},
    adhd:{baseAnimation:'adhd', randomAnimations:['blink','lookBack','walk'], taskBias:['corpse','mushroom','human'], linesKey:'adhd'},
    low:{baseAnimation:'low', randomAnimations:['watchYou','yawn','sleepBreath'], taskBias:['corpse','mushroom'], linesKey:'low'},
    stuck:{baseAnimation:'stuck', randomAnimations:['watchYou','headTilt'], taskBias:['corpse','mushroom','human'], linesKey:'stuck'},
    anxious:{baseAnimation:'anxious', randomAnimations:['blink','watchYou','lookBack'], taskBias:['corpse','mushroom'], linesKey:'anxious'},
    task:{baseAnimation:'task', randomAnimations:['blink','watchYou'], taskBias:['mushroom','human'], linesKey:'task'},
    happy:{baseAnimation:'idle', randomAnimations:['blink','headTilt'], taskBias:['mushroom','human'], linesKey:'happy'},
    failed:{baseAnimation:'failed', randomAnimations:['watchYou'], taskBias:['corpse','mushroom'], linesKey:'failed'},
    sleep:{baseAnimation:'sleep', randomAnimations:['sleepBreath'], taskBias:['corpse'], linesKey:'sleep'},
    smug:{baseAnimation:'smug', randomAnimations:['lookBack','walk'], taskBias:['mushroom','human'], linesKey:'idle'},
    dragging:{baseAnimation:'drag', randomAnimations:[], taskBias:['corpse'], linesKey:'drag'}
  };

  function createStateMachine({animation, storage, ui, lines}){
    let currentState = PetState.IDLE;
    let previousState = PetState.IDLE;

    function getState(){return currentState}
    function getConfig(state=currentState){return stateConfig[state] || stateConfig.idle}

    function setPetState(state, options = {}){
      if(!stateConfig[state]) state = PetState.IDLE;
      previousState = currentState;
      currentState = state;
      const config = getConfig(state);
      ui.setVisualState(state, stateMap[state]);
      ui.syncStateButtons(state);
      animation.setBaseAnimation(config.baseAnimation);
      const today = storage.dayData();
      today.state = state;
      today.updatedAt = Date.now();
      storage.save();
      if(options.say !== false){
        const pool = lines[options.linesKey || config.linesKey] || lines.idle;
        ui.say(options.text || ui.sample(pool));
      }
      ui.renderAll?.();
      return state;
    }

    function returnToPreviousState(){
      setPetState(previousState === PetState.DRAGGING ? PetState.IDLE : previousState, {say:false});
    }

    function wakeIfSleeping(){
      if(currentState !== PetState.SLEEP) return false;
      setPetState(PetState.IDLE, {say:false});
      animation.playAnimation('getUp', {force:true});
      ui.say(ui.sample(lines.wake));
      return true;
    }

    return {PetState, stateMap, stateConfig, getState, getConfig, setPetState, returnToPreviousState, wakeIfSleeping};
  }

  window.DuangState = {PetState, stateMap, stateConfig, createStateMachine};
})();
