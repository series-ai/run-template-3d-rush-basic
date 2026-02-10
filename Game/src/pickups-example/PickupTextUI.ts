/**
 * Simple UI component to display pickup instructions
 * Beginner-friendly example of creating screen UI
 */
export class PickupTextUI {
    private element: HTMLElement | null = null

    constructor() {
        this.createUI()
    }

    /**
     * Detect if the device is mobile (iOS/Android) or desktop
     */
    private isMobileDevice(): boolean {
        return (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent,
            ) ||
            "ontouchstart" in window ||
            navigator.maxTouchPoints > 0
        )
    }

    /**
     * Get the appropriate instruction text based on platform
     */
    private getInstructionText(): string {
        return this.isMobileDevice() 
            ? "Tap the pickups!" 
            : "Click the pickups!"
    }

    /**
     * Create the UI element
     */
    private createUI(): void {
        // Create a div element
        this.element = document.createElement("div")

        // Set the text content based on platform
        this.element.textContent = this.getInstructionText()

        // Add simple inline styles
        this.element.style.position = "fixed"
        this.element.style.top = "15%"
        this.element.style.left = "50%"
        this.element.style.transform = "translateX(-50%)"
        this.element.style.color = "white"
        this.element.style.fontSize = "24px"
        this.element.style.fontWeight = "bold"
        this.element.style.textShadow = "2px 2px 4px black"
        this.element.style.pointerEvents = "none"

        // Add to the page
        document.body.appendChild(this.element)
    }

    /**
     * Show the UI element
     */
    public show(): void {
        if (this.element) {
            this.element.style.display = "block"
        }
    }

    /**
     * Hide the UI element
     */
    public hide(): void {
        if (this.element) {
            this.element.style.display = "none"
        }
    }

    /**
     * Remove the UI element completely
     */
    public dispose(): void {
        if (this.element) {
            this.element.remove()
            this.element = null
        }
    }
}