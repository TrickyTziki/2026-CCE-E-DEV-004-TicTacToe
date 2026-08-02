export type Mark = 'X' | 'O';

export type Cell = Mark | null;

export type Board = readonly [
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
];

export type GameStatus = Readonly<{
  kind: 'playing';
  nextPlayer: Mark;
}>;

export type Game = Readonly<{
  board: Board;
  status: GameStatus;
}>;

export type MoveResult = Readonly<{
  accepted: true;
  game: Game;
}>;

function notImplemented(operation: string): never {
  throw new Error(`${operation} has not been implemented.`);
}

export function createGame(): Game {
  return notImplemented('Creating a game');
}

export function playMove(game: Game, position: number): MoveResult {
  void game;
  void position;

  return notImplemented('Playing a move');
}
