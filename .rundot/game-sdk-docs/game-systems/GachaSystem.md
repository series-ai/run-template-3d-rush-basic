# Gacha System

Randomized loot with weighted tables, pity mechanics, and new-item bias.
See SimulationConfig.md for loot table configuration.

## Client
```typescript
await RundotGameAPI.simulation.executeRecipeAsync('open_pack_common')
const config = await RundotGameAPI.simulation.getConfigAsync()
// config.lootTables for drop rate display
```
