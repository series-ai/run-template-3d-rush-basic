import * as THREE from "three"
import { Component, GameObject } from "@series-inc/rundot-3d-engine"
import { RigidBodyComponentThree, Main2DAudioBank, PhysicsSystem, PlayAudioOneShot2D, Input } from "@series-inc/rundot-3d-engine/systems"
import { FlappyGame, GameState } from "./FlappyGame"
import { Pipe } from "./Pipe"
import { Pickup } from "./Pickup"

const GRAVITY = -25
const FLAP_VELOCITY = 9
const MAX_FALL_SPEED = -15
const MAX_TILT_UP = Math.PI / 5
const MAX_TILT_DOWN = -Math.PI / 2.5
const TILT_SPEED = 6
const CEILING = 12
const FLOOR = -12

const DEATH_KICK = 7
const DEATH_KICK_Z = -8
const DEATH_BOUNCE = -6
const DEATH_SPIN_SPEED = 12
const PIPE_HALF_WIDTH = 2
const BIRD_RADIUS = 1
const JUMP_SOUNDS = ["jump_1", "jump_2", "jump_3"]

export class Bird extends Component {
    private velocity = 0
    private velocityZ = 0
    private jumpIndex = 0
    private deathSpin = 0
    private unsubAction?: () => void

    protected onCreate(): void {
        const rb = this.getComponent(RigidBodyComponentThree)
        if (rb) {
            rb.registerOnTriggerEnter((other: GameObject) => {
                if (FlappyGame.getState() !== GameState.Playing) return

                const pickup = other.getComponentInParent(Pickup)
                if (pickup) {
                    if (!pickup.isCollected()) pickup.collect()
                } else {
                    FlappyGame.die()
                }
            })
        }

        Input.registerAction("jump", [
            { type: "key", code: "Space" },
            { type: "pointer" },
            { type: "touch" },
        ])
        this.unsubAction = Input.onAction("jump", () => this.handleInput())
    }

    private handleInput(): void {
        const state = FlappyGame.getState()
        if (state === GameState.Idle) {
            FlappyGame.start()
            this.flap()
        } else if (state === GameState.Playing) {
            this.flap()
        } else if (state === GameState.Dead) {
            FlappyGame.restart()
        }
    }

    private flap(): void {
        this.velocity = FLAP_VELOCITY
        const sound = JUMP_SOUNDS[this.jumpIndex]
        this.jumpIndex = (this.jumpIndex + 1) % JUMP_SOUNDS.length
        const audio = Main2DAudioBank[sound]
        if (audio && !audio.isPlaying) {
            audio.setPlaybackRate(0.9 + Math.random() * 0.2)
            PlayAudioOneShot2D(Main2DAudioBank, sound)
        }
    }

    public update(deltaTime: number): void {
        const state = FlappyGame.getState()

        if (state === GameState.Idle) {
            const bob = Math.sin(Date.now() * 0.003) * 0.3
            this.gameObject.position.y = bob
            this.gameObject.rotation.x = 0
            return
        }

        if (state !== GameState.Playing && state !== GameState.Dead) return

        if (state === GameState.Dead) {
            if (FlappyGame.isHitFrozen()) return
            this.velocity += GRAVITY * deltaTime
            if (this.velocity < MAX_FALL_SPEED) this.velocity = MAX_FALL_SPEED
            this.gameObject.position.y += this.velocity * deltaTime
            this.gameObject.position.z += this.velocityZ * deltaTime

            this.checkDeathPipeCollisions()

            this.deathSpin += DEATH_SPIN_SPEED * deltaTime
            this.gameObject.rotation.x = this.deathSpin
            return
        }

        this.velocity += GRAVITY * deltaTime
        if (this.velocity < MAX_FALL_SPEED) this.velocity = MAX_FALL_SPEED
        this.gameObject.position.y += this.velocity * deltaTime

        const targetTilt = this.velocity > 0
            ? THREE.MathUtils.mapLinear(this.velocity, 0, FLAP_VELOCITY, 0, MAX_TILT_UP)
            : THREE.MathUtils.mapLinear(this.velocity, MAX_FALL_SPEED, 0, MAX_TILT_DOWN, 0)

        this.gameObject.rotation.x = THREE.MathUtils.lerp(
            this.gameObject.rotation.x,
            targetTilt,
            TILT_SPEED * deltaTime,
        )

        const y = this.gameObject.position.y
        if (y < FLOOR || y > CEILING) {
            FlappyGame.die()
        }
    }

    private checkDeathPipeCollisions(): void {
        const birdY = this.gameObject.position.y
        const birdZ = this.gameObject.position.z
        const pipes = FlappyGame.getPipes()
        const threshold = PIPE_HALF_WIDTH + BIRD_RADIUS

        for (let i = 0; i < pipes.length; i++) {
            const pipe = pipes[i]
            const pipeZ = pipe.getZ()
            const dz = birdZ - pipeZ
            if (Math.abs(dz) > threshold) continue

            const halfGap = pipe.getGapSize() / 2
            const gapTop = pipe.getGapCenterY() + halfGap
            const gapBottom = pipe.getGapCenterY() - halfGap

            if (birdY > gapBottom && birdY < gapTop) continue

            // Push bird out of the pipe on Z and bounce downward
            this.gameObject.position.z = pipeZ + (dz >= 0 ? threshold : -threshold)
            this.velocityZ = dz >= 0 ? Math.abs(this.velocityZ) * 0.5 : -Math.abs(this.velocityZ) * 0.5
            this.velocity = DEATH_BOUNCE
            break
        }
    }

    public deathKick(): void {
        this.velocity = DEATH_KICK
        this.velocityZ = DEATH_KICK_Z
        this.deathSpin = this.gameObject.rotation.x
    }

    public reset(): void {
        this.velocity = 0
        this.velocityZ = 0
        this.deathSpin = 0
        this.gameObject.position.set(0, 0, 0)
        this.gameObject.rotation.x = 0

        const rb = this.getComponent(RigidBodyComponentThree)?.getRigidBody()
        if (rb) {
            PhysicsSystem.syncObjectToPhysics(this.gameObject, rb)
        }
    }

    protected onCleanup(): void {
        this.unsubAction?.()
    }
}
