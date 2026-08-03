import { describe, expect, it } from 'vitest';

import {
  createGame,
  playMove,
  type Game,
  type MoveRejectionReason,
  type MoveResult,
} from './index';

const EMPTY_BOARD = [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
] as const;

const BOARD_WITH_X_IN_CENTER = [
  null,
  null,
  null,
  null,
  'X',
  null,
  null,
  null,
  null,
] as const;

const INVALID_POSITIONS = [
  { description: 'a negative integer', position: -1 },
  { description: 'an integer beyond the last cell', position: 9 },
  { description: 'a fractional number', position: 4.5 },
  { description: 'NaN', position: Number.NaN },
  { description: 'positive infinity', position: Number.POSITIVE_INFINITY },
  { description: 'negative infinity', position: Number.NEGATIVE_INFINITY },
] as const;

const WINNING_SCENARIOS = [
  {
    description: 'the top row',
    moves: [0, 3, 1, 4, 2],
    winningLine: [0, 1, 2],
  },
  {
    description: 'the middle row',
    moves: [3, 0, 4, 1, 5],
    winningLine: [3, 4, 5],
  },
  {
    description: 'the bottom row',
    moves: [6, 0, 7, 1, 8],
    winningLine: [6, 7, 8],
  },
  {
    description: 'the left column',
    moves: [0, 1, 3, 2, 6],
    winningLine: [0, 3, 6],
  },
  {
    description: 'the middle column',
    moves: [1, 0, 4, 2, 7],
    winningLine: [1, 4, 7],
  },
  {
    description: 'the right column',
    moves: [2, 0, 5, 1, 8],
    winningLine: [2, 5, 8],
  },
  {
    description: 'the descending diagonal',
    moves: [0, 1, 4, 2, 8],
    winningLine: [0, 4, 8],
  },
  {
    description: 'the ascending diagonal',
    moves: [2, 0, 4, 1, 6],
    winningLine: [2, 4, 6],
  },
] as const;

const DRAW_SEQUENCE = [0, 1, 2, 4, 3, 5, 7, 6, 8] as const;

const LAST_MOVE_WIN_SEQUENCE = [0, 1, 4, 3, 2, 5, 7, 6, 8] as const;

const MOVES_AFTER_A_WIN = [
  { description: 'an otherwise legal move', position: 5 },
  { description: 'an invalid position', position: -1 },
  { description: 'an occupied position', position: 0 },
] as const;

function acceptedGame(result: MoveResult): Game {
  expect(result.accepted).toBe(true);

  if (!result.accepted) {
    throw new Error(`Expected an accepted move, but it was ${result.reason}.`);
  }

  return result.game;
}

function rejectedGame(
  result: MoveResult,
  expectedReason: MoveRejectionReason,
): Game {
  expect(result.accepted).toBe(false);

  if (result.accepted) {
    throw new Error('Expected the move to be rejected, but it was accepted.');
  }

  expect(result.reason).toBe(expectedReason);
  return result.game;
}

function playSequence(positions: readonly number[]): Game {
  let game = createGame();

  for (const position of positions) {
    game = acceptedGame(playMove(game, position));
  }

  return game;
}

describe('a new game', () => {
  it('starts with nine empty cells and X ready to play', () => {
    const game = createGame();

    expect(game.board).toEqual(EMPTY_BOARD);
    expect(game.status).toEqual({ kind: 'playing', nextPlayer: 'X' });
  });
});

describe('legal moves', () => {
  it('places each mark and alternates players', () => {
    const initialGame = createGame();

    const afterX = acceptedGame(playMove(initialGame, 4));
    expect(afterX.board).toEqual(BOARD_WITH_X_IN_CENTER);
    expect(afterX.status).toEqual({ kind: 'playing', nextPlayer: 'O' });

    const afterO = acceptedGame(playMove(afterX, 8));
    expect(afterO.board).toEqual([
      null,
      null,
      null,
      null,
      'X',
      null,
      null,
      null,
      'O',
    ]);
    expect(afterO.status).toEqual({ kind: 'playing', nextPlayer: 'X' });
  });

  it('does not mutate an earlier game state', () => {
    const initialGame = createGame();
    const initialBoard = initialGame.board;

    const afterMove = acceptedGame(playMove(initialGame, 0));

    expect(initialGame.board).toEqual(EMPTY_BOARD);
    expect(afterMove).not.toBe(initialGame);
    expect(afterMove.board).not.toBe(initialBoard);
  });
});

describe('illegal moves', () => {
  it('rejects an occupied cell without replacing its mark or changing players', () => {
    const gameAfterX = acceptedGame(playMove(createGame(), 4));

    const unchangedGame = rejectedGame(
      playMove(gameAfterX, 4),
      'occupied',
    );

    expect(unchangedGame.board).toEqual(BOARD_WITH_X_IN_CENTER);
    expect(unchangedGame.status).toEqual({
      kind: 'playing',
      nextPlayer: 'O',
    });
  });

  for (const { description, position } of INVALID_POSITIONS) {
    it(`rejects ${description} without changing the game`, () => {
      const gameAfterX = acceptedGame(playMove(createGame(), 4));

      const unchangedGame = rejectedGame(
        playMove(gameAfterX, position),
        'invalid-position',
      );

      expect(unchangedGame.board).toEqual(BOARD_WITH_X_IN_CENTER);
      expect(unchangedGame.status).toEqual({
        kind: 'playing',
        nextPlayer: 'O',
      });
    });
  }
});

describe('winning a game', () => {
  for (const { description, moves, winningLine } of WINNING_SCENARIOS) {
    it(`recognizes ${description}`, () => {
      const game = playSequence(moves);

      expect(game.status).toEqual({
        kind: 'won',
        winner: 'X',
        winningLine,
      });

      for (const position of winningLine) {
        expect(game.board[position]).toBe('X');
      }
    });
  }

  it('identifies O as the winner when O completes a line', () => {
    const game = playSequence([0, 3, 1, 4, 8, 5]);

    expect(game.status).toEqual({
      kind: 'won',
      winner: 'O',
      winningLine: [3, 4, 5],
    });
  });

  it('keeps playing when a player has only two aligned marks', () => {
    const game = playSequence([0, 3, 1, 4]);

    expect(game.status).toEqual({ kind: 'playing', nextPlayer: 'X' });
  });

  it('keeps playing when an opponent interrupts a line', () => {
    const game = playSequence([0, 1, 2]);

    expect(game.status).toEqual({ kind: 'playing', nextPlayer: 'O' });
  });
});

describe('ending a game', () => {
  it('declares a draw when the board is full without a winner', () => {
    const game = playSequence(DRAW_SEQUENCE);

    expect(game.status).toEqual({ kind: 'draw' });
  });

  it('declares a winner instead of a draw on the final move', () => {
    const game = playSequence(LAST_MOVE_WIN_SEQUENCE);

    expect(game.status).toEqual({
      kind: 'won',
      winner: 'X',
      winningLine: [0, 4, 8],
    });
  });

  for (const { description, position } of MOVES_AFTER_A_WIN) {
    it(`rejects ${description} after a win`, () => {
      const wonGame = playSequence([0, 3, 1, 4, 2]);

      const unchangedGame = rejectedGame(
        playMove(wonGame, position),
        'game-over',
      );

      expect(unchangedGame).toEqual(wonGame);
    });
  }

  it('rejects moves after a draw', () => {
    const drawnGame = playSequence(DRAW_SEQUENCE);

    const unchangedGame = rejectedGame(
      playMove(drawnGame, 0),
      'game-over',
    );

    expect(unchangedGame).toEqual(drawnGame);
  });
});
