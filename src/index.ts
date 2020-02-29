import { Snake } from './models/Snake';
import { Apple } from './models/Apple';
import { Direction } from './models/Direction';
import {
  KEYPAD,
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

const snake = new Snake();
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
  if (snake.length === 1) return true;

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

const colorSnake = () => {
  color(snake.body, COLORS.SNAKE);
  color([snake.body[0]], COLORS.HEAD);
};

const setApple = () => {
  let x: number;
  let y: number;

  do {
    x = Math.floor(Math.random() * CANVAS_ROWS_COLS);
    y = Math.floor(Math.random() * CANVAS_ROWS_COLS);
  } while (snake.body.some(coord => areEqualArrays(coord, [x, y])));

  apple.location = [x, y];
  color([[x, y]], COLORS.APPLE);
};

const initializeSnake = () => {
  const x = 0;
  const y = 0;
  snake.body = [[x, y]];
  colorSnake();
};

const checkForSelfCollision = (): boolean => {
  for (let i = 1; i < snake.length; i++) {
    if (areEqualArrays(snake.body[i], snake.body[0])) {
      color([snake.body[i]], COLORS.ERROR);
      endGame(OUTCOMES.GAMEOVER);
      return true;
    }
  }
  return false;
};

const checkIfWon = () => {
  if (snake.length === CANVAS_ROWS_COLS * CANVAS_ROWS_COLS) {
    colorSnake();
    endGame(OUTCOMES.WIN);
    return true;
  } else {
  }
};

const isOutOfBounds = (x: number, y: number): boolean => {
  if (x < 0 || y < 0 || x >= CANVAS_ROWS_COLS || y >= CANVAS_ROWS_COLS) {
    color([snake.body[0]], COLORS.ERROR);
    endGame(OUTCOMES.GAMEOVER);
    return true;
  }
  return false;
};

const handleMovement = () => {
  direction.current = direction.new;

  let [x, y] = snake.body[0];

  if (direction.new === direction.left) x--;
  else if (direction.new === direction.right) x++;
  else if (direction.new === direction.up) y--;
  else if (direction.new === direction.down) y++;

  if (isOutOfBounds(x, y)) return;

  snake.body.unshift([x, y]);

  if (checkForSelfCollision()) return;

  if (justHitApple) {
    if (areEqualArrays(apple.location, snake.body[0])) {
      if (checkIfWon()) return;
      setApple();
      justHitApple = true;
    }
    colorSnake();
    justHitApple = false;
  } else {
    if (areEqualArrays(apple.location, snake.body[0])) {
      // new movement has hit apple
      if (checkIfWon()) return;
      justHitApple = true;
      setApple();
      checkForNewBestScore();
    }
    color(snake.body, COLORS.BOARD);
    snake.body = [...snake.body.slice(0, -1)];
    colorSnake();
  }
};

const start = (speed = GAME_SPEED.EASY) => {
  initializeBoard();
  initializeSnake();
  setApple();

  updateCurrentScore();
  checkForNewBestScore();
  displayOutcome('');

  direction.new = direction.down;
  gameInterval = setInterval(() => {
    handleMovement();
    updateCurrentScore();
  }, speed);
};

const displayOutcome = str => {
  if (str === OUTCOMES.GAMEOVER)
    document.getElementById('gameover').innerHTML = `${str}`;
  else if (str === OUTCOMES.WIN)
    document.getElementById('win').innerHTML = `${str}`;
  else {
    document.getElementById('gameover').innerHTML = '';
    document.getElementById('win').innerHTML = '';
  }
};

const updateCurrentScore = () => {
  document.getElementById('current-score').innerHTML = String(snake.length);
};

const getBestScore = () => {
  let bestScore = localStorage.getItem(`snake-${currentMode}`) || 0;
  document.getElementById('best-score').innerHTML = String(bestScore);

  return bestScore;
};

const setBestScore = newBestScore => {
  localStorage.setItem(`snake-${currentMode}`, newBestScore);
  document.getElementById('best-score').innerHTML = String(getBestScore());
};

const checkForNewBestScore = () => {
  if (snake.length > getBestScore()) setBestScore(snake.length);
  setGameMode();
};

const setGameMode = () => {
  document.getElementById(
    'game-mode'
  ).innerHTML = `(${currentMode.toLowerCase()})`;
};

const endGame = str => {
  checkForNewBestScore();
  clearInterval(gameInterval);
  displayOutcome(str);
};

/**
 * EVENT LISTENERS
 */

document.querySelectorAll('.play').forEach((btn: HTMLButtonElement) => {
  btn.addEventListener('click', () => {
    clearInterval(gameInterval);
    displayOutcome('');
    currentMode = btn.value;
    start(GAME_SPEED[btn.value]);
  });
});

document.addEventListener('keydown', evt => {
  if (isValidMovement(evt.keyCode)) direction.new = evt.keyCode;
});

document
  .querySelectorAll('#keypad button')
  .forEach((btn: HTMLButtonElement) => {
    btn.addEventListener('click', () => {
      let correspondingKeyCode = getCodeFromKeypad(btn.value);
      if (correspondingKeyCode && isValidMovement(correspondingKeyCode))
        direction.new = correspondingKeyCode;
    });
  });

const getCodeFromKeypad = (direction: String): number => {
  for (let code in KEYPAD) {
    if (KEYPAD[code] === direction) return Number(code);
  }
  return null;
};
// draw an empty canvas on page load
initializeBoard();
