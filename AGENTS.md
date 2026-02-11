# Rundot 3D Engine - Agent Reference Guide

Quick navigation index for LLMs to discover engine capabilities and patterns.

## Core Architecture

- [GameObject](rundot-3D-engine/docs/core/GameObject.md) - Entity-component system, hierarchy, lifecycle management
- [Component](rundot-3D-engine/docs/core/Component.md) - Base component class, lifecycle hooks (onCreate, update, onCleanup)
- [VenusGame](rundot-3D-engine/docs/core/VenusGame.md) - Game initialization, render loop, configuration, scene management

## Rendering & Assets

- [MeshRenderer](rundot-3D-engine/docs/rendering/MeshRenderer.md) - Load 3D meshes from StowKit (use child GameObject pattern!)
- [InstancedRenderer](rundot-3D-engine/docs/rendering/InstancedRenderer.md) - GPU instancing for many copies of same mesh
- [SkeletalRenderer](rundot-3D-engine/docs/rendering/SkeletalRenderer.md) - Character meshes with bones and animations
- [AssetManager](rundot-3D-engine/docs/rendering/AssetManager.md) - FBX/GLB/OBJ loading, preloading workflows
- [StowKitSystem](rundot-3D-engine/docs/systems/StowKitSystem.md) - Asset loading from .stow packs, mesh/texture/audio access

### Asset Catalog

**IMPORTANT**: When users request specific assets (meshes, textures, audio), always check `public/cdn-assets/main_pack.stowproject` first to see what assets are available in this project. This file contains the complete list of all built assets. If a requested asset is not found in this file, use Three.js primitives (BoxGeometry, SphereGeometry, CylinderGeometry, etc.) instead.

## Physics

- [PhysicsSystem](rundot-3D-engine/docs/physics/PhysicsSystem.md) - Rapier integration, fixed-step simulation
- [RigidBodyComponent](rundot-3D-engine/docs/physics/RigidBodyComponent.md) - Dynamic/kinematic/static bodies, forces, velocity
- [Colliders](rundot-3D-engine/docs/physics/Colliders.md) - Box/sphere/capsule collision, triggers, collision groups

## Animation & Movement

- [AnimationSystem](rundot-3D-engine/docs/systems/AnimationSystem.md) - Animation clips, state machines, blending, culling
- [NavigationSystem](rundot-3D-engine/docs/systems/NavigationSystem.md) - Grid-based pathfinding, NavAgent, dynamic obstacles
- [SplineSystem](rundot-3D-engine/docs/systems/SplineSystem.md) - Curve interpolation, waypoints, smooth paths
- [TweenSystem](rundot-3D-engine/docs/systems/TweenSystem.md) - Property animations, easing functions, callbacks

## Game Systems

- [PrefabSystem](rundot-3D-engine/docs/systems/PrefabSystem.md) - Prefab loading, instantiation, ComponentRegistry
- [AudioSystem](rundot-3D-engine/docs/systems/AudioSystem.md) - 2D/3D audio, music management, volume control
- [InputManager](rundot-3D-engine/docs/systems/InputManager.md) - Keyboard, mouse, touch, mobile controls
- [ParticleSystem](rundot-3D-engine/docs/systems/ParticleSystem.md) - Particle emitters, visual effects
- [UISystem](rundot-3D-engine/docs/systems/UISystem.md) - Loading screens, UI utilities
- [LightingSystem](rundot-3D-engine/docs/systems/LightingSystem.md) - Directional, ambient lights, shadows

## Common Patterns

- [Mesh Loading Pattern](rundot-3D-engine/docs/patterns/MeshLoading.md) - Correct MeshRenderer + GameObject pattern
- [Creating GameObjects](rundot-3D-engine/docs/patterns/CreatingGameObjects.md) - Instantiation best practices, hierarchy, cleanup
- [Component Communication](rundot-3D-engine/docs/patterns/ComponentCommunication.md) - Inter-component messaging, events, shared state

## Quick Reference

### Loading Meshes

