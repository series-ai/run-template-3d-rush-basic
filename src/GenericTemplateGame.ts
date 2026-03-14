import * as THREE from "three"
import { AssetManager, GameObject, VenusGame } from "@series-inc/rundot-3d-engine"
import {
    AudioSystem,
    GetMasterVolume,
    IsAudioMuted,
    Main2DAudioBank,
    MusicBank,
    PhysicsSystem,
    SetAudioMuted,
    SetMasterVolume,
    SetMusicVolume,
    StartPlaylistWithAutoplayHandling,
    StowKitSystem,
} from "@series-inc/rundot-3d-engine/systems"
import RundotGameAPI from "@series-inc/rundot-game-sdk/api"
import { CameraController } from "./camera"
import { Prefabs } from "./Prefabs"
import { FlappyGame } from "./flappy"
import { VolumeMenu } from "./VolumeMenu"

export class GenericTemplateGame extends VenusGame {
    private static _gameInstance: GenericTemplateGame
    private cameraObject?: GameObject
    private simCamera?: CameraController

    private volumeMenu: VolumeMenu | null = null
    private musicVolume = 0.2
    private sfxVolume = 0.5
    private settingsButton?: HTMLDivElement
    private sun?: THREE.DirectionalLight
    private sunOffset = new THREE.Vector3()
    private sunTargetOffset = new THREE.Vector3()
    private godraysPlane?: THREE.Mesh

