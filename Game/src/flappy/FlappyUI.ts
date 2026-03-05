export class FlappyUI {
    private scoreElement: HTMLElement
    private overlayElement: HTMLElement
    private overlayText: HTMLElement

    constructor() {
        this.scoreElement = this.createScoreElement()
        const { overlay, text } = this.createOverlay()
        this.overlayElement = overlay
        this.overlayText = text

        document.body.appendChild(this.scoreElement)
        document.body.appendChild(this.overlayElement)

        this.showIdle()
    }

    private createScoreElement(): HTMLElement {
        const el = document.createElement("div")
        Object.assign(el.style, {
            position: "fixed",
            top: "8%",
            left: "50%",
            transform: "translateX(-50%)",
            color: "white",
            fontSize: "64px",
            fontWeight: "900",
            fontFamily: "'Segoe UI', sans-serif",
            textShadow: "3px 3px 0 #000, -1px -1px 0 #000",
            pointerEvents: "none",
            zIndex: "100",
            letterSpacing: "2px",
        })
        el.textContent = "0"
        return el
    }

    private createOverlay(): { overlay: HTMLElement; text: HTMLElement } {
        const overlay = document.createElement("div")
        Object.assign(overlay.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: "101",
        })

        const text = document.createElement("div")
        Object.assign(text.style, {
            color: "white",
            fontSize: "28px",
            fontWeight: "bold",
            fontFamily: "'Segoe UI', sans-serif",
            textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
            textAlign: "center",
            lineHeight: "1.6",
        })

        overlay.appendChild(text)
        return { overlay, text }
    }

    private isMobile(): boolean {
        return "ontouchstart" in window || navigator.maxTouchPoints > 0
    }

    public showIdle(): void {
        this.scoreElement.style.display = "none"
        this.overlayElement.style.display = "flex"
        const tapOrClick = this.isMobile() ? "Tap" : "Click or press Space"
        this.overlayText.textContent = `${tapOrClick} to start!`
    }

    public showPlaying(): void {
        this.scoreElement.style.display = "block"
        this.overlayElement.style.display = "none"
    }

    public showDead(score: number, best: number): void {
        this.overlayElement.style.display = "flex"
        const tapOrClick = this.isMobile() ? "Tap" : "Click or press Space"
        this.overlayText.innerHTML =
            `Game Over<br>` +
            `<span style="font-size:48px;font-weight:900">${score}</span><br>` +
            `Best: ${best}<br><br>` +
            `<span style="font-size:20px">${tapOrClick} to retry</span>`
    }

    public updateScore(score: number): void {
        this.scoreElement.textContent = String(score)
    }

    public dispose(): void {
        this.scoreElement.remove()
        this.overlayElement.remove()
    }
}
