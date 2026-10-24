import { questionById, assessmentSets, reviewQuestions } from '../content/questions';
import { lessons } from '../content/lessons';
import { commandLabels, scenarioById, diagnoses } from '../domain/simulator';
import { initialProgress, validRoute } from '../domain/learning';
import { UNIT_VERSION, type Envelope } from '../domain/types';

export const STORAGE_KEY = 'infrasec-learn:v1';
export const MAX_BYTES = 5 * 1024 * 1024;
type Dict = Record<string, unknown>;
function object(value: unknown, keys: string[]): asserts value is Dict {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).some((k) => !keys.includes(k))
  )
    throw new Error('Objeto ou campos incompatíveis no progresso.');
}
function text(v: unknown, max = 128): asserts v is string {
  if (typeof v !== 'string' || v.length > max) throw new Error('Texto inválido no progresso.');
}
function date(v: unknown): asserts v is string {
  text(v);
  if (!Number.isFinite(Date.parse(v))) throw new Error('Data inválida no progresso.');
}
function number(v: unknown, max = 10000000): asserts v is number {
  if (!Number.isInteger(v) || Number(v) < 0 || Number(v) > max)
    throw new Error('Número inválido no progresso.');
}
function array(v: unknown, max = 10000): asserts v is unknown[] {
  if (!Array.isArray(v) || v.length > max) throw new Error('Lista inválida ou muito grande.');
}
function unique(values: unknown[]) {
  if (new Set(values).size !== values.length) throw new Error('Identificadores duplicados.');
}
function bool(v: unknown) {
  if (typeof v !== 'boolean') throw new Error('Estado inválido.');
}

export function parseEnvelope(raw: string): Envelope {
  if (new Blob([raw]).size > MAX_BYTES) throw new Error('Arquivo excede 5 MiB.');
  const e: unknown = JSON.parse(raw);
  object(e, ['appId', 'schemaVersion', 'revision', 'savedAt', 'progress']);
  if (e.appId !== 'infrasec-learn' || e.schemaVersion !== 1)
    throw new Error('Formato ou versão de dados incompatível. O original foi preservado.');
  number(e.revision);
  date(e.savedAt);
  const p = e.progress;
  object(p, [
    'unitVersion',
    'route',
    'read',
    'drafts',
    'attempts',
    'runs',
    'reviews',
    'labAttempts',
    'simulator',
  ]);
  if (p.unitVersion !== UNIT_VERSION)
    throw new Error('Esta cópia pertence a outra versão da unidade.');
  text(p.route);
  if (!validRoute(p.route)) throw new Error('Ponto de retomada desconhecido.');
  array(p.read, lessons.length);
  unique(p.read);
  if (p.read.some((id) => !lessons.some((l) => l.id === id)))
    throw new Error('Lição desconhecida.');
  object(p.drafts, Object.keys(questionById));
  for (const [id, draft] of Object.entries(p.drafts)) {
    object(draft, ['answer', 'hintLevel']);
    number(draft.hintLevel, 4);
    text(draft.answer);
    if (draft.answer && !questionById[id].options.some((o) => o.id === draft.answer))
      throw new Error('Alternativa desconhecida no rascunho.');
  }
  array(p.attempts);
  array(p.runs, 2000);
  array(p.reviews, 2000);
  const runIds: string[] = [];
  for (const run of p.runs) {
    object(run, [
      'id',
      'kind',
      'questionIds',
      'versions',
      'answers',
      'status',
      'assisted',
      'consulted',
      'startedAt',
      'finishedAt',
    ]);
    text(run.id);
    runIds.push(run.id);
    date(run.startedAt);
    bool(run.assisted);
    bool(run.consulted);
    if (
      !['independent', 'review'].includes(String(run.kind)) ||
      !['active', 'completed', 'abandoned'].includes(String(run.status))
    )
      throw new Error('Tentativa de avaliação inválida.');
    array(run.questionIds, 20);
    array(run.versions, 20);
    unique(run.questionIds);
    const sets = run.kind === 'review' ? [reviewQuestions.map((q) => q.id)] : assessmentSets;
    if (
      !sets.some((set) => JSON.stringify(set) === JSON.stringify(run.questionIds)) ||
      run.versions.length !== run.questionIds.length
    )
      throw new Error('Seleção de avaliação incompatível.');
    for (const v of run.versions) text(v);
    object(run.answers, run.questionIds as string[]);
    for (const [id, answer] of Object.entries(run.answers))
      if (!questionById[id]?.options.some((o) => o.id === answer))
        throw new Error('Resposta de avaliação desconhecida.');
    if (run.finishedAt !== undefined) date(run.finishedAt);
    if (
      run.status === 'completed' &&
      (!run.finishedAt ||
        run.questionIds.some((id) => !Object.hasOwn(run.answers as Dict, String(id))))
    )
      throw new Error('Avaliação concluída incompleta.');
  }
  unique(runIds);
  if (p.runs.filter((r) => (r as Dict).status === 'active').length > 1)
    throw new Error('Há avaliações ativas conflitantes.');
  const attemptIds: string[] = [];
  for (const a of p.attempts) {
    object(a, [
      'id',
      'questionId',
      'questionVersion',
      'unitVersion',
      'mode',
      'answer',
      'hintLevel',
      'at',
      'runId',
    ]);
    text(a.id);
    attemptIds.push(a.id);
    text(a.questionId);
    text(a.questionVersion);
    text(a.unitVersion);
    date(a.at);
    number(a.hintLevel, 4);
    const q = questionById[a.questionId];
    if (
      !q ||
      !q.options.some((o) => o.id === a.answer) ||
      !['comprehension', 'guided', 'independent', 'remediation', 'review'].includes(String(a.mode))
    )
      throw new Error('Resposta incompatível.');
    if (a.mode === 'independent' || a.mode === 'review') {
      const run = p.runs.find((r) => (r as Dict).id === a.runId) as Dict | undefined;
      if (
        !run ||
        run.status !== 'completed' ||
        run.kind !== a.mode ||
        (run.answers as Dict)[a.questionId] !== a.answer
      )
        throw new Error('Resposta sem avaliação correspondente.');
    } else if (a.runId !== undefined) throw new Error('Vínculo de tentativa inválido.');
  }
  unique(attemptIds);
  for (const r of p.runs as Dict[])
    if (r.status === 'completed') {
      const attempts = (p.attempts as Dict[]).filter((a) => a.runId === r.id);
      if (
        attempts.length !== (r.questionIds as string[]).length ||
        new Set(attempts.map((a) => a.questionId)).size !== attempts.length
      )
        throw new Error('Histórico da avaliação inconsistente.');
    }
  for (const event of p.reviews) {
    object(event, ['runId', 'at']);
    date(event.at);
    if (
      !(p.runs as Dict[]).some(
        (r) => r.id === event.runId && r.kind === 'review' && r.status === 'completed',
      )
    )
      throw new Error('Revisão sem tentativa.');
  }
  unique((p.reviews as Dict[]).map((r) => r.runId));
  array(p.labAttempts);
  for (const lab of p.labAttempts) {
    object(lab, ['id', 'scenarioId', 'commands', 'answer', 'hintLevel', 'at']);
    text(lab.id);
    date(lab.at);
    text(lab.scenarioId);
    text(lab.answer);
    number(lab.hintLevel, 4);
    array(lab.commands, 8);
    unique(lab.commands);
    if (
      !scenarioById[lab.scenarioId] ||
      lab.commands.some((c) => typeof c !== 'string' || !Object.hasOwn(commandLabels, c)) ||
      !diagnoses.some(([id]) => id === lab.answer)
    )
      throw new Error('Tentativa de laboratório inválida.');
  }
  unique((p.labAttempts as Dict[]).map((lab) => lab.id));
  const sim = p.simulator;
  object(sim, ['scenarioId', 'commands', 'answer', 'hintLevel']);
  text(sim.scenarioId);
  text(sim.answer);
  number(sim.hintLevel, 4);
  array(sim.commands, 8);
  unique(sim.commands);
  if (
    !scenarioById[sim.scenarioId] ||
    sim.commands.some((c) => typeof c !== 'string' || !Object.hasOwn(commandLabels, c)) ||
    (sim.answer && !diagnoses.some(([id]) => id === sim.answer))
  )
    throw new Error('Registro de laboratório inválido.');
  return e as unknown as Envelope;
}

