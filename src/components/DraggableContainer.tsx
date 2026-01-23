import { motion } from "motion/react";
import { type PropsWithChildren, type RefObject } from "react";

type Props = {
  parentRef?: RefObject<HTMLCanvasElement | null>;
};

export default function DraggableContainer({
  parentRef,
  children,
}: PropsWithChildren<Props>) {
  return (
    <motion.div
      drag
      dragConstraints={parentRef || false}
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        cursor: "grab",
      }}
      whileDrag={{
        cursor: "grabbing",
      }}
    >
      {children}
    </motion.div>
  );
}
