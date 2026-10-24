import { useRef, useState } from 'react';
import type { LearningStore } from '../app/useLearning';
import { Options, Correction } from '../components/Exercise';
import { download } from '../components/BackupPanel';
import { courseHref, knowledge, courseQuestionById, r01Knowledge } from './catalog';
import {
  activeCourseRun,
  courseRunResult,
  initialCoursework,
  recordPractice,
  startCourseRun,
  finishCourseRun,
  courseReviewDue,
  objectiveEvidence,
} from './model';
import type { CourseQuestion, CourseUnit } from './types';
import { activeRun } from '../domain/learning';
import { questionById } from '../content/questions';

export function CourseExercise({ q, store }: { q: CourseQuestion; store: LearningStore }) {
  const c = store.envelope.coursework || initialCoursework();
  const last = c.attempts.filter((a) => a.questionId === q.id).at(-1);
  const [show, setShow] = useState(Boolean(last));
  const token = useRef(crypto.randomUUID());
  const draft = c.drafts[q.id] || { answer: '', hint: false };
  const [error, setError] = useState('');
  const update = (patch: Partial<typeof draft>) =>
    store.updateCoursework((c) => ({
      ...c,
      drafts: { ...c.drafts, [q.id]: { ...draft, ...patch } },
    }));
  return (
    <section className="exercise">
      <Options
        questionId={q.id}
        question={q}
        value={draft.answer}
        disabled={show}
        onChange={(answer) => update({ answer })}
      />
      {!show && (
        <div className="actions">
          <button
            disabled={!draft.answer}
            onClick={() => {
              try {
                store.updateCoursework((c) =>
                  recordPractice(c, q, draft.answer, q.purpose, draft.hint, token.current),
                );
                setShow(true);
                setError('');
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Não foi possível registrar.');
              }
            }}
          >
            Verificar resposta
          </button>
          <button onClick={() => update({ hint: true })}>Pedir orientação</button>
        </div>
      )}
      {draft.hint && <p className="hint">{q.hint} Ajuda registrada; isto é prática.</p>}
      {error && <p role="alert">{error}</p>}
      {show && last && (
        <>
          <Correction
            questionId={q.id}
            question={q}
            answer={last.answer}
            recoveryHref={courseHref(q.unitId, 'recuperacao')}
          />
          <button
            onClick={() => {
              token.current = crypto.randomUUID();
              setShow(false);
              update({ answer: '', hint: false });
            }}
          >
            Praticar novamente
          </button>
        </>
      )}
    </section>
  );
}

