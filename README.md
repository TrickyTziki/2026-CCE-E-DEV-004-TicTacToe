# Tic-Tac-Toe

A local two-player Tic-Tac-Toe game built with React and TypeScript. The
interface is backed by a framework-independent game engine developed in small,
test-driven increments.

## Quick start

### Requirements

- Node.js 24
- npm 11

The supported versions are declared in the root `package.json`.

### Install and run

```bash
npm ci
npm run dev
```

Vite prints the local application URL when the development server starts.

### Production build

```bash
npm run build
```

The deployable application is generated in `apps/web/dist`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the React application in development mode |
| `npm test` | Run all domain and interface tests once |
| `npm run lint` | Check all source code with ESLint |
| `npm run typecheck` | Run strict TypeScript checks without emitting files |
| `npm run build` | Type-check and create the production application |

To work on one test suite in watch mode, target its workspace directly:

```bash
npm run test:watch --workspace=@tictactoe/game-core
npm run test:watch --workspace=@tictactoe/web
```

## Rules

- X always plays first.
- Players alternate placing X and O on empty cells.
- A player wins by completing a row, column, or diagonal.
- The game is a draw when all nine cells are occupied without a winner.
- Occupied cells cannot be played again.
- No moves are accepted after a win or draw.

## Architecture

The repository is an npm workspace with two focused packages:

```text
.
|-- apps/
|   `-- web/                 React interface and interaction tests
|-- packages/
|   `-- game-core/           Pure game rules and domain tests
|-- .github/workflows/       Automated quality checks
|-- eslint.config.js         Shared lint configuration
|-- package.json             Workspace scripts and toolchain
`-- tsconfig.base.json       Shared strict TypeScript configuration
```

### Game core

`packages/game-core` owns every game rule. Its public API consists of two main
operations:

- `createGame()` creates the initial state with an empty board and X to play.
- `playMove(game, position)` applies or rejects a move and returns the resulting
  state.

The state is immutable. A legal move creates a new game and board; a rejected
move returns the original game unchanged. Expected rule violations are modeled
as explicit results instead of exceptions:

- `occupied`
- `invalid-position`
- `game-over`

Game progress is represented by a discriminated status union: `playing`, `won`,
or `draw`. A won game also records its winning line so consumers do not need to
recalculate domain information.

The package is private and consumed directly from source through its
`src/index.ts` boundary. A separate published package build would add complexity
without benefiting this application.

### React application

`apps/web` owns presentation and user interaction only. React stores the current
immutable `Game`, delegates moves to `game-core`, and renders the returned state.
It does not duplicate winning, draw, turn, or validation logic.

No router, global state library, component framework, or backend is needed for a
single local game. Keeping those concerns out makes the rule boundary and data
flow easier to understand and test.

## Testing strategy

The project contains 33 automated tests:

| Layer | Tests | Focus |
| --- | ---: | --- |
| Game core | 27 | Rules, state transitions, immutability, and edge cases |
| React interface | 6 | Accessible interaction and complete user flows |

The domain suite covers:

- X starting and players alternating correctly
- Legal moves without mutation of previous state
- Occupied cells
- Negative, out-of-range, fractional, `NaN`, and infinite positions
- All three rows, all three columns, and both diagonals
- Wins by either player
- Interrupted and incomplete lines without false positives
- Draws and wins completed on the ninth move
- Attempts to play after a win or draw

The interface suite covers mouse and keyboard play, accessible cell names,
turn changes, disabled states, winner and draw announcements, and starting a new
game.

Tests were introduced before their corresponding behavior. The commit history
keeps those red and green steps separate so the design process remains visible
to reviewers.

## Accessibility and interface behavior

- Every cell is a native button with its row, column, and current value in its
  accessible name.
- The board has a descriptive group label.
- Turn and result changes are announced through a live status region.
- Occupied cells and completed boards are disabled.
- Keyboard focus is clearly visible, and native Enter/Space activation works.
- The layout adapts to smaller screens and respects reduced-motion preferences.
- Winning cells are highlighted without relying on color to communicate the
  result; the text announcement remains the primary status.

## Continuous integration

GitHub Actions runs on every pull request and every push to `main`. The workflow
uses the committed lockfile and executes the same quality gates available
locally:

1. Install dependencies with `npm ci`.
2. Lint the source.
3. Run strict type-checking.
4. Run all tests.
5. Build the production application.

## Design decisions

- **Pure rules:** the engine has no React or browser dependency, so rule tests
  stay fast and deterministic.
- **Immutable state:** every accepted move creates a new state, making transitions
  explicit and avoiding hidden mutations.
- **Explicit outcomes:** rejected moves are normal domain results, not exceptional
  control flow.
- **Strict types:** narrow board positions and discriminated unions make invalid
  states harder to represent.
- **Small dependency surface:** native platform and React behavior are preferred
  where an additional library would not add meaningful value.
- **Intentional scope:** computer opponents, persistence, networking, and match
  history are outside the kata requirements and were not added speculatively.
