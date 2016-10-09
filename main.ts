interface vector {
  x:number,
  y:number,
}

interface actor {
  velocity?: vector;
  x:number;
  y: number;
  update(delta:number):void;
  draw(ctx: CanvasRenderingContext2D): void;
  isPushable?(direction: string, mapData: number[][], actors: actor[]): boolean;
  push?(direction: string): void;
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
    this.created = true;
    this.nextState = false;
  }
  public update(delta:number) {
    for(var i:number = 0; i < this.actors.length; i++){
      this.actors[i].update(delta);
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
    if (this.actors.length > 1 && this.checkIfWon()) {
        this.nextState = true;
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
  public checkIfWon() {
      var gameWon:boolean = true;
      for (var i = 1; i < this.actors.length; i++) {
          if (this.actors[i].x < 320) {
              gameWon = false;
          }
      }
      return gameWon;
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

class Player implements actor {
  constructor(public x: number, public y: number, public size: number, public keyObj: Object, private color: string = "white", public mapData: number[][], private actors:actor[], public direction: string = "") { }
  public velocity = {x:0,y:0}
  public movable = true;
  public walking = false;
  public dest = { x: 0, y: 0 };
  public originalPos = { x: 0, y: 0 };
  public update(delta: number): void {
      if (this.keyObj['39'] && !this.walking) {
          this.direction = "right";
          if (this.checkWalls() && this.checkBoxes()) {
            this.velocity.x = 0.08;
            this.walking = true;
            this.dest.x = this.x + 20;
            this.dest.y = this.y;
          }
        
      } else if (this.keyObj['37'] && !this.walking) {
          this.direction = "left";
          if (this.checkWalls() && this.checkBoxes()) {
              this.velocity.x = -0.08;
              this.walking = true;
              this.dest.x = this.x - 20;
              this.dest.y = this.y;
          }
      } else if (this.keyObj['40'] && !this.walking) {
              this.direction = "down";
              if (this.checkWalls() && this.checkBoxes()) {
                  this.velocity.y = 0.08;
                  this.walking = true;
                  this.dest.x = this.x;
                  this.dest.y = this.y + 20;
              }
      } else if (this.keyObj['38'] && !this.walking) {
              this.direction = "up";
              if (this.checkWalls() && this.checkBoxes()) {
                  this.velocity.y = -0.08;
                  this.walking = true;
                  this.dest.x = this.x;
                  this.dest.y = this.y - 20;
              }
    } 
    this.x += this.velocity.x * delta; 
    this.y += this.velocity.y * delta;
    if (this.walking) {
        switch (this.direction) {
            case "up":
                if (this.y <= this.dest.y) {
                    this.walking = false;
                    this.y = this.dest.y;
                    this.velocity.x = 0;
                    this.velocity.y = 0;
                }
                break;
            case "down":
                if (this.y >= this.dest.y) {
                    this.walking = false;
                    this.y = this.dest.y;
                    this.velocity.x = 0;
                    this.velocity.y = 0;
                }
                break;
            case "left":
                if (this.x <= this.dest.x) {
                    this.walking = false;
                    this.x = this.dest.x;
                    this.velocity.x = 0;
                    this.velocity.y = 0;
                }
                break;
            case "right":
                if (this.x >= this.dest.x) {
                    this.walking = false;
                    this.x = this.dest.x;
                    this.velocity.x = 0;
                    this.velocity.y = 0;
                }
                break;
        }
    }
  }
  public draw(ctx):void{
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
  private checkWalls() {
      let currXpos = this.x / 20;
      let cuttYpos = this.y / 20;
      switch (this.direction) {
          case "up":
              cuttYpos -= 1;
              break
          case "down":
              cuttYpos += 1;
              break
          case "left":
              currXpos -= 1;
              break
          case "right":
              currXpos += 1;
              break
      }
      if (this.mapData[cuttYpos][currXpos]) {
          return false;
      } else {
          return true;
      }
  }
  private checkBoxes() {
      let currXpos = this.x;
      let currYpos = this.y;
      switch (this.direction) {
          case "up":
              currYpos -= 20;
              break
          case "down":
              currYpos += 20;
              break
          case "left":
              currXpos -= 20;
              break
          case "right":
              currXpos += 20;
              break
      }
      for (var i = 1; i < this.actors.length; i++) {
          if (currXpos === this.actors[i].x && currYpos === this.actors[i].y) {
              if (this.actors[i].isPushable(this.direction, this.mapData, this.actors)) {
                  this.actors[i].push(this.direction);
              } else {
                  return false;
              }
          }
      }
      return true;
  }
}

class Box implements actor {
  constructor(public x:number, public y:number, public size:number){}
  public movable = true;;
  public update(delta:number):void {}
  public draw(ctx):void{
    ctx.save();
    ctx.fillStyle = "purple"
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
  public isPushable(direction, map, actors) {
      let currXpos = this.x / 20;
      let currYpos = this.y / 20;
      let currXwhole = this.x;
      let currYwhole = this.y
      switch (direction) {
          case "up":
              currYpos -= 1;
              currYwhole -= 20;
              break
          case "down":
              currYpos += 1;
              currYwhole += 20;
              break
          case "left":
              currXpos -= 1;
              currXwhole -= 20;
              break
          case "right":
              currXpos += 1;
              currXwhole += 20;
              break
      }
      if (map[currYpos][currXpos]) {
          return false;
      } else {
          for (var i = 1; i < actors.length; i++) {
              if (currXwhole === actors[i].x && currYwhole === actors[i].y) {
                  return false;
              }
          }
      }     
      return true;
  }
  push(direction) {
      switch (direction) {
          case "up":
              this.y -= 20;
              break
          case "down":
              this.y += 20;
              break
          case "left":
              this.x -= 20;
              break
          case "right":
              this.x += 20;
              break
      }
  }
}

class GameText implements actor {
  constructor(public x:number, public y:number, public text:string){}
  public update(delta:number):void {}
  public font:string = "20px Georgia";
  public draw(ctx):void{
    ctx.save();
    ctx.fillStyle = "white"
    ctx.font="20px Georgia";
    ctx.fillText(this.text,this.x,this.y);
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
  var levelData =[[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                  [1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                  [1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                  [1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                  [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                  [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                  [1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
                  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                  [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1],
                  [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];
  var level = new Map(tileSize, levelData);
  var mainState = new State(ctx,pressedKeys,level);
  var startState = new State(ctx,pressedKeys);
  var stateMap:Object = {
    "startState": startState,
    "mainState": mainState,
  }
  var currStateKey:string = "startState";
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
      if(currStateKey === "startState" || currStateKey === "mainState"){
        currStateKey = "mainState";
        currState = stateMap[currStateKey];
        currState.actors.push(new Player(tileSize * 11, tileSize * 8, tileSize, pressedKeys, "white", levelData, currState.actors));
        currState.actors.push(new Box(tileSize * 2, tileSize * 7, tileSize));
        currState.actors.push(new Box(tileSize * 5, tileSize * 2, tileSize));
        currState.actors.push(new Box(tileSize * 5, tileSize * 4, tileSize));
        currState.actors.push(new Box(tileSize * 5, tileSize * 8, tileSize));
        currState.actors.push(new Box(tileSize * 7, tileSize * 3, tileSize));
        currState.actors.push(new Box(tileSize * 7, tileSize * 4, tileSize));
      }
      requestAnimationFrame(mainLoop);
    } else {
      var numUpdateSteps:number = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
  currState.actors.push(new GameText(100,120,"Press Space To Start"));
  document.addEventListener('keydown', keyboardDown);
  document.addEventListener('keyup', keyboardUp);
  requestAnimationFrame(mainLoop);
}
