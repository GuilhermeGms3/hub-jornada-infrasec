  function rankDomains(entries, limit = 3) {
    const list = Array.isArray(entries) ? entries : [];
    return list
      .map((item, index) => ({ item, index, level: Number(item?.level ?? 0) }))
      .sort((a, b) => a.level - b.level || a.index - b.index)
      .slice(0, Math.max(0, Number(limit || 0)))
      .map(({ item }) => item);
  }

  export const recommendationRules = Object.freeze({ rankDomains });
