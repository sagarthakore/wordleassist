import { type TileData } from "../App";
import { Tile } from "./Tile";

interface GameBoardProps {
  board: TileData[][];
  currentRow: number;
  lockedRows: boolean[];
  onTileClick: (row: number, col: number) => void;
  shakingRow: number | null;
  popCol: number | null;
}

export function GameBoard({
  board,
  currentRow,
  lockedRows,
  onTileClick,
  shakingRow,
  popCol,
}: GameBoardProps) {
  return (
    <div className="board-container">
      <div className="board">
        {board.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className={`board-row ${shakingRow === rowIdx ? "board-row--shake" : ""}`}
          >
            {row.map((tile, colIdx) => (
              <Tile
                key={colIdx}
                letter={tile.letter}
                status={tile.status}
                onClick={() => onTileClick(rowIdx, colIdx)}
                isActive={rowIdx === currentRow && !lockedRows[rowIdx]}
                isPop={
                  rowIdx === currentRow &&
                  colIdx === popCol &&
                  !lockedRows[rowIdx]
                }
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
