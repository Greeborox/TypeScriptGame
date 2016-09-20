window.onload = () => {
  var canvas:HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
  var ctx:CanvasRenderingContext2D = canvas.getContext("2d");
  var lastFrameTimeMs:number = 0;
  var delta:number = 0;
  var timestep:number = 1000/60;
  var maxFPS:number = 60;
  console.log("game ready");

  interface vector {
    x:number,
    y:number,
  }

  interface state {
    created:boolean;
    actors:actor[];
    create():void;
    update():void;
    draw():void;
    cleanUp():void;
  }

  interface actor {
    velocity: vector;
    x:number;
    y:number;
    update(delta:number):void;
    draw():void;
  }

  var rect:actor = {
    x: 10,
    y: 10,
    velocity: {x: 0.08, y: 0},
    update: function(delta:number):void {
      this.x += this.velocity.x * delta;
      if(this.x+40 >= 300 || this.x <= 0){
        this.velocity.x *= -1
      }
      this.y += this.velocity.y * delta;
    },
    draw: function():void{
      ctx.save();
      ctx.fillStyle = "white";
      ctx.fillRect(this.x, this.y, 40, 40);
      ctx.restore();
    }
  }

  function mainLoop(timestamp) {
    var numUpdateSteps:number = 0;
    ctx.clearRect(0, 0, 300, 300);
    delta += timestamp - lastFrameTimeMs;
    lastFrameTimeMs = timestamp;
    while (delta >= timestep) {
      rect.update(timestep);
      delta -= timestep;
      if (++numUpdateSteps >= 240) {
        delta = 0;
        break;
      }
    }
    rect.draw();
    requestAnimationFrame(mainLoop);
  }
  requestAnimationFrame(mainLoop);
}
