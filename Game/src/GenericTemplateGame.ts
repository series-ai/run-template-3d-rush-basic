import * as THREE from "three"
import { AssetManager, GameObject, MeshRenderer, VenusGame } from "@series-inc/rundot-3d-engine"
import {
    AudioSystem,
    Main2DAudioBank,
    MusicBank,
    PhysicsSystem,
    SetMusicVolume,
    StartPlaylistWithAutoplayHandling,
    StowKitSystem,
} from "@series-inc/rundot-3d-engine/systems"
import { CameraController } from "./camera"
import { Prefabs } from "./Prefabs"
import { FlappyGame, GameState } from "./flappy"

export class GenericTemplateGame extends VenusGame {
    private static _gameInstance: GenericTemplateGame
    private cameraObject?: GameObject
    private simCamera?: CameraController
    private bgMaterial?: THREE.Material

    protected getConfig() {
        return {
            backgroundColor: 0x6b7280,
            shadowMapEnabled: true,
            shadowMapType: "vsm" as const,
            toneMapping: "aces" as const,
            toneMappingExposure: 1.0,
            audioEnabled: true,
        }
    }

    protected async onStart(): Promise<void> {
        GenericTemplateGame._gameInstance = this
        await this.setup()
    }

    public static getInstance(): GenericTemplateGame {
        if (!GenericTemplateGame._gameInstance) {
            throw new Error("GenericTemplateGame not initialized")
        }
        return GenericTemplateGame._gameInstance
    }

    protected preRender(deltaTime: number): void {
        FlappyGame.update(deltaTime)
        if (this.bgMaterial && FlappyGame.getState() === GameState.Playing) {
            const mat = this.bgMaterial as THREE.MeshStandardMaterial
            if (mat.map) {
                mat.map.offset.x += deltaTime * 0.02
            }
        }
    }

    protected async onDispose(): Promise<void> {
        FlappyGame.dispose()
    }

    private async setup(): Promise<void> {
        await this.initializeSystems()
        PhysicsSystem.initializeDebug(this.scene)
        PhysicsSystem.setDebugEnabled(false)
        this.setupLighting()
        this.setupBackground()
        this.setupCamera()
        FlappyGame.initialize()
        FlappyGame.setOnFirstStart(() => this.startMusic())
        this.createDebugToggle()
    }

    private async initializeSystems(): Promise<void> {
        AssetManager.init(this.scene)
        AudioSystem.initialize()
        await Promise.all([
            PhysicsSystem.initialize(),
            Prefabs.initialize(),
        ])
        await this.loadAudio()
    }

    private async loadAudio(): Promise<void> {
        const stowkit = StowKitSystem.getInstance()
        const [bite, jump, music] = await Promise.all([
            stowkit.getAudio("bite"),
            stowkit.getAudio("jump"),
            stowkit.getAudio("music"),
        ])
        bite.setVolume(0.5)
        jump.setVolume(0.5)
        Main2DAudioBank["bite"] = bite
        Main2DAudioBank["jump"] = jump
        MusicBank["music"] = music
    }

    public startMusic(): void {
        SetMusicVolume(0.2, MusicBank)
        StartPlaylistWithAutoplayHandling(MusicBank, ["music"])
    }

    private setupLighting(): void {
        const sun = new THREE.DirectionalLight(0xfff4e6, 2.2)
        sun.position.set(-8, 15, 6)
        sun.castShadow = true
        sun.shadow.mapSize.set(2048, 2048)
        sun.shadow.camera.left = -30
        sun.shadow.camera.right = 30
        sun.shadow.camera.top = 30
        sun.shadow.camera.bottom = -30
        sun.shadow.camera.near = 0.5
        sun.shadow.camera.far = 60
        sun.shadow.bias = -0.0005
        sun.shadow.radius = 4
        this.scene.add(sun)
        this.scene.add(sun.target)

        const fill = new THREE.DirectionalLight(0xb0d4ff, 0.6)
        fill.position.set(6, 8, -4)
        this.scene.add(fill)

        const ambient = new THREE.AmbientLight(0xffffff, 1)
        this.scene.add(ambient)
    }

    private setupBackground(): void {
        const bg = Prefabs.instantiate("background")
        const renderer = bg.gameObject.getComponentInChildren(MeshRenderer)
        if (!renderer) return

        renderer.onLoaded(() => {
            const mat = renderer.getMaterial() as THREE.MeshStandardMaterial | null
            if (mat?.map) {
                this.bgMaterial = mat
            }
        })
    }

    private setupCamera(): void {
        this.cameraObject = new GameObject("Camera")
        this.simCamera = new CameraController()
        this.cameraObject.addComponent(this.simCamera)
        this.camera = this.simCamera.getCamera()
    }

    public getCamera(): CameraController | undefined {
        return this.simCamera
    }

    private createDebugToggle(): void {
        const label = document.createElement("label")
        Object.assign(label.style, {
            position: "fixed",
            bottom: "12px",
            right: "12px",
            color: "white",
            fontSize: "14px",
            fontFamily: "'Segoe UI', sans-serif",
            zIndex: "200",
            cursor: "pointer",
            userSelect: "none",
            textShadow: "1px 1px 2px rgba(0,0,0,0.6)",
        })

        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.checked = false
        checkbox.style.marginRight = "6px"
        checkbox.style.cursor = "pointer"
        checkbox.addEventListener("change", () => {
            PhysicsSystem.setDebugEnabled(checkbox.checked)
        })

        label.appendChild(checkbox)
        label.appendChild(document.createTextNode("Physics Debug"))
        document.body.appendChild(label)
    }
}
