import type { LearningStore } from '../app/useLearning';
import { activeRun, dueReview } from '../domain/learning';
import { lessons } from '../content/lessons';
import { ProgressView } from '../features/ProgressView';
import { ConnectionSketch, Icon } from './Icons';
import { legacyUrl, pages } from './catalog';
import journey from './journey.json';

export function resumeRoute(store: LearningStore) {
  const p = store.envelope.progress;
  const active = activeRun(p);
  if (active) return active.kind === 'review' ? 'revisao' : 'avaliacao';
  const due = dueReview(p);
  if (due && !due.completed && Date.parse(due.dueAt) <= Date.now()) return 'revisao';
  return p.route;
}

export function Home({ store }: { store: LearningStore }) {
  const p = store.envelope.progress;
  const started = Boolean(
    p.read.length || p.attempts.length || p.runs.length || p.labAttempts.length,
  );
  const due = dueReview(p);
  const next = resumeRoute(store);
  return (
    <article className="home-page">
      <h1 tabIndex={-1}>Seu próximo passo, com clareza.</h1>
      <p className="platform-lead">Aprenda, pratique e volte ao que precisa de atenção.</p>
      <section className="study-next" aria-label="Próxima sessão de estudo">
        <div>
          <h2>Como um computador acessa um site</h2>
          <p>NET-R01 · 11 lições com exemplos, exercícios e diagnóstico.</p>
          <div className="actions">
            <a className="button primary" href={`#/${next}`}>
              {activeRun(p)
                ? 'Retomar tentativa'
                : started
                  ? 'Retomar meu estudo'
                  : 'Começar a unidade'}
            </a>
            <a className="button" href="#/redes">
              Ver formação de redes
            </a>
          </div>
          {started && (
            <p className="resume-note">
              Próxima tela:{' '}
              {lessons.find((l) => `aula/${l.id}` === next)?.title ||
                {
                  revisao: 'Revisão posterior',
                  avaliacao: 'Avaliação independente',
                  pratica: 'Laboratório guiado',
                  recuperacao: 'Recuperação',
                  progresso: 'Evidências e histórico',
                }[next]}
              .
            </p>
          )}
        </div>
        <ConnectionSketch />
      </section>
      <div className="study-facts">
        <div>
          <Icon kind={3} />
          <p>
            <strong>{p.read.length} de 11</strong>
            <span>leituras registradas</span>
          </p>
        </div>
        <div>
          <Icon kind={1} />
          <p>
            <strong>
              {p.runs.filter((r) => r.status === 'completed' && r.kind === 'independent').length ||
                'Nenhuma'}
            </strong>
            <span>avaliação concluída</span>
          </p>
        </div>
        <div>
          <Icon kind={2} />
          <p>
            <strong>{due ? 'Revisão' : 'Revisão'}</strong>
            <span>
              {due
                ? due.completed
                  ? 'agenda inicial concluída'
                  : `sugerida em ${new Date(due.dueAt).toLocaleDateString('pt-BR')}`
                : 'após a primeira avaliação'}
            </span>
          </p>
        </div>
      </div>
      <h2>Um percurso maior que esta unidade</h2>
      <div className="path-rows">
        <a href="#/redes">
          <Icon kind={4} />
          <strong>Redes</strong>
          <span>
            Base, endereçamento, switching e roteamento. A primeira unidade já está disponível.
          </span>
          <b>Explorar →</b>
        </a>
        <a href="#/helpdesk-noc">
          <Icon kind={3} />
          <strong>Operação e segurança</strong>
          <span>
            Help Desk, NOC, Linux e SOC. Conteúdo em revisão; ferramentas anteriores identificadas.
          </span>
          <b>Ver áreas →</b>
        </a>
        <a href="#/cloud">
          <Icon kind={5} />
          <strong>Cloud, carreira e recursos</strong>
          <span>Arquitetura, certificações e portfólio com disponibilidade explícita.</span>
          <b>Conhecer →</b>
        </a>
      </div>
      <p className="evidence-note">
        Leitura registrada não significa domínio demonstrado. O plano de 12 semanas organiza o
        percurso; a conclusão de cada formação depende de conteúdo e avaliação próprios.
      </p>
    </article>
  );
}

