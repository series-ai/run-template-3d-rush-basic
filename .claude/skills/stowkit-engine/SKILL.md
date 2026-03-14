# Rundot 3D Engine

The Rundot 3D Engine (`@series-inc/rundot-3d-engine`) is a Three.js-based game engine with ECS architecture, Rapier physics, and StowKit asset integration.

## Quick Start

```typescript
import { VenusGame, GameObject, Component } from "@series-inc/rundot-3d-engine"
import { MeshRenderer, RigidBodyComponentThree, RigidBodyType, ColliderShape } from "@series-inc/rundot-3d-engine/systems"

class MyGame extends VenusGame {
    protected async onStart(): Promise<void> {
        // Load assets
        const stowkit = StowKitSystem.getInstance()
        const buildJson = (await import("../prefabs/build.json")).default
        await stowkit.loadFromBuildJson(buildJson, {
            fetchBlob: (path) => fetch(path).then(r => r.blob()),
        })

        // Create a player
        const player = new GameObject("Player")
        player.position.set(0, 1, 0)

        // Add mesh
        const meshObj = new GameObject("PlayerMesh")
        meshObj.addComponent(new MeshRenderer("player_mesh"))
        player.add(meshObj)

        // Add physics
        player.addComponent(new RigidBodyComponentThree({
            type: RigidBodyType.DYNAMIC,
            shape: ColliderShape.CAPSULE,
            radius: 0.5,
            height: 2,
            lockRotationX: true,
            lockRotationY: true,
            lockRotationZ: true,
        }))

        // Add lighting
        const light = new THREE.DirectionalLight(0xffffff, 1)
        light.position.set(5, 10, 5)
        this.scene.add(light)
    }

    protected preRender(deltaTime: number): void {
        // Per-frame logic
    }

    protected async onDispose(): Promise<void> {
        // Cleanup
    }
}

MyGame.create()
```

## Core Architecture

### VenusGame — Game Base Class

Manages renderer, scene, camera, and all engine systems.

```typescript
class MyGame extends VenusGame {
    protected getConfig(): VenusGameConfig {
        return {
            backgroundColor: 0x87CEEB,
            antialias: true,
            shadowMapEnabled: true,
            shadowMapType: "vsm",        // or "pcf_soft"
            toneMapping: "aces",          // "aces" | "linear" | "none"
            toneMappingExposure: 1.0,
            audioEnabled: true,
            cameraType: "perspective",    // or "orthographic"
            orthoSize: 10,               // half-height for ortho camera
        }
    }

    protected async onStart(): Promise<void> { /* init game */ }
    protected preRender(deltaTime: number): void { /* per-frame logic */ }
    protected async onDispose(): Promise<void> { /* cleanup */ }
}
```

**Static access** (after initialization):
- `VenusGame.scene` — Three.js scene
- `VenusGame.camera` — active camera
- `VenusGame.renderer` — WebGL renderer
- `VenusGame.instance` — game instance

**Lifecycle order:** Physics → Tweens → Components → `preRender()` → `render()`

**IMPORTANT:** Use the `deltaTime` parameter in `preRender()`. Never call `this.clock.getDelta()`.

### GameObject — Entity Class

Extends `THREE.Object3D`. Auto-added to scene on creation.

```typescript
const obj = new GameObject("MyObject")
obj.position.set(0, 1, 0)
obj.addComponent(new MyComponent())

// Hierarchy
const child = new GameObject("Child")
obj.add(child)

// Component access
const comp = obj.getComponent(MyComponent)
obj.hasComponent(MyComponent)
obj.removeComponent(MyComponent)

// Enable/disable
obj.setEnabled(false)  // triggers onDisabled() on all components
obj.setEnabled(true)   // triggers onEnabled()

// Cleanup
obj.dispose()  // disposes all components and children
```

### Component — Behavior Base Class

```typescript
class MyComponent extends Component {
    protected onCreate(): void {
        // Called when added to GameObject — init here
    }

    public update(deltaTime: number): void {
        // Called every frame
        this.gameObject.position.x += deltaTime
    }

    public lateUpdate(deltaTime: number): void {
        // Called after all update() calls — camera follow, UI updates
    }

    public onEnabled(): void { /* GameObject enabled */ }
    public onDisabled(): void { /* GameObject disabled */ }

    protected onCleanup(): void {
        // Called on removal or dispose — cleanup listeners, resources
    }
}
```

