const Matter = require('matter-js');
const Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  Composite = Matter.Composite;

const junkAmount = 60;
const canvasWidth = 1920;
const canvasHeight = 1080;
const spawnOffset = 50; // Additional offset for spawning outside the canvas
const engine = Engine.create({
  enableSleeping: false,
  gravity: {x: 0, y: 0},
});

const spaceJunkComposite = Composite.create({label: 'Space Junk'});

function createSpaceJunk(x, y) {
  const radius = Math.random() * 20 + 5;
  const junk = Bodies.circle(x, y, radius, {
    friction: 0.03,
    frictionAir: 0,
    restitution: 0.05,
    inverseInertia: 0,
  });
  Body.setMass(junk, radius * 0.1);
  Body.setAngularVelocity(junk, 0.001 + Math.random() * 0.05);
  Body.setVelocity(junk, {
    x: 0.001 + Math.random() * (0.1 - 0.01),
    y: 0.001 + Math.random() * (0.1 - 0.01)
  });
  return junk;
}

function initializeSpaceJunk() {
  for (let i = 0; i < junkAmount; i++) {
    const x = Math.random() * canvasWidth;
    const y = Math.random() * canvasHeight;
    const junk = createSpaceJunk(x, y);
    Composite.add(spaceJunkComposite, junk);
  }
}

function respawnJunk(junk) {
  const side = Math.floor(Math.random() * 4);
  const offset = junk.circleRadius + spawnOffset;

  let x, y;

  switch (side) {
    case 0: // Top
      x = Math.random() * canvasWidth;
      y = -offset;
      Body.setPosition(junk, {x, y});
      Body.setVelocity(junk, {
        x: 0.001 + Math.random() * 0.14,
        y: 0.001 + Math.random() * 0.2
      });
      break;
    case 1: // Right
      x = canvasWidth + offset;
      y = Math.random() * canvasHeight;
      Body.setPosition(junk, {x, y});
      Body.setVelocity(junk, {
        x: 0.001 + Math.random() * -0.2,
        y: 0.001 + Math.random() * 0.14
      });
      break;
    case 2: // Bottom
      x = Math.random() * canvasWidth;
      y = canvasHeight + offset;
      Body.setPosition(junk, {x, y});
      Body.setVelocity(junk, {
        x: 0.001 + Math.random() * 0.14,
        y: 0.001 + Math.random() * -0.2
      });
      break;
    case 3: // Left
      x = -offset;
      y = Math.random() * canvasHeight;
      Body.setPosition(junk, {x, y});
      Body.setVelocity(junk, {
        x: 0.001 + Math.random() * 0.2,
        y: 0.001 + Math.random() * 0.14
      });
      break;
  }
  Body.setAngularVelocity(junk, 0.001 + Math.random() * 0.03);
}

function updateSpaceJunk() {
  Engine.update(engine, 15);

  Composite.allBodies(spaceJunkComposite).forEach(junk => {
    const buffer = junk.circleRadius + spawnOffset;
    if (junk.position.x < -buffer ||
      junk.position.x > canvasWidth + buffer ||
      junk.position.y < -buffer ||
      junk.position.y > canvasHeight + buffer) {
      respawnJunk(junk);
    }
  });
}

function getJunkData() {
  return Composite.allBodies(spaceJunkComposite).map(junk => ({
    x: junk.position.x,
    y: junk.position.y,
    radius: junk.circleRadius,
    angle: junk.angle,
  }));
}

initializeSpaceJunk();
World.add(engine.world, spaceJunkComposite);

module.exports = {
  updateSpaceJunk,
  getJunkData
};