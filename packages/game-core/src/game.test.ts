import { describe, expect, it } from 'vitest';

import { createGame, playMove } from './index';

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

function acceptedGame(result: ReturnType<typeof playMove>) {
  expect(result.accepted).toBe(true);
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
    expect(afterX.board).toEqual([
      null,
      null,
      null,
      null,
      'X',
      null,
      null,
      null,
      null,
    ]);
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
