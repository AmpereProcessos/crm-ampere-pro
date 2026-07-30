function getLevenshteinDistance(string1: string, string2: string): number {
  const matrix = Array(string1.length + 1)
    .fill(null)
    .map(() => Array(string2.length + 1).fill(null));

  for (let index = 0; index <= string1.length; index++) matrix[index][0] = index;
  for (let index = 0; index <= string2.length; index++) matrix[0][index] = index;

  for (let row = 1; row <= string1.length; row++) {
    for (let column = 1; column <= string2.length; column++) {
      const indicator = string1[row - 1] === string2[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + indicator,
      );
    }
  }
  return matrix[string1.length][string2.length];
}

export function calculateStringSimilarity(string1: string, string2: string): number {
  const maxLength = Math.max(string1.length, string2.length);
  const distance = getLevenshteinDistance(string1, string2);
  return ((maxLength - distance) / maxLength) * 100;
}

export function getMostFrequent(values: unknown[]) {
  const frequencies = values.reduce<Record<string, number>>((result, value) => {
    const key = String(value);
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});
  return Object.keys(frequencies).reduce((first, second) =>
    frequencies[first] > frequencies[second] ? first : second,
  );
}

export function getAverageValue(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length || 0;
}