export function Networks({ store }: { store: LearningStore }) {
  return (
    <article>
      <h1 tabIndex={-1}>Formação de redes</h1>
      <p className="platform-lead">Entenda o caminho. Investigue a falha. Explique a evidência.</p>
      <p>
        A sequência preserva a base das semanas 1–6 do percurso InfraSec. A R01 oferece ensino
        completo neste recorte; as próximas unidades ainda precisam de redação, prática e revisão
        técnica.
      </p>
      <section className="available-unit">
        <span className="availability available">Disponível · NET-R01</span>
        <h2>Como um computador acessa um site</h2>
        <p>
          IP e máscara, MAC, gateway, DNS, TCP, HTTPS e diagnóstico. Onze aulas em português com
          exemplos resolvidos e exercícios comentados.
        </p>
        <ol className="learning-cycle">
          <li>Entender com exemplos e diagramas</li>
          <li>Praticar nove cenários de diagnóstico</li>
          <li>Avaliar decisões sem correção antecipada</li>
          <li>Recuperar conceitos e revisar depois</li>
        </ol>
        <div className="actions">
          <a className="button primary" href={`#/${resumeRoute(store)}`}>
            Entrar na unidade NET-R01
          </a>
          <a href="#/pratica">Abrir laboratório guiado</a>
        </div>
        <p className="scope-note">
          {store.envelope.progress.read.length}/11 leituras registradas. Nenhuma equivalência
          automática com CCNA, N1–N3 ou prontidão profissional.
        </p>
      </section>
      <h2>O que vem depois</h2>
      <p>
        Unidades planejadas: seus objetivos fazem parte da formação, mas ainda não são aulas
        disponíveis.
      </p>
      <ol className="curriculum-list">
        {journey.slice(1, 6).map((w) => (
          <li key={w.week}>
            <div>
              <strong>{w.title}</strong>
              <p>{w.outcome}</p>
              <small>Pré-requisito: {w.prerequisite}</small>
            </div>
            <span className="availability">Planejada</span>
          </li>
        ))}
      </ol>
      <div className="inline-links">
        <a href="#/dependencias">Ver dependências</a>
        <a href="#/packet-tracer">Labs Packet Tracer</a>
        <a href="#/jornada">Plano de 12 semanas</a>
      </div>
    </article>
  );
}

export function Journey({ mode }: { mode: string }) {
  return (
    <article>
      <h1 tabIndex={-1}>{pages.find((p) => p.hash === mode)?.name || 'Plano de 12 semanas'}</h1>
      <p className="platform-lead">
        Objetivos e sequência do percurso original, com disponibilidade explícita.
      </p>
      <p>
        Este roteiro preserva as 12 semanas e 84 missões como organização curricular. Ele não é uma
        formação nova concluída. A NET-R01 cobre parte da base da primeira semana; marcações e notas
        antigas não foram transformadas em domínio.
      </p>
      <a className="button primary" href="#/redes">
        Estudar a base disponível
      </a>
      {journey
        .filter((w) => mode !== 'semana-1' || w.week === 1)
        .map((w) => (
          <details className="week-row" key={w.week} open={w.week === 1}>
            <summary>
              Semana {w.week} · {w.title}
            </summary>
            <p>
              <strong>Resultado esperado:</strong> {w.outcome}
            </p>
            <p>
              <strong>Pré-requisito:</strong> {w.prerequisite}
            </p>
            <p>
              <strong>Critério original a revisar:</strong> {w.exit}
            </p>
            <p>
              <strong>Não estudar ainda:</strong> {w.notYet}
            </p>
            <ol>
              {w.days.map((d, i) => (
                <li key={d.title}>
                  <strong>
                    {
                      [
                        'Segunda',
                        'Terça',
                        'Quarta',
                        'Quinta',
                        'Sexta',
                        'Sábado · consolidação',
                        'Domingo · revisão',
                      ][i]
                    }
                    : {d.title}
                  </strong>
                  <p>{d.objective}</p>
                  <small>Evidência proposta: {d.evidence}</small>
                </li>
              ))}
            </ol>
            <p className="scope-note">
              Missões preservadas como roteiro. O ensino aprofundado e a avaliação desta semana
              ainda precisam de revisão{w.week === 1 ? '; comece pela R01 disponível em Redes' : ''}
              .
            </p>
          </details>
        ))}
    </article>
  );
}

