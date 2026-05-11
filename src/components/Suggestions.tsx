interface SuggestionsProps {
  words: string[];
  isLoading: boolean;
  hasSearched: boolean;
  error: string | null;
  onRetry: () => void;
  onWordClick: (word: string) => void;
}

export function Suggestions({
  words,
  isLoading,
  hasSearched,
  error,
  onRetry,
  onWordClick,
}: SuggestionsProps) {
  if (isLoading) {
    return (
      <div className="suggestions suggestions--loading">
        <div className="suggestions-spinner" />
        <span>Finding words...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="suggestions suggestions--error" role="alert">
        <svg
          className="suggestions-error-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <p className="suggestions-error-message">{error}</p>
        <button
          type="button"
          className="suggestions-retry"
          onClick={onRetry}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="suggestions suggestions--help">
        <p className="suggestions-instruction">
          Type your Wordle guess, then <strong>click each tile</strong> to set
          its color:
        </p>
        <div className="suggestions-legend">
          <span className="legend-item">
            <span className="legend-tile legend-tile--absent" /> Gray (not in
            word)
          </span>
          <span className="legend-item">
            <span className="legend-tile legend-tile--present" /> Yellow (wrong
            spot)
          </span>
          <span className="legend-item">
            <span className="legend-tile legend-tile--correct" /> Green (correct
            spot)
          </span>
        </div>
        <p className="suggestions-instruction">
          Press <strong>Enter</strong> to submit and get word suggestions.
        </p>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="suggestions suggestions--empty">
        <p>No matching words found. Try different colors.</p>
      </div>
    );
  }

  return (
    <div className="suggestions">
      <div className="suggestions-header">
        <span className="suggestions-count">
          {words.length} possible word{words.length !== 1 ? "s" : ""}
        </span>
        <span className="suggestions-hint">Click a word to fill your next guess</span>
      </div>
      <div className="suggestions-grid">
        {words.map((word, idx) => (
          <button
            key={idx}
            className="suggestion-word"
            onClick={() => onWordClick(word)}
          >
            {word.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
