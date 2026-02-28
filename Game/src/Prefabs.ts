import RundotGameAPI from "@series-inc/rundot-game-sdk/api"
import { PrefabCollection, PrefabLoader, StowKitSystem } from "@series-inc/rundot-3d-engine/systems"

export class Prefabs {
    private static collection: PrefabCollection

    private constructor() {
        throw new Error("Prefabs is a static class and cannot be instantiated")
    }

    public static async initialize() {
        const stowkit = StowKitSystem.getInstance()

        const buildJson = (await import("../prefabs/build.json")).default
        this.collection = await stowkit.loadFromBuildJson(buildJson, {
            fetchBlob: (path) => RundotGameAPI.cdn.fetchAsset(path)
        })
    }

    public static instantiate(name: string) {
        const prefab = this.collection.getPrefabByName(name)
        if (!prefab) {
            throw new Error(`Prefab not found: ${name}`)
        }
        return PrefabLoader.instantiatePrefab(prefab)
    }
}
