  const asList = (value) => Array.isArray(value) ? value : Object.values(value || {});
  const maxScore = (items) => Math.max(0, ...asList(items).map((item) => Number(item?.score || 0)));
  const hasPassed = (items) => asList(items).some((item) => item?.passed || Number(item?.score || 0) >= 80);
  const guidedDone = (progress, weeks) => Object.entries(progress || {})
    .filter(([key, value]) => weeks.includes(Number(key.split('-')[0])) && value === 'done').length;

  function evaluateEvidenceLevel(domain, snapshot = {}) {
    if (domain === 'network') {
      const deep = snapshot.journey || {};
      if (hasPassed(deep)) return [3, 'Missao de redes aprovada com pelo menos 80%.'];
      if (asList(deep).length || guidedDone(snapshot.guidedProgress, [0, 1, 2, 3, 4, 5]) >= 5) return [2, 'Ha pratica guiada registrada nas semanas de redes.'];
      if (guidedDone(snapshot.guidedProgress, [0, 1, 2, 3, 4, 5])) return [1, 'Ha missao inicial de redes concluida.'];
    }
    if (domain === 'operations') {
      const deep = Array.isArray(snapshot.incidents) ? snapshot.incidents : [];
      if (hasPassed(deep)) return [3, 'Incidente Help Desk/NOC aprovado com evidencia.'];
      if (deep.length) return [2, 'Ha tentativa de incidente avaliada.'];
      if (Array.isArray(snapshot.ticketAttempts) && snapshot.ticketAttempts.length) return [1, 'Ha chamado introdutorio registrado.'];
    }
    if (domain === 'linux') {
      const terminalPassed = asList(snapshot.terminal).filter((item) => item?.passed).length;
      if (terminalPassed >= 2) return [3, 'Dois desafios de terminal foram aprovados.'];
      if (terminalPassed) return [2, 'Um desafio de terminal foi aprovado.'];
      if (guidedDone(snapshot.guidedProgress, [6])) return [1, 'Ha missao da semana Linux concluida.'];
    }
    if (domain === 'security') {
      const soc = Array.isArray(snapshot.soc) ? snapshot.soc : [];
      if (hasPassed(soc)) return [3, 'Caso SOC aprovado com pelo menos 80%.'];
      if (soc.length) return [2, 'Ha investigacao SOC avaliada.'];
      if (guidedDone(snapshot.guidedProgress, [8, 9])) return [1, 'Ha missao de seguranca ou SOC concluida.'];
    }
    if (domain === 'cloud') {
      const cloud = Array.isArray(snapshot.cloud) ? snapshot.cloud : [];
      if (hasPassed(cloud)) return [3, 'Lab cloud aprovado com pelo menos 80%.'];
      if (cloud.length) return [2, 'Ha analise cloud avaliada.'];
      if (guidedDone(snapshot.guidedProgress, [10])) return [1, 'Ha missao cloud concluida.'];
    }
    if (domain === 'architecture') {
      const architecture = snapshot.architecture || {};
      if (hasPassed(architecture)) return [3, 'Mapa de arquitetura aprovado com evidencia.'];
      if (asList(architecture).length) return [2, 'Ha exercicio de arquitetura avaliado.'];
      if (guidedDone(snapshot.guidedProgress, [11])) return [1, 'Ha missao de arquitetura concluida.'];
    }
    if (domain === 'career') {
      const deliverables = Array.isArray(snapshot.deliverables) ? snapshot.deliverables : [];
      if (deliverables.length >= 3) return [3, 'Tres ou mais entregaveis foram produzidos.'];
      if (deliverables.length) return [2, 'Ha entregavel salvo na central.'];
      if ((Array.isArray(snapshot.examHistory) && snapshot.examHistory.length)
        || (Array.isArray(snapshot.interviewHistory) && snapshot.interviewHistory.length)) return [1, 'Ha pratica de carreira registrada.'];
    }
    if (domain === 'english') {
      const practices = asList(snapshot.englishPractice);
      if (maxScore(practices) >= 80) return [3, 'Pratica de ingles tecnico aprovada com 80% ou mais.'];
      if (practices.length) return [2, 'Ha pratica de ingles tecnico avaliada.'];
    }
    return [0, 'Ainda nao ha evidencia pratica nesta competencia.'];
  }

  export const evidenceRules = Object.freeze({ evaluateEvidenceLevel });
