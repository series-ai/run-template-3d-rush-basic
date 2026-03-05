import { GameObject } from "@series-inc/rundot-3d-engine"
import { Bird } from "./Bird"
import { PipeSpawner } from "./PipeSpawner"
import { FlappyUI } from "./FlappyUI"
import { Spinner } from "./Spinner"
import { Prefabs } from "../Prefabs"

export enum GameState {
    Idle,
    Playing,
    Dead,
}

const SCROLL_SPEED = 6
const DEATH_PAUSE = 0.6

export class FlappyGame {
    private static state: GameState = GameState.Idle
    private static score = 0
    private static bestScore = 0
    private static bird: Bird
    private static spawner: PipeSpawner
    private static ui: FlappyUI
    private static deathTimer = 0

    private constructor() {
        throw new Error("FlappyGame is a static class")
    }

    public static initialize(): void {
        this.ui = new FlappyUI()

        const characterPrefab = Prefabs.instantiate("character")
        const birdObject = characterPrefab.gameObject
        birdObject.rotation.y = -0.4
        this.bird = new Bird()
        birdObject.addComponent(this.bird)

        const keyChild = characterPrefab.getChildByName("key")
        if (keyChild) {
            keyChild.gameObject.addComponent(new Spinner("z"))
        }

        const spawnerObject = new GameObject("PipeSpawner")
        this.spawner = new PipeSpawner()
        spawnerObject.addComponent(this.spawner)

        this.state = GameState.Idle
        this.ui.showIdle()
    }

    public static getState(): GameState {
        return this.state
    }

    public static getScrollSpeed(): number {
        return SCROLL_SPEED
    }

    private static musicStarted = false
    private static onFirstStart?: () => void

    public static setOnFirstStart(callback: () => void): void {
        this.onFirstStart = callback
    }

    public static start(): void {
        if (this.state !== GameState.Idle) return
        this.state = GameState.Playing
        this.score = 0
        this.ui.showPlaying()
        this.ui.updateScore(0)

        if (!this.musicStarted) {
            this.musicStarted = true
            this.onFirstStart?.()
        }
    }

    public static addScore(): void {
        this.score++
        this.ui.updateScore(this.score)
    }

    public static die(): void {
        if (this.state !== GameState.Playing) return
        this.state = GameState.Dead
        this.deathTimer = DEATH_PAUSE
        if (this.score > this.bestScore) this.bestScore = this.score
        this.ui.showDead(this.score, this.bestScore)
    }

    public static restart(): void {
        if (this.state !== GameState.Dead) return
        if (this.deathTimer > 0) return

        this.spawner.clearAllPipes()
        this.bird.reset()
        this.state = GameState.Idle
        this.ui.showIdle()
    }

    public static update(deltaTime: number): void {
        if (this.state === GameState.Dead) {
            this.deathTimer -= deltaTime
        }
    }

    public static dispose(): void {
        this.ui?.dispose()
    }
}
