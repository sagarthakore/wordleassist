import { useState, useEffect, useCallback } from "react";
import "./App.css";
import "./styles/squares.css";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";
import { GameBoard } from "./components/GameBoard";
import { Keyboard } from "./components/Keyboard";
import { Suggestions } from "./components/Suggestions";
import { findMatchingWords } from "./services/wordService";

export type TileStatus = "empty" | "tbd" | "absent" | "present" | "correct";
export interface TileData {
  letter: string;
  status: TileStatus;
}

const ROWS = 6;
const COLS = 5;

function createEmptyBoard(): TileData[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      letter: "",
      status: "empty" as TileStatus,
    }))
  );
}

function computeConstraints(
  board: TileData[][],
  lockedRows: boolean[]
): { word: string; include: string; exclude: string } {
  const greenPattern = Array(COLS).fill("_");
  const includePatterns: string[] = [];
  const excludeSet = new Set<string>();
  const nonExcludeSet = new Set<string>();

  for (let r = 0; r < ROWS; r++) {
    if (!lockedRows[r]) continue;

    const rowInclude = Array(COLS).fill("_");
    let hasYellow = false;

    for (let c = 0; c < COLS; c++) {
      const tile = board[r][c];
      const letter = tile.letter.toLowerCase();

      if (tile.status === "correct") {
        greenPattern[c] = letter;
        nonExcludeSet.add(letter);
      } else if (tile.status === "present") {
        rowInclude[c] = letter;
        hasYellow = true;
        nonExcludeSet.add(letter);
      } else if (tile.status === "absent") {
        excludeSet.add(letter);
      }
    }

    if (hasYellow) {
      includePatterns.push(rowInclude.join(""));
    }
  }

  // Don't exclude letters that are also green or yellow somewhere
  for (const letter of nonExcludeSet) {
    excludeSet.delete(letter);
  }

  return {
    word: greenPattern.join(""),
    include: includePatterns.join(","),
    exclude: Array.from(excludeSet).join(""),
  };
}

