# Storage API

Scopes: deviceCache, appStorage, globalStorage, storage (alias for appStorage)

```typescript
await RundotGameAPI.appStorage.setItem('key', JSON.stringify(data))
const val = await RundotGameAPI.appStorage.getItem('key')
await RundotGameAPI.appStorage.removeItem('key')
await RundotGameAPI.appStorage.clear()
// Also: setMultipleItems, removeMultipleItems, getAllItems
```
