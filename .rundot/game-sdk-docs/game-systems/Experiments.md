# Experiments API

```typescript
const experiment = await RundotGameAPI.features.getExperiment('checkout_flow')
const flag = await RundotGameAPI.features.getFeatureFlag('new_ui')
const gate = await RundotGameAPI.features.getFeatureGate('beta_access')
```
Returns `{ name, ruleID, value, groupName }` for experiments, `boolean` for flags/gates.
