  const PASS_THRESHOLD = 75;
  const HISTORY_LIMIT = 20;

  const isPassingScore = (score) => Number(score || 0) >= PASS_THRESHOLD;

  function grade(questions, answers) {
    const items = Array.isArray(questions) ? questions : [];
    const responses = Array.isArray(answers) ? answers : [];
    const correct = items.filter((item, index) => responses[index] === item?.correct).length;
    const score = items.length ? Math.round(correct / items.length * 100) : 0;
    return { correct, total: items.length, score, passed: isPassingScore(score) };
  }

  function selectStageForLevel(level) {
    return Number(level || 0) === 0 ? 'foundation' : 'applied';
  }

  function recordAttempt(domainState, stage, score, timestamps = {}) {
    const current = domainState && typeof domainState === 'object' ? domainState : {};
    const previous = current[stage] && typeof current[stage] === 'object' ? current[stage] : {};
    const numericScore = Number(score || 0);
    const passed = isPassingScore(numericScore);
    const history = Array.isArray(current.history) ? current.history : [];
    return {
      ...current,
      [stage]: {
        passed: Boolean(previous.passed || passed),
        best: Math.max(Number(previous.best || 0), numericScore),
        attempts: Number(previous.attempts || 0) + 1,
        updatedAt: timestamps.updatedAt
      },
      history: [{ stage, score: numericScore, passed, createdAt: timestamps.createdAt }, ...history].slice(0, HISTORY_LIMIT)
    };
  }

  export const assessment = Object.freeze({
      PASS_THRESHOLD,
      HISTORY_LIMIT,
      isPassingScore,
      grade,
      selectStageForLevel,
      recordAttempt
  });
