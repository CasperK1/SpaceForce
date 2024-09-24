window.addEventListener("DOMContentLoaded", (event) => {

  // Username input and game initialization
  const usernameInput = document.querySelector("#usernameInput");
  const button = document.querySelector("#name-input-button");

  button.addEventListener("click", (e) => {
    const username = usernameInput.value;
    if (!username) return;
    socket.emit("init-game", {userName: username, width: canvas.width, height: canvas.height});
    usernameInput.value = "";
    document.querySelector(".username-container").style.display = "none";
  });
});

// Shooting 🔫
addEventListener("click", (e) => {
  if (!frontEndPlayers[socket.id]) return; // error handling if player does not exist
  const canvas = document.querySelector("canvas");
  const {x, y} = canvas.getBoundingClientRect();
  const playerPosition = {
    x: frontEndPlayers[socket.id].x,
    y: frontEndPlayers[socket.id].y,
  };

  const angle = Math.atan2(
    (e.clientY - y) - playerPosition.y,
    (e.clientX - x)- playerPosition.x,
  );

  socket.emit("shoot", {x: playerPosition.x, y: playerPosition.y, angle});

});

// Movement ♿

const keys = {
  up: {pressed: false},
  left: {pressed: false},
  down: {pressed: false},
  right: {pressed: false},
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


