# Simulation API (BETA)

Server-authoritative game state. Only runs in RUN.game host.

## State
```typescript
const state = await RundotGameAPI.simulation.getStateAsync()
const config = await RundotGameAPI.simulation.getConfigAsync()
await RundotGameAPI.simulation.resetStateAsync()
```

## Recipes
```typescript
await RundotGameAPI.simulation.executeRecipeAsync('craft_sword', { materials })
await RundotGameAPI.simulation.executeScopedRecipeAsync('upgrade', 'item_id', {})
const reqs = await RundotGameAPI.simulation.getRecipeRequirementsAsync(id, scope, qty)
const runs = await RundotGameAPI.simulation.getActiveRunsAsync()
await RundotGameAPI.simulation.collectRecipeAsync(runId)
```

## Subscriptions
```typescript
const unsub = await RundotGameAPI.simulation.subscribeAsync({
  entities: ['gold'], tags: ['currency'], activeRuns: true,
  onUpdate(update) { /* entity | activeRuns | snapshot */ }
})
```
