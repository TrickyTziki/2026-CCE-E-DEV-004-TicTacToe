import {
  createGame,
  playMove,
  type BoardPosition,
  type Game,
  type GameStatus,
} from '@tictactoe/game-core';
import { useState } from 'react';

const BOARD_POSITIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const satisfies readonly BoardPosition[];

function describeStatus(status: GameStatus): string {
  switch (status.kind) {
    case 'playing':
      return `${status.nextPlayer} to play`;
    case 'won':
      return `${status.winner} wins`;
    case 'draw':
      return 'Draw';
  }
}

function isWinningPosition(game: Game, position: BoardPosition): boolean {
  return (
    game.status.kind === 'won' && game.status.winningLine.includes(position)
  );
}

function cellLabel(game: Game, position: BoardPosition): string {
  const row = Math.floor(position / 3) + 1;
  const column = (position % 3) + 1;
  const content = game.board[position] ?? 'empty';

  return `Row ${String(row)}, column ${String(column)}: ${content}`;
}

export function App() {
  const [game, setGame] = useState(createGame);
  const gameIsOver = game.status.kind !== 'playing';

  function play(position: BoardPosition): void {
    setGame((currentGame) => playMove(currentGame, position).game);
  }

  return (
    <main className="game-shell">
      <section className="scorecard" aria-labelledby="game-title">
        <header className="scorecard__header">
          <div>
            <p className="eyebrow">Classic game · 3 × 3</p>
            <h1 id="game-title">Tic-Tac-Toe</h1>
            <p className="intro">Take turns. Make a line. Keep it simple.</p>
          </div>
          <div className="scorecard__monogram" aria-hidden="true">
            <span>X</span>
            <span>O</span>
          </div>
        </header>

        <div className="game-layout">
          <div className="play-area">
            <div className="turn-indicator">
              <span className="turn-indicator__label">Current game</span>
              <p className="turn-indicator__status" role="status" aria-live="polite">
                {describeStatus(game.status)}
              </p>
            </div>

            <div className="board" role="group" aria-label="Tic-Tac-Toe board">
              {BOARD_POSITIONS.map((position) => {
                const mark = game.board[position];
                const winningPosition = isWinningPosition(game, position);

                return (
                  <button
                    className={`board__cell${winningPosition ? ' board__cell--winning' : ''}`}
                    type="button"
                    key={position}
                    aria-label={cellLabel(game, position)}
                    disabled={gameIsOver || mark !== null}
                    onClick={() => {
                      play(position);
                    }}
                  >
                    {mark === null ? null : (
                      <span className={`board__mark board__mark--${mark.toLowerCase()}`} aria-hidden="true">
                        {mark}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="game-controls" aria-label="Game controls">
            <div>
              <p className="game-controls__label">How to win</p>
              <p className="game-controls__copy">
                Place three marks in a row, column, or diagonal.
              </p>
            </div>
            <button
              className="new-game"
              type="button"
              onClick={() => {
                setGame(createGame());
              }}
            >
              New game
              <span aria-hidden="true">↗</span>
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}
