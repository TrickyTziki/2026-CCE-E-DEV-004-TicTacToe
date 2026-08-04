import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { App } from './App';

type CellContent = 'empty' | 'X' | 'O';
type Coordinate = readonly [row: number, column: number];
type User = ReturnType<typeof userEvent.setup>;

const X_WIN_SEQUENCE = [
  [1, 1],
  [2, 1],
  [1, 2],
  [2, 2],
  [1, 3],
] as const satisfies readonly Coordinate[];

const DRAW_SEQUENCE = [
  [1, 1],
  [1, 2],
  [1, 3],
  [2, 2],
  [2, 1],
  [2, 3],
  [3, 2],
  [3, 1],
  [3, 3],
] as const satisfies readonly Coordinate[];

function getCell(
  row: number,
  column: number,
  content: CellContent = 'empty',
): HTMLButtonElement {
  return screen.getByRole('button', {
    name: `Row ${String(row)}, column ${String(column)}: ${content}`,
  });
}

function getBoardCells(): HTMLButtonElement[] {
  const board = screen.getByRole('group', { name: 'Tic-Tac-Toe board' });
  return within(board).getAllByRole<HTMLButtonElement>('button');
}

async function playSequence(
  user: User,
  coordinates: readonly Coordinate[],
): Promise<void> {
  for (const [row, column] of coordinates) {
    await user.click(getCell(row, column));
  }
}

describe('the game interface', () => {
  it('presents an empty board with X ready to play', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Tic-Tac-Toe' })).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('X to play');
    expect(getBoardCells()).toHaveLength(9);

    for (let row = 1; row <= 3; row += 1) {
      for (let column = 1; column <= 3; column += 1) {
        expect(getCell(row, column)).toBeEnabled();
      }
    }

    expect(screen.getByRole('button', { name: 'New game' })).toBeEnabled();
  });

  it('places marks, alternates players, and disables occupied cells', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(getCell(2, 2));
    expect(getCell(2, 2, 'X')).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('O to play');

    await user.click(getCell(3, 3));
    expect(getCell(3, 3, 'O')).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('X to play');
  });

  it('supports playing with the keyboard', async () => {
    const user = userEvent.setup();
    render(<App />);

    const centerCell = getCell(2, 2);
    centerCell.focus();
    await user.keyboard('{Enter}');

    expect(getCell(2, 2, 'X')).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('O to play');
  });

  it('announces a winner and disables the board', async () => {
    const user = userEvent.setup();
    render(<App />);

    await playSequence(user, X_WIN_SEQUENCE);

    expect(screen.getByRole('status')).toHaveTextContent('X wins');
    for (const cell of getBoardCells()) {
      expect(cell).toBeDisabled();
    }
  });

  it('announces a draw and disables the board', async () => {
    const user = userEvent.setup();
    render(<App />);

    await playSequence(user, DRAW_SEQUENCE);

    expect(screen.getByRole('status')).toHaveTextContent('Draw');
    for (const cell of getBoardCells()) {
      expect(cell).toBeDisabled();
    }
  });

  it('starts a fresh game on request', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(getCell(1, 1));
    await user.click(screen.getByRole('button', { name: 'New game' }));

    expect(screen.getByRole('status')).toHaveTextContent('X to play');
    expect(getBoardCells()).toHaveLength(9);

    for (let row = 1; row <= 3; row += 1) {
      for (let column = 1; column <= 3; column += 1) {
        expect(getCell(row, column)).toBeEnabled();
      }
    }
  });
});
