const io = require('socket.io')(3000, {
    cors: {
        origin: "http://localhost:8082",
        methods: ["GET", "POST"]
    }
});

