import type { LearningStore } from '../app/useLearning';
import { runResult } from '../domain/learning';
import journey from '../platform/journey.json';
import { courseUnits, courseHref, knowledge, r01Knowledge } from './catalog';
import {
  activeCourseRun,
  courseRunResult,
  courseReviewDue,
  initialCoursework,
  objectiveEvidence,
} from './model';

export const weekOneMissions = [
  {
    id: 'w1-d1',
    objectives: ['R01-IP', 'R01-ROTA', 'R01-DNS', 'R01-HTTPS'],
    units: ['net-r01'],
    lessons: [
      ['aula/percurso', 'Caminho da requisição'],
      ['aula/ipv4', 'IPv4'],
      ['aula/gateway', 'Gateway'],
      ['aula/dns', 'DNS'],
    ],
    lab: 'pratica',
    assessment: 'avaliacao',
    evidence: 'Desenho e explicação autorais; desempenho da avaliação R01 separado da leitura.',
  },
  {
    id: 'w1-d2',
    objectives: ['NET-CONFIG', 'NET-DHCP-DORA', 'NET-DHCP-LEASE'],
    units: ['net-r02'],
    lessons: [
      ['unidade/net-r02/interfaces', 'Interpretar configuração'],
      ['unidade/net-r02/dora', 'Aquisição DHCP'],
      ['unidade/net-r02/lease', 'Concessão e renovação'],
    ],
    lab: 'unidade/net-r02/pratica',
    assessment: 'unidade/net-r02/avaliacao',
    evidence:
      'Tabela de configuração com origem declarada e decisões avaliadas; execução Windows opcional não verificada.',
  },
  {
    id: 'w1-d3',
    objectives: ['NET-SCOPE', 'NET-TEST-ORDER', 'NET-TEST-LIMITS', 'NET-TRACE'],
    units: ['net-r03'],
    lessons: [
      ['unidade/net-r03/escopo', 'Escopo e hipóteses'],
      ['unidade/net-r03/ordem', 'Ordem dos testes'],
      ['unidade/net-r03/protocolos', 'Protocolos e limites'],
      ['unidade/net-r03/tracert', 'Tracert'],
    ],
    lab: 'unidade/net-r03/pratica',
    assessment: 'unidade/net-r03/avaliacao',
    evidence:
      'Sequência de testes e conclusões proporcionais ao que os outputs sintéticos mostram.',
  },
  {
    id: 'w1-d4',
    objectives: ['NET-APIPA', 'NET-DHCP-DORA', 'NET-TEST-ORDER'],
    units: ['net-r02', 'net-r03'],
    lessons: [
      ['unidade/net-r02/apipa', 'Interpretar APIPA'],
      ['unidade/net-r02/dora', 'Investigar a aquisição'],
      ['unidade/net-r03/ordem', 'Escolher próximo teste'],
    ],
    lab: 'unidade/net-r02/pratica',
    assessment: 'unidade/net-r02/avaliacao',
    evidence: 'Análise de configuração e hipóteses; APIPA não identifica sozinho a causa.',
  },
  {
    id: 'w1-d5',
    objectives: ['OPS-EVIDENCE', 'OPS-RUNBOOK', 'OPS-VALIDATION', 'OPS-HANDOFF'],
    units: ['net-r04'],
    lessons: [
      ['unidade/net-r04/registro', 'Registro técnico'],
      ['unidade/net-r04/runbook', 'Runbook com decisões'],
      ['unidade/net-r04/mudanca', 'Validação e retorno'],
      ['unidade/net-r04/escalonar', 'Encaminhamento'],
    ],
    lab: 'unidade/net-r04/pratica',
    assessment: 'unidade/net-r04/avaliacao',
    evidence: 'Runbook editável autodeclarado e decisões estruturadas avaliadas separadamente.',
  },
  {
    id: 'w1-d6',
    objectives: ['NET-CONFIG', 'NET-APIPA', 'NET-TEST-LIMITS', 'OPS-VALIDATION'],
    units: ['net-r01', 'net-r02', 'net-r03', 'net-r04'],
    lessons: [
      ['unidade/net-r02/apipa', 'Revisar configuração'],
      ['unidade/net-r03/protocolos', 'Confrontar resultados'],
      ['unidade/net-r04/mudanca', 'Validar a operação'],
    ],
    lab: 'unidade/net-r03/pratica',
    assessment: 'unidade/net-r04/avaliacao',
    evidence:
      'Consolidação dos conjuntos e práticas locais; laboratório real permanece uma evidência externa não supervisionada.',
  },
  {
    id: 'w1-d7',
    objectives: ['NET-DHCP-LEASE', 'NET-TRACE', 'OPS-HANDOFF'],
    units: ['net-r02', 'net-r03', 'net-r04'],
    lessons: [
      ['unidade/net-r02/recuperacao', 'Rever configuração'],
      ['unidade/net-r03/recuperacao', 'Rever diagnóstico'],
      ['unidade/net-r04/recuperacao', 'Rever documentação'],
    ],
    lab: 'unidade/net-r04/pratica',
    assessment: 'unidade/net-r02/revisao',
    evidence:
      'Revisões em novos itens; antecipação é prática e não avança automaticamente a agenda posterior.',
  },
];
function passed(store: Pick<LearningStore, 'envelope'>, id: string) {
  return id === 'net-r01'
    ? store.envelope.progress.runs.some(
        (r) =>
          r.kind === 'independent' &&
          runResult(store.envelope.progress, r).independent &&
          runResult(store.envelope.progress, r).passed,
      )
    : store.envelope.coursework?.runs.some(
        (r) => r.unitId === id && r.kind === 'independent' && courseRunResult(r).independent,
      ) || false;
}
export function missionState(store: Pick<LearningStore, 'envelope'>, index: number) {
  const mission = weekOneMissions[index];
  const c = store.envelope.coursework || initialCoursework();
  if (index === 6)
    return mission.units.every((id) => (courseReviewDue(c, id)?.stage || 0) > 0)
      ? 'Revisões posteriores registradas'
      : 'Revisão recomendada';
  if (mission.units.every((id) => passed(store, id)))
    return 'Conjunto da atividade atendido no recorte local';
  return mission.units.some((id) =>
    id === 'net-r01' ? store.envelope.progress.read.length : c.read.some((r) => r.startsWith(id)),
  )
    ? 'Em aprendizagem'
    : 'Ainda não iniciado';
}
export function recommendedCourseRoute(store: LearningStore) {
  const c = store.envelope.coursework;
  if (!c) return passed(store, 'net-r01') ? 'unidade/net-r02/interfaces' : null;
  const active = activeCourseRun(c);
  if (active)
    return `unidade/${active.unitId}/${active.kind === 'review' ? 'revisao' : 'avaliacao'}`;
  for (const unit of courseUnits) {
    const due = courseReviewDue(c, unit.id);
    if (due && !due.completed && Date.parse(due.dueAt) <= Date.now())
      return `unidade/${unit.id}/revisao`;
  }
  return c.route;
}
export function WeekOne({ store, compact = false }: { store: LearningStore; compact?: boolean }) {
  const next = weekOneMissions.findIndex((_, i) => !missionState(store, i).startsWith('Conjunto'));
  return (
    <section className="week-one-teaching">
      <h2>Semana 1 · do ensino à investigação</h2>
      <p>
        Aulas, prática, avaliação e recuperação estão conectadas às missões. Os estados abaixo
        descrevem atividades locais; não promovem N0–N3 nem confirmam execução real por checkbox.
      </p>
      {weekOneMissions
        .filter((_, i) => !compact || i === Math.max(0, next))
        .map((m) => {
          const i = weekOneMissions.indexOf(m);
          return (
            <details key={m.id} open={compact || i === Math.max(0, next)}>
              <summary>
                {i + 1}. {journey[0].days[i].title} · {missionState(store, i)}
              </summary>
              <p>{journey[0].days[i].objective}</p>
              <p>
                <strong>Objetivos:</strong> {m.objectives.join(', ')}
              </p>
              <ol>
                {m.lessons.map(([route, title]) => (
                  <li key={route}>
                    <a href={`#/${route}`}>{title} · aula e exemplo</a>
                  </li>
                ))}
              </ol>
              <div className="inline-links">
                <a href={`#/${m.lab}`}>Prática e laboratório</a>
                <a href={`#/${m.assessment}`}>
                  {i === 6 ? 'Revisar posteriormente' : 'Avaliação e correção'}
                </a>
                {m.units
                  .filter((id) => id !== 'net-r01')
                  .map((id) => (
                    <a key={id} href={courseHref(id, 'recuperacao')}>
                      Recuperar {id.toUpperCase()}
                    </a>
                  ))}
              </div>
              <p>
                <strong>Evidência:</strong> {m.evidence}
              </p>
            </details>
          );
        })}
      {compact && <a href="#/semana-1">Ver as sete missões e seus conteúdos</a>}
    </section>
  );
}
export function KnowledgeMap({ store }: { store: LearningStore }) {
  const c = store.envelope.coursework || initialCoursework();
  return (
    <article>
      <h1 tabIndex={-1}>Conhecimentos e dependências</h1>
      <p className="platform-lead">
        Entenda o que cada atividade pede e abra as explicações necessárias.
      </p>
      <p>
        Pré-requisitos recomendados, sem bloqueio das próprias aulas introdutórias. O estado
        descreve evidências locais, não a competência inteira de uma certificação.
      </p>
      {knowledge.map((k) => (
        <details className="week-row" key={k.id}>
          <summary>
            {k.id} · {k.name}
          </summary>
          <p>{k.explanation}</p>
          <p>
            <strong>Você deverá conseguir:</strong> {k.observable}
          </p>
          <p>{objectiveEvidence(c, k.id)}</p>
          <h3>Pré-requisitos</h3>
          <ul>
            {k.prerequisites.map((id) => {
              const previous = knowledge.find((n) => n.id === id);
              return (
                <li key={id}>
                  <a
                    href={
                      previous
                        ? courseHref(previous.unitId, previous.lessonId)
                        : `#/${r01Knowledge[id].route}`
                    }
                  >
                    {previous?.name || r01Knowledge[id].title}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="inline-links">
            <a href={courseHref(k.unitId, k.lessonId)}>Aula e exemplo</a>
            <a href={courseHref(k.unitId, 'pratica')}>Laboratório relacionado</a>
            <a href={courseHref(k.unitId, 'avaliacao')}>Avaliação do objetivo</a>
            <a href={courseHref(k.unitId, 'recuperacao')}>Recuperação</a>
          </div>
          <p>
            <strong>Exercícios versionados:</strong> {k.exercises.join(', ')}
          </p>
          <details>
            <summary>Referências adicionais</summary>
            <ul>
              {k.references.map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    {r.title}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </details>
      ))}
    </article>
  );
}
