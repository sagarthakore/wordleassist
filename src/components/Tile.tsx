import { type TileStatus } from "../App";

interface TileProps {
  letter: string;
  status: TileStatus;
  onClick: () => void;
  isActive: boolean;
  isPop: boolean;
}

export function Tile({ letter, status, onClick, isActive, isPop }: TileProps) {
  const statusClass = letter ? `tile--${status}` : "tile--empty";
  const activeClass = isActive ? "tile--active" : "";
  const popClass = isPop ? "tile--pop" : "";
  const clickable = isActive && letter ? "tile--clickable" : "";

  return (
    <div
      className={`tile ${statusClass} ${activeClass} ${popClass} ${clickable}`}
      onClick={onClick}
    >
      {letter}
    </div>
  );
}
