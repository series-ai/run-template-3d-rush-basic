# 3D Template

A minimal, reusable template for creating 3D games and simulations. Built with the [Rundot 3D Engine](https://github.com/series-ai/Run.3DEngine) and Three.js.

## ✨ Features

- **Static Camera**: Overhead camera looking at the world origin
- **Physics**: Rapier physics integration with proper collision handling
- **Mobile Optimized**: Touch controls and responsive design
- **Clean Architecture**: Component-based system for easy extension
- **Example System**: Pickup system demonstrating prefab spawning, click/tap handling, and UI integration
- **Multi-Platform**: Works on desktop (click) and mobile (tap)

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Build engine before running at least once
npm run build:engine

# Start development server
npm run dev
```

The template will open in your browser at `http://localhost:3033`

### Build for Production

```bash
# Build the engine first
npm run build:engine

# Then build the template
npm run build
```

The built files will be in the `dist/` folder.

## 📁 Project Structure

```
3D-Template/
├── Game/
│   └── src/
│       ├── camera/             # Camera controller
│       │   ├── CameraController.ts
│       │   └── index.ts
│       ├── pickups-example/    # Example pickup system
│       │   ├── Pickup.ts       # Pickup component (click/tap to collect)
│       │   ├── PickupSpawner.ts
│       │   ├── PickupSystem.ts
│       │   ├── PickupTextUI.ts
│       │   └── index.ts
│       ├── styles/             # CSS
│       │   └── main.css
│       ├── GenericTemplateGame.ts  # Main game setup
│       ├── Instantiation.ts    # Prefab loader
│       └── main.ts             # Entry point
├── public/                     # Static assets
│   ├── cdn-assets/             # Asset packs
│   ├── basis/                  # Basis texture decoder
│   ├── stowkit/                # Draco mesh decoder
│   └── stowkit_reader.wasm
├── rundot-3D-engine/           # Rundot 3D Engine (https://github.com/series-ai/Run.3DEngine)
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🎮 Interaction

### Desktop
- **Mouse Click**: Interact with pickups
- **Mouse Scroll**: Zoom in/out (when camera controls enabled)

### Mobile/Touch
- **Tap**: Interact with pickups
- **Pinch**: Zoom in/out (when camera controls enabled)

## 🔧 Customization

### Modifying Camera Settings

In `Game/src/camera/CameraController.ts`, you can adjust:

```typescript
private radius: number = 40 // Distance from origin
private alpha: number = (230 * Math.PI) / 180 // Horizontal angle
private beta: number = (35 * Math.PI) / 180 // Vertical angle
```

Or enable interactive camera controls in `Game/src/GenericTemplateGame.ts`:

```typescript
private setupCamera(): void {
  // ...
  this.simCamera.setControlsEnabled(true) // Enable mouse drag to rotate
}
```

### Adjusting Physics

Physics settings can be modified in the Rundot 3D Engine's physics system. The template uses Rapier physics with default gravity and collision settings.

### Adding 3D Objects

In `GenericTemplateGame.ts`, extend the `createGround()` method or add new methods:

```typescript
private createGround(): void {
  // Existing ground plane
  // ...
  
  // Add your 3D objects here
  this.createCustomObjects()
}

private createCustomObjects(): void {
  // Add your meshes, lights, or other objects
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 })
  const cube = new THREE.Mesh(geometry, material)
  cube.position.set(0, 0.5, 0)
  this.scene.add(cube)
}
```

### Using the Pickup Example System

The `pickups-example` folder contains a complete example system demonstrating key game development patterns:

**What it demonstrates:**
- Creating a static system class (`PickupSystem`)
- Spawning prefabs from StowKit packages
- Handling click/tap interactions with raycasting
- Creating platform-specific UI elements
- Managing game object lifecycle

**To use it:**

The pickup system is already integrated in `GenericTemplateGame.ts`. You can modify spawn settings in `PickupSpawner.ts`:

```typescript
const spawner = new PickupSpawner({
  spawnInterval: 1,    // Seconds between spawns
  spawnRadius: 3.67    // Spawn distance from origin
})
```

Or customize the UI in `PickupTextUI.ts` to change how instructions are displayed.

**Learn from it:**
Study this example to understand how to build your own game systems with prefab spawning, interaction handling, and UI integration.

## 🏗️ Architecture

### Component System

The template uses an Entity-Component-System (ECS) architecture:

- **GameObject**: Container for components
- **Component**: Reusable behavior (CameraController, Pickup, etc.)
- **System**: Manages groups of components (PhysicsSystem, etc.)

### Key Components

1. **CameraController**: Static camera looking at world origin
2. **Pickup**: Click/tap-to-collect object with visual effects
3. **PickupSpawner**: Spawns pickups in a radius around origin
4. **PickupSystem**: Manages active pickups and UI

## 📦 Dependencies

### Core
- `three` (^0.180.0) - 3D graphics library
- `@series-ai/rundot-3d-engine` - [Rundot 3D Engine](https://github.com/series-ai/Run.3DEngine) (local)
- `@dimforge/rapier3d` - Physics engine

### Assets
- Assets stored in `.stow` format
- StowKit for efficient asset loading and mesh compression

## 🐛 Troubleshooting

### Assets not loading
- Check console for asset loading errors
- Ensure `Core.stow` is in `public/cdn-assets/`
- Verify StowKit WASM files are in `public/`

### Physics not working
- Ensure Rapier WASM is loading (check console)
- Verify physics system is initialized in `GenericTemplateGame.ts`

### Camera not positioned correctly
- Check camera settings in `CameraController.ts`
- Verify camera is initialized in `setupCamera()`

## 📝 License

This template is derived from the BurgerTime project. Check with the original project for licensing information.

## 🤝 Contributing

This is a template project. Feel free to fork and customize for your needs!

## Publishing to RUN.game

Install the RUN.game CLI (docs): <https://series-1.gitbook.io/venus-docs/venus-docs/venus-cli>

### First Time Setup

```bash
rundot login
rundot init --name "<name>" --description "<description>" --build-path dist --override
```

### Deploy a New Version

```bash
npm run build
rundot deploy
```

## 🔗 Related

- [Rundot 3D Engine](https://github.com/series-ai/Run.3DEngine) - The game engine powering this template
- [Three.js](https://threejs.org/) - 3D graphics library
- [Rapier Physics](https://rapier.rs/) - Physics engine

---

**Happy Coding! 🎮✨**
