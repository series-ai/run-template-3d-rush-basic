# Simulation Config Reference (BETA)

Config in `config.json` or `config/` directory with `"simulation"` top-level key.

## Entities
Atomic game state units with: tags, stackable, clientViewable, neverConsumable, requiresManualCollection, metadata.

## Recipes
Server-authoritative actions. Types: instant (duration:0), timed, auto-restart.
Fields: duration, scope, inputs, outputs, guards, beginEffects, endEffects, concurrency, trigger.

## Loot Tables
Types: weighted (explicit weights), uniform (tag-based auto-include), guaranteed (fixed drops).
Features: table chaining, new-item bias, pity systems, wildcard conversion.

## Effects: set, add, trigger_recipe, trigger_recipes_parallel, disable_recipe, assign_to_slot, send_notification

## Concurrency: "single", "global:<key>", "cooldown:<key>"

## Lifecycle: onStart hook for player initialization
