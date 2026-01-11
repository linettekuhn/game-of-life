export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Size {
  x: number;
  y: number;
}

export interface GameSettings {
  livingCellRed: number;
  livingCellGreen: number;
  livingCellBlue: number;
  livingCellAlpha: number;

  deadCellRed: number;
  deadCellGreen: number;
  deadCellBlue: number;
  deadCellAlpha: number;

  gridLineRed: number;
  gridLineGreen: number;
  gridLineBlue: number;
  gridLineAlpha: number;

  gridSize: number;
  interval: number;
  windowWidth: number;
  windowHeight: number;

  isHUDChecked: boolean;
  isNeighborCountChecked: boolean;
  isToroidalChecked: boolean;
  isShowGridChecked: boolean;
  isShowThickGridChecked: boolean;
}

export interface GameBoard {
  RandomizeGameBoard: (seed: number) => void;
  NextGeneration: () => void;
  InitializeGameBoard: () => void;
  LivingNeighborCount: (row: number, col: number) => number;
  UpdateCounts: () => void;
  ClearUniverse: () => void;
  mGameBoard: boolean[][];
  mNeighborCounts: number[][];
  mGenerationCount: number;
  mLivingCellCount: number;
  mSettings: GameSettings;
}

export interface GameOfLifeModule {
  GameBoard: new () => GameBoard;
}

// tells interfaceScript that window.GameOfLifeModule exists
declare global {
  interface Window {
    GameOfLifeModule: () => Promise<GameOfLifeModule>;
  }
}
