# Embedded Libraries

Vite plugin externalizes supported libs from bundle:
```typescript
import { rundotGameLibrariesPlugin } from '@series-inc/rundot-game-sdk/vite'
export default defineConfig({ plugins: [rundotGameLibrariesPlugin()] })
```
Supported: Phaser 3.90.0, React 18.3.1/19.2.4, Three.js 0.170.0/0.183.2, Matter.js 0.19.0, Ink.js 2.2.0/2.3.2, Zustand 5.0.3
