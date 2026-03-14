# AI API

## Text
```typescript
await RundotGameAPI.ai.requestChatCompletionAsync({ model: 'gpt-4o-mini', maxTokens, temperature, messages })
const models = await RundotGameAPI.ai.getAvailableCompletionModels()
```

## Image
```typescript
await RundotGameAPI.ai.generateImageAsync({ prompt, negativePrompt, aspectRatio, model: 'nano-banana-2' })
```