```typescript
const renderer = new MeshRenderer("asset_name")
const rendererObject = new GameObject("RendererObject")
rendererObject.addComponent(renderer)
this.gameObject.add(rendererObject)
rendererObject.position.set(0, 2, 0)
```
```

### Creating GameObjects

```typescript
const obj = new GameObject("Name")
obj.position.set(x, y, z)
obj.addComponent(new MyComponent())
obj.dispose() // Clean up when done
```

### Adding Physics

```typescript
obj.addComponent(new RigidBodyComponentThree({
    type: RigidBodyType.DYNAMIC,
    shape: ColliderShape.BOX,
    size: new THREE.Vector3(1, 1, 1)
}))
```

### Playing Audio

```typescript
const sfx = new Audio2D("SFX/sound.ogg")
this.gameObject.addComponent(sfx)
sfx.play()
```

### Animating Properties

```typescript
TweenSystem.tween(this, "alpha", 1.0, 0.5, Easing.easeOutQuad)
```

## Documentation Structure

```
rundot-3D-engine/docs/
├── core/           - GameObject, Component, VenusGame
├── rendering/      - MeshRenderer, InstancedRenderer, SkeletalRenderer, AssetManager
├── physics/        - PhysicsSystem, RigidBodyComponent, Colliders
├── systems/        - All game systems (Animation, Audio, Input, etc.)
└── patterns/       - Common usage patterns and best practices
```

## Key Principles

1. **Component-Based Architecture** - Behaviors are components attached to GameObjects
2. **Lifecycle Management** - onCreate → update → onCleanup
3. **Child GameObject Pattern** - Use child GameObjects for mesh rendering
4. **Preload Assets** - Load all assets during initialization
5. **Dispose Properly** - Always call dispose() on GameObjects when done
6. **Fixed-Step Physics** - Physics runs at fixed rate (120 Hz default)
7. **Cache References** - Get components in onCreate, not in update

## Getting Started

1. Extend `VenusGame` and implement `onStart()`, `preRender()`, `onDispose()`
2. Create `GameObject` instances with descriptive names
3. Add `Component` subclasses for behavior
4. Use `MeshRenderer` with child GameObject for visuals
5. Add `RigidBodyComponent` for physics
6. Preload assets with `AssetManager` or `StowKitSystem`
7. Use `InputManager` for user input
8. Animate with `TweenSystem` or `AnimationSystem`

## Common Workflows

### Character Setup

1. Preload skeletal model: `AssetManager.preloadSkeletalModel("char.fbx")`
2. Create GameObject: `const char = new GameObject("Character")`
3. Add renderer: `char.addComponent(new SkeletalRenderer("char.fbx"))`
4. Add animation: `char.addComponent(new AnimationControllerComponent())`
5. Add physics: `char.addComponent(new RigidBodyComponentThree(...))`

### Pickup Item

1. Create GameObject: `const pickup = new GameObject("Pickup")`
2. Add mesh (child GameObject pattern): See [Mesh Loading Pattern](rundot-3D-engine/docs/patterns/MeshLoading.md)
3. Add trigger: `pickup.addComponent(new RigidBodyComponentThree({ isSensor: true }))`
4. Register callbacks: `trigger.onTriggerEnter((other) => { ... })`

### Enemy AI

1. Create GameObject: `const enemy = new GameObject("Enemy")`
2. Add visual: Use MeshRenderer or SkeletalRenderer
3. Add AI component: `enemy.addComponent(new EnemyAI())`
4. Add navigation: `enemy.addComponent(new NavAgent())`
5. Add physics: `enemy.addComponent(new RigidBodyComponentThree(...))`

## Performance Tips

- Use `InstancedRenderer` for many copies of same mesh
- Enable animation culling: `VenusGame.setAnimationCullingCamera(camera)`
- Set meshes as static if they don't move: `isStatic: true`
- Pool GameObjects instead of creating/destroying
- Preload all assets at startup
- Use collision groups to filter physics interactions

## Troubleshooting

- **Mesh not appearing?** Check if asset is preloaded and name is correct
- **Physics not working?** Ensure PhysicsSystem is initialized (automatic in VenusGame)
- **Animation not playing?** Verify skeletal model is preloaded with `preloadSkeletalModel()`
- **Component not updating?** Implement `update(deltaTime)` method
- **Memory leak?** Call `dispose()` on GameObjects when done

## Version Info

This documentation is for Rundot 3D Engine built on Three.js with Rapier3D physics.

