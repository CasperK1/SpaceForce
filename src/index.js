const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d", { antialias: true });
const pixelRatio = window.devicePixelRatio || 1;
const scoreEl = document.querySelector("#scoreEl");
const socket = io();

canvas.width = window.innerWidth * pixelRatio;
canvas.height = window.innerHeight * pixelRatio;
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

const frontEndPlayers = {};
const frontEndProjectiles = {};
const speed = 15;
socket.on("connect", () => {
  socket.emit("init-canvas", { width: canvas.width, height: canvas.height });
});
socket.on("update-players", (playerDataBackend) => {
  for (const id in playerDataBackend) {
    const playerData = playerDataBackend[id];

    // If player does not exist frontend, create a new player
    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({
        color: playerData.color,
        x: playerData.x,
        y: playerData.y,
        radius: 20,
      });
    } else {
      if (id === socket.id) {
        // Update player position from backend data
        frontEndPlayers[id].x = playerData.x;
        frontEndPlayers[id].y = playerData.y;

        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return playerData.sequenceNumber === input.sequenceNumber;
        });

        if (lastBackendInputIndex > -1) {
          playerInputs.splice(0, lastBackendInputIndex + 1);
        }
        playerInputs.forEach((input) => {
          frontEndPlayers[id].x += input.dx;
          frontEndPlayers[id].y += input.dy;
        });
      } else {
        frontEndPlayers[id].x = playerData.x;
        frontEndPlayers[id].y = playerData.y;
        gsap.to(frontEndPlayers[id], {
          x: playerData.x,
          y: playerData.y,
          duration: 0.015,
          ease: "linear",
        });
      }
    }
  }
  // If ID does not exist in backend, remove player from frontend
  for (const id in frontEndPlayers) {
    if (!playerDataBackend[id]) {
      delete frontEndPlayers[id];
    }
  }
});
socket.on("update-projectiles", (projectileDataBackend) => {
  for (const id in projectileDataBackend) {
    const projectileData = projectileDataBackend[id];
    if (!frontEndProjectiles[id]) {
      frontEndProjectiles[id] = new Projectile({
        x: projectileData.x,
        y: projectileData.y,
        radius: 5,
        color: frontEndPlayers[projectileData.playerId]?.color,
        velocity: projectileData.velocity,
      });
    } else {
      frontEndProjectiles[id].x = projectileData.x;
      frontEndProjectiles[id].y = projectileData.y;
    }
  }
  // Remove projectiles that no longer exist on the server
  for (const id in frontEndProjectiles) {
    if (!projectileDataBackend[id]) {
      delete frontEndProjectiles[id];
    }
  }
});

// Sequence number for lag compensation:
// allows the server to reconstruct order of player inputs if they arrive delayed or out of order due to network issues
const playerInputs = [];
let sequenceNumber = 0;

//setInterval: same tick rate as server
setInterval(() => {
  if (keys.up.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: -speed });
    frontEndPlayers[socket.id].y -= speed;
    socket.emit("player-movement", { key: "up", sequenceNumber });
  }
  if (keys.left.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: -speed, dy: 0 });
    frontEndPlayers[socket.id].x -= speed;
    socket.emit("player-movement", { key: "left", sequenceNumber });
  }
  if (keys.down.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: speed });
    frontEndPlayers[socket.id].y += speed;
    socket.emit("player-movement", { key: "down", sequenceNumber });
  }
  if (keys.right.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: speed, dy: 0 });
    frontEndPlayers[socket.id].x += speed;
    socket.emit("player-movement", { key: "right", sequenceNumber });
  }
}, 15);

let animationId;

function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const id in frontEndPlayers) {
    frontEndPlayers[id].draw();
  }
  for (const id in frontEndProjectiles) {
    frontEndProjectiles[id].draw();
  }
}

animate();
