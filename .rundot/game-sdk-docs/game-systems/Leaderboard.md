# Leaderboards API (BETA)

## Config (config.json)
```json
{
  "leaderboard": {
    "requiresToken": false,
    "scoreOrder": "highest",
    "minScore": 0,
    "maxScore": 999999999,
    "minDurationSec": 10,
    "maxDurationSec": 3600,
    "modes": { "default": { "displayName": "Normal" } },
    "periods": { "alltime": { "type": "alltime" }, "daily": { "type": "daily" } },
    "antiCheat": { "enableRateLimit": true, "minTimeBetweenSubmissionsSec": 60 }
  }
}
```

## Security Modes

### Simple (default)
```typescript
await RundotGameAPI.leaderboard.submitScore({ score: 1500, duration: 120, metadata: {} })
```

### Token Mode (`requiresToken: true`)
```typescript
const token = await RundotGameAPI.leaderboard.createScoreToken()
await RundotGameAPI.leaderboard.submitScore({ token: token.token, score: 1500, duration: 120 })
```

### Score Sealing (`enableScoreSealing: true`)
Adds HMAC-SHA256 tamper protection. SDK handles crypto automatically.

## Querying
```typescript
const paged = await RundotGameAPI.leaderboard.getPagedScores({ limit: 50, cursor })
const podium = await RundotGameAPI.leaderboard.getPodiumScores({ topCount: 3, contextAhead: 4, contextBehind: 2 })
const rank = await RundotGameAPI.leaderboard.getMyRank()
```

## Multiple Modes
```typescript
await RundotGameAPI.leaderboard.submitScore({ score, duration, mode: 'competitive' })
await RundotGameAPI.leaderboard.getPagedScores({ period: 'daily', limit: 50 })
```
