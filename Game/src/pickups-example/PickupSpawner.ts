import { Component, GameObject } from "@series-inc/rundot-3d-engine";
import * as THREE from "three";
import { Pickup } from "./Pickup";
import { PickupSystem } from "./PickupSystem";
import { Prefabs } from "../Prefabs";
import { GenericTemplateGame } from "../GenericTemplateGame";

export class PickupSpawner extends Component {
    private spawnTimer: number;
    private readonly spawnInterval: number;
    private readonly insetFraction: number;

    constructor(config?: { spawnInterval?: number, insetFraction?: number }) {
        super()
        this.spawnInterval = config?.spawnInterval ?? 3
        this.insetFraction = config?.insetFraction ?? 0.15
        this.spawnTimer = this.spawnInterval
    }

    public update(deltaTime: number): void {
        if (PickupSystem.getNumActivePickups() >= 1) return

        this.spawnTimer -= deltaTime

        if (this.spawnTimer <= 0) {
            this.spawnPickup()
        }
    }

    private spawnPickup(): void {
        this.spawnTimer = this.spawnInterval

        const pickupPrefab = Prefabs.instantiate("pickup")

        const spawnPosition = this.chooseSpawnPosition()

        const pickupObject = pickupPrefab.gameObject
        pickupObject.position.set(spawnPosition.x, spawnPosition.y, spawnPosition.z)

        const pickupComponent = new Pickup()
        pickupObject.addComponent(pickupComponent)
        PickupSystem.addActivePickup(pickupComponent)
    }

    /**
     * Projects the camera frustum onto the ground plane (y=0) and picks
     * a random point inside the visible rectangle, inset by a configurable margin.
     */
    private chooseSpawnPosition(): THREE.Vector3 {
        const camera = GenericTemplateGame.getInstance().getCamera()?.getCamera()
        if (!camera) {
            return new THREE.Vector3(0, 0.5, 0)
        }

        const bounds = this.getVisibleGroundBounds(camera)

        const insetX = (bounds.maxX - bounds.minX) * this.insetFraction
        const insetZ = (bounds.maxZ - bounds.minZ) * this.insetFraction

        const x = THREE.MathUtils.lerp(
            bounds.minX + insetX,
            bounds.maxX - insetX,
            Math.random()
        )
        const z = THREE.MathUtils.lerp(
            bounds.minZ + insetZ,
            bounds.maxZ - insetZ,
            Math.random()
        )

        return new THREE.Vector3(x, 0.5, z)
    }

    private getVisibleGroundBounds(camera: THREE.PerspectiveCamera): {
        minX: number; maxX: number; minZ: number; maxZ: number
    } {
        camera.updateMatrixWorld()
        camera.updateProjectionMatrix()

        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
        const raycaster = new THREE.Raycaster()
        const corners = [
            new THREE.Vector2(-1, -1),
            new THREE.Vector2(1, -1),
            new THREE.Vector2(-1, 1),
            new THREE.Vector2(1, 1),
        ]

        let minX = Infinity, maxX = -Infinity
        let minZ = Infinity, maxZ = -Infinity
        const hitPoint = new THREE.Vector3()

        for (const ndc of corners) {
            raycaster.setFromCamera(ndc, camera)
            const ray = raycaster.ray
            if (ray.intersectPlane(groundPlane, hitPoint)) {
                minX = Math.min(minX, hitPoint.x)
                maxX = Math.max(maxX, hitPoint.x)
                minZ = Math.min(minZ, hitPoint.z)
                maxZ = Math.max(maxZ, hitPoint.z)
            }
        }

        if (!isFinite(minX)) {
            return { minX: -3, maxX: 3, minZ: -3, maxZ: 3 }
        }

        return { minX, maxX, minZ, maxZ }
    }
}