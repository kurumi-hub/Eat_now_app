const ALTERNATIVE_SEPARATOR = /\s+(?:hoặc|hay|or)\s+|\s*[|/]\s*/giu;

/**
 * Split only explicit alternatives. Ordinary multi-word food names such as
 * "bún bò Huế" remain one query, while "bún hoặc hủ tiếu" becomes two.
 */
export function splitAlternativeFoodQueries(query: string | null, maxItems = 3) {
  if (!query) return [];

  const parts = query
    .split(ALTERNATIVE_SEPARATOR)
    .map((part) => part.trim().replace(/^["“”']+|["“”']+$/g, ""))
    .filter(Boolean);

  return [...new Set(parts)].slice(0, maxItems);
}
