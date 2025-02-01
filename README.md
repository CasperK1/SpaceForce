# Space Force 🚀
A real-time multiplayer space shooter built with Node.js, Socket.IO, and Matter.js. 

![spaceforce](https://github.com/user-attachments/assets/ab6664b4-3f42-45f3-b797-34838f56db99)
---


Deployed here: https://space-force-77a77f0ea368.herokuapp.com/ (give some time for Heroku wake up)

My aim is still to further develop this. Some of the features would include: saving player data in a database, polish the UI, add game lobbies, in-game shop for upgrades, more visual effects and better collision detection with space junk.

## Features 🛠️
* Real-time multiplayer gameplay
* Physics-based space debris using Matter.js
* In-game chat system
* Live leaderboard
* Smooth camera follow system

## Game Controls 🎮

- **W A S D**: Activate jetpack
- **Mouse**: Aim weapon
- **Click**: Shoot
- **Chat**: Enter message in chat box


## Game Architecture 🎮
### Server-Side:

- Handles physics calculations
- Manages player states and positions
- Processes collisions and scoring
- Broadcasts game state to all clients

### Client-Side

- Renders game state
- Handles user input
- Manages visual effects and animations
- Interpolates movement for smooth gameplay

## Setup & Installation 🔧

1. Install dependencies
```bash
npm install
```

2. Start the server
```bash
npm start
```
3. Open `http://localhost:3000` in your browser
