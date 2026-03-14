# Ads API

## Rewarded Video Ads
```typescript
const isReady = await RundotGameAPI.ads.isRewardedAdReadyAsync()
if (isReady) {
  const rewarded = await RundotGameAPI.ads.showRewardedAdAsync()
  if (rewarded) grantReward()
}
```

## Interstitial Ads
```typescript
await RundotGameAPI.ads.showInterstitialAd()
```

| Method | Return | Purpose |
|--------|--------|---------|
| `isRewardedAdReadyAsync()` | `Promise<boolean>` | Check availability |
| `showRewardedAdAsync(options?)` | `Promise<boolean>` | Show rewarded ad |
| `showInterstitialAd(options?)` | `Promise<boolean>` | Show interstitial |
