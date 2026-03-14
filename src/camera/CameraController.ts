import * as THREE from "three"
import { Component } from "@series-inc/rundot-3d-engine"
import { FlappyGame } from "../flappy/FlappyGame"

const CAMERA_OFFSET = new THREE.Vector3(-32, 0, 0)

export class CameraController extends Component {
    private camera!: THREE.PerspectiveCamera
    private shakeIntensity = 0
    private shakeDuration = 0
    private shakeTimer = 0
    private basePosition = new THREE.Vector3()

    protected onCreate(): void {
        this.camera = new THREE.PerspectiveCamera(
            40,
            window.innerWidth / window.innerHeight,
            0.1,
            300,
        )

        this.camera.position.set(-32, 0, 0)
        this.camera.up.set(0, 1, 0)
        this.camera.lookAt(0, 0, 0)

        this.scene.add(this.camera)
        window.addEventListener("resize", this.onResize)
    }

    private onResize = (): void => {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
    }

    public getCamera(): THREE.PerspectiveCamera {
        return this.camera
    }

    public shake(intensity: number, duration: number): void {
        this.shakeIntensity = intensity
        this.shakeDuration = duration
        this.shakeTimer = duration
        this.basePosition.copy(this.camera.position)
    }

    public lateUpdate(deltaTime: number): void {
        const followZ = FlappyGame.getFollowZ()
        this.basePosition.set(CAMERA_OFFSET.x, CAMERA_OFFSET.y, followZ + CAMERA_OFFSET.z)
        this.camera.lookAt(0, 0, followZ)

        if (this.shakeTimer > 0) {
            this.shakeTimer -= deltaTime
            const t = Math.max(0, this.shakeTimer / this.shakeDuration)
            const strength = this.shakeIntensity * t
            this.camera.position.set(
                this.basePosition.x + (Math.random() - 0.5) * 2 * strength,
                this.basePosition.y + (Math.random() - 0.5) * 2 * strength,
                this.basePosition.z + (Math.random() - 0.5) * 2 * strength,
            )
            if (this.shakeTimer <= 0) {
                this.camera.position.copy(this.basePosition)
            }
        } else {
            this.camera.position.copy(this.basePosition)
        }
    }

    protected onCleanup(): void {
        window.removeEventListener("resize", this.onResize)
        this.scene.remove(this.camera)
    }
}
