import { motion } from "motion/react";
import type { IconType } from "react-icons";

export default function IconButton({
  IconComponent,
  onClick,
}: {
  IconComponent: IconType;
  onClick: () => void;
}) {
  return (
    <motion.button
      style={{
        display: "flex",
        placeContent: "center",
        borderRadius: "50%",
        padding: 16,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.05, cursor: "pointer" }}
      whileTap={{ scale: 0.95 }}
    >
      <IconComponent style={{ fontSize: "16px" }} />
    </motion.button>
  );
}
