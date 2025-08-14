import { useState, useEffect } from "react";
import "./App.css";
import "./styles/squares.css";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { findMatchingWords } from "./services/wordService";

function App() {
  // Get route parameters
  const { word = "", include = "", exclude = "" } = useParams();
  const navigate = useNavigate();

  const [letters, setWord] = useState(word || "");
  const [includeLetters, setIncludeLetters] = useState(include || "");
  const [excludeLetters, setExcludeLetters] = useState(exclude || "");
  const [results, setResults] = useState<string[]>([]);
  const [resultCount, setResultCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // New state to track if search was performed
  const [error, setError] = useState<string | null>(null);

  // Update route when form values change
  useEffect(() => {
    // Only update URL if values have actually changed from params
    if (
      letters !== word ||
      includeLetters !== include ||
      excludeLetters !== exclude
    ) {
      // Construct URL path with optional parameters
      let path = "/";
      if (letters || includeLetters || excludeLetters) {
        path += `${letters || "_"}`;
        if (includeLetters || excludeLetters) {
          path += `/${includeLetters || "_"}`;
          if (excludeLetters) {
            path += `/${excludeLetters}`;
          }
        }
      }
      navigate(path, { replace: true });
    }
  }, [
    letters,
    includeLetters,
    excludeLetters,
    navigate,
    word,
    include,
    exclude,
  ]);

  const handleClear = () => {
    setWord("");
    setIncludeLetters("");
    setExcludeLetters("");
    setResults([]);
    setResultCount(0);
    setError(null);
    setHasSearched(false); // Reset search state
    // Clear route params by navigating to root
    navigate("/", { replace: true });
  };

  const handleFindWords = async () => {
    // Construct URL path with optional parameters
    let path = "/";
    if (letters || includeLetters || excludeLetters) {
      path += `${letters || "_"}`;
      if (includeLetters || excludeLetters) {
        path += `/${includeLetters || "_"}`;
        if (excludeLetters) {
          path += `/${excludeLetters}`;
        }
      }
    }
    navigate(path);

    setIsLoading(true);
    setError(null);

    try {
      const response = await findMatchingWords(
        letters,
        includeLetters,
        excludeLetters
      );
      setResults(response);
      setResultCount(response.length);
      setHasSearched(true); // Mark that a search has been performed
    } catch (err) {
      setError("Something went wrong...");
      setResults([]);
      setResultCount(0);
      setHasSearched(true); // Mark that a search has been performed, even if it failed
    } finally {
      setIsLoading(false);
    }
  };

  // Handle letters word input change
  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z_]/g, "").toUpperCase();
    setWord(value);
  };

  // Handle include letters input change
  const handleIncludeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z_]/g, "").toUpperCase();
    setIncludeLetters(value);
  };

  // Handle exclude letters input change
  const handleExcludeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase();
    setExcludeLetters(value);
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="wordleassist-theme">
      <div className="container mx-auto px-4">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl text-center mt-8 mb-2">
          Wordle Assist
        </h1>
        <span className="text-muted-foreground">
          Click{" "}
          <a
            className="text-success"
            target="_blank"
            href="https://www.nytimes.com/games/wordle/index.html"
          >
            here
          </a>{" "}
          to play Wordle
        </span>
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <div className="flex flex-col items-center mt-8">
          <div className="flex w-full flex-col items-center text-left space-y-4 mb-6">
            <div className="w-full max-w-2xl mt-6">
              <Input
                id="letters"
                type="text"
                placeholder="Enter letters"
                value={letters}
                onChange={handleWordChange}
                className="wordle w-full text-2xl py-8 border-4 focus:border-4 rounded-xl"
              />
              <span className="text mt-1 italic">
                Enter letters that appear in{" "}
                <span className="text-success">green</span>. Use underscore for
                letters not in <span className="text-success">green</span>.
                Example: For <span className="text-warning">B</span>
                <span className="text-success">O</span>A
                <span className="text-warning">R</span>D, enter "_O___".
              </span>
            </div>

            <div className="w-full max-w-2xl mt-6">
              <Input
                id="exclude"
                type="text"
                placeholder="Enter letters to exclude"
                value={excludeLetters}
                onChange={handleExcludeChange}
                className="wordle w-full text-2xl py-8 border-4 focus:border-4 rounded-xl"
              />
              <span className="text mt-1 italic">
                Enter letters that appear in grey. No need for underscore.
                Example: For <span className="text-warning">B</span>
                <span className="text-success">O</span>A
                <span className="text-warning">R</span>D, enter "AD".
              </span>
            </div>

            <div className="w-full max-w-2xl mt-6">
              <Input
                id="include"
                type="text"
                placeholder="Enter letters to include"
                value={includeLetters}
                onChange={handleIncludeChange}
                className="wordle w-full text-2xl py-8 border-4 focus:border-4 rounded-xl"
              />
              <span className="text mt-1 italic">
                Enter letters that appear in{" "}
                <span className="text-warning">yellow</span>. Use underscore for
                letters not in <span className="text-warning">yellow</span>.
                Example: For <span className="text-warning">B</span>
                <span className="text-success">O</span>A
                <span className="text-warning">R</span>D, enter "B__R_".
              </span>
            </div>

            <div className="flex space-x-4 max-w-2xl mt-8">
              <Button
                onClick={handleFindWords}
                className="flex-1 py-6 text-xl"
                size="lg"
                disabled={isLoading || letters.trim() === ""}
              >
                {isLoading ? "SEARCHING..." : "FIND WORDS"}
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="py-6 text-xl"
                size="lg"
                disabled={isLoading || letters.trim() === ""}
              >
                CLEAR
              </Button>
            </div>
          </div>

          {/* Results section */}
          {hasSearched && !isLoading && (
            <div className="w-full max-w-2xl mt-8 border rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 bg-card">
                {error ? (
                  <div>
                    <p className="text-destructive p-2 text-center text-4xl">
                      {error}
                    </p>
                  </div>
                ) : resultCount > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-4 justify-center">
                      {results.map((word, index) => (
                        <div
                          key={index}
                          className="p-2 text-center text-4xl uppercase font-mono font-bold"
                        >
                          {word}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-xl">
                      No valid words can be formed. Try different letters.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
