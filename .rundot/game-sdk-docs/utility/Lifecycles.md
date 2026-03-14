# Lifecycles API

```typescript
RundotGameAPI.lifecycles.onPause(() => { /* halt loops, silence audio */ })
RundotGameAPI.lifecycles.onResume(() => { /* restart loops */ })
RundotGameAPI.lifecycles.onSleep(() => { /* save progress */ })
RundotGameAPI.lifecycles.onAwake(() => { /* refresh state */ })
RundotGameAPI.lifecycles.onQuit(() => { /* final save */ })
```
