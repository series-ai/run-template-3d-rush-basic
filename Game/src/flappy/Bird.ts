import * as THREE from "three"
import { Component, GameObject } from "@series-inc/rundot-3d-engine"
import { BoxColliderComponent } from "@series-inc/rundot-3d-engine/systems"
import { FlappyGame, GameState } from "./FlappyGame"
import { Burger } from "./Burger"

const GRAVITY = -25
const FLAP_VELOCITY = 9
const MAX_FALL_SPEED = -15
const MAX_TILT_UP = Math.PI / 5
const MAX_TILT_DOWN = -Math.PI / 2.5
const TILT_SPEED = 6
const CEILING = 12
const FLOOR = -12

export class Bird extends Component {
    private velocity = 0
    private boundOnPointerDown: (e: Event) => void
    private boundOnKeyDown: (e: KeyboardEvent) => void

    constructor() {
        super()
        this.boundOnPointerDown = this.onPointerDown.bind(this)
        this.boundOnKeyDown = this.onKeyDown.bind(this)
    }

    protected onCreate(): void {
        const boxCollider = this.getComponent(BoxColliderComponent)
        if (boxCollider) {
            const rb = boxCollider.getRigidBody()
            if (rb) {
                rb.registerOnTriggerEnter((other: GameObject) => {
                    if (FlappyGame.getState() !== GameState.Playing) return

                    const burger = other.getComponentInParent(Burger)
                    if (burger) {
                        burger.collect()
                    } else {
                        FlappyGame.die()
                    }
                })
            }
        }

        this.addInputListeners()
    }

    private addInputListeners(): void {
        document.addEventListener("pointerdown", this.boundOnPointerDown)
        document.addEventListener("keydown", this.boundOnKeyDown)
    }

    private onPointerDown(_e: Event): void {
        this.handleInput()
    }

    private onKeyDown(e: KeyboardEvent): void {
        if (e.code === "Space") {
            e.preventDefault()
            this.handleInput()
        }
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

        if (state === GameState.Playing) {
            const y = this.gameObject.position.y
            if (y < FLOOR || y > CEILING) {
                FlappyGame.die()
            }
        }
    }

    public reset(): void {
        this.velocity = 0
        this.gameObject.position.set(0, 0, 0)
        this.gameObject.rotation.x = 0
    }

    protected onCleanup(): void {
        document.removeEventListener("pointerdown", this.boundOnPointerDown)
        document.removeEventListener("keydown", this.boundOnKeyDown)
    }
}
