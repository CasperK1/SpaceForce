const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  pingInterval: 3000,
  pingTimeout: 5000,
});
const port = 3000;
const backEndPlayers = {};
const backEndProjectiles = {};
let projectileId = 0;
const speed = 15;

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "index.html");
});

io.on("connection", (socket) => {
  console.log(`a user connected ${socket.id}`);
  backEndPlayers[socket.id] = {
    x: 1000 * Math.random(),
    y: 1000 * Math.random(),
    color: `hsl(${360 * Math.random()}, 100%, 50%)`,
    sequenceNumber: 0,
  };
  io.emit("update-players", backEndPlayers); // Sends player data to frontend

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`user disconnected ${socket.id}`);
    delete backEndPlayers[socket.id];
    io.emit("update-players", backEndPlayers); // Removes player from frontend too
  });

  // Canvas size
  socket.on("init-canvas", ({ width, height, pixelRatio }) => {
    backEndPlayers[socket.id].canvas = { width, height };

    backEndPlayers[socket.id].radius = 10;
  });

  // Player movement
  socket.on("player-movement", ({ key, sequenceNumber }) => {
    backEndPlayers[socket.id].sequenceNumber = sequenceNumber;
    switch (key) {
      case "up":
        backEndPlayers[socket.id].y -= speed;
        break;
      case "down":
        backEndPlayers[socket.id].y += speed;
        break;
      case "left":
        backEndPlayers[socket.id].x -= speed;
        break;
      case "right":
        backEndPlayers[socket.id].x += speed;
        break;
    }
  });

  // Shooting
  socket.on("shoot", ({ x, y, angle }) => {
    projectileId++;
    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5,
    };

    backEndProjectiles[projectileId] = {
      x,
      y,
      velocity,
      playerId: socket.id,
    };
  });

  // Chat
  socket.on("chat-message", (message, userName) => {
    io.emit("chat-message", {
      senderId: socket.id,
      message: message,
      userName: userName,
    });
  });
});

setInterval(() => {
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
        if (backEndPlayers[backEndProjectiles[id].playerId])
          backEndPlayers[backEndProjectiles[id].playerId].score++;

        delete backEndProjectiles[id];
        delete backEndPlayers[playerId];
        break;
      }
    }
  }

  io.emit("update-projectiles", backEndProjectiles);
  io.emit("update-players", backEndPlayers);
}, 15);
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
