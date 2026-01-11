import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useGameOfLifeModule } from "./hooks/useGameOfLifeModule";
import { useState } from "react";
import type { GameBoard } from "./GameOfLifeModule";

function App() {
  const { module, loading, error } = useGameOfLifeModule();
  const [gameBoard, setGameBoard] = useState<GameBoard | null>(null);
  if (loading) return <div>Loading Game of Life...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!module) return <div>Module not loaded</div>;

  const initializeGame = () => {
    const board = new module.GameBoard();
    console.log(board);
    board.InitializeGameBoard();
    setGameBoard(board);
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={initializeGame}>Initialize Game Board</button>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