export function Area({ route }: { route: string }) {
  const page = pages.find((p) => p.hash === route);
  if (!page) return null;
  const references = [
    'certificacoes',
    'biblioteca',
    'fila-leitura',
    'estante',
    'nao-estudar',
    'dependencias',
  ];
  const tools = [
    'packet-tracer',
    'simulador-chamados',
    'terminal',
    'certificacoes-pratica',
    'portfolio',
    'labs-validados',
    'prontidao',
    'simulados',
    'entrevista',
    'templates',
  ];
  const kind = references.includes(route)
    ? 'reference'
    : tools.includes(route)
      ? 'tool'
      : 'formation';
  return (
    <article>
      <h1 tabIndex={-1}>{page.name}</h1>
      <p className="platform-lead">{page.purpose}.</p>
      <div className="area-status">
        <strong>
          {kind === 'reference'
            ? 'Referência complementar'
            : kind === 'tool'
              ? 'Ferramenta disponível na versão anterior'
              : 'Conteúdo em reformulação'}
        </strong>
        <p>
          {kind === 'formation'
            ? 'As aulas aprofundadas desta área ainda estão em reformulação. Você pode consultar os casos anteriores, com seus critérios e limites originais.'
            : 'A organização desta área está em reformulação. O recurso anterior permanece acessível abaixo; ele complementa o estudo e não é apresentado como uma formação concluída.'}
        </p>
      </div>
      <h2>Como esta área se organiza</h2>
      <p>{page.internal}.</p>
      <h2>Seu fluxo de trabalho</h2>
      <p>{page.flow}.</p>
      <h2>{kind === 'formation' ? 'Conteúdo previsto' : 'Uso e limites'}</h2>
      <p>
        {kind === 'formation'
          ? page.rewrite
          : kind === 'reference'
            ? 'Use as referências para consultar e aprofundar assuntos. Marcar uma leitura não demonstra domínio e não substitui as aulas e atividades da unidade.'
            : 'Os resultados desta ferramenta seguem os critérios da versão anterior. Eles não são convertidos automaticamente em evidências independentes da nova formação.'}
      </p>
      <h2>Disponível na versão anterior</h2>
      <p>
        O link abre a página original em outra aba. Ela não é uma aula revisada nem concede
        evidências na R01. Seus dados anteriores continuam no armazenamento da origem em que foram
        criados.
      </p>
      <a className="button" href={legacyUrl(page.hash)} target="_blank" rel="noopener noreferrer">
        Abrir {page.name} na versão anterior
      </a>
      <div className="inline-links">
        <a href="#/redes">Estudar a unidade disponível</a>
        <a href="#/jornada">Ver posição no percurso</a>
      </div>
    </article>
  );
}

export function Level({ store }: { store: LearningStore }) {
  return (
    <>
      <ProgressView store={store} />
      <section className="legacy-note">
        <h2>Diagnóstico anterior</h2>
        <p>
          Os níveis N0–N3 do Hub anterior usam outros critérios. Eles não foram importados como
          domínio demonstrado nesta unidade.
        </p>
        <a href={legacyUrl('meu-nivel')} target="_blank" rel="noopener noreferrer">
          Consultar diagnóstico anterior
        </a>
      </section>
    </>
  );
}
