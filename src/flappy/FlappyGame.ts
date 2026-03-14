import { Component, GameObject } from "@series-inc/rundot-3d-engine"
import { Bird } from "./Bird"
import { PipeSpawner } from "./PipeSpawner"
import { BackgroundScroller } from "./BackgroundScroller"
import { FlappyUI } from "./FlappyUI"
import { Spinner } from "./Spinner"
import { CharacterShader } from "./CharacterShader"

import { Main2DAudioBank, ParticleSystemPrefabComponent, PlayAudioOneShot2D } from "@series-inc/rundot-3d-engine/systems"
import { Prefabs } from "../Prefabs"
import { GenericTemplateGame } from "../GenericTemplateGame"
import RundotGameAPI from "@series-inc/rundot-game-sdk/api"

class FlappyGameUpdater extends Component {
    update(deltaTime: number): void {
        FlappyGame.update(deltaTime)
    }
}

export enum GameState {
    Idle,
    Playing,
    Dead,
}

const SCROLL_SPEED = 5
const BIRD_START_Z = 0
const DEATH_PAUSE = 1.2
const HIT_FREEZE_DURATION = 0.1

export class FlappyGame {
    private static state: GameState = GameState.Idle
    private static score = 0
    private static bestScore = 0
    private static bird: Bird
    private static birdObject: GameObject
    private static bubbleParticles: ParticleSystemPrefabComponent | undefined
    private static spawner: PipeSpawner
    private static backgroundScroller: BackgroundScroller
    private static ui: FlappyUI
    private static deathTimer = 0
    private static hitFreezeTimer = 0
    private static playStartTime = 0
    private static followZ = 0

    private constructor() {
        throw new Error("FlappyGame is a static class")
    }

    public static initialize(): void {
        this.ui = new FlappyUI()
        this.ui.setOnContinue(() => this.restart())

        const characterPrefab = Prefabs.instantiate("character")
        this.birdObject = characterPrefab.gameObject
        this.birdObject.rotation.y = -0.4
        this.bird = new Bird()
        this.birdObject.addComponent(this.bird)

        const bubbles = Prefabs.instantiate("bubbles_vfx", this.birdObject)
        bubbles.gameObject.position.set(0, -0.5, -1.5)
        bubbles.gameObject.rotation.set(0, 0, 0)
        this.bubbleParticles = bubbles.getComponent(ParticleSystemPrefabComponent)
        this.bubbleParticles?.play()

        const botInstance = characterPrefab.getChildByName("bot")
        if (botInstance) {
            botInstance.gameObject.addComponent(new CharacterShader({ fresnelScale: 0.4, underLightScale: 0.5 }))

            const keyInstance = botInstance.getChildByName("key")
            if (keyInstance) {
                keyInstance.gameObject.addComponent(new Spinner("z", 8))
            }
        }

        const spawnerObject = new GameObject("PipeSpawner")
        this.spawner = new PipeSpawner()
        spawnerObject.addComponent(this.spawner)

        const bgObject = new GameObject("BackgroundScroller")
        this.backgroundScroller = new BackgroundScroller()
        bgObject.addComponent(this.backgroundScroller)

        const updaterObject = new GameObject("FlappyGameUpdater")
        updaterObject.addComponent(new FlappyGameUpdater())

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
        this.playStartTime = performance.now()
        this.ui.showPlaying()
        this.ui.updateScore(0)

        this.startAmbienceLoops()

        if (!this.musicStarted) {
            this.musicStarted = true
            this.onFirstStart?.()
        }
    }

    private static startAmbienceLoops(): void {
        const bubble = Main2DAudioBank["bubble_ambience"]
        if (bubble && !bubble.isPlaying) {
            bubble.setLoop(true)
            bubble.play()
        }
    }

    private static stopAmbienceLoops(): void {
        const bubble = Main2DAudioBank["bubble_ambience"]
        if (bubble?.isPlaying) bubble.stop()
    }

    public static addScore(): void {
        this.score++
        this.ui.updateScore(this.score)
    }

