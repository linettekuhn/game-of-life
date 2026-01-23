import { useState } from "react";
import Modal from "./Modal";
import styles from "./RandomizeModal.module.css";
import TextButton from "./TextButton";

type Props = {
  onRandomize: (seed: number) => void;
  onCancel: () => void;
};

export default function RandomizeModal({ onRandomize, onCancel }: Props) {
  const [seed, setSeed] = useState(() => Math.floor(Date.now() / 1000));
  const footer = (
    <div className={styles.formControls}>
      <TextButton onClick={() => onRandomize(seed)}>Randomize</TextButton>
      <TextButton onClick={onCancel}>Cancel</TextButton>
    </div>
  );
  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Randomize Game Board"
      footer={footer}
    >
      <p className="caption">
        Default seed is current Unix timestamp (seconds)
      </p>
      <div className={styles.inputWrapper}>
        <label htmlFor="seed">Choose a seed</label>
        <input
          type="number"
          id="seed"
          name="seed"
          value={seed}
          onChange={(e) => setSeed(Number(e.target.value))}
          max={1_000_000_000_000}
          min={1}
          required
        />
      </div>
    </Modal>
  );
}