export function emptyEnvelope(): Envelope {
  return {
    appId: 'infrasec-learn',
    schemaVersion: 1,
    revision: 0,
    savedAt: new Date().toISOString(),
    progress: initialProgress(),
  };
}
export interface Store {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export function load(store: Store): { envelope: Envelope; error: string; raw: string | null } {
  let raw: string | null = null;
  try {
    raw = store.getItem(STORAGE_KEY);
    return { envelope: raw ? parseEnvelope(raw) : emptyEnvelope(), error: '', raw };
  } catch (e) {
    return {
      envelope: emptyEnvelope(),
      raw,
      error: e instanceof Error ? e.message : 'Não foi possível ler o armazenamento.',
    };
  }
}
export function save(store: Store, e: Envelope, expectedRevision: number) {
  const raw = store.getItem(STORAGE_KEY);
  if (raw && parseEnvelope(raw).revision !== expectedRevision)
    throw new Error(
      'Outra aba atualizou o progresso. Exporte esta sessão e recarregue antes de continuar.',
    );
  const next = { ...e, revision: expectedRevision + 1, savedAt: new Date().toISOString() };
  const serialized = JSON.stringify(next);
  parseEnvelope(serialized);
  store.setItem(STORAGE_KEY, serialized);
  return next;
}
export async function exportBackup(e: Envelope) {
  const payload = JSON.stringify(e);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  const checksum = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return JSON.stringify({ format: 'infrasec-backup-v1', checksum, payload }, null, 2);
}
export async function importBackup(raw: string) {
  if (new Blob([raw]).size > MAX_BYTES) throw new Error('Arquivo excede 5 MiB.');
  const data: unknown = JSON.parse(raw);
  object(data, ['format', 'checksum', 'payload']);
  if (data.format !== 'infrasec-backup-v1') throw new Error('Formato de cópia desconhecido.');
  text(data.payload, MAX_BYTES);
  text(data.checksum);
  const e = parseEnvelope(data.payload);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data.payload));
  const checksum = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  if (checksum !== data.checksum) throw new Error('A cópia foi alterada ou está corrompida.');
  return e;
}
