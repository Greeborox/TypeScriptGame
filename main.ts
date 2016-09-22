interface vector {
  x:number,
  y:number,
}

interface actor {
  velocity: vector;
  x:number;
  y:number;
  update(delta:number):void;
  draw(ctx:CanvasRenderingContext2D):void;
}

interface istate {
  created:boolean;
  readyToChange:boolean;
  nextState:Object;
  actors:actor[];
  create():void;
  update(delta:number):void;
  draw():void;
  cleanUp():void;
}

class State implements istate {
  constructor(private ctx:CanvasRenderingContext2D,private pressedKeys:Object){};
  public created = false;
  public readyToChange = false;
  public nextState = undefined;
  public actors:actor[] = []
  public create() {
    console.log("state created");
    this.created = true;
  }
  public update(delta:number) {
    for(var i:number = 0; i < this.actors.length; i++){
      this.actors[i].update(delta);
    }
    if(this.nextState != undefined){
      this.cleanUp();
    }
    if(this.pressedKeys[32]){
      this.nextState = true;
    }
  }
  public draw() {
    for(var i:number = 0; i < this.actors.length; i++){
      this.actors[i].draw(this.ctx);
    }
  }
  public cleanUp() {
    console.log("state removed");
    this.created = false;
    for(var i:number = 0; i < this.actors.length; i++){
      delete this.actors[i]
    }
    this.actors = [];
    this.nextState = undefined;
    this.readyToChange = true;
  }
}

class Rect implements actor {
  constructor(public x:number, public y:number, public keyObj:Object, private color:string = "white"){}
  public velocity = {x:0,y:0}
  public update(delta:number):void {
    if(this.keyObj['39']){
      this.velocity.x = 0.08;
    } else if (this.keyObj['37']) {
      this.velocity.x = -0.08;
    } else {
      this.velocity.x = 0;
    };
    if(this.keyObj['40']){
      this.velocity.y = 0.08;
    } else if (this.keyObj['38']) {
      this.velocity.y = -0.08;
    } else {
      this.velocity.y = 0;
    };
    this.x += this.velocity.x * delta;
    this.y += this.velocity.y * delta;
  }
  public draw(ctx):void{
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, 40, 40);
    ctx.restore();
  }
}

window.onload = () => {
  var canvas:HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
  var ctx:CanvasRenderingContext2D = canvas.getContext("2d");
  var lastFrameTimeMs:number = 0;
  var delta:number = 0;
  var timestep:number = 1000/60;
  var currState:State;
  var pressedKeys = {};

  function mainLoop(timestamp) {
    if(!currState.created && !currState.readyToChange){
      currState.create();
      requestAnimationFrame(mainLoop);
    } else if(currState.readyToChange){
      currState.readyToChange = false;
      console.log(currState);
      currState = redState;
      currState.actors.push(new Rect(10,10,pressedKeys,"red"));
      requestAnimationFrame(mainLoop);
    } else {
      var numUpdateSteps:number = 0;
      ctx.clearRect(0, 0, 300, 300);
      delta += timestamp - lastFrameTimeMs;
      lastFrameTimeMs = timestamp;
      while (delta >= timestep) {
        currState.update(timestep);
        delta -= timestep;
        if (++numUpdateSteps >= 240) {
          delta = 0;
          break;
        }
      }
      currState.draw();
      requestAnimationFrame(mainLoop);
    }
  }

  var keyboardDown = (event: KeyboardEvent) => {
    pressedKeys[event.keyCode] = true;
    console.log(event.keyCode);
  }

  var keyboardUp = (event: KeyboardEvent) => {
    if(pressedKeys[event.keyCode]){
      delete pressedKeys[event.keyCode]
    };
  }

  var mainState = new State(ctx,pressedKeys);
  var redState = new State(ctx,pressedKeys);
  currState = mainState;
  mainState.actors.push(new Rect(10,10,pressedKeys));
  document.addEventListener('keydown', keyboardDown);
  document.addEventListener('keyup', keyboardUp);
  requestAnimationFrame(mainLoop);
}
