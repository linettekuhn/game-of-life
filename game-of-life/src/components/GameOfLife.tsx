import { useCallback, useEffect, useRef, useState } from "react";
import { useGameOfLifeModule } from "../hooks/useGameOfLifeModule";
import type { GameBoard } from "../GameOfLifeModule";
import DrawingPanel from "./DrawingPanel";
import GameStatus from "./GameStatus";
import { IoMdPause } from "react-icons/io";
import { IoMdPlay } from "react-icons/io";
import { IoMdSkipForward } from "react-icons/io";
import { IoMdTrash } from "react-icons/io";
import IconButton from "./IconButton";
import styles from "./GameOfLife.module.css";

export default function GameOfLife() {
  const { module, loading, error } = useGameOfLifeModule();
  const [gameBoard, setGameBoard] = useState<GameBoard | null>(null);
  const [flatBoard, setFlatBoard] = useState<Uint8Array>(new Uint8Array(0));
  const [flatNeighbors, setFlatNeighbors] = useState<Int32Array>(
    new Int32Array(0)
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
        size
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
      initializeBoard();
    }
  };

  const initializeBoard = () => {
    if (module) {
      const board = new module.GameBoard();
      board.InitializeGameBoard();
      setGameBoard(board);

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
        size
      );
      setFlatNeighbors(new Int32Array(neighborData)); // copy it for local state
    }
  };

  useEffect(() => {
    if (isRunning) {
      console.log(isRunning);
      intervalId.current = setInterval(() => {
        handleNextGeneration();
      }, 200);
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
  }, [isRunning, handleNextGeneration]);

  if (!module) return <div>Module not loaded</div>;
  if (loading) return <div>Loading Game of Life...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={initializeBoard}>start game</button>
      {gameBoard && (
        <div className={styles.gameWindow}>
          <div className={styles.gameBoardWrapper}>
            <div className={styles.gameBoard}>
              <DrawingPanel
                gameBoard={flatBoard}
                setGameBoard={handleBoardChange}
                neighborCounts={flatNeighbors}
                settings={gameBoard.mSettings}
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
