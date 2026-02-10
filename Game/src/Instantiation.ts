import { RundotGameAPI } from "@series-ai/rundot-3d-engine"
import { PrefabCollection, PrefabInstance, PrefabLoader, StowKitSystem } from "@series-ai/rundot-3d-engine/systems"

export class Instantiation {
    private static prefabCollection?: PrefabCollection

    // Prevent instantiation
    private constructor() {
        throw new Error("Instantiation is a static class and cannot be instantiated")
    }

    public static async initialize() {
        const stowkit = StowKitSystem.getInstance()

        // Load everything from build.json - this auto-loads all packs from prefab mounts
        const buildJson = (await import("../prefabs/build.json")).default
        this.prefabCollection = await stowkit.loadFromBuildJson(buildJson, {
            fetchBlob: (path) => RundotGameAPI.cdn.fetchAsset(path)
        })
    }

    public static instantiate(prefabPath: string): PrefabInstance | null {
        const prefab = this.prefabCollection?.getPrefabByName(prefabPath)
        if (!prefab) {
            throw new Error(`Prefab not found: ${prefabPath}`)
        }
        return PrefabLoader.instantiatePrefab(prefab)
    }
}