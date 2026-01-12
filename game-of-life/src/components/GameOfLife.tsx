import { useState } from "react";
import { useGameOfLifeModule } from "../hooks/useGameOfLifeModule";
import type { GameBoard } from "../GameOfLifeModule";
import DrawingPanel from "./DrawingPanel";

export default function GameOfLife() {
  const { module, loading, error } = useGameOfLifeModule();
  const [gameBoard, setGameBoard] = useState<GameBoard | null>(null);
  const [flatBoard, setFlatBoard] = useState<Uint8Array>(new Uint8Array(0));
  const [flatNeighbors, setFlatNeighbors] = useState<Int32Array>(
    new Int32Array(0)
  );

  const refreshBoards = () => {
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
  };

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

  const initializeGame = () => {
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

  if (!module) return <div>Module not loaded</div>;
  if (loading) return <div>Loading Game of Life...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={initializeGame}>start game</button>
      {gameBoard && (
        <div
          style={{
            flex: 1,
            border: "2px solid #333",
            borderRadius: "4px",
            overflow: "hidden",
            resize: "both",
            minWidth: "200px",
            minHeight: "200px",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          <DrawingPanel
            gameBoard={flatBoard}
            setGameBoard={handleBoardChange}
            neighborCounts={flatNeighbors}
            settings={gameBoard.mSettings}
            refresh={refreshBoards}
          />
        </div>
      )}
    </div>
  );
}
