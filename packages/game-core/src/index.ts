export type Mark = 'X' | 'O';

export type Cell = Mark | null;

export type BoardPosition = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

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

export type WinningLine = readonly [
  BoardPosition,
  BoardPosition,
  BoardPosition,
];

export type PlayingGameStatus = Readonly<{
  kind: 'playing';
  nextPlayer: Mark;
}>;

export type WonGameStatus = Readonly<{
  kind: 'won';
  winner: Mark;
  winningLine: WinningLine;
}>;

export type DrawnGameStatus = Readonly<{
  kind: 'draw';
}>;

export type GameStatus =
  | PlayingGameStatus
  | WonGameStatus
  | DrawnGameStatus;

export type Game = Readonly<{
  board: Board;
  status: GameStatus;
}>;

export type MoveRejectionReason =
  | 'game-over'
  | 'invalid-position'
  | 'occupied';

export type AcceptedMove = Readonly<{
  accepted: true;
  game: Game;
}>;

export type RejectedMove = Readonly<{
  accepted: false;
  reason: MoveRejectionReason;
  game: Game;
}>;

export type MoveResult = AcceptedMove | RejectedMove;

const BOARD_SIZE = 9;

const WINNING_LINES: readonly WinningLine[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function createEmptyBoard(): Board {
  return [null, null, null, null, null, null, null, null, null];
}

function isBoardPosition(position: number): position is BoardPosition {
  return Number.isInteger(position) && position >= 0 && position < BOARD_SIZE;
}

function placeMark(board: Board, position: BoardPosition, mark: Mark): Board {
  return [
    position === 0 ? mark : board[0],
    position === 1 ? mark : board[1],
    position === 2 ? mark : board[2],
    position === 3 ? mark : board[3],
    position === 4 ? mark : board[4],
    position === 5 ? mark : board[5],
    position === 6 ? mark : board[6],
    position === 7 ? mark : board[7],
    position === 8 ? mark : board[8],
  ];
}

function nextPlayer(player: Mark): Mark {
  return player === 'X' ? 'O' : 'X';
}

function findWinningLine(board: Board, player: Mark): WinningLine | undefined {
  return WINNING_LINES.find(
    ([first, second, third]) =>
      board[first] === player &&
      board[second] === player &&
      board[third] === player,
  );
}

function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

function statusAfterMove(board: Board, player: Mark): GameStatus {
  const winningLine = findWinningLine(board, player);

  if (winningLine !== undefined) {
    return { kind: 'won', winner: player, winningLine };
  }

  if (isBoardFull(board)) {
    return { kind: 'draw' };
  }

  return { kind: 'playing', nextPlayer: nextPlayer(player) };
}

function rejectMove(
  game: Game,
  reason: MoveRejectionReason,
): RejectedMove {
  return { accepted: false, reason, game };
}

export function createGame(): Game {
  return {
    board: createEmptyBoard(),
    status: { kind: 'playing', nextPlayer: 'X' },
  };
}

export function playMove(game: Game, position: number): MoveResult {
  if (game.status.kind !== 'playing') {
    return rejectMove(game, 'game-over');
  }

  if (!isBoardPosition(position)) {
    return rejectMove(game, 'invalid-position');
  }

  if (game.board[position] !== null) {
    return rejectMove(game, 'occupied');
  }

  const player = game.status.nextPlayer;
  const board = placeMark(game.board, position, player);

  return {
    accepted: true,
    game: {
      board,
      status: statusAfterMove(board, player),
    },
  };
}
