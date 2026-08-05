(function () {
  'use strict';

  const profileKey = 'infrasec-learner-profile';
  const alwaysFullKey = 'infrasec-always-show-full-content';
  const onboardingKey = 'infrasec-level-onboarding-shown';
  const levelLabels = ['Comecando', 'Base em formacao', 'Pratica guiada', 'Competencia demonstrada'];
  const sessionOverrides = new Set();

  const domains = {
    network: {
      title: 'Redes', page: 'network-practice', prepPage: 'journey', prepLabel: 'Voltar ao plano de redes',
      next: 'Entender IP, gateway e DNS antes de configurar roteadores.',
      glossary: ['IP = endereco do dispositivo', 'Gateway = saida para outra rede', 'DNS = traduz nome para IP']
    },
    operations: {
      title: 'Help Desk e NOC', page: 'helpdesk-noc', prepPage: 'week-one', prepLabel: 'Fazer a Semana 1',
      next: 'Aprender a separar sintoma, hipotese, evidencia e correcao.',
      glossary: ['Sintoma = o que o usuario percebe', 'Evidencia = dado que testa uma hipotese', 'Escalar = passar com contexto']
    },
    linux: {
      title: 'Linux e Git', page: 'linux-guide', prepPage: 'linux-guide', prepLabel: 'Abrir o guia basico',
      next: 'Praticar navegacao, arquivos e permissoes antes dos desafios.',
      glossary: ['Shell = interface de comandos', 'Diretorio = pasta', 'Permissao = quem pode ler, escrever ou executar']
    },
    security: {
      title: 'Seguranca e SOC', page: 'soc', prepPage: 'dependencies', prepLabel: 'Revisar dependencias',
      next: 'Diferenciar login, permissao, log e alerta antes de investigar incidentes.',
      glossary: ['Log = registro de um evento', 'Alerta = regra que destacou um evento', 'IOC = indicador relevante para a investigacao']
    },
    cloud: {
      title: 'Cloud', page: 'cloud', prepPage: 'dependencies', prepLabel: 'Revisar rede primeiro',
      next: 'Entender rede, identidade e responsabilidade compartilhada antes de criar recursos.',
      glossary: ['Cloud = infraestrutura consumida como servico', 'VPC/VNet = rede virtual', 'IAM/RBAC = controle de acesso']
    },
    architecture: {
      title: 'Arquitetura', page: 'architecture', prepPage: 'journey', prepLabel: 'Revisar o fluxo basico',
      next: 'Seguir uma requisicao de cliente para DNS, aplicacao e dados.',
      glossary: ['Componente = parte do sistema', 'Dependencia = algo necessario para funcionar', 'Fluxo = ordem percorrida pela requisicao']
    },
    career: {
      title: 'Carreira e portfolio', page: 'portfolio', prepPage: 'today', prepLabel: 'Voltar para a missao atual',
      next: 'Concluir uma evidencia pequena antes de pensar em uma vaga inteira.',
      glossary: ['Entregavel = prova concreta do estudo', 'Portfolio = conjunto de evidencias', 'Rubrica = criterio usado na avaliacao']
    },
    english: {
      title: 'Ingles tecnico', page: 'english', prepPage: 'english', prepLabel: 'Abrir ingles basico',
      next: 'Aprender cinco termos por semana e usa-los em um ticket curto.',
      glossary: ['Issue = problema', 'Evidence = evidencia', 'Resolution = resolucao']
    }
  };

  const pageRequirements = {
    dependencies: ['network', 0], 'network-practice': ['network', 1], 'packet-tracer': ['network', 1],
    'weekly-overview': ['network', 0], 'weekly-tasks': ['network', 0], 'week-one': ['network', 0],
    'helpdesk-noc': ['operations', 1], 'ticket-simulator': ['operations', 0], 'validated-labs': ['operations', 1],
    'linux-guide': ['linux', 0], terminal: ['linux', 1], soc: ['security', 1], cloud: ['cloud', 1],
    architecture: ['architecture', 1], certifications: ['career', 0], 'cert-practice': ['career', 1],
    portfolio: ['career', 0], readiness: ['career', 0], simulations: ['career', 0], interview: ['career', 1],
    english: ['english', 0]
  };

  const questions = [
    ['network', 'Para que serve um endereco IP?', ['Nao sei ainda', 'Identificar um dispositivo em uma rede IP', 'Guardar a senha do Wi-Fi', 'Traduzir nomes de sites'], 1],
    ['network', 'Um site abre pelo IP, mas nao pelo nome. Qual servico merece ser testado primeiro?', ['Nao sei ainda', 'DHCP', 'DNS', 'Bluetooth'], 2],
    ['operations', 'Ao receber "a internet caiu", qual e o melhor primeiro passo?', ['Nao sei ainda', 'Reiniciar tudo', 'Descobrir escopo, horario e sintoma exato', 'Trocar o roteador'], 2],
    ['operations', 'O que torna um ticket util para outra pessoa?', ['Nao sei ainda', 'Muitos termos dificeis', 'Evidencias, impacto, acao e resultado', 'Somente a frase "resolvido"'], 2],
    ['linux', 'Qual comando mostra o diretorio atual no Linux?', ['Nao sei ainda', 'pwd', 'rm', 'chmod'], 1],
    ['linux', 'Em permissoes Linux, o que significa a letra r?', ['Nao sei ainda', 'Reiniciar', 'Rotear', 'Ler'], 3],
    ['security', 'Autenticacao responde qual pergunta?', ['Nao sei ainda', 'Quem e voce?', 'Quanto custa?', 'Qual rota usar?'], 1],
    ['security', 'Varias falhas de login em contas diferentes vindas do mesmo IP sao...', ['Nao sei ainda', 'Prova definitiva de malware', 'Um sinal para investigar', 'Sempre normais'], 2],
    ['cloud', 'No modelo de responsabilidade compartilhada, o cliente ainda precisa proteger...', ['Nao sei ainda', 'Identidades, configuracoes e dados', 'O predio do provedor', 'Os cabos submarinos'], 1],
    ['cloud', 'VPC na AWS e VNet no Azure representam principalmente...', ['Nao sei ainda', 'Uma rede virtual', 'Um banco de dados', 'Uma certificacao'], 1],
    ['architecture', 'Em uma aplicacao web simples, qual fluxo faz mais sentido?', ['Nao sei ainda', 'Banco -> teclado -> DNS', 'Navegador -> DNS/rede -> aplicacao -> dados', 'Firewall -> mouse -> impressora'], 2],
    ['architecture', 'Uma dependencia e...', ['Nao sei ainda', 'Algo que o componente precisa para funcionar', 'Um erro obrigatorio', 'Um tipo de usuario'], 1],
    ['career', 'Qual item e melhor evidencia de portfolio?', ['Nao sei ainda', 'Uma lista de tecnologias', 'Um lab com objetivo, comandos, resultado e aprendizado', 'Dizer que estudou muito'], 2],
    ['career', 'Antes de marcar uma certificacao, o melhor sinal e...', ['Nao sei ainda', 'Ter visto o nome dos assuntos', 'Conseguir explicar, praticar e revisar erros de simulados limpos', 'Decorar dumps'], 2],
    ['english', 'Em um ticket, "root cause" significa...', ['Nao sei ainda', 'Causa raiz', 'Usuario final', 'Rede publica'], 1],
    ['english', 'A frase "the request timed out" indica que...', ['Nao sei ainda', 'A solicitacao excedeu o tempo de espera', 'A senha foi alterada', 'O arquivo foi salvo'], 1]
  ];

  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  };
  const asList = (value) => Array.isArray(value) ? value : Object.values(value || {});
  const maxScore = (items) => Math.max(0, ...asList(items).map((item) => Number(item?.score || 0)));
  const passed = (items) => asList(items).some((item) => item?.passed || Number(item?.score || 0) >= 80);
  const guidedDone = (weeks) => {
    const state = read('infrasec-guided-progress', {});
    return Object.entries(state).filter(([key, value]) => weeks.includes(Number(key.split('-')[0])) && value === 'done').length;
  };

  function evidenceLevel(domain) {
    if (domain === 'network') {
      const deep = read('infrasec-deep-journey', {});
      if (passed(deep)) return [3, 'Missao de redes aprovada com pelo menos 80%.'];
      if (asList(deep).length || guidedDone([0, 1, 2, 3, 4, 5]) >= 5) return [2, 'Ha pratica guiada registrada nas semanas de redes.'];
      if (guidedDone([0, 1, 2, 3, 4, 5])) return [1, 'Ha missao inicial de redes concluida.'];
    }
    if (domain === 'operations') {
      const deep = read('infrasec-deep-incidents', []);
      if (passed(deep)) return [3, 'Incidente Help Desk/NOC aprovado com evidencia.'];
      if (deep.length) return [2, 'Ha tentativa de incidente avaliada.'];
      if (read('infrasec-ticket-attempts', []).length) return [1, 'Ha chamado introdutorio registrado.'];
    }
    if (domain === 'linux') {
      const terminal = read('infrasec-deep-terminal', {});
      const terminalPassed = asList(terminal).filter((item) => item?.passed).length;
      if (terminalPassed >= 2) return [3, 'Dois desafios de terminal foram aprovados.'];
      if (terminalPassed) return [2, 'Um desafio de terminal foi aprovado.'];
      if (guidedDone([6])) return [1, 'Ha missao da semana Linux concluida.'];
    }
    if (domain === 'security') {
      const soc = read('infrasec-deep-soc', []);
      if (passed(soc)) return [3, 'Caso SOC aprovado com pelo menos 80%.'];
      if (soc.length) return [2, 'Ha investigacao SOC avaliada.'];
      if (guidedDone([8, 9])) return [1, 'Ha missao de seguranca ou SOC concluida.'];
    }
    if (domain === 'cloud') {
      const cloud = read('infrasec-deep-cloud', []);
      if (passed(cloud)) return [3, 'Lab cloud aprovado com pelo menos 80%.'];
      if (cloud.length) return [2, 'Ha analise cloud avaliada.'];
      if (guidedDone([10])) return [1, 'Ha missao cloud concluida.'];
    }
    if (domain === 'architecture') {
      const architecture = read('infrasec-deep-architecture', {});
      if (passed(architecture)) return [3, 'Mapa de arquitetura aprovado com evidencia.'];
      if (asList(architecture).length) return [2, 'Ha exercicio de arquitetura avaliado.'];
      if (guidedDone([11])) return [1, 'Ha missao de arquitetura concluida.'];
    }
    if (domain === 'career') {
      const deliverables = read('infrasec-deliverables', []);
      if (deliverables.length >= 3) return [3, 'Tres ou mais entregaveis foram produzidos.'];
      if (deliverables.length) return [2, 'Ha entregavel salvo na central.'];
      if (read('infrasec-exam-history', []).length || read('infrasec-interview-history', []).length) return [1, 'Ha pratica de carreira registrada.'];
    }
    if (domain === 'english') {
      const practices = asList(read('infrasec-english-practice', {}));
      if (maxScore(practices) >= 80) return [3, 'Pratica de ingles tecnico aprovada com 80% ou mais.'];
      if (practices.length) return [2, 'Ha pratica de ingles tecnico avaliada.'];
    }
    return [0, 'Ainda nao ha evidencia pratica nesta competencia.'];
  }

  function diagnosticLevels() {
    return read(profileKey, {}).levels || {};
  }

  function competency(domain) {
    const diagnosis = Number(diagnosticLevels()[domain] || 0);
    const evidence = evidenceLevel(domain);
    return { level: Math.max(diagnosis, evidence[0]), evidence: evidence[1], diagnosis, evidenceLevel: evidence[0] };
  }

  function renderProfile() {
    const entries = Object.entries(domains).map(([id, domain]) => ({ id, domain, ...competency(id) }));
    const total = entries.reduce((sum, item) => sum + item.level, 0);
    const demonstrated = entries.filter((item) => item.level === 3).length;
    const weakest = Math.min(...entries.map((item) => item.level));
    document.getElementById('levelOverview').innerHTML = `
      <div><span>Leitura geral</span><strong>${levelLabels[Math.floor(total / entries.length)]}</strong></div>
      <div><span>Competencias demonstradas</span><strong>${demonstrated} de ${entries.length}</strong></div>
      <div><span>Prioridade atual</span><strong>Nivel ${weakest}</strong></div>`;
    document.getElementById('levelDomainGrid').innerHTML = entries.map((item) => `
      <article class="level-domain-card">
        <header><h3>${item.domain.title}</h3><span class="level-badge">N${item.level}</span></header>
        <strong>${levelLabels[item.level]}</strong>
        <progress max="3" value="${item.level}">${item.level} de 3</progress>
        <p>${item.domain.next}</p>
        <span class="level-evidence">${item.evidence}</span>
      </article>`).join('');
    renderBalanced(entries);
  }

  function renderBalanced(entries) {
    const recommendations = [...entries].sort((a, b) => a.level - b.level).slice(0, 3);
    document.getElementById('balancedRecommendations').innerHTML = recommendations.map((item, index) => `
      <article class="balanced-card">
        <span>Prioridade ${index + 1} · Nivel ${item.level}</span>
        <strong>${item.domain.title}</strong>
        <p>${item.domain.next}</p>
        <button type="button" data-adaptive-page="${item.domain.page}">Abrir estudo recomendado</button>
      </article>`).join('');
  }

  function renderSupport(pageId = document.body.dataset.hubPage) {
    const support = document.getElementById('adaptiveSupport');
    const requirement = pageRequirements[pageId];
    document.body.classList.remove('adaptive-content-locked');
    support.hidden = true;
    support.className = 'adaptive-support';
    if (!requirement || pageId === 'level') return;
    const [domainId, required] = requirement;
    const domain = domains[domainId];
    const current = competency(domainId);
    const alwaysFull = localStorage.getItem(alwaysFullKey) === 'true';
    const locked = current.level < required && !alwaysFull && !sessionOverrides.has(pageId);
    document.body.dataset.learnerLevel = String(current.level);
    support.hidden = false;
    support.classList.toggle('is-gate', locked);
    support.innerHTML = locked ? `
      <div>
        <span class="guided-eyebrow">Preparacao recomendada · ${domain.title}</span>
        <h2>Essa tela esta um passo acima da sua base atual</h2>
        <p>Seu nivel e <strong>${levelLabels[current.level]}</strong> e esta atividade espera <strong>${levelLabels[required]}</strong>. O conteudo continua aqui, mas primeiro vale aprender estes termos:</p>
        <div class="adaptive-glossary">${domain.glossary.map((item) => `<span>${item}</span>`).join('')}</div>
      </div>
      <div class="adaptive-support-actions">
        <button class="primary" type="button" data-adaptive-page="${domain.prepPage}">${domain.prepLabel}</button>
        <button type="button" data-unlock-page="${pageId}">Abrir conteudo mesmo assim</button>
        <button type="button" data-adaptive-page="level">Ver meu nivel</button>
      </div>` : `
      <div>
        <span class="guided-eyebrow">${domain.title} · Nivel ${current.level}</span>
        <h3>${levelLabels[current.level]}</h3>
        <p>${current.evidence}</p>
      </div>
      <div class="adaptive-support-actions"><button type="button" data-adaptive-page="level">Ver equilibrio das competencias</button></div>`;
    document.body.classList.toggle('adaptive-content-locked', locked);
  }

  let diagnosticIndex = 0;
  let answers = [];

  function renderQuestion() {
    const [domainId, question, options] = questions[diagnosticIndex];
    document.getElementById('diagnosticDomain').textContent = domains[domainId].title;
    document.getElementById('diagnosticPosition').textContent = `${diagnosticIndex + 1} de ${questions.length}`;
    document.getElementById('diagnosticProgress').value = diagnosticIndex + 1;
    document.getElementById('diagnosticQuestion').textContent = question;
    document.getElementById('diagnosticOptions').innerHTML = options.map((option, index) => `
      <label><input type="radio" name="diagnostic-answer" value="${index}" ${answers[diagnosticIndex] === index ? 'checked' : ''}> ${option}</label>`).join('');
    document.getElementById('diagnosticBack').disabled = diagnosticIndex === 0;
    const next = document.getElementById('diagnosticNext');
    next.disabled = answers[diagnosticIndex] == null;
    next.textContent = diagnosticIndex === questions.length - 1 ? 'Concluir diagnostico' : 'Proxima pergunta';
  }

  function finishDiagnostic() {
    const scores = Object.fromEntries(Object.keys(domains).map((domain) => [domain, 0]));
    questions.forEach(([domainId, , , correct], index) => {
      if (answers[index] === correct) scores[domainId] += 1;
    });
    const levels = Object.fromEntries(Object.entries(scores).map(([domain, score]) => [domain, score]));
    localStorage.setItem(profileKey, JSON.stringify({ levels, answers, completedAt: new Date().toISOString() }));
    localStorage.setItem(onboardingKey, 'true');
    document.getElementById('diagnosticRunner').hidden = true;
    document.getElementById('diagnosticIntro').hidden = false;
    document.getElementById('startDiagnostic').textContent = 'Refazer diagnostico';
    document.getElementById('diagnosticResult').textContent = 'Diagnostico salvo. O nivel 3 continuara reservado para atividades praticas aprovadas.';
    renderProfile();
    renderSupport();
  }

  document.getElementById('startDiagnostic').addEventListener('click', () => {
    diagnosticIndex = 0;
    answers = [];
    document.getElementById('diagnosticIntro').hidden = true;
    document.getElementById('diagnosticRunner').hidden = false;
    document.getElementById('diagnosticResult').textContent = '';
    renderQuestion();
  });
  document.getElementById('diagnosticOptions').addEventListener('change', (event) => {
    answers[diagnosticIndex] = Number(event.target.value);
    document.getElementById('diagnosticNext').disabled = false;
  });
  document.getElementById('diagnosticBack').addEventListener('click', () => {
    if (diagnosticIndex > 0) diagnosticIndex -= 1;
    renderQuestion();
  });
  document.getElementById('diagnosticNext').addEventListener('click', () => {
    if (answers[diagnosticIndex] == null) return;
    if (diagnosticIndex === questions.length - 1) finishDiagnostic();
    else { diagnosticIndex += 1; renderQuestion(); }
  });
  document.getElementById('alwaysShowFullContent').addEventListener('change', (event) => {
    localStorage.setItem(alwaysFullKey, String(event.target.checked));
    renderSupport();
  });
  document.addEventListener('click', (event) => {
    const pageButton = event.target.closest('[data-adaptive-page]');
    if (pageButton) window.InfraSecHub?.navigateToPage(pageButton.dataset.adaptivePage);
    const unlockButton = event.target.closest('[data-unlock-page]');
    if (unlockButton) {
      sessionOverrides.add(unlockButton.dataset.unlockPage);
      renderSupport(unlockButton.dataset.unlockPage);
    }
  });

  window.addEventListener('infrasec:page-changed', (event) => renderSupport(event.detail.pageId));
  window.addEventListener('infrasec:competency-changed', () => {
    renderProfile();
    renderSupport();
  });
  window.addEventListener('storage', () => {
    renderProfile();
    renderSupport();
  });

  document.getElementById('alwaysShowFullContent').checked = localStorage.getItem(alwaysFullKey) === 'true';
  const profile = read(profileKey, {});
  if (profile.completedAt) document.getElementById('startDiagnostic').textContent = 'Refazer diagnostico';
  renderProfile();
  renderSupport();
  if (!profile.completedAt && localStorage.getItem(onboardingKey) !== 'true') {
    localStorage.setItem(onboardingKey, 'true');
    window.InfraSecHub?.navigateToPage('level', true);
  }
})();
