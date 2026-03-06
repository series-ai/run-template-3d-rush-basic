import * as THREE from "three"
import { Component, GameObject } from "@series-inc/rundot-3d-engine"
import { Pipe } from "./Pipe"
import { Pickup } from "./Pickup"
import { FlappyGame, GameState } from "./FlappyGame"

const PIPE_SPACING = 10
const GAP_SIZE = 12
const GAP_Y_MIN = -4
const GAP_Y_MAX = 5
const OFFSCREEN_MARGIN = 2

export class PipeSpawner extends Component {
    private pipes: { gameObject: GameObject; pipe: Pipe }[] = []
    private pickups: { gameObject: GameObject; pickup: Pickup }[] = []
    private distanceSinceLastSpawn = 0
    private fallbackSpawnZ = 20

    public update(deltaTime: number): void {
        if (FlappyGame.getState() !== GameState.Playing) return

        const speed = FlappyGame.getScrollSpeed()
        this.distanceSinceLastSpawn += speed * deltaTime

        if (this.distanceSinceLastSpawn >= PIPE_SPACING) {
            this.distanceSinceLastSpawn -= PIPE_SPACING
            this.spawnPipe()
        }

        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const entry = this.pipes[i]
            if (entry.pipe.getZ() < this.getDespawnZ()) {
                entry.gameObject.dispose()
                this.pipes.splice(i, 1)
            }
        }

        for (let i = this.pickups.length - 1; i >= 0; i--) {
            const entry = this.pickups[i]
            if (entry.pickup.isCollected() || entry.pickup.getZ() < this.getDespawnZ()) {
                if (!entry.pickup.isCollected()) entry.gameObject.dispose()
                this.pickups.splice(i, 1)
            }
        }
    }

    private spawnPipe(): void {
        const gapY = GAP_Y_MIN + Math.random() * (GAP_Y_MAX - GAP_Y_MIN)
        const spawnZ = this.getSpawnZ() + this.distanceSinceLastSpawn

        const pipeObject = new GameObject("Pipe")
        pipeObject.position.set(0, 0, spawnZ)
        const pipeComponent = new Pipe(gapY, GAP_SIZE)
        pipeObject.addComponent(pipeComponent)
        this.pipes.push({ gameObject: pipeObject, pipe: pipeComponent })

        const pickupObject = new GameObject("Pickup")
        pickupObject.position.set(0, gapY, spawnZ)
        const pickupComponent = new Pickup()
        pickupObject.addComponent(pickupComponent)
        this.pickups.push({ gameObject: pickupObject, pickup: pickupComponent })
    }

    private getSpawnZ(): number {
        const camera = this.findPerspectiveCamera()
        if (!camera) return this.fallbackSpawnZ

        const forward = new THREE.Vector3()
        camera.getWorldDirection(forward)
        const toPlayFieldCenter = new THREE.Vector3().set(0, 0, 0).sub(camera.position)
        const distanceToCenter = Math.max(1, toPlayFieldCenter.dot(forward))

        const halfHeightAtPlayField = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distanceToCenter
        const halfWidthAtPlayField = halfHeightAtPlayField * camera.aspect
        return halfWidthAtPlayField + OFFSCREEN_MARGIN
    }

    private getDespawnZ(): number {
        return -this.getSpawnZ()
    }

    private findPerspectiveCamera(): THREE.PerspectiveCamera | undefined {
        for (const child of this.scene.children) {
            if ((child as THREE.PerspectiveCamera).isPerspectiveCamera) {
                return child as THREE.PerspectiveCamera
            }
        }
        return undefined
    }

    public getPipes(): Pipe[] {
        return this.pipes.map(e => e.pipe)
    }

    public clearAllPipes(): void {
        for (const entry of this.pipes) {
            entry.gameObject.dispose()
        }
        for (const entry of this.pickups) {
            if (!entry.pickup.isCollected()) entry.gameObject.dispose()
        }
        this.pipes = []
        this.pickups = []
        this.distanceSinceLastSpawn = 0
    }
}
