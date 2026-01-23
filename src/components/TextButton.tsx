import { motion } from "motion/react";
import styles from "./styles/TextButton.module.css";
import type { PropsWithChildren } from "react";

type Props = {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};
export default function TextButton({
  onClick,
  children,
}: PropsWithChildren<Props>) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, cursor: "pointer" }}
      whileTap={{ scale: 0.95 }}
      className={styles.button}
    >
      {children}
    </motion.button>
  );
}
