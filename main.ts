interface vector {
  x:number,
  y:number,
}

interface actor {
  velocity: vector;
  movable: boolean;
  x:number;
  y:number;
  update(delta:number):void;
  draw(ctx:CanvasRenderingContext2D):void;
}

interface istate {
  created:boolean;
  readyToChange:boolean;
  nextState:boolean;
  actors:actor[];
  create():void;
  update(delta:number):void;
  draw():void;
  cleanUp():void;
}

interface map {
  mapData: number[][];
  draw(ctx:CanvasRenderingContext2D):void;
}

class State implements istate {
  constructor(private ctx:CanvasRenderingContext2D,private pressedKeys:Object,private level?:Map){};
  public spacePressed = false;
  public created = false;
  public nextState = false;
  public readyToChange = false;
  public actors:actor[] = []
  public create() {
    console.log("state created");
    console.log(this.level);
    this.created = true;
    this.nextState = false;
  }
  private checkCollision(r1,r2){
    let r1centerx = r1.x+(r1.size/2);
    let r1centery = r1.y+(r1.size/2);
    let r2centerx = r2.x+(r2.size/2);
    let r2centery = r2.y+(r2.size/2);
    var vx = r1centerx - r2centerx;
    var vy = r1centery - r2centery;
    var combinedHalfWidths = r1.size/2 + r2.size/2;
    var combinedHalfHeights = r1.size/2 + r2.size/2;
    if(Math.abs(vx) < combinedHalfWidths){
      if(Math.abs(vy) < combinedHalfHeights){
        var overlapX = combinedHalfWidths - Math.abs(vx);
        var overlapY = combinedHalfHeights - Math.abs(vy);
        if(overlapX >= overlapY) {
          if(vy > 0) {
            r1.y = r1.y + overlapY;
          } else {
            r1.y = r1.y - overlapY;
          }
        } else {
          if(vx > 0) {
            r1.x = r1.x + overlapX;
          } else {
            r1.x = r1.x - overlapX;
          }
        }
      }
    }
  }
  public checkOverlap(entity1,entity2){
    return !(entity1.x + entity1.size -1 < entity2.x ||
               entity2.x + entity2.size -1 < entity1.x ||
               entity1.y + entity1.size -1 < entity2.y ||
               entity2.y + entity2.size -1 < entity1.y);
  }
  public update(delta:number) {
    for(var i:number = 0; i < this.actors.length; i++){
      this.actors[i].update(delta);
    }
    if(this.level){
      let level = this.level.mapData;
      for (let i = 0; i < level.length; i++) {
        for (let j = 0; j < level[i].length; j++) {
          if(level[i][j]){
            var wallColl = {
              size: 20,
              x: 20*j,
              y: 20*i,
            }
            this.checkCollision(this.actors[0],wallColl)
            if(this.actors.length > 1){
              for (let k = 1; k < this.actors.length; k++) {
                if(this.checkOverlap(this.actors[k], wallColl)){
                  if(this.checkOverlap(this.actors[k], this.actors[0])){
                    this.actors[k].movable = false;
                  } else {
                    this.actors[k].movable = true;
                  }
                }
                this.checkCollision(this.actors[k], wallColl);
              }
            }
          }
        }
      }
      if(this.actors.length > 1){
        for (let i = 1; i < this.actors.length; i++) {
          if(this.actors[i].movable){
            this.checkCollision(this.actors[i], this.actors[0]);
          } else {
            this.checkCollision(this.actors[0], this.actors[i]);
          }
          if(!this.checkOverlap(this.actors[i], this.actors[0])){
            this.actors[i].movable = true;
          }
        }
      }
    }
    if(this.nextState){
      this.cleanUp();
    }
    if(this.pressedKeys[32]){
      if(!this.spacePressed){
        this.nextState = true;
        this.spacePressed = true;
      }
    } else {
      this.spacePressed = false;
    }
  }
  public draw() {
    if(this.level){
      this.level.draw(this.ctx);
    }
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
    this.readyToChange = true;
    this.nextState = false;
  }
}

class Map implements map {
  constructor (public size:number, public mapData:number[][]){}
  public draw(ctx):void{
    for (let i = 0; i < this.mapData.length; i++) {
        for (let j = 0; j < this.mapData[i].length; j++) {
          if(this.mapData[i][j]){
            ctx.save();
            ctx.fillStyle = "gray";
            ctx.fillRect(this.size*j, this.size*i, this.size, this.size);
            ctx.restore();
          }
        }
    }
  }
}

class Rect implements actor {
  constructor(public x:number, public y:number, public size:number, public keyObj:Object, private color:string = "white"){}
  public velocity = {x:0,y:0}
  public movable = true;
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
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
}

class Box implements actor {
  constructor(public x:number, public y:number, public size:number){}
  public velocity = {x:0,y:0}
  public movable = true;;
  public update(delta:number):void {

  }
  public draw(ctx):void{
    ctx.save();
    ctx.fillStyle = "purple"
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
}

window.onload = () => {
  var canvas:HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
  var ctx:CanvasRenderingContext2D = canvas.getContext("2d");
  var tileSize:number = 20;
  var lastFrameTimeMs:number = 0;
  var delta:number = 0;
  var timestep:number = 1000/60;
  var currState:State;
  var pressedKeys:Object = {};
  var levelData =[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                  [1,1,1,1,1,1,0,0,0,1,1,1,1,1,1],
                  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]];
  var level = new Map(tileSize, levelData);
  var mainState = new State(ctx,pressedKeys,level);
  var redState = new State(ctx,pressedKeys);
  var stateMap:Object = {
    "mainState": mainState,
    "redState": redState
  }
  var currStateKey:string = "mainState";
  var keyboardDown = (event:KeyboardEvent) => {
    pressedKeys[event.keyCode] = true;
  }
  var keyboardUp = (event:KeyboardEvent) => {
    if(pressedKeys[event.keyCode]){
      delete pressedKeys[event.keyCode]
    };
  }

  function mainLoop(timestamp) {
    if(!currState.created && !currState.readyToChange){
      currState.create();
      requestAnimationFrame(mainLoop);
    } else if(currState.readyToChange){
      currState.readyToChange = false;
      if(currStateKey === "mainState"){
        currStateKey = "redState";
        currState = stateMap[currStateKey];
        currState.actors.push(new Rect(tileSize,tileSize,tileSize,pressedKeys,"red"));
        currState.actors.push(new Box(tileSize*2,tileSize*1,tileSize));
      } else {
        currStateKey = "mainState";
        currState = stateMap[currStateKey];
        currState.actors.push(new Rect(tileSize,tileSize,tileSize,pressedKeys,"white"));
      }
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

  currState = stateMap[currStateKey];
  mainState.actors.push(new Rect(tileSize,tileSize,tileSize,pressedKeys));
  currState.actors.push(new Box(tileSize*2,tileSize*3,tileSize));
  document.addEventListener('keydown', keyboardDown);
  document.addEventListener('keyup', keyboardUp);
  requestAnimationFrame(mainLoop);
}
