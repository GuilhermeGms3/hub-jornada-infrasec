import type { Mode } from '../domain/types';
import type { Coursework, CourseRun, CourseQuestion, UnitId } from './types';
import { courseQuestionById, unitById, courseRoute } from './catalog';
import { shuffle } from './shuffle';

export const initialCoursework = (): Coursework => ({
  version: 1,
  route: 'unidade/net-r02/interfaces',
  read: [],
  drafts: {},
  attempts: [],
  runs: [],
  collected: {},
  artifacts: {},
});
export const questionsFor = (unitId: string, kind: Mode) =>
  unitById.get(unitId)!.questions.filter((q) => q.purpose === kind);
export function activeCourseRun(c: Coursework) {
  return c.runs.find((r) => r.status === 'active');
}
export function startCourseRun(c: Coursework, unitId: UnitId, kind: CourseRun['kind']): Coursework {
  if (activeCourseRun(c))
    throw new Error('Retome a tentativa em andamento antes de iniciar outra.');
  const qs = shuffle(questionsFor(unitId, kind));
  const run: CourseRun = {
    id: crypto.randomUUID(),
    unitId,
    unitVersion: unitById.get(unitId)!.version,
    kind,
    questionIds: qs.map((q) => q.id),
    versions: qs.map((q) => q.version),
    answers: {},
    consulted: false,
    status: 'active',
    at: new Date().toISOString(),
  };
  return { ...c, runs: [...c.runs, run] };
}
export function courseRunResult(run: CourseRun) {
  const expected = questionsFor(run.unitId, run.kind).map((q) => q.id);
  const compatible =
    expected.length > 0 &&
    JSON.stringify([...run.questionIds].sort()) === JSON.stringify([...expected].sort()) &&
    run.versions.length === run.questionIds.length &&
    run.unitVersion === unitById.get(run.unitId)?.version &&
    run.questionIds.every((id, i) => courseQuestionById.get(id)?.version === run.versions[i]);
  const correct = run.questionIds.filter(
    (id) => courseQuestionById.get(id)?.correct === run.answers[id],
  ).length;
  const validTime = Boolean(
    run.finishedAt &&
    Date.parse(run.finishedAt) >= Date.parse(run.at) &&
    Date.parse(run.finishedAt) <= Date.now(),
  );
  const passed =
    run.status === 'completed' && compatible && validTime && correct === run.questionIds.length;
  return { correct, total: run.questionIds.length, passed, independent: passed && !run.consulted };
}
export function finishCourseRun(c: Coursework, id: string): Coursework {
  const run = c.runs.find((r) => r.id === id);
  if (!run) throw new Error('Tentativa desconhecida.');
  if (run.status === 'completed') return c; // Idempotent submission: no duplicate attempts.
  if (
    run.questionIds.some(
      (qid) => !courseQuestionById.get(qid)?.options.some((o) => o.id === run.answers[qid]),
    )
  )
    throw new Error('Responda todos os itens antes de concluir.');
  if (
    run.unitVersion !== unitById.get(run.unitId)?.version ||
    run.questionIds.some((qid, i) => courseQuestionById.get(qid)?.version !== run.versions[i])
  )
    throw new Error('A versão do conteúdo mudou; a tentativa não pode ser concluída nesta versão.');
  const at = new Date().toISOString();
  return {
    ...c,
    runs: c.runs.map((r) => (r.id === id ? { ...r, status: 'completed', finishedAt: at } : r)),
    attempts: [
      ...c.attempts,
      ...run.questionIds.map((qid) => ({
        id: crypto.randomUUID(),
        unitId: run.unitId,
        unitVersion: run.unitVersion,
        questionId: qid,
        questionVersion: courseQuestionById.get(qid)!.version,
        objective: courseQuestionById.get(qid)!.objective,
        answer: run.answers[qid],
        mode: run.kind,
        hintLevel: run.consulted ? 1 : 0,
        at,
        source: courseQuestionById.get(qid)!.source,
        runId: id,
      })),
    ],
  };
}
export function recordPractice(
  c: Coursework,
  q: CourseQuestion,
  answer: string,
  mode: Mode,
  hint: boolean,
  id: string = crypto.randomUUID(),
) {
  const existing = c.attempts.find((a) => a.id === id);
  if (existing) {
    if (existing.questionId !== q.id || existing.answer !== answer || existing.mode !== mode)
      throw new Error('Identificador de tentativa já usado para outra resposta.');
    return c;
  }
  if (
    !['comprehension', 'guided', 'remediation'].includes(mode) ||
    q.purpose !== mode ||
    !q.options.some((o) => o.id === answer)
  )
    throw new Error('Resposta ou modo inválido.');
  if (
    mode === 'guided' &&
    !unitById.get(q.unitId)!.lab.required.every((id) => (c.collected[q.unitId] || []).includes(id))
  )
    throw new Error('Colete as evidências necessárias antes de concluir o laboratório.');
  return {
    ...c,
    attempts: [
      ...c.attempts,
      {
        id,
        unitId: q.unitId,
        unitVersion: unitById.get(q.unitId)!.version,
        questionId: q.id,
        questionVersion: q.version,
        objective: q.objective,
        answer,
        mode,
        hintLevel: hint ? 1 : 0,
        at: new Date().toISOString(),
        source: q.source,
      },
    ],
  };
}
export function visitCoursework(c: Coursework, route: string): Coursework {
  return {
    ...c,
    route: courseRoute(route) ? route : c.route,
    runs: c.runs.map((r) =>
      r.status === 'active' &&
      route !== `unidade/${r.unitId}/${r.kind === 'review' ? 'revisao' : 'avaliacao'}`
        ? { ...r, consulted: true }
        : r,
    ),
  };
}
export function courseReviewDue(c: Coursework, unitId: string) {
  const baseline = c.runs.find(
    (r) => r.unitId === unitId && r.kind === 'independent' && courseRunResult(r).independent,
  );
  if (!baseline?.finishedAt) return null;
  let anchor = Date.parse(baseline.finishedAt);
  let stage = 0;
  const intervals = [1, 3, 7];
  for (const r of c.runs
    .filter((r) => r.unitId === unitId && r.kind === 'review' && courseRunResult(r).independent)
    .sort((a, b) => Date.parse(a.finishedAt!) - Date.parse(b.finishedAt!))) {
    if (stage < 3 && Date.parse(r.finishedAt!) >= anchor + intervals[stage] * 86400000) {
      anchor = Date.parse(r.finishedAt!);
      stage++;
    }
  }
  return {
    stage,
    completed: stage === 3,
    dueAt: new Date(anchor + intervals[Math.min(stage, 2)] * 86400000).toISOString(),
  };
}
export function objectiveEvidence(c: Coursework, objective: string) {
  const attempts = c.attempts
    .filter(
      (a) =>
        a.objective === objective &&
        Date.parse(a.at) <= Date.now() &&
        a.questionVersion === courseQuestionById.get(a.questionId)?.version &&
        a.unitVersion === unitById.get(a.unitId)?.version,
    )
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const independent = attempts.filter(
    (a) => (a.mode === 'independent' || a.mode === 'review') && !a.hintLevel,
  );
  const latest = independent.at(-1);
  const wrong = independent
    .filter((a) => courseQuestionById.get(a.questionId)?.correct !== a.answer)
    .at(-1);
  if (
    wrong &&
    !independent.some(
      (a) =>
        Date.parse(a.at) > Date.parse(wrong.at) &&
        courseQuestionById.get(a.questionId)?.correct === a.answer &&
        courseQuestionById.get(a.questionId)?.family !==
          courseQuestionById.get(wrong.questionId)?.family,
    )
  )
    return 'Vale revisar este assunto: um acerto repetido na mesma família não elimina o erro observado.';
  return latest
    ? courseQuestionById.get(latest.questionId)?.correct === latest.answer
      ? 'Acerto independente neste objetivo; evidência restrita ao conjunto finito.'
      : 'Vale revisar este assunto: houve erro independente observado.'
    : attempts.length
      ? 'Em aprendizagem; falta observação independente.'
      : 'Ainda não avaliado.';
}
