import type { IconType } from "react-icons";

export default function IconButton({
  IconComponent,
  onClick,
}: {
  IconComponent: IconType;
  onClick: () => void;
}) {
  return (
    <button
      style={{
        display: "flex",
        placeContent: "center",
        borderRadius: "50%",
        padding: 16,
      }}
      onClick={onClick}
    >
      <IconComponent style={{ fontSize: "16px" }} />
    </button>
  );
}
