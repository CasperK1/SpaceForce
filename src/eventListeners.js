addEventListener("click", (e) => {
  const playerPosition = {
    x: frontEndPlayers[socket.id].x,
    y: frontEndPlayers[socket.id].y,
  };

  const angle = Math.atan2(
    e.clientY - playerPosition.y,
    e.clientX - playerPosition.x,
  );

  socket.emit("shoot", { x: playerPosition.x, y: playerPosition.y, angle });
});

window.addEventListener("DOMContentLoaded", (event) => {
  const canvas = document.querySelector("canvas");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resizeCanvas);

  // Initial resize to set canvas size
  resizeCanvas();
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
