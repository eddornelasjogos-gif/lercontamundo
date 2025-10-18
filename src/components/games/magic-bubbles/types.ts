export type Difficulty = "easy" | "medium" | "hard";
export type GameMode = "time" | "levels";

export interface GameSettings {
  difficulty: Difficulty;
  mode: GameMode;
  timeLimitSeconds: number;
  colorCount: number;
  rows: number;
  initialSpeed: number;
}

export const BUBBLE_COLORS = {
  RED: '#FF6B6B', 
  PURPLE: '#8b5cf6',
  BLUE: '#38bdf8',
  YELLOW: '#fde047',
  GREEN: '#10B981',
  PINK: '#f472b6',
};

export type BubbleColor = keyof typeof BUBBLE_COLORS;

export interface Bubble {
  id: number;
  x: number;
  y: number;
  color: BubbleColor;
  radius: number;
  isFixed: boolean; // Faz parte da grade?
  isFalling: boolean; // Está caindo após ser desconectada?
  velocity: { x: number; y: number };
  gridX?: number;
  gridY?: number;
}

export const GAME_SETTINGS: Record<Difficulty, GameSettings> = {
  easy: {
    difficulty: "easy",
    mode: "time", // Default mode, will be overridden by user selection
    timeLimitSeconds: 90,
    colorCount: 4,
    rows: 6,
    initialSpeed: 5,
  },
  medium: {
    difficulty: "medium",
    mode: "time",
    timeLimitSeconds: 60,
    colorCount: 5,
    rows: 8,
    initialSpeed: 7,
  },
  hard: {
    difficulty: "hard",
    mode: "time",
    timeLimitSeconds: 45,
    colorCount: 6,
    rows: 10,
    initialSpeed: 9,
  },
};

// Constantes de Renderização e Grade
export const BUBBLE_RADIUS = 20;
export const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;
export const GRID_COLS = 12;
export const GRID_ROWS = 15; 
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const LAUNCHER_Y = CANVAS_HEIGHT - BUBBLE_RADIUS;