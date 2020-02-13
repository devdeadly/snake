export const GAME_SPEED = {
  EASY: 120,
  MEDIUM: 60,
  HARD: 30,
  INSANE: 15
};

export const OUTCOMES = {
  GAMEOVER: '💀 gameover 💀',
  WIN: '👑 you won 👑'
};

export class COLORS {
  static SNEK: string = '#006400';
  static APPLE: string = '#8b0000';
  static BOARD: string = '#a9a9a9';
  static ERROR: string = '#ff8c00';
}

export const CANVAS_DIMENSION: number = 600;
export const CELL_DIMENSION: number = 20;
export const CANVAS_ROWS_COLS: number = CANVAS_DIMENSION / CELL_DIMENSION;
