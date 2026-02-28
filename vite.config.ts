import { defineConfig } from "vite"
import wasm from "vite-plugin-wasm"
import topLevelAwait from "vite-plugin-top-level-await"
import path from "path"

export default defineConfig(() => ({
  // Use relative paths - works everywhere including GitHub Pages
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./Game/src"),
      "@capacitor/core": path.resolve(__dirname, "./stubs/capacitor.ts"),
      "@capacitor/app": path.resolve(__dirname, "./stubs/capacitor.ts"),
      "@capacitor/local-notifications": path.resolve(__dirname, "./stubs/capacitor.ts"),
      "@capacitor/preferences": path.resolve(__dirname, "./stubs/capacitor.ts"),
      "@capacitor/splash-screen": path.resolve(__dirname, "./stubs/capacitor.ts"),
    },
  },
  optimizeDeps: {
    exclude: ["@dimforge/rapier3d"],
  },
  server: {
    port: 3033,
    host: "0.0.0.0",
    allowedHosts: true
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    target: "esnext",
    sourcemap: false,
  },
  publicDir: "Game/public",
  plugins: [
    wasm(),
    topLevelAwait(),
  ],
}))

