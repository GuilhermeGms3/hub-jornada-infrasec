const normalize = (value) => String(value || '').trim();

export function getMissionSession(sessions, missionKey) {
  const stored = sessions?.[missionKey] || {};
  return {
    steps: stored.steps && typeof stored.steps === 'object' ? stored.steps : {},
    evidence: normalize(stored.evidence),
    evidenceSaved: Boolean(stored.evidenceSaved),
    updatedAt: stored.updatedAt || null
  };
}

export function setStepState(session, stepIndex, patch) {
  const previous = session.steps?.[stepIndex] || {};
  return {
    ...session,
    steps: {
      ...session.steps,
      [stepIndex]: {
        ...previous,
        ...patch,
        updatedAt: new Date().toISOString()
      }
    },
    updatedAt: new Date().toISOString()
  };
}

export function saveMissionEvidence(session, evidence) {
  const value = normalize(evidence);
  if (value.length < 80) {
    return { valid: false, message: 'A evidencia precisa ter pelo menos 80 caracteres com resultado e interpretacao.' };
  }
  return {
    valid: true,
    session: {
      ...session,
      evidence: value,
      evidenceSaved: true,
      updatedAt: new Date().toISOString()
    }
  };
}

export function validateManualStep(step, submission) {
  if (['activity', 'quiz'].includes(step.completion) && !submission.activityPassed) {
    return { valid: false, message: 'Conclua a atividade vinculada e volte para importar a nota.' };
  }
  const response = normalize(submission.response);
  const output = normalize(submission.output);
  const checked = [...new Set(submission.checked || [])];
  if (response.length < 60) {
    return { valid: false, message: 'Responda a pergunta com pelo menos 60 caracteres e uma explicacao sua.' };
  }
  if (checked.length < (step.checks?.length || 0)) {
    return { valid: false, message: 'Confirme todos os criterios somente depois de verifica-los.' };
  }
  if (step.requiresOutput && output.length < 40) {
    return { valid: false, message: 'Cole pelo menos 40 caracteres de comando, output ou resultado observado.' };
  }
  return {
    valid: true,
    stepState: {
      state: 'done',
      response,
      output,
      checked,
      score: submission.activityScore ?? 100,
      source: submission.activitySource || 'guided-validation'
    }
  };
}

export function activityResultFor(target, snapshot) {
  if (!target) return null;
  if (/CCNA-1-Study-Hub\/quiz\.html$/i.test(target)) {
    const stats = snapshot.quiz || {};
    const score = Number(stats.lastQuizPct);
    const date = new Date(stats.lastQuizDate);
    return Number.isFinite(score) && stats.lastQuizDate && !Number.isNaN(date.getTime())
      ? { score, passed: score >= 70, updatedAt: date.toISOString(), source: 'ccna-quiz' }
      : null;
  }
  if (!target.startsWith('practice:')) return null;
  const [, type, id] = target.split(':');
  if (['journey', 'terminal', 'certs', 'architecture'].includes(type)) {
    const state = snapshot[type]?.[id];
    return state ? { score: Number(state.score || 0), passed: Boolean(state.passed), updatedAt: state.updatedAt, source: type } : null;
  }
  if (['incidents', 'soc', 'cloud'].includes(type)) {
    const state = (snapshot[type] || []).find((item) => item.id === id);
    return state ? { score: Number(state.score || 0), passed: Boolean(state.passed), updatedAt: state.createdAt, source: type } : null;
  }
  return null;
}

export function applyActivityResult(session, steps, target, result) {
  if (!result?.passed) return { changed: false, session };
  let next = session;
  let changed = false;
  steps.forEach((step, index) => {
    const acceptsResult = step.target === target && ['activity', 'quiz'].includes(step.completion);
    const current = next.steps?.[index];
    const alreadyImported = current?.activityUpdatedAt === (result.updatedAt || null)
      && current?.source === result.source && Number(current?.score) === Number(result.score);
    if (!acceptsResult || current?.state === 'done' || alreadyImported) return;
    next = setStepState(next, index, {
      state: 'verified',
      score: result.score,
      source: result.source,
      activityUpdatedAt: result.updatedAt || null
    });
    changed = true;
  });
  return { changed, session: next };
}

export function missionReadiness(session, stepCount) {
  const completed = Array.from({ length: stepCount }, (_, index) => session.steps?.[index]?.state === 'done').filter(Boolean).length;
  return {
    completed,
    total: stepCount,
    evidenceReady: Boolean(session.evidenceSaved && normalize(session.evidence).length >= 80),
    ready: completed === stepCount && Boolean(session.evidenceSaved && normalize(session.evidence).length >= 80)
  };
}
