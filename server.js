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
const { updateSpaceJunk, getJunkData, createSpaceJunk, spaceJunkComposite } = require('./matterJS');
const Matter = require('matter-js');
const { Body, Composite } = Matter;

const backEndPlayers = {};
const backEndProjectiles = {};
let projectileId = 0;
const accelerationRate = 0.09;
const friction = 0.97;


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
      jetpack: {jetpackOn: false},
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
        backEndPlayers[socket.id].jetpack.jetpackOn = true;
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
        backEndPlayers[socket.id].jetpack.jetpackOn = false;

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
  updateSpaceJunk();

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
  // After the existing projectile update loop
const junkData = getJunkData();
for (const id in backEndProjectiles) {
  const projectile = backEndProjectiles[id];

  for (let i = 0; i < junkData.length; i++) {
    const junk = junkData[i];
    const dx = projectile.x - junk.x;
    const dy = projectile.y - junk.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < junk.radius + 5) { // 5 is projectile radius
      // Collision detected
      delete backEndProjectiles[id];

      // Get the actual junk body
      const junkBody = Composite.allBodies(spaceJunkComposite)[i];

      if (junk.radius > 8) {
        // Reduce size of hit junk
        const newRadius = junk.radius * 0.5;
        Body.scale(junkBody, 0.5, 0.5);

        // Create a new smaller piece
        const newJunkPosition = {
          x: junk.x + (Math.random() - 0.5) * 20,
          y: junk.y + (Math.random() - 0.5) * 20
        };
        const newJunk = createSpaceJunk(newJunkPosition.x, newJunkPosition.y, newRadius);
        Composite.add(spaceJunkComposite, newJunk);

      } else {
        // Remove very small junk
        Composite.remove(spaceJunkComposite, junkBody);
      }

      break;
    }
  }
}

  io.emit('update-junk', getJunkData());
  io.emit("update-projectiles", backEndProjectiles);
  io.emit("update-players", backEndPlayers);
}, 15);
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
