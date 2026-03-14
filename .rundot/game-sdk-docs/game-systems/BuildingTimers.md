# Building Timers

Entity-scoped recipes for upgrades, crafting, passive generation.
See SimulationConfig.md for recipe configuration.

## Client
```typescript
await RundotGameAPI.simulation.executeScopedRecipeAsync('upgrade_building', buildingId)
const runs = await RundotGameAPI.simulation.getActiveRunsAsync()
await RundotGameAPI.simulation.collectRecipeAsync(runId)
```
