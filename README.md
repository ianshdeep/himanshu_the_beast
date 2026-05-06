# FPS Web Game

A first-person shooter web game built with Three.js and Vite.

## Controls

- **WASD** - Move
- **Mouse** - Look around
- **Left Click** - Shoot
- **ESC** - Pause/Release mouse

## How to Run

```bash
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## Game Features

- First-person camera with mouse look
- WASD movement with collision detection
- Shooting mechanics with ammo
- Enemy AI that chases the player
- Health and score system
- 3D level with walls and obstacles

## Project Structure

```
├── index.html          # Main HTML with UI overlay
├── package.json        # Dependencies (three.js, vite)
├── vite.config.js      # Vite configuration
└── src/
    ├── main.js         # Game loop and initialization
    ├── player.js      # Player movement and camera
    ├── level.js       # Level/wall generation
    ├── weapon.js      # Gun and bullets
    ├── enemy.js       # Enemy spawning
    └── collision.js  # Collision detection
```