function CourseAssessment({
  unit,
  store,
  kind,
}: {
  unit: CourseUnit;
  store: LearningStore;
  kind: 'independent' | 'review';
}) {
  const c = store.envelope.coursework || initialCoursework();
  const run = activeCourseRun(c);
  const [error, setError] = useState('');
  const last = c.runs
    .filter((r) => r.unitId === unit.id && r.kind === kind && r.status === 'completed')
    .at(-1);
  const due = courseReviewDue(c, unit.id);
  const result = last ? courseRunResult(last) : null;
  if (activeRun(store.envelope.progress))
    return (
      <p>
        Existe uma tentativa R01 em andamento. <a href="#/avaliacao">Retomar R01</a> antes de
        iniciar outra.
      </p>
    );
  return (
    <section>
      <p>
        Quatro decisões essenciais, uma por objetivo. Todos os quatro itens precisam estar corretos
        para atender ao critério deste conjunto. Leitura, texto livre e checkboxes não aprovam. Não
        há cronômetro nem equivalência com exame de certificação. O banco é finito.
      </p>
      {kind === 'review' && (
        <p>
          {due
            ? `Próxima sugestão: ${new Date(due.dueAt).toLocaleString('pt-BR')}. Etapas posteriores: ${due.stage}/3.`
            : 'A agenda de 1, 3 e 7 dias começa após avaliação independente que atende ao critério.'}{' '}
          Antecipar a revisão permite praticar, mas não avança o intervalo sugerido. Esta agenda não
          mede sua memória.
        </p>
      )}
      {!run ? (
        <button
          onClick={() => {
            try {
              store.updateCoursework((c) => startCourseRun(c, unit.id, kind));
              setError('');
            } catch (e) {
              setError(String(e));
            }
          }}
        >
          {last
            ? 'Iniciar outra tentativa'
            : kind === 'review'
              ? 'Iniciar revisão'
              : 'Iniciar avaliação'}
        </button>
      ) : run.unitId !== unit.id || run.kind !== kind ? (
        <p>
          Há outra tentativa em andamento.{' '}
          <a href={courseHref(run.unitId, run.kind === 'review' ? 'revisao' : 'avaliacao')}>
            Retomar tentativa
          </a>
          .
        </p>
      ) : (
        <section className="course-assessment">
          <p role="status">
            {Object.keys(run.answers).length}/4 respostas salvas ·{' '}
            {run.consulted ? 'Tentativa assistida' : 'Sem consulta registrada'}
          </p>
          {run.questionIds.map((id) => (
            <Options
              key={id}
              questionId={id}
              question={courseQuestionById.get(id)!}
              value={run.answers[id] || ''}
              onChange={(answer) =>
                store.updateCoursework((c) => ({
                  ...c,
                  runs: c.runs.map((r) =>
                    r.id === run.id ? { ...r, answers: { ...r.answers, [id]: answer } } : r,
                  ),
                }))
              }
            />
          ))}
          <div className="actions">
            <button
              onClick={() => {
                try {
                  store.updateCoursework((c) => finishCourseRun(c, run.id));
                  setError('');
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Não foi possível concluir.');
                }
              }}
            >
              Concluir e ver correção
            </button>
            <button
              onClick={() =>
                store.updateCoursework((c) => ({
                  ...c,
                  runs: c.runs.map((r) => (r.id === run.id ? { ...r, consulted: true } : r)),
                }))
              }
            >
              Marcar consulta ou ajuda
            </button>
          </div>
          <p>
            Consultar aulas é permitido e marca a tentativa como assistida. Nenhuma correção do
            conjunto aparece antes de concluir.
          </p>
        </section>
      )}
      {error && <p role="alert">{error}</p>}
      {last && !run && result && (
        <section>
          <h2>
            Resultado observado: {result.correct}/{result.total}
          </h2>
          <p>
            {last.consulted
              ? 'Tentativa assistida: registra prática, não desempenho independente.'
              : result.independent
                ? 'Critério do conjunto atendido sem consulta registrada. Evidência restrita a estes quatro objetivos e situações.'
                : 'Vale revisar os objetivos em que houve erro. O resultado não é uma medida completa de competência.'}
          </p>
          {last.questionIds.map((id) => (
            <div key={id}>
              <h3>{courseQuestionById.get(id)!.prompt}</h3>
              <Correction
                questionId={id}
                question={courseQuestionById.get(id)!}
                answer={last.answers[id]}
                recoveryHref={courseHref(unit.id, 'recuperacao')}
              />
            </div>
          ))}
          <div className="inline-links">
            <a href={courseHref(unit.id, 'recuperacao')}>
              Rever explicações e praticar em outra situação
            </a>
            <a href={courseHref(unit.id, 'revisao')}>Revisão posterior</a>
            <a href="#/semana-1">Voltar à jornada</a>
          </div>
        </section>
      )}
    </section>
  );
}

