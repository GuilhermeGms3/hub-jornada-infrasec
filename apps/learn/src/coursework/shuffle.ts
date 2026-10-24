/*! Adapted from CCNA-1-Study-Hub/quiz.html, shuffle.
 * Copyright (c) 2026 Bastiaan van Oorde. MIT License.
 * Full notice: THIRD_PARTY_NOTICES.txt shipped with the application. */
export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temporary = result[i];
    result[i] = result[j];
    result[j] = temporary;
  }
  return result;
}
