var GIFEncoder = require('gifencoder');
var Canvas = require('canvas');
var fs = require('fs');

require('shelljs/global');

var CORE_SIZE = 20;
var GIF_LENGTH = 6000;
var TIME_STEP = 1000 / 60;

var encoder = new GIFEncoder(320, 240);

encoder.createReadStream().pipe(fs.createWriteStream('galaxy.gif'));
encoder.start();
encoder.setRepeat(0);
encoder.setDelay(TIME_STEP);
encoder.setQuality(100);

var canvas = new Canvas(320, 240);
var ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';
ctx.strokeStyle = 'white';

function Galaxy () {
  var stars = [],
    me = this;

  me.draw = function (context) {
    for (var i = 0; i < stars.length; i++) {
      stars[i].draw(context);
    }
  };

  me.generate = function () {
    var startAngle = 0,
      startDistance = 0,
      currentAngle = 0,
      currentDistance = 1,
      arms = 0;

    //central stars first
    for (var i = 0; i < 150; i++) {
      startAngle = Math.random() * (Math.PI * 2);
      startDistance = Math.random() * CORE_SIZE;

      stars.push(new Star({
        startPosition: {
          x: startDistance * Math.cos(startAngle),
          y: startDistance * Math.sin(startAngle)
        }
      }));
    }

    arms = 2;// + Math.floor(Math.random() * 3);
    for (i = 0; i < arms; i++) {
      currentAngle = Math.random() * (Math.PI * 2);

      while (currentDistance <= 240) {
        currentAngle += 0.1 + Math.random() * 0.4;
        currentDistance++;

        stars.push(new Star({
          startPosition: {
            x: currentDistance * Math.cos(currentAngle),
            y: currentDistance * Math.sin(currentAngle)
          }
        }));
      }

      currentDistance = 1;
    }
  };

  me.update = function () {
    for (var i = 0; i < stars.length; i++) {
      stars[i].update();
    }
  };

  return me;
};

function Star (config) {
  var me = this;

  me.startPosition = config.startPosition;
  me.position = {
    x: me.startPosition.x,
    y: me.startPosition.y
  };
  me.radius = Math.sqrt(Math.pow(me.position.x, 2) + Math.pow(me.position.y, 2))
  me.angle = Math.atan2(me.position.y, me.position.x);
  me.speed = config.speed || (Math.PI * 2) / (GIF_LENGTH / TIME_STEP);

  me.draw = function (context) {
    context.beginPath();
    context.arc(me.position.x + 160, me.position.y + 120, 0.5, 0, Math.PI * 2);
    context.fill();
  };

  me.update = function () {
    me.angle += me.speed;
    me.position = {
      x: me.radius * Math.cos(me.angle),
      y: me.radius * Math.sin(me.angle)
    };
  };
};

var frames = 0,
  maxFrames = GIF_LENGTH / TIME_STEP,
  testGalaxy = new Galaxy();

testGalaxy.generate();

while (frames < maxFrames) {
  testGalaxy.draw(ctx);
  encoder.addFrame(ctx);
  ctx.clearRect(0, 0, 320, 240);
  testGalaxy.update();

  frames++;
  console.log('frame complete: ' + frames);
}

encoder.finish();
console.log('Finished!');

setTimeout(function () {
  exec('eog ~/Code/galaxy-generator/galaxy.gif');
}, 500);
