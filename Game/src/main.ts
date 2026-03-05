import "./styles/main.css"
import { GenericTemplateGame } from "./GenericTemplateGame"

;(async function () {
    try {
        const game = await GenericTemplateGame.create()
        ;(window as any).game = game
    } catch (error) {
        console.error("Failed to start game:", error)
    }
})()
