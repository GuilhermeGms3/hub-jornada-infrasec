  const thresholds = Object.freeze({
    INTRO_TICKET: 70,
    DEEP_ACTIVITY: 80
  });

  const meetsThreshold = (score, threshold) => Number(score || 0) >= Number(threshold || 0);

  function allChecksComplete(checks, expectedCount = Array.isArray(checks) ? checks.length : 0) {
    const items = Array.isArray(checks) ? checks : [];
    return items.length === Number(expectedCount) && items.every(Boolean);
  }

  export const scoring = Object.freeze({ thresholds, meetsThreshold, allChecksComplete });
