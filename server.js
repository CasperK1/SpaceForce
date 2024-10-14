const express = require("express");
const http = require("http");
const {Server} = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  pingInterval: 3000,
  pingTimeout: 5000,
});
const port = process.env.PORT || 3000;
const Matter = require('matter-js');
const Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  Composite = Matter.Composite;
const engine = Engine.create({
  enableSleeping: false,
  gravity: {x: 0, y: 0},
});

const backEndPlayers = {};
const backEndProjectiles = {};
let projectileId = 0;
const accelerationRate = 0.09;
const friction = 0.97;

// Space Junk with matter.js
const spaceJunkComposite = Composite.create({label: 'Space Junk'});
for (let i = 0; i < 50; i++) {
  const x = Math.random() * 1920;
  const y = Math.random() * 1080;
  const radius = Math.random() * 20 + 5;

  const junk = Bodies.circle(x, y, radius, {
    friction: 0.03,
    frictionAir: 0,
    restitution: 0.05,
    inverseInertia: 0,
  });
  Body.setMass(junk, radius * 0.1);
  Body.setAngularVelocity(junk, 0.001 + Math.random() * 0.03);
  Body.setVelocity(junk, {x: 0.001 + Math.random() * (0.1 - 0.01), y: 0.001 + Math.random() * (0.1 - 0.01)});
  Composite.add(spaceJunkComposite, junk);
}

World.add(engine.world, spaceJunkComposite);

app.use(express.static(__dirname + "/src"));

// Serve index.html when user visits root
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/src/index.html");
});

