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
  publicDir: "public",
  plugins: [
    wasm(),
    topLevelAwait(),
  ],
}))

