# Notifications API

## Methods
- `scheduleAsync(title, body, delaySec, customId?, metadata?)` → notification ID
- `cancelNotification(id)` - Cancel by ID
- `getAllScheduledLocalNotifications()` - List pending
- `isLocalNotificationsEnabled()` - Check permission
- `setLocalNotificationsEnabled(enabled)` - Toggle permissions
