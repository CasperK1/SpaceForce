window.addEventListener("DOMContentLoaded", (event) => {
  // Username input and game initialization
  const usernameInput = document.querySelector("#usernameInput");
  const button = document.querySelector("#name-input-button");

  button.addEventListener("click", (e) => {
    const username = usernameInput.value;
    if (!username) return;
    socket.emit("init-game", {
      userName: username,
      width: canvas.width,
      height: canvas.height,
    });
    usernameInput.value = "";
    document.querySelector(".username-container").style.display = "none";
  });
});

// Shooting 🔫
addEventListener("click", (e) => {
  if (!frontEndPlayers[socket.id]) return;
  const player = frontEndPlayers[socket.id];

  // Use the weapon's angle for shooting
  const angle = player.weapon.angle;

  // Calculate the barrel tip position in world coordinates.
  const barrelTipX = player.x + (Math.cos(angle) * player.weapon.width) / 2;
  const barrelTipY = player.y + (Math.sin(angle) * player.weapon.width) / 2;

  socket.emit("shoot", { x: barrelTipX, y: barrelTipY, angle });
});

// Weapon movement
addEventListener("mousemove", (e) => {
  if (!frontEndPlayers[socket.id]) return;

  const { left, top } = canvas.getBoundingClientRect();
  const player = frontEndPlayers[socket.id];

  // Calculate mouse position
  const mouseX = (e.clientX - left) / zoomFactor + camera.x;
  const mouseY = (e.clientY - top) / zoomFactor + camera.y;
  player.updateImage();
  player.weapon.updateAngle(player.x, player.y, mouseX, mouseY);
  socket.emit("weapon-movement", { angle: player.weapon.angle });
});

// Movement ♿

const keys = {
  up: { pressed: false },
  left: { pressed: false },
  down: { pressed: false },
  right: { pressed: false },
};

addEventListener("keydown", (e) => {
  if (!frontEndPlayers[socket.id]) return; // error handling if player does not exist
  const key = e.key.toLowerCase();
  switch (key) {
    case "w":
    case "ArrowUp":
      keys.up.pressed = true;
      break;
    case "a":
    case "ArrowLeft":
      keys.left.pressed = true;
      break;
    case "s":
    case "ArrowDown":
      keys.down.pressed = true;
      break;
    case "d":
    case "ArrowRight":
      keys.right.pressed = true;
      break;
  }
});

addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  switch (key) {
    case "w":
    case "ArrowUp":
      keys.up.pressed = false;
      break;
    case "a":
    case "ArrowLeft":
      keys.left.pressed = false;
      break;
    case "s":
    case "ArrowDown":
      keys.down.pressed = false;
      break;
    case "d":
    case "ArrowRight":
      keys.right.pressed = false;
      break;
  }
});
