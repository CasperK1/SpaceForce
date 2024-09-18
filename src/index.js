const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d', {antialias: true});
const pixelRatio = window.devicePixelRatio || 1
const scoreEl = document.querySelector('#scoreEl')
const socket = io();

canvas.width = window.innerWidth * pixelRatio;
canvas.height = window.innerHeight * pixelRatio;
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';

const frontEndPlayers = {}
const speed = 10

socket.on('update-players', (playerDataBackend) => {
  for (const id in playerDataBackend) {
    const playerData = playerDataBackend[id]

    // If player does not exist frontend, create a new player
    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({
        color: playerData.color,
        x: playerData.x,
        y: playerData.y,
        radius: 20
      })
    } else {
      // Update player position from backend data
      frontEndPlayers[id].x = playerData.x
      frontEndPlayers[id].y = playerData.y
      const lastBackendInputIndex = playerInputs.forEach((input) => {
        return backEndPlayers.sequenceNumber === input.sequenceNumber
      })
      if (lastBackendInputIndex > -1) {
        playerInputs.splice(0, lastBackendInputIndex + 1)
      }
    }
  }
  // If ID does not exist in backend, remove player from frontend
  for (const id in frontEndPlayers) {
    if (!playerDataBackend[id]) {
      delete frontEndPlayers[id]
    }
  }
})

let animationId

function animate() {
  animationId = requestAnimationFrame(animate)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const id in frontEndPlayers) {
    frontEndPlayers[id].draw()
  }
}

animate()
const keys = {
  up: {pressed: false},
  left: {pressed: false},
  down: {pressed: false},
  right: {pressed: false}
}

// Sequence number for lag compensation:
// allows the server to reconstruct order of player inputs if they arrive delayed or out of order due to network issues
const playerInputs = []
let sequenceNumber = 0

setInterval(() => {
  if (keys.up.pressed) {
    sequenceNumber++
    playerInputs.push({sequenceNumber, dx: 0, dy: -speed})
    frontEndPlayers[socket.id].y -= speed
    socket.emit('player-movement', {key: 'up', sequenceNumber})
  }
  if (keys.left.pressed) {
    sequenceNumber++
    playerInputs.push({sequenceNumber, dx: -speed, dy: 0})
    frontEndPlayers[socket.id].x -= speed
    socket.emit('player-movement', {key: 'left', sequenceNumber})
  }
  if (keys.down.pressed) {
    sequenceNumber++
    playerInputs.push({sequenceNumber, dx: 0, dy: speed})
    frontEndPlayers[socket.id].y += speed
    socket.emit('player-movement', {key: 'down', sequenceNumber})
  }
  if (keys.right.pressed) {
    sequenceNumber++
    playerInputs.push({sequenceNumber, dx: speed, dy: 0})
    frontEndPlayers[socket.id].x += speed
    socket.emit('player-movement', {key: 'right', sequenceNumber})
  }
}, 15)

window.addEventListener('keydown', (e) => {
  if (!frontEndPlayers[socket.id]) return // error handling if player does not exist
  switch (e.key) {
    case 'w':
    case 'ArrowUp':
      keys.up.pressed = true
      break
    case 'a':
    case 'ArrowLeft':
      keys.left.pressed = true
      break
    case 's':
    case 'ArrowDown':
      keys.down.pressed = true
      break
    case 'd':
    case 'ArrowRight':
      keys.right.pressed = true
      break
  }
})

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'w':
    case 'ArrowUp':
      keys.up.pressed = false
      break
    case 'a':
    case 'ArrowLeft':
      keys.left.pressed = false
      break
    case 's':
    case 'ArrowDown':
      keys.down.pressed = false
      break
    case 'd':
    case 'ArrowRight':
      keys.right.pressed = false
      break
  }
});