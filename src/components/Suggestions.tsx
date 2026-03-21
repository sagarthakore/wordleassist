interface SuggestionsProps {
  words: string[];
  isLoading: boolean;
  hasSearched: boolean;
  onWordClick: (word: string) => void;
}

const MAX_DISPLAY = 100;

export function Suggestions({
  words,
  isLoading,
  hasSearched,
  onWordClick,
}: SuggestionsProps) {
  if (!hasSearched && !isLoading) {
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

  if (isLoading) {
    return (
      <div className="suggestions suggestions--loading">
        <div className="suggestions-spinner" />
        <span>Finding words...</span>
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

  const displayed = words.slice(0, MAX_DISPLAY);
  const remaining = words.length - displayed.length;

  return (
    <div className="suggestions">
      <div className="suggestions-header">
        <span className="suggestions-count">
          {words.length} possible word{words.length !== 1 ? "s" : ""}
        </span>
        <span className="suggestions-hint">Click a word to fill your next guess</span>
      </div>
      <div className="suggestions-grid">
        {displayed.map((word, idx) => (
          <button
            key={idx}
            className="suggestion-word"
            onClick={() => onWordClick(word)}
          >
            {word.toUpperCase()}
          </button>
        ))}
      </div>
      {remaining > 0 && (
        <p className="suggestions-more">
          and {remaining} more...
        </p>
      )}
    </div>
  );
}