const artifactFields = [
  ['impacto', 'Impacto e escopo'],
  ['evidencias', 'Evidências e origem'],
  ['hipoteses', 'Hipóteses e limites'],
  ['passos', 'Passos e ramificações'],
  ['validacao', 'Validação antes e depois'],
  ['rollback', 'Rollback e autorização'],
  ['escalonamento', 'Escalonamento e próximo responsável'],
  ['comunicacao', 'Comunicação ao usuário'],
] as const;
function CourseLab({ unit, store }: { unit: CourseUnit; store: LearningStore }) {
  const c = store.envelope.coursework || initialCoursework();
  const collected = c.collected[unit.id] || [];
  const fields = c.artifacts[unit.id] || {};
  return (
    <section>
      <h2>{unit.lab.title}</h2>
      <p>{unit.lab.scenario}</p>
      <p>
        <strong>Ambiente:</strong> simulação local, sem executar comandos externos. Critério:
        coletar as evidências relevantes e escolher uma decisão coerente. A prática guiada não
        valida execução em equipamento real.
      </p>
      <div className="actions">
        {unit.lab.outputs.map((o) => (
          <button
            key={o.id}
            onClick={() =>
              store.updateCoursework((c) => ({
                ...c,
                collected: {
                  ...c.collected,
                  [unit.id]: [...new Set([...(c.collected[unit.id] || []), o.id])],
                },
              }))
            }
          >
            {o.label}
          </button>
        ))}
      </div>
      {unit.lab.outputs
        .filter((o) => collected.includes(o.id))
        .map((o) => (
          <section key={o.id}>
            <h3>{o.label}</h3>
            <pre>{o.output}</pre>
          </section>
        ))}
      <p>
        {unit.lab.required.every((id) => collected.includes(id))
          ? 'Evidências mínimas coletadas. Escolha a conclusão e confira o feedback.'
          : 'Colete as evidências; a correção não aceita uma conclusão sem a coleta necessária.'}
      </p>
      <CourseExercise q={unit.lab.question} store={store} />
      {unit.id === 'net-r04' && (
        <section className="runbook-editor">
          <h2>Seu runbook editável</h2>
          <p>
            Preencha com o caso simulado ou com uma coleta externa autorizada, identificando a
            origem. Não inclua senhas, tokens ou dados pessoais. O documento é autodeclarado e não é
            corrigido por palavras-chave, tamanho ou preenchimento de campos.
          </p>
          {artifactFields.map(([id, label]) => (
            <label key={id}>
              {label}
              <textarea
                rows={3}
                maxLength={8192}
                value={fields[id] || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  store.updateCoursework((c) => ({
                    ...c,
                    artifacts: {
                      ...c.artifacts,
                      [unit.id]: { ...c.artifacts[unit.id], [id]: value },
                    },
                  }));
                }}
              />
            </label>
          ))}
          <button
            onClick={() =>
              download(
                'runbook-infrasec.md',
                `# Runbook de estudo\n\nArtefato autodeclarado; execução externa não verificada pela plataforma.\n\n${artifactFields.map(([id, label]) => `## ${label}\n\n${fields[id] || 'Não informado.'}`).join('\n\n')}`,
                'text/markdown',
              )
            }
          >
            Exportar runbook
          </button>
          <p>
            <strong>Extensão opcional:</strong> em laboratório Windows autorizado, colete
            configuração e testes do próprio equipamento, compare antes/depois e peça revisão
            humana. Em Packet Tracer, use uma topologia isolada; não altere a rede de trabalho.
            Identifique o ambiente no documento. A plataforma não marca essa execução real como
            concluída.
          </p>
        </section>
      )}
    </section>
  );
}