function App() {
  const [board, setBoard] = useState<TileData[][]>(createEmptyBoard());
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [lockedRows, setLockedRows] = useState<boolean[]>(
    Array(ROWS).fill(false)
  );

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const [shakingRow, setShakingRow] = useState<number | null>(null);
  const [popCol, setPopCol] = useState<number | null>(null);
  const [howToOpen, setHowToOpen] = useState(false);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const triggerShake = useCallback((row: number) => {
    setShakingRow(row);
    setTimeout(() => setShakingRow(null), 600);
  }, []);

  const triggerPop = useCallback((col: number) => {
    setPopCol(col);
    setTimeout(() => setPopCol(null), 150);
  }, []);

  const fetchSuggestions = useCallback(
    (boardArg: TileData[][], lockedArg: boolean[]) => {
      const constraints = computeConstraints(boardArg, lockedArg);
      setError(null);
      setIsLoading(true);
      findMatchingWords(
        constraints.word,
        constraints.include,
        constraints.exclude
      )
        .then((results) => {
          setSuggestions(results);
          setHasSearched(true);
        })
        .catch((err: unknown) => {
          setSuggestions([]);
          setHasSearched(true);
          setError(
            err instanceof Error
              ? err.message
              : "Couldn't load suggestions. Please try again."
          );
        })
        .finally(() => setIsLoading(false));
    },
    []
  );

  const handleKeyPress = useCallback(
    (key: string) => {
      if (currentRow >= ROWS) return;
      if (lockedRows[currentRow]) return;

      if (key === "ENTER") {
        if (currentCol < COLS) {
          showToast("Not enough letters");
          triggerShake(currentRow);
          return;
        }

        // Check all tiles have been colored
        const rowTiles = board[currentRow];
        const hasUncolored = rowTiles.some(
          (t) => t.status === "tbd" || t.status === "empty"
        );
        if (hasUncolored) {
          showToast("Click tiles to set their colors");
          triggerShake(currentRow);
          return;
        }

        // Lock the row
        const newLocked = [...lockedRows];
        newLocked[currentRow] = true;

        // Update state
        setLockedRows(newLocked);
        setCurrentRow(currentRow + 1);
        setCurrentCol(0);

        fetchSuggestions(board, newLocked);

        return;
      }

      if (key === "BACKSPACE") {
        if (currentCol > 0) {
          const newBoard = board.map((row) => row.map((t) => ({ ...t })));
          newBoard[currentRow][currentCol - 1] = {
            letter: "",
            status: "empty",
          };
          setBoard(newBoard);
          setCurrentCol(currentCol - 1);
        }
        return;
      }

      // Letter key
      if (currentCol < COLS && /^[A-Z]$/.test(key)) {
        const newBoard = board.map((row) => row.map((t) => ({ ...t })));
        newBoard[currentRow][currentCol] = { letter: key, status: "absent" };
        setBoard(newBoard);
        setCurrentCol(currentCol + 1);
        triggerPop(currentCol);
      }
    },
    [
      currentRow,
      currentCol,
      board,
      lockedRows,
      showToast,
      triggerShake,
      triggerPop,
      fetchSuggestions,
    ]
  );

  // Physical keyboard handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.repeat) return;

      if (e.key === "Enter") {
        e.preventDefault();
        handleKeyPress("ENTER");
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleKeyPress("BACKSPACE");
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKeyPress]);

  const handleTileClick = useCallback(
    (row: number, col: number) => {
      if (row !== currentRow || lockedRows[row]) return;
      if (board[row][col].letter === "") return;

      const newBoard = board.map((r) => r.map((t) => ({ ...t })));
      const tile = newBoard[row][col];

      // Cycle: absent → present → correct → absent
      const cycle: TileStatus[] = ["absent", "present", "correct"];
      const idx = cycle.indexOf(tile.status);
      tile.status = cycle[(idx + 1) % cycle.length];

      setBoard(newBoard);
    },
    [currentRow, board, lockedRows]
  );

  const handleSuggestionClick = useCallback(
    (word: string) => {
      if (currentRow >= ROWS || lockedRows[currentRow]) return;

      const newBoard = board.map((r) => r.map((t) => ({ ...t })));
      for (let c = 0; c < COLS && c < word.length; c++) {
        newBoard[currentRow][c] = {
          letter: word[c].toUpperCase(),
          status: "absent",
        };
      }
      // Clear remaining cols if word is shorter
      for (let c = word.length; c < COLS; c++) {
        newBoard[currentRow][c] = { letter: "", status: "empty" };
      }
      setBoard(newBoard);
      setCurrentCol(Math.min(word.length, COLS));
    },
    [currentRow, board, lockedRows]
  );

  // Compute keyboard statuses from locked rows
  const keyStatuses = new Map<string, TileStatus>();
  for (let r = 0; r < ROWS; r++) {
    if (!lockedRows[r]) continue;
    for (let c = 0; c < COLS; c++) {
      const tile = board[r][c];
      const key = tile.letter;
      if (!key) continue;

      const current = keyStatuses.get(key);
      const priority: TileStatus[] = ["absent", "present", "correct"];
      const currentPriority = current ? priority.indexOf(current) : -1;
      const newPriority = priority.indexOf(tile.status);
      if (newPriority > currentPriority) {
        keyStatuses.set(key, tile.status);
      }
    }
  }

  const handleUndo = () => {
    // Find the last locked row
    let lastLocked = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (lockedRows[r]) {
        lastLocked = r;
        break;
      }
    }
    if (lastLocked === -1) return;

    // Unlock it and move cursor back
    const newLocked = [...lockedRows];
    newLocked[lastLocked] = false;

    // Clear any rows after the unlocked one
    const newBoard = board.map((r) => r.map((t) => ({ ...t })));
    for (let r = lastLocked + 1; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        newBoard[r][c] = { letter: "", status: "empty" };
      }
    }

    setLockedRows(newLocked);
    setBoard(newBoard);
    setCurrentRow(lastLocked);
    setCurrentCol(COLS);

    // Re-fetch suggestions with remaining locked rows, or clear if none left
    const hasAnyLocked = newLocked.some((l) => l);
    if (hasAnyLocked) {
      fetchSuggestions(newBoard, newLocked);
    } else {
      setSuggestions([]);
      setHasSearched(false);
      setError(null);
    }
  };

  const canUndo = lockedRows.some((l) => l);

  const handleClear = () => {
    setBoard(createEmptyBoard());
    setCurrentRow(0);
    setCurrentCol(0);
    setLockedRows(Array(ROWS).fill(false));
    setSuggestions([]);
    setHasSearched(false);
    setError(null);
  };

  const handleRetry = () => fetchSuggestions(board, lockedRows);

  return (
    <ThemeProvider defaultTheme="system" storageKey="wordleassist-theme">
      <div className="wordle-app">
        <header className="wordle-header">
          <div className="wordle-header-left" />
          <div className="wordle-header-center">
            <h1 className="wordle-title">Wordle Assist</h1>
            <span className="wordle-subtitle">
              Click{" "}
              <a
                className="wordle-link"
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.nytimes.com/games/wordle/index.html"
              >
                here
              </a>{" "}
              to play Wordle
            </span>
          </div>
          <div className="wordle-header-right">
            <button
              className="header-btn"
              onClick={handleClear}
              title="Reset board"
              aria-label="Reset board"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 1 9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 22v-6h6" />
              </svg>
            </button>
            <ModeToggle />
          </div>
        </header>

        {toast && <div className="wordle-toast">{toast}</div>}

        <div className="wordle-how-to">
          <button
            className="how-to-toggle"
            onClick={() => setHowToOpen(!howToOpen)}
            aria-expanded={howToOpen}
          >
            <h2 className="how-to-title">How to use Wordle Assist</h2>
            <span className={`how-to-chevron ${howToOpen ? "how-to-chevron--open" : ""}`} />
          </button>
          <div className={`how-to-content ${howToOpen ? "how-to-content--open" : ""}`}>
            <div className="how-to-inner">
              <ol className="how-to-steps">
                <li>
                  Play{" "}
                  <a
                    href="https://www.nytimes.com/games/wordle/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wordle-link"
                  >
                    Wordle
                  </a>{" "}
                  and enter your guess below using the keyboard.
                </li>
                <li>
                  <strong>Click each tile</strong> to match the colors Wordle
                  gave you:{" "}
                  <span className="how-to-color how-to-color--absent">gray</span>{" "}
                  (not in word),{" "}
                  <span className="how-to-color how-to-color--present">
                    yellow
                  </span>{" "}
                  (wrong spot),{" "}
                  <span className="how-to-color how-to-color--correct">
                    green
                  </span>{" "}
                  (correct spot).
                </li>
                <li>
                  Press <strong>Enter</strong> to submit. We'll suggest possible
                  words for your next guess.
                </li>
                <li>
                  Click a suggestion to auto-fill your next row. Repeat until
                  you solve it!
                </li>
              </ol>
            </div>
          </div>
        </div>

        <main className="wordle-main">
          <GameBoard
            board={board}
            currentRow={currentRow}
            lockedRows={lockedRows}
            onTileClick={handleTileClick}
            shakingRow={shakingRow}
            popCol={popCol}
            onUndo={handleUndo}
            canUndo={canUndo}
          />

          <Keyboard keyStatuses={keyStatuses} onKeyPress={handleKeyPress} />

          <Suggestions
            words={suggestions}
            isLoading={isLoading}
            hasSearched={hasSearched}
            error={error}
            onRetry={handleRetry}
            onWordClick={handleSuggestionClick}
          />
        </main>
      </div>

      <ul className="squares">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
    </ThemeProvider>
  );
}

export default App;
