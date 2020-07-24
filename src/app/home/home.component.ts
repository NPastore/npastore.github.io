import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('canvas', {static: true}) canvasCtrl;
  constructor() { }

  ngOnInit(): void {
    this.canvasAnimationStart(this.canvasCtrl.nativeElement);
  }

  private canvasAnimationStart(canvasCtrl: any) {
    // Little Canvas things
    let ctx = canvasCtrl.getContext('2d');

// Set Canvas to be window size
    canvasCtrl.width = window.innerWidth;
    canvasCtrl.height = window.innerHeight;

// Configuration, Play with these
    let config = {
      particleNumber: 1,
      maxParticleSize: 10,
      maxSpeed: 10,
      colorVariation: 50
    };

    let background = new Image();
    background.src = "../../assets/images/my.gif";


// Colors
    let colorPalette = {
      bg: [{a: 0, r: 0, g: 0, b: 0}],
      matter: [
        {r: 7, g: 98, b: 168}, // darkPRPL
        {r: 41, g: 128, b: 185}, // rockDust
        {r: 237, g: 27, b: 47}, // solorFlare
        {r: 230, g: 71, b: 87} // totesASun
      ]
    };

    let particles = [];

    let drawBg = function (ctx, color) {
      ctx.fillStyle = "rgb("+color.a + "," + color.r + "," + color.g + "," + color.b + ")";
      //ctx.drawImage(background,0,0);
      //ctx.fillRect(0, 0, canvasCtrl.width, canvasCtrl.height);
    };

    let Particle = function (x, y) {
      // X Coordinate
      this.x = x || Math.round(Math.random() * canvasCtrl.width);
      // Y Coordinate
      this.y = 0;
      // Radius of the space dust
      this.r = Math.ceil(Math.random() * config.maxParticleSize);
      // Color of the rock, given some randomness
      this.c = colorVariation(colorPalette.matter[Math.floor(Math.random() * colorPalette.matter.length)], true, false);
      // Speed of which the rock travels
      this.s = 5;//Math.pow(Math.ceil(Math.random() * config.maxSpeed), .7);
      // Direction the Rock flies
      this.d = 0;// Math.round(Math.random() * 360);
      this.rip = y;
      this.lastPosition = {};
    };

// Provides some nice color variation
// Accepts an rgba object
// returns a modified rgba object or a rgba string if true is passed in for argument 2
    let colorVariation = function (color, returnString, transparent) {
      let r, g, b, a, variation;
      if(!transparent){
        r = Math.round(((Math.random() * config.colorVariation) - (config.colorVariation / 2)) + color.r);
        g = Math.round(((Math.random() * config.colorVariation) - (config.colorVariation / 2)) + color.g);
        b = Math.round(((Math.random() * config.colorVariation) - (config.colorVariation / 2)) + color.b);
        a = Math.random() + .5;
      } else {
        r = color.r;
        g = color.g;
        b = color.b;
        a = color.a;
      }
      if (returnString) {
        return "rgba(" + r + "," + g + "," + b + "," + a + ")";
      } else {
        return {r, g, b, a};
      }
    };

// Used to find the rocks next point in space, accounting for speed and direction
    let updateParticleModel = function (p) {
      p.lastPosition = p;
      let a = 180 - (p.d + 90); // find the 3rd angle
      p.d > 0 && p.d < 180 ? p.x += p.s * Math.sin(p.d) / Math.sin(p.s) : p.x -= p.s * Math.sin(p.d) / Math.sin(p.s);
      p.d > 90 && p.d < 270 ? p.y += p.s * Math.sin(a) / Math.sin(p.s) : p.y -= p.s * Math.sin(a) / Math.sin(p.s);
      return p;
    };

// Just the function that physically draws the particles
// Physically? sure why not, physically.
    let drawParticle = function (x, y, r, c) {
      ctx.beginPath();
      ctx.fillStyle = colorVariation(colorPalette.matter[Math.floor(Math.random() * colorPalette.matter.length)], true, false);
      ctx.arc(x, y, r, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.closePath();
    };

    let cleansParticle = function (x, y, r, c){
      ctx.clearRect(x-r, 0, r*2, y);
    }

// Remove particles that aren't on the canvas
    let cleanUpArray = function () {
      particles = particles.filter((p) => {
        return (p.x > -100 && p.y > -100) && (p.y < p.rip);
      });
    };


    let initParticles = function (numParticles, x?, y?) {
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle(x, y));
      }
      particles.forEach((p) => {
        drawParticle(p.x, p.y, p.r, p.c);
        if(p.lastPosition){
          cleansParticle(p.lastPosition.x, p.lastPosition.y, p.lastPosition.r, p.lastPosition.c)
        }
      });
    };


// That thing
    window['requestAnimFrame'] = (function () {
      return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (callback) {
          window.setTimeout(callback, 1000 / 60);
        };
    })();


// Our Frame function
    let frame = function () {
      // Draw background first
      drawBg(ctx, colorPalette.bg);
      // Update Particle models to new position
      particles.map((p) => {
        return updateParticleModel(p);
      });
      // Draw em'
      particles.forEach((p) => {
        cleansParticle(p.lastPosition.x, p.lastPosition.y, p.lastPosition.r, p.lastPosition.c);
        drawParticle(p.x, p.y, p.r, p.c);
        //cleansParticle(p.x, p.y, p.r, p.c);

        if(p.y > p.rip){
          cleansParticle(p.x, p.y+p.r, p.r, p.c);
          explode(p.x,p.y);
          cleanUpArray();
        }
      });

      // Play the same song? Ok!
      window['requestAnimFrame'](frame);
    };
  var lastOne;

  let showBoom = function (_element,x,y) {
      let id = 'boom'+Math.floor(Math.random() * 7);
      while(id == lastOne){
        id = 'boom'+Math.floor(Math.random() * 7);
      }
      var _div = document.getElementById(id);     // returns a random integer from 0 to 9 );
      _div.style.left = x+'px';
      switch(_div.id) {
        case "boom0":
          _div.style.top = y+'px';
          console.log("boom0")
          break;
        case "boom1":
          _div.style.top = y-120+'px';
          break;
        case "boom2":
          _div.style.top = y-160+'px';
          break;
        case "boom3":
          _div.style.top = y-260+'px';
          break;
        case "boom4":
          _div.style.top = y-300+'px';
          break;
        case "boom5":
          _div.style.top = y-400+'px';
          break;
        case "boom6":
          _div.style.top = y-460+'px';
          break;
      }
      _div.style.visibility = 'visible';
      setTimeout(
        function(){
          _div.style.visibility = 'hidden';
          }, 800);
      lastOne = id;
  }

  let explode = function(x,y){
      showBoom(ctx,x-40,y-40)
    }

// Click listener
    this.canvasCtrl.nativeElement.addEventListener("click", function (event) {
        let x = event.clientX,
          y = event.clientY;
        cleanUpArray();
        initParticles(config.particleNumber, x, y);
      }
    );

// First Frame
    frame();

// First particle explosion
    //initParticles(config.particleNumber);
  }
}
