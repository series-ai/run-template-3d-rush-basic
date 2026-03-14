# Energy System

Auto-restart recipe pattern for energy regeneration with offline catch-up.
See SimulationConfig.md for full recipe configuration details.

## Client
```typescript
const state = await RundotGameAPI.simulation.getStateAsync()
const energy = state.entities['energy_current'] ?? 0
const reqs = await RundotGameAPI.simulation.getRecipeRequirementsAsync('battle_start', 'player', 1)
await RundotGameAPI.simulation.executeRecipeAsync('battle_start')
```
