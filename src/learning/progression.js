  function evaluateCompetency({ diagnosis = 0, evidence = [0, ''], mastery = {} } = {}) {
    const practical = Array.isArray(evidence) ? evidence : [0, ''];
    const currentMastery = mastery && typeof mastery === 'object' ? mastery : {};
    let level = currentMastery.foundation?.passed ? 1 : 0;
    if (level >= 1 && currentMastery.applied?.passed) level = 2;
    if (level >= 2 && Number(practical[0] || 0) >= 3) level = 3;
    const nextGate = level === 0 ? 'Passe na prova de fundamentos.'
      : level === 1 ? 'Passe na prova aplicada.'
        : level === 2 ? 'Aprove uma atividade pratica com evidencia.' : 'Nivel verificado por prova e pratica.';
    return {
      level,
      evidence: `${nextGate} ${practical[1] || ''}`,
      diagnosis: Number(diagnosis || 0),
      evidenceLevel: Number(practical[0] || 0),
      mastery: currentMastery
    };
  }

  export const progression = Object.freeze({ evaluateCompetency });
