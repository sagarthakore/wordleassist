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

    let response: Response;
    try {
      response = await fetch(`${apiUrl}?${params.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
    } catch {
      throw new Error(
        "Can't reach the suggestions service. It may be offline. Please try again."
      );
    }

    if (!response.ok) {
      throw new Error(
        `The suggestions service returned an error (status ${response.status}). Please try again.`
      );
    }

    try {
      return await response.json();
    } catch {
      throw new Error("Got an unexpected response from the suggestions service.");
    }
}
