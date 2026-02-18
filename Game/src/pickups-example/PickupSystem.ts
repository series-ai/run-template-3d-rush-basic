import { Pickup } from "./Pickup"
import { PickupTextUI } from "./PickupTextUI"
import { PickupSpawner } from "./PickupSpawner"
import { GameObject } from "@series-inc/rundot-3d-engine"

export class PickupSystem {
    private static activePickups: Set<Pickup> = new Set<Pickup>()
    private static pickupTextUI: PickupTextUI | null = null
    private static spawnerObject: GameObject | null = null
    private static isInitialized: boolean = false

    // Prevent instantiation
    private constructor() {
        throw new Error("PickupSystem is a static class and cannot be instantiated")
    }

    /**
     * Initialize the pickup system (must be called before use)
     */
    public static initialize(): void {
        if (this.isInitialized) {
            console.warn("PickupSystem already initialized")
            return
        }
        
        // Create the pickup text UI
        this.pickupTextUI = new PickupTextUI()
        
        // Create spawner GameObject
        this.spawnerObject = new GameObject("PickupSpawner")
        
        // Add spawner component with configuration
        const spawner = new PickupSpawner({
            spawnInterval: 1,
            spawnRadius: 8
        })
        this.spawnerObject.addComponent(spawner)
        
        this.isInitialized = true
        console.log("✅ Pickup system initialized")
    }

    public static getNumActivePickups(): number {
        return this.activePickups.size
    }

    public static addActivePickup(pickup: Pickup): void {
        this.activePickups.add(pickup)
    }

    public static removeActivePickup(pickup: Pickup): void {
        this.activePickups.delete(pickup)
    }

    /**
     * Get the pickup text UI instance
     */
    public static getPickupTextUI(): PickupTextUI | null {
        return this.pickupTextUI
    }

    /**
     * Cleanup the pickup system
     */
    public static dispose(): void {
        if (this.pickupTextUI) {
            this.pickupTextUI.dispose()
            this.pickupTextUI = null
        }
        if (this.spawnerObject) {
            this.spawnerObject.dispose()
            this.spawnerObject = null
        }
        this.activePickups.clear()
    }
}