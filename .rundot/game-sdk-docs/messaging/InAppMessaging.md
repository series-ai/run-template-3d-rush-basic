# In-App Messaging API

## Toast Notifications
```typescript
await RundotGameAPI.popups.showToast('Progress saved!')
const tapped = await RundotGameAPI.popups.showToast('Item purchased!', {
  duration: 3000,
  variant: 'success', // success | error | warning | info
  action: { label: 'View' },
})
if (tapped) openInventory()
```