export function CourseHistory({ store, unit }: { store: LearningStore; unit?: CourseUnit }) {
  const c = store.envelope.coursework || initialCoursework();
  const rows = [
    ...store.envelope.progress.attempts.map((a) => ({
      ...a,
      unit: 'NET-R01',
      source: 'InfraSec · NET-R01 · original',
      objective: questionById[a.questionId]?.objective || '',
      correct: questionById[a.questionId]?.correct === a.answer,
    })),
    ...c.attempts.map((a) => ({
      ...a,
      unit: a.unitId.toUpperCase(),
      correct: courseQuestionById.get(a.questionId)?.correct === a.answer,
    })),
  ]
    .filter((a) => !unit || a.unit === unit.id.toUpperCase())
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  return (
    <section>
      <h2>Histórico unificado de estudo</h2>
      <p>
        Estudante local deste navegador. Mesma cópia de progresso para as quatro unidades. Modos e
        fontes permanecem separados; importar backup substitui, não soma tentativas. Os últimos cem
        eventos são exibidos; o histórico completo permanece na cópia.
      </p>
      {unit &&
        unit.lessons.map((l) => (
          <p key={l.id}>
            <strong>{l.title}: </strong>
            {objectiveEvidence(c, l.objective)}
          </p>
        ))}
      {!rows.length && <p>Nenhuma resposta registrada.</p>}
      <ol className="observations">
        {rows.slice(0, 100).map((a) => (
          <li key={a.id}>
            <div>
              <strong>
                {a.unit} · {a.objective} · {a.mode}
              </strong>
              <p>
                {a.correct ? 'Acerto' : 'Erro'} no item {a.questionId} · versão {a.questionVersion}{' '}
                · {a.hintLevel ? 'com ajuda/consulta' : 'sem ajuda registrada'} ·{' '}
                {new Date(a.at).toLocaleString('pt-BR')}
              </p>
              <small>{a.source}. Isso não é prova supervisionada.</small>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function CoursePlayer({
  unit,
  view,
  store,
}: {
  unit: CourseUnit;
  view: string;
  store: LearningStore;
}) {
  const c = store.envelope.coursework || initialCoursework();
  const lesson = unit.lessons.find((l) => l.id === view);
  const titles: Record<string, string> = {
    pratica: 'Prática guiada',
    avaliacao: 'Avaliação independente',
    recuperacao: 'Recuperação por objetivo',
    revisao: 'Revisão posterior',
    historico: 'Evidências e histórico',
  };
  const suggested = new Set(
    c.attempts
      .filter((a) => courseQuestionById.get(a.questionId)?.correct !== a.answer)
      .map((a) => a.objective),
  );
  return (
    <article className="unit-player">
      <p className="unit-location">
        <a href="#/redes">Formação de redes</a> / {unit.id.toUpperCase()} · {unit.title}
      </p>
      <details className="unit-outline">
        <summary>Sumário da unidade</summary>
        <nav aria-label="Lições da unidade">
          <ol>
            {unit.lessons.map((l, i) => (
              <li key={l.id}>
                <a
                  href={courseHref(unit.id, l.id)}
                  aria-current={view === l.id ? 'page' : undefined}
                >
                  {i + 1}. {l.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <nav className="unit-tools" aria-label="Praticar e acompanhar">
          {Object.entries(titles).map(([key, title]) => (
            <a
              href={courseHref(unit.id, key)}
              key={key}
              aria-current={view === key ? 'page' : undefined}
            >
              {title}
            </a>
          ))}
        </nav>
      </details>
      <div className="unit-content">
        <h1 tabIndex={-1}>{lesson?.title || titles[view]}</h1>
        <p className="lead">{unit.motivation}</p>
        <p className="scope-note">{unit.prerequisite}</p>
        {lesson ? (
          <>
            <p>
              <strong>Objetivo observável:</strong> {lesson.observable}
            </p>
            <details>
              <summary>Pré-requisitos recomendados e suas explicações</summary>
              <ul>
                {lesson.prerequisites.map((id) => {
                  const node = knowledge.find((k) => k.id === id);
                  const prior = r01Knowledge[id];
                  return (
                    <li key={id}>
                      <a href={node ? courseHref(node.unitId, node.lessonId) : `#/${prior?.route}`}>
                        {node?.name || prior?.title || id}
                      </a>{' '}
                      —{' '}
                      {node
                        ? objectiveEvidence(c, id)
                        : 'Evidência da R01 disponível em Meu nível; nenhuma barreira para abrir a aula.'}
                    </li>
                  );
                })}
              </ul>
            </details>
            <p>
              <strong>Vocabulário no contexto:</strong> {lesson.vocabulary}
            </p>
            {lesson.sections.map((s) => (
              <section className="lesson-section" key={s.title}>
                <h2>{s.title}</h2>
                {s.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </section>
            ))}
            <ol className="course-flow" aria-label="Fluxo explicativo">
              {lesson.diagram.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <section className="worked-example">
              <p className="section-label">Exemplo resolvido · dados sintéticos</p>
              <h2>{lesson.example.title}</h2>
              <pre>{lesson.example.data}</pre>
              <ol>
                {lesson.example.reasoning.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ol>
              <p>
                <strong>Conclusão:</strong> {lesson.example.conclusion}
              </p>
              <p>
                <strong>Limite:</strong> {lesson.example.limit}
              </p>
            </section>
            <aside className="concept-note">
              <h3>Um erro comum</h3>
              <p>{lesson.misconception}</p>
            </aside>
            <CourseExercise
              key={lesson.id}
              q={unit.questions.find(
                (q) => q.lessonId === lesson.id && q.purpose === 'comprehension',
              )!}
              store={store}
            />
            <h2>O que levar desta lição</h2>
            <p>{lesson.takeaway}</p>
            <label className="read-toggle">
              <input
                type="checkbox"
                checked={c.read.includes(`${unit.id}:${lesson.id}`)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  store.updateCoursework((c) => ({
                    ...c,
                    read: checked
                      ? [...new Set([...c.read, `${unit.id}:${lesson.id}`])]
                      : c.read.filter((id) => id !== `${unit.id}:${lesson.id}`),
                  }));
                }}
              />
              Registrei a leitura desta lição
            </label>
            <p>Leitura é um registro de estudo, não aprovação ou domínio.</p>
            <div className="inline-links">
              {unit.lessons[unit.lessons.indexOf(lesson) + 1] ? (
                <a href={courseHref(unit.id, unit.lessons[unit.lessons.indexOf(lesson) + 1].id)}>
                  Próxima lição
                </a>
              ) : (
                <a href={courseHref(unit.id, 'pratica')}>Seguir para prática guiada</a>
              )}
              <a href="#/semana-1">Voltar à missão da jornada</a>
            </div>
          </>
        ) : view === 'pratica' ? (
          <CourseLab unit={unit} store={store} />
        ) : view === 'avaliacao' || view === 'revisao' ? (
          <CourseAssessment
            unit={unit}
            store={store}
            kind={view === 'revisao' ? 'review' : 'independent'}
          />
        ) : view === 'recuperacao' ? (
          <>
            <p>
              Um erro sugere revisão, não um diagnóstico definitivo sobre você. As explicações
              abaixo usam outra abordagem e os exercícios mudam a decisão solicitada. A ordem
              destaca assuntos com erros observados.
            </p>
            {[...unit.lessons]
              .sort(
                (a, b) => Number(suggested.has(b.objective)) - Number(suggested.has(a.objective)),
              )
              .map((l) => (
                <section className="recovery-section" key={l.id}>
                  <h2>{l.title}</h2>
                  <p>{l.recovery}</p>
                  <a href={courseHref(unit.id, l.id)}>Retomar a explicação e o exemplo resolvido</a>
                  <CourseExercise
                    q={unit.questions.find(
                      (q) => q.lessonId === l.id && q.purpose === 'remediation',
                    )!}
                    store={store}
                  />
                </section>
              ))}
          </>
        ) : (
          <CourseHistory store={store} unit={unit} />
        )}
        <details>
          <summary>Referências complementares e procedência</summary>
          <p>
            Aulas e questões originais InfraSec, versão {unit.version}. Fontes técnicas consultadas
            para revisão; não substituem o ensino acima. Não são dumps e não afirmam cobertura
            integral de certificação.
          </p>
          <a href="./THIRD_PARTY_NOTICES.txt" target="_blank" rel="noopener noreferrer">
            Avisos do código reutilizado (MIT)
          </a>
          <ul>
            {unit.references.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  {r.title}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </article>
  );
}
