import { useCallback, useEffect, useRef, useState } from "react";
import { useGameOfLifeModule } from "../hooks/useGameOfLifeModule";
import type { GameBoard, GameSettings } from "../GameOfLifeModule";
import DrawingPanel from "./DrawingPanel";
import GameStatus from "./GameStatus";
import { IoMdPause } from "react-icons/io";
import { IoMdPlay } from "react-icons/io";
import { IoMdSkipForward } from "react-icons/io";
import { IoMdTrash } from "react-icons/io";
import IconButton from "./IconButton";
import styles from "./GameOfLife.module.css";
import MenuBar from "./MenuBar";
import TextButton from "./TextButton";

export default function GameOfLife() {
  const { module, loading, error } = useGameOfLifeModule();
  const [gameBoard, setGameBoard] = useState<GameBoard | null>(null);
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [flatBoard, setFlatBoard] = useState<Uint8Array>(new Uint8Array(0));
  const [flatNeighbors, setFlatNeighbors] = useState<Int32Array>(
    new Int32Array(0),
  );
  const [isRunning, setRunning] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const intervalId = useRef<number | null>(null);

  const refreshBoards = useCallback(() => {
    if (gameBoard && module) {
      // read from WASM memory
      const pointer = gameBoard.getGameBoardPointer();
      const size = gameBoard.getBoardSize();

      // create array from memory using pointer
      const board = new Uint8Array(module.HEAPU8.buffer, pointer, size);
      setFlatBoard(new Uint8Array(board)); // copy it for local state

      // repeat for neighbor counts array
      const neighborPointer = gameBoard.getNeighborCountsPointer();
      const neighbors = new Int32Array(
        module.HEAP32.buffer,
        neighborPointer,
        size,
      );
      setFlatNeighbors(new Int32Array(neighbors)); // copy it for local state
    }
  }, [gameBoard, module]);

  const handleBoardChange = (newBoard: Uint8Array) => {
    if (gameBoard && module) {
      const size = gameBoard.getBoardSize();

      // allocate memory in WASM memory
      const pointer = module._malloc(size);

      // copy data to WASM memory
      module.HEAPU8.set(newBoard, pointer);

      // call setter
      gameBoard.setGameBoardFromPointer(pointer, size);

      // free memory
      module._free(pointer);

      // refresh local states
      refreshBoards();
    }
  };

  const handleNextGeneration = useCallback(() => {
    if (gameBoard) {
      gameBoard.NextGeneration();
      refreshBoards();
      setRefreshCount((prev) => prev + 1);
    }
  }, [gameBoard, refreshBoards]);

  const handleRandomizeBoard = useCallback(
    (seed: number) => {
      if (gameBoard) {
        gameBoard.RandomizeGameBoard(seed);
        refreshBoards();
        setRefreshCount((prev) => prev + 1);
      }
    },
    [gameBoard, refreshBoards],
  );

  const handleRunGame = () => {
    setRunning(true);
  };

  const handlePauseGame = () => {
    setRunning(false);
  };

  const handleStopGame = () => {
    setRunning(false);
    if (gameBoard) {
      gameBoard.ClearUniverse();
      refreshBoards();
      setRefreshCount((prev) => prev + 1);
    }
  };

  const initializeBoard = () => {
    setRunning(false);
    if (module) {
      const board = new module.GameBoard();
      board.InitializeGameBoard();
      setGameBoard(board);
      setSettings(board.mSettings);

      // initialize boards thru pointers
      const pointer = board.getGameBoardPointer();
      const size = board.getBoardSize();

      // create array from memory using pointer
      const gameBoardData = new Uint8Array(module.HEAPU8.buffer, pointer, size);
      setFlatBoard(new Uint8Array(gameBoardData)); // copy it for local state

      // repeat for neighbor counts array
      const neighborPointer = board.getNeighborCountsPointer();
      const neighborData = new Int32Array(
        module.HEAP32.buffer,
        neighborPointer,
        size,
      );
      setFlatNeighbors(new Int32Array(neighborData)); // copy it for local state
    }
  };

  const updateGameSettings = (newSettings: GameSettings) => {
    const oldGridSize = settings?.gridSize;
    setSettings(newSettings);
    if (gameBoard) {
      gameBoard.setGameSettings(newSettings);
      if (oldGridSize !== newSettings.gridSize) {
        refreshBoards();
        setRefreshCount((prev) => prev + 1);
      }
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalId.current = setInterval(() => {
        handleNextGeneration();
      }, settings?.interval || 200);
    } else {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    }

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [isRunning, handleNextGeneration, settings?.interval]);

  if (!module)
    return <div>Module not loaded. Please use a supported browser.</div>;
  if (loading) return <div>Loading Game of Life...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "2rem",
      }}
    >
      {gameBoard ? (
        <TextButton onClick={initializeBoard}>Reset Game of Life</TextButton>
      ) : (
        <TextButton onClick={initializeBoard}>Start Game of Life</TextButton>
      )}
      {gameBoard && settings && (
        <div className={styles.gameWindow}>
          <div className={styles.gameBoardWrapper}>
            <MenuBar
              settings={settings}
              onSettingsChange={updateGameSettings}
              onRandomize={handleRandomizeBoard}
            />
            <div className={styles.gameBoard}>
              <DrawingPanel
                gameBoard={flatBoard}
                setGameBoard={handleBoardChange}
                neighborCounts={flatNeighbors}
                settings={settings}
                refresh={refreshBoards}
              />
            </div>
            <GameStatus
              gameBoard={gameBoard}
              isRunning={isRunning}
              refreshTrigger={refreshCount}
            />
          </div>
          <div className={styles.controls}>
            <IconButton IconComponent={IoMdPlay} onClick={handleRunGame} />
            <IconButton
              IconComponent={IoMdSkipForward}
              onClick={handleNextGeneration}
            />
            <IconButton IconComponent={IoMdPause} onClick={handlePauseGame} />
            <IconButton IconComponent={IoMdTrash} onClick={handleStopGame} />
          </div>
        </div>
      )}
    </div>
  );
}
