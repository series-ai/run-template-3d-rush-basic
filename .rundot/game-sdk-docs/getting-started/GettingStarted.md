# Getting Started

## Prerequisites
- Node.js 20+

## Install CLI
macOS/Linux: `curl -fsSL https://github.com/series-ai/rundot-cli-releases/releases/latest/download/install.sh | bash`
Windows: `irm https://github.com/series-ai/rundot-cli-releases/releases/latest/download/install.ps1 | iex`

## Install SDK
```bash
npm install @series-inc/rundot-game-sdk@latest
```

## Initialize
```typescript
import { default as RundotGameAPI } from '@series-inc/rundot-game-sdk/api'
await RundotGameAPI.initializeAsync()
```

## Deploy
```bash
rundot init  # generates game.config.json
npm run build
rundot deploy
```
