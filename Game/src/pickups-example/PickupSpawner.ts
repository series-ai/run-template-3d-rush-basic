import { Component, GameObject } from "@series-inc/rundot-3d-engine";
import * as THREE from "three";
import { Pickup } from "./Pickup";
import { PickupSystem } from "./PickupSystem";
import { Instantiation } from "../Instantiation";

export class PickupSpawner extends Component {
    private spawnTimer: number;
    private readonly spawnInterval: number;
    private readonly spawnRadius: number;

    constructor(config?: { spawnInterval?: number, spawnRadius?: number }) {
        super()
        this.spawnInterval = config?.spawnInterval ?? 3
        this.spawnRadius = config?.spawnRadius ?? 5
        this.spawnTimer = this.spawnInterval
    }

    public update(deltaTime: number): void {
        if (PickupSystem.getNumActivePickups() >= 1) return

        this.spawnTimer -= deltaTime

        // Check if we can spawn: have available customer (pool or can create new) and conditions met
        const canSpawn = this.spawnTimer <= 0
        if (canSpawn) {
            this.spawnPickup()
        }
    }

    private spawnPickup(): void {
        this.spawnTimer = this.spawnInterval

        const pickupPrefab = Instantiation.instantiate("pickup")
        if (!pickupPrefab) {
            console.error("Failed to instantiate pickup prefab")
            return
        }

        const spawnPosition = this.chooseSpawnPosition()

        const pickupObject = pickupPrefab.gameObject
        pickupObject.position.set(spawnPosition.x, spawnPosition.y, spawnPosition.z)

        const pickupComponent = new Pickup()
        pickupObject.addComponent(pickupComponent)
        PickupSystem.addActivePickup(pickupComponent)
    }

    private chooseSpawnPosition(): THREE.Vector3 {
        const centerPosition = new THREE.Vector3(0, 0, 0)
        const angle = Math.random() * Math.PI * 2
        
        // Use sqrt for uniform distribution within circle
        const radiusFactor = Math.sqrt(Math.random())
        const radius = radiusFactor * this.spawnRadius
        
        const x = centerPosition.x + Math.cos(angle) * radius
        const z = centerPosition.z + Math.sin(angle) * radius
        const y = 0.5 // Fixed height above ground

        return new THREE.Vector3(x, y, z)
    }
}