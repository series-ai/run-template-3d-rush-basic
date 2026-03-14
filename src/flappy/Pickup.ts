import { Component, GameObject } from "@series-inc/rundot-3d-engine"
import { Easing, Main2DAudioBank, ParticleSystemPrefabComponent, PlayAudioOneShot2D, TweenSystem } from "@series-inc/rundot-3d-engine/systems"
import type { PrefabInstance } from "@series-inc/rundot-3d-engine/systems"
import { FlappyGame, GameState } from "./FlappyGame"
import { CharacterShader } from "./CharacterShader"

import { Prefabs } from "../Prefabs"

const WOBBLE_SPEED = 2.5
const WOBBLE_ANGLE = 0.25
const BASE_TILT = -0.5

export class Pickup extends Component {
    private prefab!: PrefabInstance
    private collected = false
    private wobbleTime = Math.random() * Math.PI * 2
    private tweenScale = 1

    protected onCreate(): void {
        this.prefab = Prefabs.instantiate("pickup", this.gameObject)
        const coin = this.prefab.getChildByName("coin")
        if (coin) {
            coin.gameObject.addComponent(new CharacterShader())
        }
    }

    public update(deltaTime: number): void {
        if (this.collected) return

        this.wobbleTime += deltaTime * WOBBLE_SPEED
        const visual = this.prefab.gameObject
        visual.rotation.x = Math.sin(this.wobbleTime) * WOBBLE_ANGLE
        visual.rotation.z = BASE_TILT + Math.cos(this.wobbleTime * 0.7) * WOBBLE_ANGLE
        visual.rotation.y += deltaTime * 1.5
    }

    public collect(): void {
        this.collected = true
        PlayAudioOneShot2D(Main2DAudioBank, "coin_collect")
        FlappyGame.addScore()

        // Spawn collect VFX at pickup position
        const vfxHolder = new GameObject("collect_vfx")
        vfxHolder.position.copy(this.gameObject.position)
        const vfxPrefab = Prefabs.instantiate("collect_vfx", vfxHolder)
        const vfxParticles = vfxPrefab.getComponent(ParticleSystemPrefabComponent)
        vfxParticles?.play()
        setTimeout(() => vfxHolder.dispose(), 1500)

        // Snappy pop-and-vanish
        const pop = TweenSystem.tween(this, "tweenScale", 1.5, 0.03, Easing.easeOutQuad)
        pop.onUpdated((v: number) => {
            this.gameObject.scale.set(v, v, v)
        })
        pop.onCompleted(() => {
            const shrink = TweenSystem.tween(this, "tweenScale", 0, 0.05, Easing.easeInQuad)
            shrink.onUpdated((v: number) => {
                this.gameObject.scale.set(v, v, v)
            })
            shrink.onCompleted(() => {
                this.gameObject.dispose()
            })
        })
    }

    public getZ(): number {
        return this.gameObject.position.z
    }

    public isCollected(): boolean {
        return this.collected
    }
}