io.on("connection", (socket) => {
  console.log(`a user connected ${socket.id}`);

  // Game initialization
  socket.on("init-game", ({width, height, userName}) => {
    backEndPlayers[socket.id] = {
      x: 1900 * Math.random(),
      y: 1000 * Math.random(),
      color: `hsl(${360 * Math.random()}, 100%, 50%)`,
      score: 0,
      userName,
      weapon: {x: 0, y: 0, angle: 0},
      acceleration: {x: 0, y: 0},
      velocity: {x: 0, y: 0},
    };
    backEndPlayers[socket.id].canvas = {width, height};
    backEndPlayers[socket.id].radius = 10;
    backEndPlayers[socket.id].userName = userName;

    io.emit("bot-message", {
      message: `${backEndPlayers[socket.id].userName} joined!`,
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`user disconnected ${socket.id}`);
    delete backEndPlayers[socket.id];
    io.emit("update-players", backEndPlayers); // Removes player from frontend too
  });

  // Player movement
  socket.on("player-movement", ({key}) => {
    if (!backEndPlayers[socket.id]) return; // error handling if player does not exist
    const backendPlayer = backEndPlayers[socket.id];
    switch (key) {
      case "up":
        backEndPlayers[socket.id].acceleration.y = -accelerationRate;
        break;
      case "down":
        backEndPlayers[socket.id].acceleration.y = accelerationRate;
        break;
      case "left":
        backEndPlayers[socket.id].acceleration.x = -accelerationRate;
        backEndPlayers[socket.id].y += 0.2;
        break;
      case "right":
        backEndPlayers[socket.id].acceleration.x = accelerationRate;
        backEndPlayers[socket.id].y += 0.2;
        break;
      default:
        backEndPlayers[socket.id].acceleration.x = 0;
        backEndPlayers[socket.id].acceleration.y = 0;
        backEndPlayers[socket.id].y += 0.2;
        break;
    }

    const playerSides = {
      left: backendPlayer.x - backendPlayer.radius,
      right: backendPlayer.x + backendPlayer.radius,
      top: backendPlayer.y - backendPlayer.radius,
      bottom: backendPlayer.y + backendPlayer.radius,
    };

    // Boundary check
    if (playerSides.left < 0) {
      backEndPlayers[socket.id].x = backendPlayer.radius + 10;
    }
    if (playerSides.right > backendPlayer.canvas.width) {
      backEndPlayers[socket.id].x =
        backendPlayer.canvas.width - backendPlayer.radius - 10;
    }
    if (playerSides.top < 0) {
      backEndPlayers[socket.id].y = backendPlayer.radius + 10;
    }
    if (playerSides.bottom > backendPlayer.canvas.height) {
      backEndPlayers[socket.id].y =
        backendPlayer.canvas.height - backendPlayer.radius - 10;
    }
  });

  // Weapon movement
  socket.on("weapon-movement", ({angle}) => {
    if (!backEndPlayers[socket.id]) return; // error handling if player does not exist
    backEndPlayers[socket.id].weapon = {angle};
  });

  // Shooting
  socket.on("shoot", ({x, y, angle}) => {
    projectileId++;
    const velocity = {
      x: Math.cos(angle) * 6,
      y: Math.sin(angle) * 6,
    };

    backEndProjectiles[projectileId] = {
      x,
      y,
      velocity,
      playerId: socket.id,
      angle,
    };
  });

  // Chat
  socket.on("chat-message", (message) => {
    if (!backEndPlayers[socket.id] || !backEndPlayers[socket.id].userName) {
      console.log("no user name");
      return;
    }
    io.emit("chat-message", {
      senderId: socket.id,
      message: message,
      userName: backEndPlayers[socket.id].userName,
    });
  });
  socket.on("bot-message", (message) => {
    console.log(message);
    io.emit("bot-message", {
      message: message,
    });
  });
});

setInterval(() => {
  //Matter.js
  Engine.update(engine, 15);

  // Update projectile positions
  for (const id in backEndProjectiles) {
    backEndProjectiles[id].x += backEndProjectiles[id].velocity.x;
    backEndProjectiles[id].y += backEndProjectiles[id].velocity.y;

    // Check boundaries and remove if necessary
    const PROJECTILE_RADIUS = 5;
    const player = backEndPlayers[backEndProjectiles[id].playerId];
    if (
      player &&
      player.canvas &&
      (backEndProjectiles[id].x - PROJECTILE_RADIUS >= player.canvas.width ||
        backEndProjectiles[id].x + PROJECTILE_RADIUS <= 0 ||
        backEndProjectiles[id].y - PROJECTILE_RADIUS >= player.canvas.height ||
        backEndProjectiles[id].y + PROJECTILE_RADIUS <= 0)
    ) {
      delete backEndProjectiles[id];
      continue;
    }
    for (const playerId in backEndPlayers) {
      const backEndPlayer = backEndPlayers[playerId];

      const DISTANCE = Math.hypot(
        backEndProjectiles[id].x - backEndPlayer.x,
        backEndProjectiles[id].y - backEndPlayer.y,
      );

      // collision detection
      if (
        DISTANCE < PROJECTILE_RADIUS + backEndPlayer.radius &&
        backEndProjectiles[id].playerId !== playerId
      ) {
        backEndPlayers[backEndProjectiles[id].playerId].score++;
        delete backEndProjectiles[id];
        delete backEndPlayers[playerId];
        break;
      }
    }
  }
  // update movement constantly for friction to work
  for (const playerId in backEndPlayers) {
    const backEndPlayer = backEndPlayers[playerId];
    backEndPlayer.velocity.y += backEndPlayer.acceleration.y;
    backEndPlayer.velocity.x += backEndPlayer.acceleration.x;
    backEndPlayer.velocity.x *= friction;
    backEndPlayer.velocity.y *= friction;
    backEndPlayer.x += backEndPlayer.velocity.x
    backEndPlayer.y += backEndPlayer.velocity.y
    backEndPlayer.y += 0.2;
  }

  const junkData = Composite.allBodies(spaceJunkComposite).map(junk => ({
    x: junk.position.x,
    y: junk.position.y,
    radius: junk.circleRadius,
    angle: junk.angle,
  }));


  io.emit('update-junk', junkData);
  io.emit("update-projectiles", backEndProjectiles);
  io.emit("update-players", backEndPlayers);
}, 15);
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
