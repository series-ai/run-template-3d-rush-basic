import { Component, GameObject } from "@series-inc/rundot-3d-engine"
import * as THREE from "three"
import { PickupSystem } from "./PickupSystem"
import { Easing, TweenSystem } from "@series-inc/rundot-3d-engine/systems"

export class Pickup extends Component {
    private elapsedTime: number = 0
    private initialY: number = 0
    private raycaster: THREE.Raycaster = new THREE.Raycaster()
    private mouse: THREE.Vector2 = new THREE.Vector2()
    private camera: THREE.Camera | null = null
    private clickableMesh: THREE.Mesh | null = null
    private boundOnClick: (event: MouseEvent) => void
    private boundOnTouch: (event: TouchEvent) => void
    private wasClicked: boolean = false
    private tweenScale: number = 1.0

    constructor() {
        super()
        this.boundOnClick = this.onClick.bind(this)
        this.boundOnTouch = this.onTouchStart.bind(this)
    }

    protected onCreate(): void {
        this.initialY = this.gameObject.position.y
        this.createClickableMesh()
        this.setupClickHandler()
    }

    public destroy(): void {
        this.gameObject.removeFromParent()
        this.gameObject.dispose()
    }

    public update(deltaTime: number): void {
        this.elapsedTime += deltaTime

        // Bob up and down using sine wave
        const bobSpeed = 2.0 // How fast it bobs
        const bobHeight = 0.3 // How high it bobs (in units)
        const bobOffset = Math.sin(this.elapsedTime * bobSpeed) * bobHeight
        this.gameObject.position.y = this.initialY + bobOffset

        // Rotate around Y axis for an enticing spin
        const rotationSpeed = 1.5 // Radians per second
        this.gameObject.rotation.y += rotationSpeed * deltaTime
    }

    private createClickableMesh(): void {
        // Create an invisible box geometry for click detection
        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)
        
        // Create material - invisible by default
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0, // Invisible
            wireframe: false,
        })
        
        this.clickableMesh = new THREE.Mesh(geometry, material)
        this.clickableMesh.name = "PickupClickZone"
        
        // Add to the GameObject
        this.gameObject.add(this.clickableMesh)
    }

    private setupClickHandler(): void {
        // Get the camera from the scene
        this.camera = this.findCamera()
        
        // Add click event listener for desktop
        document.addEventListener("click", this.boundOnClick)
        
        // Add touch event listener for mobile (iOS/Android)
        document.addEventListener("touchstart", this.boundOnTouch)
    }

    private findCamera(): THREE.Camera | null {
        // Traverse up to find the scene and then find the camera
        let current: THREE.Object3D | null = this.gameObject
        while (current && !(current instanceof THREE.Scene)) {
            current = current.parent
        }
        
        if (current instanceof THREE.Scene) {
            // Find camera in the scene
            let foundCamera: THREE.Camera | null = null
            current.traverse((obj) => {
                if (obj instanceof THREE.Camera && !foundCamera) {
                    foundCamera = obj
                }
            })
            return foundCamera
        }
        
        return null
    }

    private onClick(event: MouseEvent): void {
        if (!this.camera || !this.clickableMesh) {
            return
        }

        // Calculate mouse position in normalized device coordinates (-1 to +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

        this.checkRaycastHit()
    }

    private onTouchStart(event: TouchEvent): void {
        if (!this.camera || !this.clickableMesh) {
            return
        }

        // Only handle the first touch
        if (event.touches.length > 0) {
            const touch = event.touches[0]
            
            // Calculate touch position in normalized device coordinates (-1 to +1)
            this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1
            this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1

            this.checkRaycastHit()
        }
    }

    private checkRaycastHit(): void {
        if (!this.camera || !this.clickableMesh) {
            return
        }

        // Update the raycaster with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera)

        // Check for intersections with the clickable mesh only
        const intersects = this.raycaster.intersectObject(this.clickableMesh, false)

        if (intersects.length > 0) {
            // Pickup was clicked/tapped!
            this.onPickupClicked()
        }
    }

    private onPickupClicked(): void {
        if (this.wasClicked) {
            return
        }

        this.wasClicked = true
        this.quickPopTween()
    }

    protected onCleanup(): void {
        // Remove event listeners
        document.removeEventListener("click", this.boundOnClick)
        document.removeEventListener("touchstart", this.boundOnTouch)
        
        // Clean up clickable mesh
        if (this.clickableMesh) {
            this.clickableMesh.geometry.dispose()
            if (this.clickableMesh.material instanceof THREE.Material) {
                this.clickableMesh.material.dispose()
            }
            this.gameObject.remove(this.clickableMesh)
            this.clickableMesh = null
        }
    }
    
    public quickPopTween(
        popTarget: number = 1.35,
        popDuration: number = 0.12,
        fadeDuration: number = 0.3
    ): void {
        this.tweenScale = 1.0
        this.gameObject.scale.set(this.tweenScale, this.tweenScale, this.tweenScale)
        
        // Set up initial tween using local value
        const popTween = TweenSystem.tween(
            this,
            "tweenScale",
            popTarget,
            popDuration,
            (t: number) => Easing.easeOutQuad(t)
        )
        // Local value is read and then used to set game object scale
        popTween.onUpdated((value: number) => {
            this.gameObject.scale.set(value, value, value)
        })

        // Once initial pop tween is complete, repeat the process with a scale down fade tween
        popTween.onCompleted(() => {
            // Fade down to 0 scale
            const fadeTween = TweenSystem.tween(
                this,
                "tweenScale",
                0,
                fadeDuration,
                (t: number) => Easing.easeInOutQuad(t)
            )

            fadeTween.onUpdated((value: number) => {
                this.gameObject.scale.set(value, value, value)
            })

            fadeTween.onCompleted(() => {
                this.tweenScale = 0
                this.gameObject.scale.set(0, 0, 0)
                PickupSystem.removeActivePickup(this)
                this.destroy()
            })
        })
    }
}