    protected getConfig() {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || "ontouchstart" in window
        return {
            backgroundColor: 0x6b7280,
            shadowMapEnabled: true,
            shadowMapType: isMobile ? "basic" as const : "pcf_soft" as const,
            toneMapping: "linear" as const,
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

    protected preRender(_deltaTime: number): void {
        this.updateSunPosition()
    }

    private updateSunPosition(): void {
        const sun = this.sun
        if (!sun) return

        const followZ = FlappyGame.getFollowZ()

        sun.position.set(this.sunOffset.x, this.sunOffset.y, this.sunOffset.z + followZ)
        sun.target.position.set(this.sunTargetOffset.x, this.sunTargetOffset.y, this.sunTargetOffset.z + followZ)
        sun.target.updateMatrixWorld()

        if (this.godraysPlane) {
            this.godraysPlane.position.z = followZ
        }
    }

    protected async onDispose(): Promise<void> {
        FlappyGame.dispose()

        this.settingsButton?.remove()
    }

    private async setup(): Promise<void> {
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        await this.initializeSystems()
        await RundotGameAPI.preloader.setLoaderProgress(0.4)
        if (import.meta.env.DEV) {
            PhysicsSystem.initializeDebug(this.scene)
            PhysicsSystem.setDebugEnabled(false)
        }
        this.setupLighting()
        this.setupOceanBackground()
        this.setupCamera()

        await RundotGameAPI.preloader.setLoaderProgress(0.6)
        await this.setupGodrays()
        await RundotGameAPI.preloader.setLoaderProgress(0.8)
        FlappyGame.initialize()
        FlappyGame.setOnFirstStart(() => this.startMusic())
        if (import.meta.env.DEV) {
            this.createDebugToggle()
        }

        this.createSettingsButton()

        window.addEventListener("keydown", (e) => {
            if (e.key.toLowerCase() === "v") {
                this.openVolumeMenu();
            }
        });

        await VenusGame.loadingFinished()
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
        const [jump1, jump2, jump3, coinCollect, bubbleAmbience, death, music] = await Promise.all([
            stowkit.getAudio("jump_1"),
            stowkit.getAudio("jump_2"),
            stowkit.getAudio("jump_3"),
            stowkit.getAudio("coin_collect"),
            stowkit.getAudio("bubble_ambience"),
            stowkit.getAudio("death"),
            stowkit.getAudio("music"),
        ])
        jump1.setVolume(0.5)
        jump2.setVolume(0.5)
        jump3.setVolume(0.5)
        coinCollect.setVolume(0.5)
        bubbleAmbience.setVolume(0.3)
        death.setVolume(0.5)
        Main2DAudioBank["jump_1"] = jump1
        Main2DAudioBank["jump_2"] = jump2
        Main2DAudioBank["jump_3"] = jump3
        Main2DAudioBank["coin_collect"] = coinCollect
        Main2DAudioBank["bubble_ambience"] = bubbleAmbience
        Main2DAudioBank["death"] = death
        MusicBank["music"] = music
    }

    public startMusic(): void {
        SetMusicVolume(0.2, MusicBank)
        StartPlaylistWithAutoplayHandling(MusicBank, ["music"])
    }

    private setupLighting(): void {
        const sun = new THREE.DirectionalLight(0xddf4ff, 2.0)
        sun.position.set(-18, 35, 10)
        sun.target.position.set(0, 0, 0)
        sun.castShadow = true
        sun.shadow.mapSize.set(1024, 1024)
        sun.shadow.camera.left = -80
        sun.shadow.camera.right = 80
        sun.shadow.camera.top = 40
        sun.shadow.camera.bottom = -40
        sun.shadow.camera.near = 1
        sun.shadow.camera.far = 150
        sun.shadow.bias = -0.001
        sun.shadow.normalBias = 0.03
        this.sun = sun
        this.sunOffset.copy(sun.position)
        this.sunTargetOffset.copy(sun.target.position)
        this.scene.add(sun)
        this.scene.add(sun.target)

        const ambient = new THREE.AmbientLight(0x80d4e6, 1.8)
        this.scene.add(ambient)

        this.scene.fog = new THREE.Fog(0x1050a0, 0, 300)

    }

    private setupOceanBackground(): void {
        const canvas = document.createElement("canvas")
        canvas.width = 2
        canvas.height = 512
        const ctx = canvas.getContext("2d")!
        const gradient = ctx.createLinearGradient(0, 0, 0, 512)
        gradient.addColorStop(0, "#0a50d0")
        gradient.addColorStop(0.3, "#063090")
        gradient.addColorStop(0.6, "#041a58")
        gradient.addColorStop(1, "#010c25")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 2, 512)
        const texture = new THREE.CanvasTexture(canvas)
        texture.needsUpdate = true
        this.scene.background = texture
    }

    private setupCamera(): void {
        this.cameraObject = new GameObject("Camera")
        this.simCamera = new CameraController()
        this.cameraObject.addComponent(this.simCamera)
        this.camera = this.simCamera.getCamera()
    }


    private async setupGodrays(): Promise<void> {
        const stowkit = StowKitSystem.getInstance()
        const texture = await stowkit.getTexture("godrays")
        const geo = new THREE.PlaneGeometry(80, 80)
        const mat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            fog: false,
        })
        const plane = new THREE.Mesh(geo, mat)
        plane.position.set(15, 10, 0)
        plane.rotation.y = -Math.PI / 2
        this.godraysPlane = plane
        this.scene.add(plane)
    }

    private createSettingsButton(): void {
        const btn = document.createElement("div")
        Object.assign(btn.style, {
            position: "fixed",
            top: "16px",
            right: "16px",
            width: "52px",
            height: "52px",
            zIndex: "100",
            cursor: "pointer",
            borderRadius: "50%",
            background: "linear-gradient(180deg, rgba(162, 240, 245, 0.85) 0%, rgba(105, 215, 230, 0.9) 100%)",
            border: "3px solid rgba(255, 255, 255, 0.7)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 0 10px rgba(255,255,255,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.15s ease",
            userSelect: "none",
        })

        btn.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`

        btn.addEventListener("pointerdown", (e) => {
            e.stopPropagation()
            btn.style.transform = "scale(0.9)"
        })
        btn.addEventListener("pointerup", (e) => {
            e.stopPropagation()
            btn.style.transform = "scale(1)"
            this.openVolumeMenu()
        })
        btn.addEventListener("pointerleave", () => {
            btn.style.transform = "scale(1)"
        })

        document.body.appendChild(btn)
        this.settingsButton = btn
    }

    private openVolumeMenu(): void {
        if (this.volumeMenu) return

        this.pause()
        // Restore audio so the user can preview volume changes in the menu.
        // pause() mutes the listener directly, but SetMasterVolume overrides it.
        SetMasterVolume(GetMasterVolume())

        this.volumeMenu = new VolumeMenu({
            masterVolume: GetMasterVolume(),
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            isMuted: IsAudioMuted(),
            onMasterChange: (value) => {
                SetMasterVolume(value)
            },
            onMusicChange: (value) => {
                this.musicVolume = value
                SetMusicVolume(value, MusicBank)
            },
            onSfxChange: (value) => {
                this.sfxVolume = value
                this.applySfxVolume(value)
            },
            onMuteToggle: (muted) => {
                SetAudioMuted(muted)
            },
            onClose: () => {
                this.volumeMenu = null
                this.resume()
                // Re-apply user's volume since resume() restores the pre-pause listener value
                SetMasterVolume(GetMasterVolume())
            },
        })
    }

    private applySfxVolume(volume: number): void {
        const sfxKeys = ["jump_1", "jump_2", "jump_3", "coin_collect", "death"]
        for (const key of sfxKeys) {
            const audio = Main2DAudioBank[key]
            if (audio) audio.setVolume(volume)
        }
        const ambience = Main2DAudioBank["bubble_ambience"]
        if (ambience) ambience.setVolume(volume * 0.6)
    }

    public getCamera(): CameraController | undefined {
        return this.simCamera
    }

    private createDebugToggle(): void {
        const container = document.createElement("div")
        Object.assign(container.style, {
            position: "fixed",
            bottom: "12px",
            right: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "4px",
            zIndex: "200",
        })

        const labelStyle = {
            color: "white",
            fontSize: "14px",
            fontFamily: "'Segoe UI', sans-serif",
            cursor: "pointer",
            userSelect: "none",
            textShadow: "1px 1px 2px rgba(0,0,0,0.6)",
        }

        const statsLabel = document.createElement("label")
        Object.assign(statsLabel.style, labelStyle)
        const statsCheckbox = document.createElement("input")
        statsCheckbox.type = "checkbox"
        statsCheckbox.checked = false
        statsCheckbox.style.marginRight = "6px"
        statsCheckbox.style.cursor = "pointer"
        statsCheckbox.addEventListener("change", () => {
            this.showStats(statsCheckbox.checked)
        })
        statsLabel.appendChild(statsCheckbox)
        statsLabel.appendChild(document.createTextNode("Show Stats"))

        const physicsLabel = document.createElement("label")
        Object.assign(physicsLabel.style, labelStyle)
        const physicsCheckbox = document.createElement("input")
        physicsCheckbox.type = "checkbox"
        physicsCheckbox.checked = false
        physicsCheckbox.style.marginRight = "6px"
        physicsCheckbox.style.cursor = "pointer"
        physicsCheckbox.addEventListener("change", () => {
            PhysicsSystem.setDebugEnabled(physicsCheckbox.checked)
        })
        physicsLabel.appendChild(physicsCheckbox)
        physicsLabel.appendChild(document.createTextNode("Physics Debug"))

        container.appendChild(statsLabel)
        container.appendChild(physicsLabel)
        document.body.appendChild(container)
    }
}
