import { courseQuestionById, courseRoute, unitById } from './catalog';
import type { Coursework } from './types';
import { questionsFor } from './model';

type Dict = Record<string, unknown>;
function object(v: unknown, keys: string[]): asserts v is Dict {
  if (
    !v ||
    typeof v !== 'object' ||
    Array.isArray(v) ||
    Object.keys(v).some((k) => !keys.includes(k))
  )
    throw new Error('Campos incompatíveis no histórico de unidades.');
}
function str(v: unknown, max = 256): asserts v is string {
  if (typeof v !== 'string' || v.length > max)
    throw new Error('Texto inválido no histórico de unidades.');
}
function list(v: unknown, max = 10000): asserts v is unknown[] {
  if (!Array.isArray(v) || v.length > max)
    throw new Error('Lista de unidades inválida ou excessiva.');
}
function unique(v: unknown[]) {
  if (new Set(v).size !== v.length) throw new Error('IDs duplicados no histórico de unidades.');
}
function date(v: unknown) {
  str(v);
  if (!Number.isFinite(Date.parse(v))) throw new Error('Data inválida no histórico de unidades.');
}
export function validateCoursework(value: unknown): asserts value is Coursework {
  object(value, [
    'version',
    'route',
    'read',
    'drafts',
    'attempts',
    'runs',
    'collected',
    'artifacts',
  ]);
  if (value.version !== 1)
    throw new Error('Versão de unidades incompatível; dados originais preservados.');
  str(value.route);
  if (!courseRoute(value.route)) throw new Error('Rota de unidade desconhecida.');
  list(value.read, 100);
  unique(value.read);
  for (const id of value.read) {
    str(id);
    if (![...unitById.values()].some((u) => u.lessons.some((l) => `${u.id}:${l.id}` === id)))
      throw new Error('Leitura de unidade desconhecida.');
  }
  object(value.drafts, [...courseQuestionById.keys()]);
  for (const [id, draft] of Object.entries(value.drafts)) {
    object(draft, ['answer', 'hint']);
    str(draft.answer);
    if (
      typeof draft.hint !== 'boolean' ||
      (draft.answer && !courseQuestionById.get(id)!.options.some((o) => o.id === draft.answer))
    )
      throw new Error('Rascunho de unidade inválido.');
  }
  list(value.runs, 2000);
  list(value.attempts);
  const runIds: string[] = [];
  for (const run of value.runs) {
    object(run, [
      'id',
      'unitId',
      'unitVersion',
      'kind',
      'questionIds',
      'versions',
      'answers',
      'consulted',
      'status',
      'at',
      'finishedAt',
    ]);
    str(run.id);
    runIds.push(run.id);
    str(run.unitId);
    str(run.unitVersion);
    date(run.at);
    if (
      !unitById.has(run.unitId) ||
      !['independent', 'review'].includes(String(run.kind)) ||
      !['active', 'completed'].includes(String(run.status)) ||
      typeof run.consulted !== 'boolean'
    )
      throw new Error('Avaliação de unidade inválida.');
    list(run.questionIds, 20);
    list(run.versions, 20);
    unique(run.questionIds);
    const expected = questionsFor(run.unitId, run.kind === 'review' ? 'review' : 'independent').map(
      (q) => q.id,
    );
    if (
      JSON.stringify([...run.questionIds].sort()) !== JSON.stringify([...expected].sort()) ||
      run.versions.length !== expected.length
    )
      throw new Error('Seleção de unidade incompatível.');
    run.versions.forEach((v) => str(v));
    object(run.answers, expected);
    for (const [id, answer] of Object.entries(run.answers))
      if (!courseQuestionById.get(id)!.options.some((o) => o.id === answer))
        throw new Error('Alternativa de unidade desconhecida.');
    if (run.finishedAt !== undefined) date(run.finishedAt);
    if (
      run.status === 'completed' &&
      (!run.finishedAt || expected.some((id) => !Object.hasOwn(run.answers as Dict, id)))
    )
      throw new Error('Avaliação de unidade incompleta.');
  }
  unique(runIds);
  if (value.runs.filter((r) => (r as Dict).status === 'active').length > 1)
    throw new Error('Avaliações de unidades conflitantes.');
  const attemptIds: string[] = [];
  for (const a of value.attempts) {
    object(a, [
      'id',
      'unitId',
      'unitVersion',
      'questionId',
      'questionVersion',
      'objective',
      'answer',
      'mode',
      'hintLevel',
      'at',
      'source',
      'runId',
    ]);
    str(a.id);
    attemptIds.push(a.id);
    str(a.unitId);
    str(a.unitVersion);
    str(a.questionId);
    str(a.questionVersion);
    str(a.objective);
    str(a.source);
    date(a.at);
    const q = courseQuestionById.get(a.questionId);
    if (
      !q ||
      a.unitId !== q.unitId ||
      a.objective !== q.objective ||
      a.source !== q.source ||
      a.mode !== q.purpose ||
      ![0, 1].includes(Number(a.hintLevel)) ||
      typeof a.hintLevel !== 'number' ||
      !q.options.some((o) => o.id === a.answer)
    )
      throw new Error('Resposta de unidade incompatível.');
    if (a.mode === 'independent' || a.mode === 'review') {
      const run = value.runs.find((r) => (r as Dict).id === a.runId) as Dict | undefined;
      if (
        !run ||
        run.status !== 'completed' ||
        run.unitId !== a.unitId ||
        run.kind !== a.mode ||
        a.unitVersion !== run.unitVersion ||
        a.questionVersion !==
          (run.versions as string[])[(run.questionIds as string[]).indexOf(q.id)] ||
        (run.answers as Dict)[q.id] !== a.answer ||
        a.hintLevel !== (run.consulted ? 1 : 0) ||
        a.at !== run.finishedAt
      )
        throw new Error('Resposta de unidade sem avaliação correspondente.');
    } else if (a.runId !== undefined) throw new Error('Vínculo indevido na prática.');
  }
  unique(attemptIds);
  for (const r of value.runs as Dict[])
    if (r.status === 'completed') {
      const events = (value.attempts as Dict[]).filter((a) => a.runId === r.id);
      if (
        events.length !== (r.questionIds as string[]).length ||
        new Set(events.map((a) => a.questionId)).size !== events.length
      )
        throw new Error('Histórico de unidade inconsistente.');
    }
  object(value.collected, [...unitById.keys()]);
  for (const [id, collected] of Object.entries(value.collected)) {
    list(collected, 20);
    unique(collected);
    if (collected.some((v) => !unitById.get(id)!.lab.outputs.some((o) => o.id === v)))
      throw new Error('Coleta de laboratório desconhecida.');
  }
  object(value.artifacts, [...unitById.keys()]);
  for (const artifact of Object.values(value.artifacts)) {
    object(artifact, [
      'impacto',
      'evidencias',
      'hipoteses',
      'passos',
      'validacao',
      'rollback',
      'escalonamento',
      'comunicacao',
    ]);
    Object.values(artifact).forEach((v) => str(v, 8192));
  }
}
