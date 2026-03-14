# Sharing API

```typescript
const { shareUrl } = await RundotGameAPI.social.shareLinkAsync({
  shareParams: { challengeType: 'highscore', scoreToBeat: '1500' },
  metadata: { title: 'Beat my score!', description: '...' },
})

const { qrCode } = await RundotGameAPI.social.createQRCodeAsync({
  shareParams: { ... }, qrOptions: { size: 512, format: 'png' }
})

// On launch:
const shareParams = RundotGameAPI.context.shareParams
```