    public static die(): void {
        if (this.state !== GameState.Playing) return
        this.state = GameState.Dead
        this.deathTimer = DEATH_PAUSE
        this.hitFreezeTimer = HIT_FREEZE_DURATION
        this.stopAmbienceLoops()
        PlayAudioOneShot2D(Main2DAudioBank, "death")
        if (this.score > this.bestScore) this.bestScore = this.score

        this.bird.deathKick()

        const cam = GenericTemplateGame.getInstance().getCamera()
        cam?.shake(0.8, 0.4)

        this.ui.flashScreen()
        this.ui.showDead(this.score, this.bestScore)

        setTimeout(() => this.submitAndShowLeaderboard(), 1200)
    }

    private static async submitAndShowLeaderboard(): Promise<void> {
        if (import.meta.env.DEV) {
            this.showDummyLeaderboard()
            return
        }

        const duration = Math.round((performance.now() - this.playStartTime) / 1000)
        const profile = RundotGameAPI.getProfile()

        try {
            const existingRank = await RundotGameAPI.leaderboard.getMyRank()
            const existingScore = existingRank?.score ?? 0
            if (existingScore > this.bestScore) this.bestScore = existingScore

            if (this.score > 0 && this.score > existingScore && profile.username) {
                await RundotGameAPI.leaderboard.submitScore({
                    score: this.score,
                    duration: Math.max(duration, 10),
                    metadata: { username: profile.username },
                })
            }
        } catch (e) {
            console.warn("Leaderboard submit failed:", e)
        }

        if (this.score > this.bestScore) this.bestScore = this.score
        this.ui.showDead(this.score, this.bestScore)

        try {
            const scores = await RundotGameAPI.leaderboard.getPagedScores({ limit: 10 })
            const rankResult = await RundotGameAPI.leaderboard.getMyRank()
            const rankNumber = rankResult?.rank ?? null
            this.ui.showLeaderboard(scores, rankNumber, profile.username)
        } catch (e) {
            console.warn("Leaderboard fetch failed:", e)
            this.ui.showLeaderboard(null, null, profile.username)
        }
    }



    private static showDummyLeaderboard(): void {
        const names = [
            "AquaKing", "CoralQueen", "DeepDiver", "ShellMaster", "TideRider",
            "BubbleFish", "ReefRunner", "WaveBreaker", "PearlHunter", "SeaStorm",
            "KelpKnight", "DolphinDash", "OceanBlitz", "SandShark", "TrenchLord",
        ]
        const dummyScores = names
            .map((name, i) => ({
                rank: i + 1,
                score: Math.max(1, 80 - i * 5 + Math.floor(Math.random() * 6)),
                metadata: { username: name },
            }))
            .sort((a, b) => b.score - a.score)
            .map((entry, i) => ({ ...entry, rank: i + 1 }))

        const myRank = dummyScores.findIndex(e => e.score <= this.score) + 1 || dummyScores.length + 1
        const myEntry = { rank: myRank, score: this.score, metadata: { username: "You" } }

        dummyScores.splice(myRank - 1, 0, myEntry)
        for (let i = myRank; i < dummyScores.length; i++) {
            dummyScores[i].rank = i + 1
        }

        const podium = { topScores: dummyScores }
        this.ui.showLeaderboard(podium, myRank, "You")
    }

    public static restart(): void {
        if (this.state !== GameState.Dead) return
        if (this.deathTimer > 0) return

        this.spawner.clearAllPipes()
        this.backgroundScroller.reset()
        this.bird.reset()
        this.birdObject.position.set(0, 0, 0)
        this.birdObject.rotation.set(0, -0.4, 0)
        this.followZ = 0
        this.deathTimer = 0
        this.hitFreezeTimer = 0
        this.bubbleParticles?.play()

        this.state = GameState.Idle
        this.ui.showIdle()
    }

    public static getPipes() {
        return this.spawner.getPipes()
    }

    public static isHitFrozen(): boolean {
        return this.hitFreezeTimer > 0
    }

    public static getBirdZ(): number {
        return this.birdObject.position.z
    }

    public static getFollowZ(): number {
        return this.followZ
    }

    public static update(deltaTime: number): void {
        if (this.state === GameState.Playing) {
            this.birdObject.position.z += SCROLL_SPEED * deltaTime
            this.followZ = this.birdObject.position.z
        }

        if (this.state === GameState.Dead) {
            if (this.hitFreezeTimer > 0) {
                this.hitFreezeTimer -= deltaTime
                return
            }
            this.deathTimer -= deltaTime
        }
    }

    public static dispose(): void {
        this.ui?.dispose()
    }
}
