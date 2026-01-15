import { useEffect, useState } from "react";
import type { GameBoard } from "../GameOfLifeModule";
import styles from "./GameStatus.module.css";

type Props = {
  gameBoard: GameBoard | null;
  isRunning: boolean;
  refreshTrigger?: number;
};

export default function GameStatus({
  gameBoard,
  isRunning,
  refreshTrigger,
}: Props) {
  const [generationCount, setGenerationCount] = useState(0);
  const [livingCellCount, setLivingCellCount] = useState(0);

  useEffect(() => {
    if (!gameBoard) return;

    const updateStats = () => {
      if (gameBoard) {
        setGenerationCount(gameBoard.mGenerationCount);
        setLivingCellCount(gameBoard.mLivingCellCount);
      }
    };

    if (isRunning) {
      const intervalId = setInterval(updateStats, 50);
      return () => clearInterval(intervalId);
    } else {
      updateStats();
    }
  }, [gameBoard, isRunning, refreshTrigger]);

  if (!gameBoard) return null;

  return (
    <div className={styles.statusWrapper}>
      <p>Generation No. {generationCount}</p>
      <p>Living Cell Count: {livingCellCount}</p>
    </div>
  );
}
