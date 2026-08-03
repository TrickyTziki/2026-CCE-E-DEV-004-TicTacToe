# Tic-Tac-Toe

A React application backed by a framework-independent Tic-Tac-Toe domain.

## Workspace

- `apps/web` contains the React interface.
- `packages/game-core` contains the game rules and their unit tests.

`game-core` is a private source workspace rather than a published package. Its
public API is exposed through `src/index.ts`, consumed directly by Vite, and
verified independently through strict type-checking and unit tests.
