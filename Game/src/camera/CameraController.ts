import * as THREE from "three"
import { Component } from "@series-inc/rundot-3d-engine"

export class CameraController extends Component {
    private camera!: THREE.PerspectiveCamera

    protected onCreate(): void {
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            200,
        )

        this.camera.position.set(-22, 0, 0)
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

    protected onCleanup(): void {
        window.removeEventListener("resize", this.onResize)
        this.scene.remove(this.camera)
    }
}
