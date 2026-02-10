// Entry point for Generic 3D Template
import "./styles/main.css"
import { GenericTemplateGame } from "./GenericTemplateGame"

(async function () {
  console.log("🚀 Starting 3D Template...")

  try {
    // Create and start the game
    const game = await GenericTemplateGame.create()

    // Make game available for debugging in console
    ;(window as any).game = game

    console.log("✅ Template loaded successfully!")
  } catch (error) {
    console.error("❌ Failed to start template:", error)
  }
})()

