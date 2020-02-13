import { Snek } from './models/Snek';
import { Apple } from './models/Apple';
import { Direction } from './models/Direction';
import {
  COLORS,
  CANVAS_DIMENSION,
  CANVAS_ROWS_COLS,
  CELL_DIMENSION,
  GAME_SPEED,
  OUTCOMES
} from './constants';
import { areEqualArrays } from './utils';

const canvas: HTMLCanvasElement = document.getElementById(
  'canvas'
) as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext(
  '2d'
) as CanvasRenderingContext2D;

const snek = new Snek();
const apple = new Apple();

canvas.height = CANVAS_DIMENSION;
canvas.width = CANVAS_DIMENSION;

let direction: Direction = new Direction();
let gameInterval: NodeJS.Timeout;
let justHitApple: boolean = false;
let currentMode: String = null;

const initializeBoard = () => {
  let coords = [];
  for (let i = 0; i < CANVAS_ROWS_COLS; i++) {
    for (let j = 0; j < CANVAS_ROWS_COLS; j++) {
      coords.push([i, j]);
    }
  }
  color(coords, COLORS.BOARD);
};

/**
 *
 * @param dir proposed direction
 */
const isValidMovement = (dir: number) => {
  let { current, left, right, up, down } = direction;

  // check to see if the input is even valid to begin with
  if (![left, right, up, down].includes(dir)) return false;

  // if the snake is only one cell allow any movement
  if (snek.length === 1) return true;

  if (current === left && dir === right) return false;
  if (current === right && dir === left) return false;
  if (current === up && dir === down) return false;
  if (current === down && dir === up) return false;

  return true;
};

const color = (coords: number[][], color: string): void => {
  ctx.fillStyle = color;
  coords.forEach(([x, y]) => {
    ctx.fillRect(
      x * CELL_DIMENSION,
      y * CELL_DIMENSION,
      CELL_DIMENSION,
      CELL_DIMENSION
    );
  });
};

const setApple = () => {
  let x: number;
  let y: number;

  do {
    x = Math.floor(Math.random() * CANVAS_ROWS_COLS);
    y = Math.floor(Math.random() * CANVAS_ROWS_COLS);
  } while (snek.body.some(coord => areEqualArrays(coord, [x, y])));

  apple.location = [x, y];
  color([[x, y]], COLORS.APPLE);
};

const initializeSnek = () => {
  const x = 0;
  const y = 0;
  snek.body = [[x, y]];
  ctx.fillStyle = COLORS.SNEK;
  ctx.fillRect(x, y, CELL_DIMENSION, CELL_DIMENSION);
};

const checkForSelfCollision = (): boolean => {
  for (let i = 1; i < snek.length; i++) {
    if (areEqualArrays(snek.body[i], snek.body[0])) {
      color([snek.body[i]], COLORS.ERROR);
      gameOver(OUTCOMES.GAMEOVER);
      return true;
    }
  }
  return false;
};

const checkIfWon = () => {
  if (snek.length === CANVAS_ROWS_COLS * CANVAS_ROWS_COLS) {
    color(snek.body, COLORS.SNEK);
    gameOver(OUTCOMES.WIN);
    return true;
  } else {
  }
};

const isOutOfBounds = (x: number, y: number): boolean => {
  if (x < 0 || y < 0 || x >= CANVAS_ROWS_COLS || y >= CANVAS_ROWS_COLS) {
    color([snek.body[0]], COLORS.ERROR);
    gameOver(OUTCOMES.GAMEOVER);
    return true;
  }
  return false;
};

const handleMovement = () => {
  direction.current = direction.new;

  let [x, y] = snek.body[0];

  if (direction.new === direction.left) x--;
  else if (direction.new === direction.right) x++;
  else if (direction.new === direction.up) y--;
  else if (direction.new === direction.down) y++;

  if (isOutOfBounds(x, y)) return;

  snek.body.unshift([x, y]);

  if (checkForSelfCollision()) return;

  if (justHitApple) {
    if (areEqualArrays(apple.location, snek.body[0])) {
      if (checkIfWon()) return;
      setApple();
      justHitApple = true;
    }
    color(snek.body, COLORS.SNEK);
    justHitApple = false;
  } else {
    if (areEqualArrays(apple.location, snek.body[0])) {
      // new movement has hit apple
      if (checkIfWon()) return;
      justHitApple = true;
      setApple();
      checkForNewBestScore();
    }
    color(snek.body, COLORS.BOARD);
    snek.body = [...snek.body.slice(0, -1)];
    color(snek.body, COLORS.SNEK);
  }
};

const start = (speed = GAME_SPEED.EASY) => {
  initializeBoard();
  initializeSnek();
  setApple();

  updateCurrentScore();
  checkForNewBestScore();
  setOutcome('');

  direction.new = direction.down;
  gameInterval = setInterval(() => {
    handleMovement();
    updateCurrentScore();
  }, speed);
};

const setOutcome = str => {
  document.getElementById('cause-of-death').innerHTML = `${str}`;
};

const updateCurrentScore = () => {
  document.getElementById('current-score').innerHTML = String(snek.length);
};

const getBestScore = () => {
  let bestScore = localStorage.getItem(`snek-${currentMode}`) || 0;
  document.getElementById('best-score').innerHTML = String(bestScore);

  return bestScore;
};

const setBestScore = newBestScore => {
  localStorage.setItem(`snek-${currentMode}`, newBestScore);
  document.getElementById('best-score').innerHTML = String(getBestScore());
};

const checkForNewBestScore = () => {
  if (snek.length > getBestScore()) setBestScore(snek.length);
  setGameMode();
};

const setGameMode = () => {
  document.getElementById(
    'game-mode'
  ).innerHTML = `(${currentMode.toLowerCase()})`;
};

const gameOver = str => {
  checkForNewBestScore();
  clearInterval(gameInterval);
  setOutcome(str);
};

/**
 * EVENT LISTENERS
 */

document.querySelectorAll('.play').forEach((btn: HTMLButtonElement) => {
  btn.addEventListener('click', () => {
    clearInterval(gameInterval);
    setOutcome('');
    currentMode = btn.value;
    start(GAME_SPEED[btn.value]);
  });
});

document.addEventListener('keydown', evt => {
  if (isValidMovement(evt.keyCode)) direction.new = evt.keyCode;
  else {
  }
});

// draw an empty canvas on page load
initializeBoard();
