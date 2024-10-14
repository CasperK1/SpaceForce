const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d", {antialias: true});
const socket = io();

const mapWidth = 1920;
const mapHeight = 1080;
const cameraWidth = 960;
const cameraHeight = 540;
const zoomFactor = 2;
canvas.width = cameraWidth * zoomFactor;
canvas.height = cameraHeight * zoomFactor;

const camera = {
  x: 0,
  y: 0
};

ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

const frontEndPlayers = {};
const frontEndProjectiles = {};
const leaderBoard = document.querySelector("#score-list");
let spaceJunk = [];
const meteorTexture = new Image();
meteorTexture.src = '/assets/images/meteor_small.png';

socket.on("update-players", (playerDataBackend) => {
  for (const id in playerDataBackend) {
    const playerData = playerDataBackend[id];
    const scoreElement = document.querySelector(`div[data-id="${id}"]`);

    // If player does not exist frontend, create a new player
    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({
        userName: playerData.userName,
        color: playerData.color,
        x: playerData.x,
        y: playerData.y,
      });
      // Add new player to the leaderboard
      leaderBoard.innerHTML += `<div data-id="${id}" data-score="${playerData.score}">${playerData.userName}: ${playerData.score}</div>`;
      chatInputArea.style.display = "Flex"; // Chat input to visible
    } else {
      // Update leaderboard
      scoreElement.innerHTML = `${playerData.userName}: ${playerData.score}`;
      scoreElement.setAttribute("data-score", playerData.score);

      if (id === socket.id) {
        // Calculate velocity
        frontEndPlayers[id].velocity = {
          x: playerData.x - frontEndPlayers[id].x,
          y: playerData.y - frontEndPlayers[id].y
        };
        frontEndPlayers[id].x = playerData.x;
        frontEndPlayers[id].y = playerData.y;
      } else {
        if (playerData.weapon && playerData.weapon.angle !== undefined) {
          frontEndPlayers[id].weapon.angle = playerData.weapon.angle;
        }
        // Calculate velocity for other players
        frontEndPlayers[id].velocity = {
          x: playerData.x - frontEndPlayers[id].x,
          y: playerData.y - frontEndPlayers[id].y
        };
        gsap.to(frontEndPlayers[id], {
          x: playerData.x,
          y: playerData.y,
          duration: 0.015,
          ease: "power2.out",
          overwrite: "auto"
        });
      }
    }
  }
  // If ID does not exist in backend, remove player from frontend
  for (const id in frontEndPlayers) {
    if (!playerDataBackend[id]) {
      const divDel = document.querySelector(`div[data-id="${id}"]`);
      divDel.remove();
      delete frontEndPlayers[id];
    }
  }
  // Sort the leaderboard
  const scoreElements = Array.from(leaderBoard.children);
  scoreElements.sort((a, b) => {
    const scoreA = parseInt(a.getAttribute("data-score"));
    const scoreB = parseInt(b.getAttribute("data-score"));
    return scoreB - scoreA; // Sort in descending order
  });

  // Clear the leaderboard and append sorted elements
  leaderBoard.innerHTML = "";
  scoreElements.forEach((element) => leaderBoard.appendChild(element));
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
        angle: projectileData.angle,


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

// Update local junk data
socket.on('update-junk', (junkData) => {
  spaceJunk = junkData;
});

//setInterval: same tick rate as server
setInterval(() => {
  if (!frontEndPlayers[socket.id]) return; // error handling if player does not exist
  const player = frontEndPlayers[socket.id];
  if (keys.up.pressed) {
    socket.emit("player-movement", {key: "up"});
  }
  if (keys.left.pressed) {
    socket.emit("player-movement", {key: "left"});
  }
  if (keys.down.pressed) {
    socket.emit("player-movement", {key: "down"});
  }
  if (keys.right.pressed) {
    socket.emit("player-movement", {key: "right"});
  }
  if (!keys.up.pressed && !keys.left.pressed && !keys.down.pressed && !keys.right.pressed) {
    socket.emit("player-movement", {key: "none"});
  }

}, 15);

let animationId;

function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // matter.js
  ctx.save();
  spaceJunk.forEach(junk => {
    const screenX = (junk.x - camera.x) * zoomFactor;
    const screenY = (junk.y - camera.y) * zoomFactor;
    const size = junk.radius * 2 * zoomFactor;

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(junk.angle || 0);
    ctx.drawImage(meteorTexture, -size / 2, -size / 2, size, size);
    ctx.restore();
  });

  // Update camera position to follow the player
  if (frontEndPlayers[socket.id]) {
    camera.x = frontEndPlayers[socket.id].x - cameraWidth / 2;
    camera.y = frontEndPlayers[socket.id].y - cameraHeight / 2;

    // Clamp camera to world bounds
    camera.x = Math.max(0, Math.min(camera.x, mapWidth - cameraWidth));
    camera.y = Math.max(0, Math.min(camera.y, mapHeight - cameraHeight));
  }

  // Update the CSS background position
  canvas.style.backgroundPosition = `${-camera.x * zoomFactor}px ${-camera.y * zoomFactor}px`;
  canvas.style.backgroundSize = `${mapWidth * zoomFactor}px ${mapHeight * zoomFactor}px`;

  // Draw game objects
  for (const id in frontEndPlayers) {
    frontEndPlayers[id].draw()
  }
  for (const id in frontEndProjectiles) {
    frontEndProjectiles[id].draw();
  }
}

animate();
