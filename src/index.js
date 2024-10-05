const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d", { antialias: true });
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
const speed = 4;
const leaderBoard = document.querySelector("#score-list");

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
      // interpolation
      frontEndPlayers[id].target = {
        x: playerData.x,
        y: playerData.y,
      }

      if (id === socket.id) {

        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return playerData.sequenceNumber === input.sequenceNumber;
        });

        if (lastBackendInputIndex > -1) {
          playerInputs.splice(0, lastBackendInputIndex + 1);
        }
        // Apply all the inputs that have not been acknowledged by the server
        playerInputs.forEach((input) => {
          frontEndPlayers[id].target.x += input.dx;
          frontEndPlayers[id].target.y += input.dy;
        });
      } else {
        if (playerData.weapon && playerData.weapon.angle !== undefined) {
          frontEndPlayers[id].weapon.angle = playerData.weapon.angle;
        }

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
  if (!frontEndPlayers[socket.id]) return; // error handling if player does not exist
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    // liner interpolation for smooth movement if lag occurs
    if (frontEndPlayers[id].target) {
      frontEndPlayers[id].x += (frontEndPlayers[id].target.x - frontEndPlayers[id].x) * 0.1;
        frontEndPlayers[id].y += (frontEndPlayers[id].target.y - frontEndPlayers[id].y) * 0.1;
    }
    frontEndPlayers[id].draw();
  }

  for (const id in frontEndProjectiles) {
    frontEndProjectiles[id].draw();
  }
}

animate();
