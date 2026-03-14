import "./styles/main.css"
import RundotGameAPI from "@series-inc/rundot-game-sdk/api"
import { GenericTemplateGame } from "./GenericTemplateGame"

;(async function () {
    try {
        await RundotGameAPI.preloader.showLoadScreen()
        await RundotGameAPI.preloader.setLoaderProgress(0)

        const game = await GenericTemplateGame.create()
        ;(window as any).game = game
    } catch (error) {
        console.error("Failed to start game:", error)
        try { await RundotGameAPI.preloader.hideLoadScreen() } catch {}
    }
})()
