import { Component, GameObject } from "@series-inc/rundot-3d-engine"
import { Prefabs } from "../Prefabs"
import type { PrefabInstance } from "@series-inc/rundot-3d-engine/systems"
import { FlappyGame, GameState } from "./FlappyGame"
import { SeaweedShader } from "./SeaweedShader"

const TILE_SIZE = 250
const BUFFER_TILES = 2

export class BackgroundScroller extends Component {
    private tiles: { z: number; instance: PrefabInstance }[] = []
    private scrollOffset = 0

    protected onCreate(): void {
        this.spawnTile(0)
        this.spawnTile(TILE_SIZE)
        this.spawnTile(-TILE_SIZE)
    }

    private spawnTile(z: number): void {
        const instance = Prefabs.instantiate("Background")
        instance.gameObject.position.set(25, -15, z)
        instance.gameObject.rotation.y = Math.PI / 2
        this.tiles.push({ z, instance })
        this.applySeaweedShaders(instance)
    }

    private applySeaweedShaders(instance: PrefabInstance): void {
        instance.gameObject.traverse((child) => {
            if (/^seaweed/i.test(child.name) && child instanceof GameObject) {
                child.addComponent(new SeaweedShader())
            }
        })
    }

    private despawnTile(index: number): void {
        this.tiles[index].instance.gameObject.dispose()
        this.tiles.splice(index, 1)
    }

    public update(_deltaTime: number): void {
        if (FlappyGame.getState() !== GameState.Playing) return

        const birdZ = FlappyGame.getBirdZ()

        let frontZ = -Infinity
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].z > frontZ) frontZ = this.tiles[i].z
        }
        if (frontZ < birdZ + TILE_SIZE * BUFFER_TILES) {
            this.spawnTile(frontZ + TILE_SIZE)
        }

        for (let i = this.tiles.length - 1; i >= 0; i--) {
            if (this.tiles[i].z < birdZ - TILE_SIZE * BUFFER_TILES) {
                this.despawnTile(i)
            }
        }
    }

    public reset(): void {
        for (let i = this.tiles.length - 1; i >= 0; i--) {
            this.despawnTile(i)
        }
        this.scrollOffset = 0
        this.spawnTile(0)
        this.spawnTile(TILE_SIZE)
        this.spawnTile(-TILE_SIZE)
    }
}
