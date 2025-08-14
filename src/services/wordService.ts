export async function findMatchingWords(
  word: string,
  includeLetters: string,
  excludeLetters: string
): Promise<string[]> {
    const apiUrl =
      import.meta.env.VITE_WORDLEASSIST_API_URL ||
      "http://localhost:7071/api/WordleAssist";

    // Build query parameters
    const params = new URLSearchParams();
    params.append("word", word || "_____");
    params.append("include", includeLetters || "");
    params.append("exclude", excludeLetters || "");

    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
}
