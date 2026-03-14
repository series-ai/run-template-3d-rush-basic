# Assets API

Assets in `public/cdn-assets/` are served via CDN.

```typescript
const blob = await RundotGameAPI.cdn.fetchAsset('images/logo.png')
const url = URL.createObjectURL(blob)
```

| Method | Returns | Purpose |
|--------|---------|---------|
| `cdn.fetchAsset(path, options?)` | `Promise<Blob>` | Fetch asset |
| `cdn.getAssetCdnBaseUrl()` | `string` | Get CDN base URL |
