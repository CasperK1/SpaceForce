const express = require('express');
const http = require('http');
const {Server} = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  pingInterval: 3000,
  pingTimeout: 5000
});
const port = 3000;
const backEndPlayers = {};
const speed = 10;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log(`a user connected ${socket.id}`);
  backEndPlayers[socket.id] = {
    x: 1000 * Math.random(),
    y: 1000 * Math.random(),
    color: `hsl(${360 * Math.random()}, 100%, 50%)`,
    sequenceNumber: 0
  };
  io.emit('update-players', backEndPlayers); // Sends player data to frontend

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`user disconnected ${socket.id}`);
    delete backEndPlayers[socket.id];
    io.emit('update-players', backEndPlayers); // Removes player from frontend too
  });

  // Player movement
  socket.on('player-movement', ({key, sequenceNumber}) => {
    backEndPlayers[socket.id].sequenceNumber = sequenceNumber;
    switch (key) {
      case 'up':
        backEndPlayers[socket.id].y -= speed
        break;
      case 'down':
        backEndPlayers[socket.id].y += speed
        break;
      case 'left':
        backEndPlayers[socket.id].x -= speed
        break;
      case 'right':
        backEndPlayers[socket.id].x += speed;
        break;
    }
  });
});

setInterval(() => {
  io.emit('update-players', backEndPlayers);
}, 15);
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
