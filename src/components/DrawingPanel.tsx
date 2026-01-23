import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { GameSettings, Size } from "../GameOfLifeModule";
import tinycolor from "tinycolor2";
import styles from "./styles/DrawingPanel.module.css";
import DraggableContainer from "./DraggableContainer";

type Props = {
  gameBoard: Uint8Array;
  setGameBoard: (flatBoard: Uint8Array) => void;
  neighborCounts: Int32Array;
  settings: GameSettings;
  refresh: () => void;
  windowSize?: Size;
};

export default function DrawingPanel({
  gameBoard,
  setGameBoard,
  neighborCounts,
  settings,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  }>({ width: 800, height: 600 });

  // update canvas size on parent size change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const { width, height } = parent.getBoundingClientRect();
        setCanvasSize({ width, height });
      }
    };

    updateCanvasSize();

    window.addEventListener("resize", updateCanvasSize);

    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      resizeObserver.disconnect();
    };
  }, []);

  // handle mouse click
  const handleMouseUp = (mouseEvent: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = mouseEvent.clientX - rect.left;
    const mouseY = mouseEvent.clientY - rect.top;

    const cellWidth = canvasSize.width / settings.gridSize;
    const cellHeight = canvasSize.height / settings.gridSize;

    const colIndex = Math.floor(mouseX / cellWidth);
    const rowIndex = Math.floor(mouseY / cellHeight);

    // toggle cell state
    if (
      colIndex >= 0 &&
      colIndex < settings.gridSize &&
      rowIndex >= 0 &&
      rowIndex < settings.gridSize
    ) {
      const flatIndex = colIndex * settings.gridSize + rowIndex;

      if (gameBoard.length === 0) {
        console.error("gameBoard is empty! Can't toggle cell.");
        return;
      }

      const newBoard = new Uint8Array(gameBoard);

      newBoard[flatIndex] = gameBoard[flatIndex] === 0 ? 1 : 0;

      setGameBoard(newBoard);
    }
  };

  // draw game board
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    const cellWidth = canvasSize.width / settings.gridSize;
    const cellHeight = canvasSize.height / settings.gridSize;

    const livingCellColor = tinycolor({
      r: settings.livingCellRed,
      g: settings.livingCellGreen,
      b: settings.livingCellBlue,
      a: settings.livingCellAlpha,
    }).toRgbString();

    const deadCellColor = tinycolor({
      r: settings.deadCellRed,
      g: settings.deadCellGreen,
      b: settings.deadCellBlue,
      a: settings.deadCellAlpha,
    }).toRgbString();

    const gridLineColor = tinycolor({
      r: settings.gridLineRed,
      g: settings.gridLineGreen,
      b: settings.gridLineBlue,
      a: settings.gridLineAlpha,
    }).toRgbString();

    // draw cells
    for (let i = 0; i < settings.gridSize; i++) {
      for (let j = 0; j < settings.gridSize; j++) {
        const flatIndex = i * settings.gridSize + j;
        const isAlive = gameBoard[flatIndex] === 1;

        // set fill color
        ctx.fillStyle = isAlive ? livingCellColor : deadCellColor;

        // set stroke color for grid lines
        if (settings.showGrid) {
          ctx.strokeStyle = gridLineColor;
          ctx.lineWidth = 0.3;
        } else {
          ctx.strokeStyle = isAlive ? livingCellColor : deadCellColor;
        }

        // draw rectangle
        ctx.fillRect(
          i * cellWidth,
          j * cellHeight,
          cellWidth + 1,
          cellHeight + 1,
        );
        ctx.strokeRect(
          i * cellWidth,
          j * cellHeight,
          cellWidth + 1,
          cellHeight + 1,
        );

        // show neighbor count if enabled
        if (settings.showNeighborCount) {
          const neighbors = neighborCounts[flatIndex];
          if (neighbors > 0) {
            const fontSize = Math.min(cellWidth, cellHeight) * 0.6;
            ctx.font = `${fontSize}px Onest`;
            ctx.fillStyle = "black";

            const text = neighbors.toString();
            const metrics = ctx.measureText(text);
            const textWidth = metrics.width;
            const textHeight = fontSize;

            const x = cellWidth * i + cellWidth / 2 - textWidth / 2;
            const y = cellHeight * j + cellHeight / 2 + textHeight / 3;

            ctx.fillText(text, x, y);
          }
        }
      }
    }

    // draw thick grid lines (every 10 squares)
    if (settings.showThickGrid) {
      const solidLines = Math.floor(settings.gridSize / 10);
      ctx.strokeStyle = gridLineColor;
      ctx.lineWidth = 1;

      for (let i = 1; i <= solidLines; i++) {
        // vertical lines
        ctx.beginPath();
        ctx.moveTo(cellWidth * i * 10, 0);
        ctx.lineTo(cellWidth * i * 10, canvasSize.height);
        ctx.stroke();

        // horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, cellHeight * i * 10);
        ctx.lineTo(canvasSize.width, cellHeight * i * 10);
        ctx.stroke();
      }
    }
  }, [gameBoard, neighborCounts, settings, canvasSize]);

  return (
    <div className={styles.canvasWrapper}>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseUp={handleMouseUp}
        style={{
          display: "block",
          cursor: "pointer",
          backgroundColor: "#ffffff",
          width: "100%",
          height: "100%",
        }}
      />
      {/* display HUD if enabled */}
      {settings.showHUD && (
        <DraggableContainer parentRef={canvasRef}>
          <div className={styles.hudWrapper}>
            <p>
              <span className="bold">Boundary type:</span>{" "}
              {settings.isToroidal ? "Toroidal" : "Finite"}
            </p>
            <p>
              <span className="bold">Game Board Size:</span> {settings.gridSize}{" "}
              x {settings.gridSize}
            </p>
            <p>
              <span className="bold">Timer Interval:</span> {settings.interval}{" "}
              ms
            </p>
          </div>
        </DraggableContainer>
      )}
    </div>
  );
}
