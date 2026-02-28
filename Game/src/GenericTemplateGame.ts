import * as THREE from "three"
import {AssetManager, GameObject, VenusGame} from "@series-inc/rundot-3d-engine"
import {
  PhysicsSystem,
  SharedAnimationManager,
} from "@series-inc/rundot-3d-engine/systems"
import {CameraController} from "./camera"
import {Prefabs} from "./Prefabs"
import {PickupSystem} from "./pickups-example"

/**
 * 3D Rush Template Basic Game
 * Provides a basic 3D scene with camera and pickup system example
 */
export class GenericTemplateGame extends VenusGame {
  private static _gameInstance: GenericTemplateGame

  private cameraObject?: GameObject
  private simCamera?: CameraController
  
  /**
   * Configure VenusGame settings
   */
  protected getConfig() {
    return {
      backgroundColor: 0x87ceeb, // Sky blue background
      shadowMapEnabled: true,
      shadowMapType: "pcf_soft" as const,
      toneMapping: "aces" as const,
      toneMappingExposure: 1.0,
      audioEnabled: false, // Simplified - no audio for template
    }
  }

  /**
   * VenusGame required: Called once at startup
   */
  protected async onStart(): Promise<void> {
    GenericTemplateGame._gameInstance = this
    await this.setup()
  }

  /**
   * Get the singleton instance of GenericTemplateGame
   */
  public static getInstance(): GenericTemplateGame {
    if (!GenericTemplateGame._gameInstance) {
      throw new Error("GenericTemplateGame not initialized")
    }
    return GenericTemplateGame._gameInstance
  }

  /**
   * VenusGame required: Called every frame before rendering
   */
  protected preRender(deltaTime: number): void {
    // Update logic goes here if needed
    // Most updates are handled by the Component system automatically
  }

  /**
   * VenusGame required: Cleanup
   */
  protected async onDispose(): Promise<void> {
    // Cleanup logic goes here if needed
    console.log("🧹 Cleaning up 3D Rush Template Basic")
  }

  /**
   * Main setup - called by onStart
   */
  private async setup(): Promise<void> {
    console.log("🎮 Starting 3D Rush Template Basic Setup...")

    // Initialize core systems
    await this.initializeSystems()

    // Create the world
    this.setupLighting()
    this.createGround()
    this.setupCamera()

    console.log("✅ 3D Rush Template Basic Setup Complete!")
  }

  /**
   * Initialize required systems
   */
  private async initializeSystems(): Promise<void> {
    console.log("⚙️ Initializing systems...")

    // AssetManager
    AssetManager.init(this.scene)

    // Initialize systems in parallel
    await Promise.all([
      PhysicsSystem.initialize(),
      Prefabs.initialize(),
    ])

    // SharedAnimationManager
    SharedAnimationManager.getInstance()

    // Initialize pickup system (EXAMPLE, remove this if not needed)
    PickupSystem.initialize()

    // Physics debug visualization (optional)
    PhysicsSystem.initializeDebug(this.scene)

    console.log("✅ Systems initialized")
  }

  /**
   * Setup lighting
   */
  private setupLighting(): void {
    // Main directional light with shadows
    const directionalLight = new THREE.DirectionalLight(
      new THREE.Color(1.0, 0.98, 0.94),
      1.0
    )
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true

    // Shadow settings
    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 50
    directionalLight.shadow.camera.left = -20
    directionalLight.shadow.camera.right = 20
    directionalLight.shadow.camera.top = 20
    directionalLight.shadow.camera.bottom = -20
    directionalLight.shadow.bias = -0.0005

    this.scene.add(directionalLight)
    this.scene.add(directionalLight.target)

    // Ambient light for general fill
    const ambientLight = new THREE.AmbientLight(
      new THREE.Color(1.0, 0.97, 0.92),
      0.6
    )
    this.scene.add(ambientLight)

    console.log("💡 Lighting setup complete")
  }

  /**
   * Create a simple ground plane
   */
  private createGround(): void {
    const groundGeometry = new THREE.PlaneGeometry(100, 100)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x7fc77f,
      roughness: 0.8,
      metalness: 0.2,
    })

    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    ground.position.y = 0

    this.scene.add(ground)

    console.log("🌍 Ground created")
  }

  /**
   * Setup static camera looking at origin
   */
  private setupCamera(): void {
    // Create camera GameObject
    this.cameraObject = new GameObject("Camera")

    // Add camera component
    this.simCamera = new CameraController()
    this.cameraObject.addComponent(this.simCamera)

    // Enable controls (optional - allows mouse drag to rotate camera)
    this.simCamera.setControlsEnabled(false)

    // Get the camera and set it as the rendering camera
    const simCameraInstance = this.simCamera.getCamera()
    this.camera = simCameraInstance

    console.log("📷 Camera setup complete")
  }

  /**
   * Get the camera controller (for debugging)
   */
  public getCamera(): CameraController | undefined {
    return this.simCamera
  }
}

