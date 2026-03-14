# Multiplayer API (BETA)

## Config
```json
{ "rooms": { "game-type": { "minPlayers": 2, "maxPlayers": 4 } } }
```

## Room Operations
```typescript
const room = await RundotGameAPI.rooms.createRoomAsync({ maxPlayers: 4, gameType: 'chess' })
const result = await RundotGameAPI.rooms.joinOrCreateRoomAsync({ matchCriteria, createOptions })
const room = await RundotGameAPI.rooms.joinRoomByCodeAsync('ABC123')
const rooms = await RundotGameAPI.rooms.getUserRoomsAsync({ includeArchived: false })
```

## Subscriptions
```typescript
const unsub = await RundotGameAPI.rooms.subscribeAsync(room, { onData, onMessages, onGameEvents })
```

## Moves
```typescript
await RundotGameAPI.rooms.proposeMoveAsync(room, { moveType, gameSpecificState })
```

## Lifecycle Phases: waiting → playing → ended