**Access from Component:**
- `this.gameObject` — the attached GameObject
- `this.scene` — the Three.js scene
- `this.getComponent(Type)` — get sibling component

## Systems

### MeshRenderer — Static Mesh Display

```typescript
import { MeshRenderer } from "@series-inc/rundot-3d-engine/systems"

// ALWAYS use child GameObject pattern
const renderer = new MeshRenderer("asset_name", castShadow?, receiveShadow?, isStatic?, materialOverride?)
const meshObj = new GameObject("Mesh")
meshObj.addComponent(renderer)
parentGameObject.add(meshObj)

// Check if loaded
renderer.isLoaded()
renderer.getBounds()
renderer.setVisible(false)
renderer.setMaterial(customMaterial)
```

**Static meshes** (`isStatic: true`) skip per-frame matrix updates — use for non-moving objects.

#### Sub-Meshes & Named Children

Meshes with named child groups (from the editor's hierarchy) are automatically promoted to GameObjects.
You can access them by name to add components, move them, etc.

```typescript
const renderer = new MeshRenderer("vehicle_mesh")
const meshObj = new GameObject("VehicleMesh")
meshObj.addComponent(renderer)
parent.add(meshObj)

// Wait for mesh to load, then access named children
renderer.onLoaded(() => {
    // Get a single child by name
    const wheel = renderer.getMeshChild("Wheel_FL")
    if (wheel) {
        wheel.addComponent(new WheelSpinner())
        wheel.position.y -= 0.1  // offset the wheel
    }

    // Get all named children
    const children = renderer.getMeshChildren()
    if (children) {
        for (const [name, childGO] of children) {
            console.log(`Child: ${name}`, childGO.position)
        }
    }
})
```

**Sub-mesh mode** (from prefab): When a `stow_mesh` component has a `subMesh` field, MeshRenderer
loads only that named group's geometry instead of the full mesh. This is how the editor's expanded
sub-mesh hierarchy works at runtime — each child node gets its own MeshRenderer rendering only its part.

```json
{
    "type": "stow_mesh",
    "mesh": { "pack": "main", "assetId": "vehicle" },
    "subMesh": "Wheel_FL"
}
```

Each sub-mesh node is a real GameObject in the prefab tree, so you can attach any component
(physics, scripts, etc.) to individual parts of a mesh.

### SkeletalRenderer — Animated Characters

```typescript
import { SkeletalRenderer } from "@series-inc/rundot-3d-engine/systems"

const skelRenderer = new SkeletalRenderer("character_mesh")
const meshObj = new GameObject("CharacterMesh")
meshObj.addComponent(skelRenderer)
character.add(meshObj)
```

### RigidBodyComponentThree — Physics

```typescript
import { RigidBodyComponentThree, RigidBodyType, ColliderShape } from "@series-inc/rundot-3d-engine/systems"

// Dynamic (affected by physics)
new RigidBodyComponentThree({
    type: RigidBodyType.DYNAMIC,
    shape: ColliderShape.BOX,         // BOX, SPHERE, CAPSULE
    size: new THREE.Vector3(1, 1, 1), // box dimensions
    radius: 0.5,                      // sphere/capsule radius
    height: 2,                        // capsule height
    mass: 1.0,
    friction: 0.5,
    restitution: 0.8,                 // bounciness
    linearDamping: 0.5,
    angularDamping: 0.5,
    lockRotationX/Y/Z: true,          // lock rotation axes
    fitToMesh: true,                  // auto-size from mesh bounds
})

// Static (immovable)
new RigidBodyComponentThree({ type: RigidBodyType.STATIC, shape: ColliderShape.BOX, size: ... })

// Kinematic (script-controlled)
new RigidBodyComponentThree({ type: RigidBodyType.KINEMATIC, ... })

// Trigger (sensor, no physics response)
new RigidBodyComponentThree({ type: RigidBodyType.STATIC, shape: ColliderShape.BOX, isSensor: true })
rb.registerOnTriggerEnter((other) => console.log("entered", other.name))
rb.registerOnTriggerExit((other) => console.log("exited", other.name))

// Velocity & forces (dynamic only)
rb.setVelocity(new THREE.Vector3(0, 5, 0))
rb.applyImpulse(new THREE.Vector3(10, 0, 0))
rb.applyForce(new THREE.Vector3(0, -9.8, 0))
```

### AnimationGraphComponent — State Machine Animations

```typescript
import { AnimationGraphComponent } from "@series-inc/rundot-3d-engine/systems"

const config = {
    parameters: {
        speed: { type: "float", default: 0 },
        isGrounded: { type: "bool", default: true },
    },
    states: {
        idle: { animation: "idle" },
        walk: { animation: "walk" },
        run: { animation: "run" },
        locomotion: {
            tree: {
                parameter: "speed",
                children: [
                    { animation: "idle", threshold: 0 },
                    { animation: "walk", threshold: 1 },
                    { animation: "run", threshold: 2 },
                ],
            },
        },
    },
    transitions: [
        { from: "idle", to: "walk", when: { speed: 1 } },
        { from: "walk", to: "run", when: { speed: 2 } },
        { from: "attack", to: "idle", exitTime: 1.0 },  // after anim finishes
    ],
    initialState: "idle",
}

const animGraph = new AnimationGraphComponent(model, config)
character.addComponent(animGraph)

// Drive transitions via parameters
animGraph.setParameter("speed", 2)
animGraph.setState("attack")  // direct state change
animGraph.getCurrentState()
```

### StowKitSystem — Asset Loading

```typescript
import { StowKitSystem } from "@series-inc/rundot-3d-engine/systems"

const stowkit = StowKitSystem.getInstance()

// Load from build.json
await stowkit.loadFromBuildJson(buildJson, {
    fetchBlob: (path) => fetch(path).then(r => r.blob()),
})

// Access assets
const mesh = await stowkit.getMesh("name")       // async
const mesh = stowkit.getMeshSync("name")          // sync (null if not loaded)
const tex = await stowkit.getTexture("name")
const clip = await stowkit.getAnimation("walk", "character_mesh")
const audio = await stowkit.getAudio("sfx_click")
const skinned = await stowkit.getSkinnedMesh("character", 1.0)

// Clone with shadow settings
const clone = await stowkit.cloneMesh("name", castShadow, receiveShadow)

// GPU instancing
await stowkit.registerMeshForInstancing("coin_batch", "coin_mesh", true, true, 500)
```

### Other Systems

- **AudioSystem** — 2D/3D positional audio with AudioListener management
- **InputManager** — keyboard, mouse, touch, and gamepad input
- **LightingSystem** — directional, point, and spot lights with shadow management
- **NavigationSystem** — A* pathfinding on navigation meshes
- **ParticleSystem** — GPU particle effects
- **TweenSystem** — property animation and easing
- **UISystem** — HTML-based UI overlay system
- **PrefabSystem** — load and instantiate prefab hierarchies from JSON
- **SplineSystem** — Catmull-Rom spline paths for cameras, movement, etc.

## Patterns

### Separation of Concerns

```typescript
// Logic/physics on parent
const character = new GameObject("Character")
character.addComponent(new CharacterController())
character.addComponent(new RigidBodyComponentThree({ type: RigidBodyType.DYNAMIC, shape: ColliderShape.CAPSULE }))

// Visual as child (can offset independently)
const visual = new GameObject("Visual")
visual.addComponent(new SkeletalRenderer("character_mesh"))
character.add(visual)
visual.position.y = -1
```

### Cache Component References

```typescript
class MyComponent extends Component {
    private meshRenderer?: MeshRenderer

    protected onCreate(): void {
        this.meshRenderer = this.getComponent(MeshRenderer) // cache in onCreate
    }

    public update(deltaTime: number): void {
        // use cached ref — don't search every frame
    }
}
```

### Factory Pattern

```typescript
class EnemyFactory {
    static create(type: string): GameObject {
        const enemy = new GameObject(`Enemy_${type}`)
        enemy.addComponent(new EnemyAI())
        const meshObj = new GameObject("Mesh")
        meshObj.addComponent(new MeshRenderer(`enemy_${type}`))
        enemy.add(meshObj)
        return enemy
    }
}
```

## Common Mistakes

- **Don't create GameObjects in `update()`** — causes memory leaks. Create once, reuse or pool.
- **Don't access `this.gameObject` in constructor** — use `onCreate()` instead.
- **Don't forget `dispose()`** — always dispose GameObjects when done.
- **Don't add multiple components of same type** to one GameObject — use child GameObjects.
- **Don't call `this.clock.getDelta()`** — use the `deltaTime` parameter.
- **Don't bypass MeshRenderer** by loading meshes directly from StowKitSystem — use the component pattern.

## Dependencies

- `three` (peer, >=0.180.0)
- `@dimforge/rapier3d` — Rapier physics engine
- `@series-inc/stowkit-reader` + `@series-inc/stowkit-three-loader` — asset loading
