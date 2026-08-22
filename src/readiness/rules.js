  const gate = (label, passed, critical = false) => ({ label, passed: Boolean(passed), critical });

  function summarizeGates(gates) {
    const items = Array.isArray(gates) ? gates : [];
    const passedCount = items.filter((item) => item?.passed).length;
    const criticalMissing = items.some((item) => item?.critical && !item?.passed);
    const rawScore = items.length ? Math.round(passedCount / items.length * 100) : 0;
    const score = criticalMissing ? Math.min(69, rawScore) : rawScore;
    return { passedCount, criticalMissing, rawScore, score, missing: items.filter((item) => !item?.passed) };
  }

  function evaluateReadiness(snapshot = {}) {
    const deepJourney = snapshot.journey || {};
    const deepIncidents = Array.isArray(snapshot.incidents) ? snapshot.incidents : [];
    const deepSoc = Array.isArray(snapshot.soc) ? snapshot.soc : [];
    const deepCloud = Array.isArray(snapshot.cloud) ? snapshot.cloud : [];
    const deepTerminal = snapshot.terminal || {};
    const deepCerts = snapshot.certs || {};
    const deepArchitecture = snapshot.architecture || {};
    const labProgress = snapshot.labProgress || {};
    const labIds = Array.isArray(snapshot.labIds) ? snapshot.labIds : [];
    const deliverables = Array.isArray(snapshot.deliverables) ? snapshot.deliverables : [];
    const interviewHistory = Array.isArray(snapshot.interviewHistory) ? snapshot.interviewHistory : [];
    const labCount = labIds.filter((id) => labProgress[id]?.completed).length;
    const deliverableCount = deliverables.filter((item) => item?.status === 'concluido').length;
    const uniquePassed = (items, predicate = () => true) => new Set(items
      .filter((item) => item?.passed && predicate(item)).map((item) => item.id)).size;
    const journeyPassed = (ids) => ids.every((id) => deepJourney[id]?.passed);
    const terminalPassed = (ids) => ids.every((id) => deepTerminal[id]?.passed);
    const architecturePassed = (ids) => ids.every((id) => deepArchitecture[id]?.passed);
    const certScore = (ids) => Math.max(0, ...ids.map((id) => Number(deepCerts[id]?.score || 0)));
    const interviewScores = interviewHistory.map((item) => Number(item?.score || 0)).filter(Boolean);
    const interviewAverage = interviewScores.length
      ? Math.round(interviewScores.reduce((sum, value) => sum + value, 0) / interviewScores.length) : 0;

    const requirements = [
      {
        role: 'Help Desk',
        cert: 'ITF+ opcional; Linux Essentials agrega mais',
        gates: [
          gate('Semanas 1 e 2 aprovadas', journeyPassed(['w1', 'w2']), true),
          gate('2 incidentes Help Desk com 80%+', uniquePassed(deepIncidents, (item) => item.area === 'Help Desk') >= 2, true),
          gate('2 desafios Linux aprovados', Object.values(deepTerminal).filter((item) => item?.passed).length >= 2),
          gate('2 entregaveis concluidos', deliverableCount >= 2),
          gate('Entrevista tecnica media 70%+', interviewAverage >= 70)
        ]
      },
      {
        role: 'Suporte N2',
        cert: 'Linux Essentials; CCNA em andamento',
        gates: [
          gate('Semanas 1 a 4 aprovadas', journeyPassed(['w1', 'w2', 'w3', 'w4']), true),
          gate('4 incidentes com 80%+', uniquePassed(deepIncidents) >= 4, true),
          gate('2 labs Packet Tracer validados', labCount >= 2),
          gate('4 desafios Linux/Git aprovados', Object.values(deepTerminal).filter((item) => item?.passed).length >= 4),
          gate('Cliente-servidor e camadas aprovados', architecturePassed(['client-server', 'layered'])),
          gate('4 entregaveis concluidos', deliverableCount >= 4),
          gate('Entrevista tecnica media 70%+', interviewAverage >= 70)
        ]
      },
      {
        role: 'NOC',
        cert: 'CCNA; Fortinet NSE 1-3 complementa',
        gates: [
          gate('Semanas 1 a 6 aprovadas', journeyPassed(['w1', 'w2', 'w3', 'w4', 'w5', 'w6']), true),
          gate('3 incidentes NOC com 80%+', uniquePassed(deepIncidents, (item) => item.area === 'NOC') >= 3, true),
          gate('Labs VLAN, OSPF e ACL validados', ['vlan', 'ospf', 'acl'].every((id) => labProgress[id]?.completed), true),
          gate('Desafio Linux de rede aprovado', terminalPassed(['linux-network'])),
          gate('Arquitetura distribuida aprovada', architecturePassed(['distributed'])),
          gate('Plano CCNA em 60%+', certScore(['ccna']) >= 60),
          gate('5 entregaveis concluidos', deliverableCount >= 5)
        ]
      },
      {
        role: 'SOC',
        cert: 'SC-900/Fortinet como base; SC-200 ou Security+ como aprofundamento',
        gates: [
          gate('3 casos SOC distintos com 80%+', uniquePassed(deepSoc) >= 3, true),
          gate('Casos de spray e comprometimento aprovados', ['spray', 'bruteforce'].every((id) => deepSoc.some((item) => item.id === id && item.passed)), true),
          gate('Linux logs e services aprovados', terminalPassed(['linux-logs', 'linux-service'])),
          gate('Arquitetura Zero Trust aprovada', architecturePassed(['security'])),
          gate('Plano de seguranca em 60%+', certScore(['sc900', 'fortinet', 'sc200', 'securityplus']) >= 60),
          gate('5 entregaveis concluidos', deliverableCount >= 5),
          gate('Entrevista tecnica media 70%+', interviewAverage >= 70)
        ]
      },
      {
        role: 'Cloud junior',
        cert: 'AZ-900 ou AWS CLF-C02; SC-300 para identidade Microsoft',
        gates: [
          gate('3 labs cloud distintos com 80%+', uniquePassed(deepCloud) >= 3, true),
          gate('IAM/RBAC e rede cloud aprovados', deepCloud.some((item) => ['aws-iam', 'azure-rbac'].includes(item.id) && item.passed)
            && deepCloud.some((item) => ['aws-vpc', 'azure-nsg'].includes(item.id) && item.passed), true),
          gate('4 desafios Linux/Git aprovados', Object.values(deepTerminal).filter((item) => item?.passed).length >= 4),
          gate('Cloud e sistemas distribuidos aprovados', architecturePassed(['cloud', 'distributed'])),
          gate('Plano AWS/Azure em 60%+', certScore(['clf02', 'az900', 'sc300']) >= 60),
          gate('5 entregaveis concluidos', deliverableCount >= 5),
          gate('Entrevista tecnica media 70%+', interviewAverage >= 70)
        ]
      },
      {
        role: 'DevSecOps junior',
        cert: 'Linux Essentials + cloud; SC-300 agrega identidade e Zero Trust',
        gates: [
          gate('Servicos, cloud e Zero Trust aprovados', architecturePassed(['services', 'cloud', 'security']), true),
          gate('2 labs cloud distintos com 80%+', uniquePassed(deepCloud) >= 2, true),
          gate('2 casos SOC distintos com 80%+', uniquePassed(deepSoc) >= 2, true),
          gate('Git branch e recovery aprovados', terminalPassed(['git-branch', 'git-recovery']), true),
          gate('6 desafios Linux/Git aprovados', Object.values(deepTerminal).filter((item) => item?.passed).length >= 6),
          gate('Plano security/cloud em 60%+', certScore(['sc900', 'clf02', 'az900', 'sc300', 'sc200']) >= 60),
          gate('7 entregaveis concluidos', deliverableCount >= 7),
          gate('Entrevista tecnica media 70%+', interviewAverage >= 70)
        ]
      }
    ];

    const roles = requirements.map((requirement) => ({ ...requirement, ...summarizeGates(requirement.gates) }));
    return {
      roles,
      metrics: {
        labCount,
        deliverableCount,
        interviewAverage,
        incidentCount: uniquePassed(deepIncidents),
        socCount: uniquePassed(deepSoc),
        cloudCount: uniquePassed(deepCloud)
      }
    };
  }

  export const readinessRules = Object.freeze({ summarizeGates, evaluateReadiness });
