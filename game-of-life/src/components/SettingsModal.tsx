import tinycolor from "tinycolor2";
import type { GameSettings } from "../GameOfLifeModule";
import styles from "./SettingsModal.module.css";
import { useState } from "react";
type Props = {
  onSave: (newSettings: GameSettings) => void;
  onCancel: () => void;
  settings: GameSettings;
};

export default function SettingsModal({ onSave, onCancel, settings }: Props) {
  const RGBAtoHexString = (r: number, g: number, b: number, a: number) => {
    return tinycolor({
      r,
      g,
      b,
      a,
    }).toHexString();
  };

  const hexStringToRGBA = (hex: string) => {
    const color = tinycolor(hex).toRgb();
    return { r: color.r, g: color.g, b: color.b, a: color.a };
  };

  const [livingCellColor, setLivingCellColor] = useState({
    r: settings.livingCellRed,
    g: settings.livingCellGreen,
    b: settings.livingCellBlue,
    a: settings.livingCellAlpha,
  });

  const [deadCellColor, setDeadCellColor] = useState({
    r: settings.deadCellRed,
    g: settings.deadCellGreen,
    b: settings.deadCellBlue,
    a: settings.deadCellAlpha,
  });

  const [gridLineColor, setGridLineColor] = useState({
    r: settings.gridLineRed,
    g: settings.gridLineGreen,
    b: settings.gridLineBlue,
    a: settings.gridLineAlpha,
  });

  const [gridSize, setGridSize] = useState(settings.gridSize);

  const [interval, setInterval] = useState(settings.interval);

  const saveSettings = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    const newSettings: GameSettings = {
      ...settings,
      livingCellRed: livingCellColor.r,
      livingCellGreen: livingCellColor.g,
      livingCellBlue: livingCellColor.b,
      livingCellAlpha: livingCellColor.a,
      deadCellRed: deadCellColor.r,
      deadCellGreen: deadCellColor.g,
      deadCellBlue: deadCellColor.b,
      deadCellAlpha: deadCellColor.a,
      gridLineRed: gridLineColor.r,
      gridLineGreen: gridLineColor.g,
      gridLineBlue: gridLineColor.b,
      gridLineAlpha: gridLineColor.a,
      gridSize: gridSize,
      interval: interval,
    };
    onSave(newSettings);
  };

  return (
    <div className={styles.backdrop}>
      <form action="" className={styles.settingsForm}>
        <div className={styles.settingWrapper}>
          <input
            type="color"
            id="livingCellColor"
            name="livingCellColor"
            value={RGBAtoHexString(
              livingCellColor.r,
              livingCellColor.g,
              livingCellColor.b,
              livingCellColor.a
            )}
            onChange={(e) =>
              setLivingCellColor(hexStringToRGBA(e.target.value))
            }
            required
          />
          <label htmlFor="livingCellColor">Living Cell Color</label>
        </div>
        <div className={styles.settingWrapper}>
          <input
            type="color"
            id="deadCellColor"
            name="deadCellColor"
            value={RGBAtoHexString(
              deadCellColor.r,
              deadCellColor.g,
              deadCellColor.b,
              deadCellColor.a
            )}
            onChange={(e) => setDeadCellColor(hexStringToRGBA(e.target.value))}
            required
          />
          <label htmlFor="deadCellColor">Dead Cell Color</label>
        </div>
        <div className={styles.settingWrapper}>
          <input
            type="color"
            id="gridLineColor"
            name="gridLineColor"
            value={RGBAtoHexString(
              gridLineColor.r,
              gridLineColor.g,
              gridLineColor.b,
              gridLineColor.a
            )}
            onChange={(e) => setGridLineColor(hexStringToRGBA(e.target.value))}
            required
          />
          <label htmlFor="gridLineColor">Grid Line Color</label>
        </div>
        <div className={styles.settingWrapper}>
          <input
            type="number"
            id="gridSize"
            name="gridSize"
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            max={100}
            min={10}
            required
          />
          x
          <input
            type="number"
            id="gridSize"
            name="gridSize"
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            max={100}
            min={10}
            required
          />
          <label htmlFor="gridSize">Grid Size</label>
        </div>
        <div className={styles.settingWrapper}>
          <input
            type="number"
            id="interval"
            name="interval"
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            max={5000}
            min={20}
            required
          />
          (ms)
          <label htmlFor="interval">Timer Interval </label>
        </div>
        <div className={styles.formControls}>
          <button onClick={saveSettings}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
