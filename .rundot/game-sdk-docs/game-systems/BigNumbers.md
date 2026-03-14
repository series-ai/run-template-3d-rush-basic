# Big Numbers API

Built on `break_eternity` for exponential economies.

```typescript
const numbers = RundotGameAPI.numbers
const currency = numbers.normalize('BE:1.23e9')
const display = numbers.format.incremental(currency) // "1.23B"
const cost = numbers.calculateGeometricSeriesCost(baseCost, multiplier, level, qty)
const maxBuy = numbers.calculateMaxAffordableDecimal(cash, baseCost, mult, level)
const { Decimal } = numbers
```
