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
  const { x, y } = canvas.getBoundingClientRect();
  const weapon = frontEndPlayers[socket.id].weapon;

  // Calculate the position of the weapon's tip
  const weaponTipX = weapon.x + Math.cos(weapon.angle) * weapon.width;
  const weaponTipY =
    weapon.y + weapon.rotationPointY + Math.sin(weapon.angle) * weapon.width;

  const angle = Math.atan2(
    e.clientY - y - weaponTipY,
    e.clientX - x - weaponTipX,
  );

  socket.emit("shoot", { x: weaponTipX, y: weaponTipY, angle });
});

// Weapon movement
addEventListener("mousemove", (e) => {
  if (!frontEndPlayers[socket.id]) return;

  const { left, top } = canvas.getBoundingClientRect();
  const mouseX = e.clientX - left;
  const mouseY = e.clientY - top;

  // Update the weapon angle for the local player
  frontEndPlayers[socket.id].weapon.updateAngle(mouseX, mouseY);

  // Send the updated angle to the server
  socket.emit("weapon-movement", {
    angle: frontEndPlayers[socket.id].weapon.angle,
  });
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
  switch (e.key) {
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
  switch (e.key) {
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
