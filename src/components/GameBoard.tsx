import { type TileData } from "../App";
import { Tile } from "./Tile";

interface GameBoardProps {
  board: TileData[][];
  currentRow: number;
  lockedRows: boolean[];
  onTileClick: (row: number, col: number) => void;
  shakingRow: number | null;
  popCol: number | null;
  onUndo: () => void;
  canUndo: boolean;
}

export function GameBoard({
  board,
  currentRow,
  lockedRows,
  onTileClick,
  shakingRow,
  popCol,
  onUndo,
  canUndo,
}: GameBoardProps) {
  // Find the last locked row index
  let lastLockedRow = -1;
  for (let r = board.length - 1; r >= 0; r--) {
    if (lockedRows[r]) {
      lastLockedRow = r;
      break;
    }
  }

  return (
    <div className="board-container">
      <div className="board">
        {board.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className={`board-row-wrapper ${shakingRow === rowIdx ? "board-row--shake" : ""}`}
          >
            <div className="board-row">
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
            {canUndo && rowIdx === lastLockedRow && (
              <button
                className="undo-btn"
                onClick={onUndo}
                title="Undo this row"
                aria-label="Undo this row"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 14 4 9l5-5" />
                  <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
