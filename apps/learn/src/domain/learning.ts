import { lessons, objectives } from '../content/lessons';
import { assessmentSets, questionById } from '../content/questions';
import { UNIT_VERSION, type Attempt, type Mode, type Progress, type Run } from './types';

export function initialProgress(): Progress {
  return {
    unitVersion: UNIT_VERSION,
    route: 'aula/redes',
    read: [],
    drafts: {},
    attempts: [],
    runs: [],
    reviews: [],
    labAttempts: [],
    simulator: { scenarioId: 'healthy', commands: [], answer: '', hintLevel: 0 },
  };
}
export function correctAnswer(questionId: string, answer: string) {
  const q = questionById[questionId];
  return Boolean(q && q.options.some((o) => o.id === answer) && q.correct === answer);
}
export function makeAttempt(
  questionId: string,
  answer: string,
  mode: Mode,
  hintLevel: number,
  runId?: string,
): Attempt {
  const q = questionById[questionId];
  if (!q || !q.options.some((o) => o.id === answer))
    throw new Error('Resposta ou exercício inválido.');
  return {
    id: crypto.randomUUID(),
    questionId,
    questionVersion: q.version,
    unitVersion: UNIT_VERSION,
    answer,
    mode,
    hintLevel,
    at: new Date().toISOString(),
    ...(runId ? { runId } : {}),
  };
}
export function activeRun(p: Progress) {
  return p.runs.find((r) => r.status === 'active');
}
export function startRun(p: Progress, kind: Run['kind']): Run {
  const count = p.runs.filter((r) => r.kind === kind).length;
  const questionIds =
    kind === 'review'
      ? Object.keys(questionById).filter((id) => id.startsWith('r-'))
      : assessmentSets[count % assessmentSets.length];
  return {
    id: crypto.randomUUID(),
    kind,
    questionIds: [...questionIds],
    versions: questionIds.map((id) => questionById[id].version),
    answers: {},
    status: 'active',
    assisted: false,
    consulted: false,
    startedAt: new Date().toISOString(),
  };
}
export function finishRun(p: Progress, runId: string): Progress {
  const run = p.runs.find((r) => r.id === runId);
  if (
    !run ||
    run.status !== 'active' ||
    run.questionIds.some((id) => !questionById[id]?.options.some((o) => o.id === run.answers[id]))
  )
    throw new Error('Responda todos os itens antes de concluir.');
  if (run.questionIds.some((id, i) => questionById[id]?.version !== run.versions[i]))
    throw new Error('O conteúdo mudou. Inicie uma tentativa compatível.');
  const at = new Date().toISOString();
  return {
    ...p,
    runs: p.runs.map((r) => (r.id === runId ? { ...r, status: 'completed', finishedAt: at } : r)),
    attempts: [
      ...p.attempts,
      ...run.questionIds.map((id) =>
        makeAttempt(id, run.answers[id], run.kind, run.assisted || run.consulted ? 4 : 0, runId),
      ),
    ],
    reviews: run.kind === 'review' ? [...p.reviews, { runId, at }] : p.reviews,
  };
}
export function runResult(p: Progress, run: Run) {
  const compatible = run.questionIds.every(
    (id, i) => questionById[id]?.version === run.versions[i],
  );
  const correct = run.questionIds.filter((id) => correctAnswer(id, run.answers[id])).length;
  const essentials = run.questionIds.filter((id) => questionById[id]?.essential);
  const passed =
    run.status === 'completed' &&
    compatible &&
    correct / run.questionIds.length >= 0.8 &&
    essentials.every((id) => correctAnswer(id, run.answers[id]));
  const priorFamilies = new Set(
    p.attempts
      .filter((a) => a.runId !== run.id && a.at <= run.startedAt)
      .map((a) => questionById[a.questionId]?.family),
  );
  const repeated = run.questionIds.filter((id) =>
    priorFamilies.has(questionById[id]?.family),
  ).length;
  return {
    correct,
    total: run.questionIds.length,
    passed,
    compatible,
    independent: !run.assisted && !run.consulted,
    repeated,
  };
}
export function observations(p: Progress) {
  const runs = new Map(p.runs.map((run) => [run.id, run]));
  const firstFamily = new Map<string, string>();
  const attemptIndex = new Map<string, number>();
  p.attempts.forEach((attempt, index) => {
    const family = questionById[attempt.questionId]?.family;
    if (family && !firstFamily.has(family)) firstFamily.set(family, attempt.id);
    attemptIndex.set(attempt.id, index);
  });
  return Object.entries(objectives).map(([id, title]) => {
    const attempts = p.attempts.filter((a) => questionById[a.questionId]?.objective === id);
    const eligible = attempts.filter((a) => {
      const q = questionById[a.questionId];
      const run = a.runId ? runs.get(a.runId) : undefined;
      return (
        q.version === a.questionVersion &&
        a.unitVersion === UNIT_VERSION &&
        Date.parse(a.at) <= Date.now() &&
        a.hintLevel === 0 &&
        (a.mode === 'independent' || a.mode === 'review') &&
        run?.status === 'completed' &&
        run.questionIds.every((id, index) => questionById[id]?.version === run.versions[index]) &&
        !run.assisted &&
        !run.consulted
      );
    });
    const novel = (a: Attempt) => firstFamily.get(questionById[a.questionId].family) === a.id;
    const families = new Set(
      eligible
        .filter((a) => correctAnswer(a.questionId, a.answer) && novel(a))
        .map((a) => questionById[a.questionId].family),
    );
    const last = eligible.at(-1);
    const lastWrong = eligible.filter((a) => !correctAnswer(a.questionId, a.answer)).at(-1);
    const wrongIndex = lastWrong ? attemptIndex.get(lastWrong.id)! : -1;
    const fragile = Boolean(
      lastWrong &&
      !eligible.some(
        (a) =>
          attemptIndex.get(a.id)! > wrongIndex && correctAnswer(a.questionId, a.answer) && novel(a),
      ),
    );
    const status = fragile
      ? 'Fragilidade observada'
      : families.size >= 2
        ? 'Demonstrado neste recorte'
        : eligible.length
          ? 'Evidência ainda limitada'
          : attempts.length
            ? 'Praticado; falta avaliação independente'
            : 'Ainda não avaliado';
    return { id, title, status, families: families.size, fragile, lastAt: last?.at };
  });
}
export function difficultyIds(p: Progress) {
  return [
    ...new Set(
      p.attempts
        .filter((a) => !correctAnswer(a.questionId, a.answer))
        .map((a) => questionById[a.questionId]?.remediation)
        .filter(Boolean),
    ),
  ];
}
export function dueReview(
  p: Progress,
): { dueAt: string; stage: number; completed: boolean } | null {
  const baseline = p.runs.find(
    (r) => r.kind === 'independent' && runResult(p, r).passed && runResult(p, r).independent,
  );
  if (!baseline?.finishedAt || Date.parse(baseline.finishedAt) > Date.now()) return null;
  let anchor = new Date(baseline.finishedAt).getTime();
  let stage = 0;
  for (const e of p.reviews) {
    const run = p.runs.find((r) => r.id === e.runId);
    if (!run) continue;
    const when = new Date(e.at).getTime();
    if (when > Date.now()) continue;
    const interval = [1, 3, 7][Math.min(stage, 2)];
    if (when < anchor + interval * 86400000) continue;
    if (runResult(p, run).passed && runResult(p, run).independent) stage += 1;
    else stage = 0;
    anchor = when;
  }
  return {
    dueAt: new Date(anchor + [1, 3, 7][Math.min(stage, 2)] * 86400000).toISOString(),
    stage,
    completed: stage >= 3,
  };
}
export function validRoute(route: string) {
  return (
    ['pratica', 'avaliacao', 'recuperacao', 'revisao', 'progresso'].includes(route) ||
    lessons.some((l) => route === `aula/${l.id}`)
  );
}
