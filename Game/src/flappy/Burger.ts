import { Component } from "@series-inc/rundot-3d-engine"
import type { PrefabInstance } from "@series-inc/rundot-3d-engine/systems"
import { FlappyGame, GameState } from "./FlappyGame"
import { Prefabs } from "../Prefabs"

const WOBBLE_SPEED = 2.5
const WOBBLE_ANGLE = 0.25
const BASE_TILT = -0.5

export class Burger extends Component {
    private prefab!: PrefabInstance
    private collected = false
    private wobbleTime = Math.random() * Math.PI * 2

    protected onCreate(): void {
        this.prefab = Prefabs.instantiate("burger", this.gameObject)
    }

    public update(deltaTime: number): void {
        if (this.collected) return

        if (FlappyGame.getState() === GameState.Playing) {
            this.gameObject.position.z -= FlappyGame.getScrollSpeed() * deltaTime
        }

        this.wobbleTime += deltaTime * WOBBLE_SPEED
        const visual = this.prefab.gameObject
        visual.rotation.x = Math.sin(this.wobbleTime) * WOBBLE_ANGLE
        visual.rotation.z = BASE_TILT + Math.cos(this.wobbleTime * 0.7) * WOBBLE_ANGLE
        visual.rotation.y += deltaTime * 1.5
    }

    public collect(): void {
        this.collected = true
        FlappyGame.addScore()
        this.gameObject.dispose()
    }

    public getZ(): number {
        return this.gameObject.position.z
    }

    public isCollected(): boolean {
        return this.collected
    }
}
