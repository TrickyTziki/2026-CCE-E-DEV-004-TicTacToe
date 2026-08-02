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
