import type { CertificationProgress } from './types';
import { certificationById, certificationRoute, lessonIndex } from './catalog';

export const initialCertifications = (): CertificationProgress => ({
  version: 1,
  route: 'certificacao/ccna',
  read: [],
  notes: {},
  attempts: [],
});
export function noteKey(certificationId: string, week: number) {
  const cert = certificationById.get(certificationId);
  if (!cert?.weeks.some((w) => w.number === week)) throw new Error('Semana desconhecida.');
  return `${certificationId}:${week}`;
}
export function recordReading(
  p: CertificationProgress,
  lessonId: string,
  read: boolean,
): CertificationProgress {
  if (!lessonIndex.has(lessonId)) throw new Error('Aula desconhecida.');
  return {
    ...p,
    read: read ? [...new Set([...p.read, lessonId])] : p.read.filter((id) => id !== lessonId),
  };
}
export function saveNote(
  p: CertificationProgress,
  key: string,
  text: string,
): CertificationProgress {
  const [id, week, extra] = key.split(':');
  if (extra || noteKey(id, Number(week)) !== key || text.length > 8192)
    throw new Error('Anotação inválida.');
  return { ...p, notes: { ...p.notes, [key]: text } };
}
export function submitComprehension(
  p: CertificationProgress,
  lessonId: string,
  answer: string,
  id: string,
  at = new Date().toISOString(),
): CertificationProgress {
  const lesson = lessonIndex.get(lessonId);
  const context = certificationRoute(p.route);
  if (
    !lesson?.options.includes(answer) ||
    !context?.week?.lessons.includes(lessonId) ||
    !id ||
    id.length > 128 ||
    !Number.isFinite(Date.parse(at))
  )
    throw new Error('Resposta inválida.');
  const existing = p.attempts.find((a) => a.id === id);
  if (existing) {
    if (existing.lessonId !== lessonId || existing.answer !== answer)
      throw new Error('Identificador já utilizado.');
    return p;
  }
  if (p.attempts.length >= 10000)
    throw new Error('Limite de respostas atingido. Exporte uma cópia para preservar o histórico.');
  return {
    ...p,
    attempts: [
      ...p.attempts,
      {
        id,
        certificationId: context.certification.id,
        week: context.week.number,
        lessonId,
        lessonVersion: lesson.version,
        answer,
        at,
        mode: 'comprehension',
      },
    ],
  };
}
export function validateCertifications(value: unknown): asserts value is CertificationProgress {
  function object(v: unknown, keys: string[]): asserts v is Record<string, unknown> {
    if (
      !v ||
      typeof v !== 'object' ||
      Array.isArray(v) ||
      Object.keys(v).some((k) => !keys.includes(k))
    )
      throw new Error('Dados de certificações incompatíveis.');
  }
  function text(v: unknown, max: number): asserts v is string {
    if (typeof v !== 'string' || v.length > max)
      throw new Error('Texto inválido nas certificações.');
  }
  object(value, ['version', 'route', 'read', 'notes', 'attempts']);
  if (value.version !== 1 || typeof value.route !== 'string' || !certificationRoute(value.route))
    throw new Error('Roteiro ou versão de certificações desconhecido.');
  if (
    !Array.isArray(value.read) ||
    value.read.length > lessonIndex.size ||
    new Set(value.read).size !== value.read.length ||
    value.read.some((id) => typeof id !== 'string' || !lessonIndex.has(id))
  )
    throw new Error('Leituras de certificações inválidas.');
  const keys = [...certificationById.values()].flatMap((c) =>
    c.weeks.map((w) => noteKey(c.id, w.number)),
  );
  object(value.notes, keys);
  Object.values(value.notes).forEach((v) => text(v, 8192));
  if (!Array.isArray(value.attempts) || value.attempts.length > 10000)
    throw new Error('Histórico de certificações inválido.');
  const ids = new Set<string>();
  for (const a of value.attempts) {
    object(a, [
      'id',
      'certificationId',
      'week',
      'lessonId',
      'lessonVersion',
      'answer',
      'at',
      'mode',
    ]);
    text(a.id, 128);
    text(a.lessonId, 128);
    text(a.certificationId, 128);
    text(a.lessonVersion, 32);
    text(a.answer, 32);
    text(a.at, 128);
    const lesson = lessonIndex.get(a.lessonId);
    if (
      !a.id ||
      ids.has(a.id) ||
      !lesson ||
      !Number.isInteger(a.week) ||
      !certificationById
        .get(a.certificationId)
        ?.weeks.some((w) => w.number === a.week && w.lessons.includes(a.lessonId as string)) ||
      a.lessonVersion !== lesson.version ||
      !lesson.options.includes(a.answer) ||
      !Number.isFinite(Date.parse(a.at)) ||
      a.mode !== 'comprehension'
    )
      throw new Error('Resposta de certificações incompatível.');
    ids.add(a.id);
  }
}
