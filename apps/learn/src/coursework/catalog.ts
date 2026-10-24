import { r02 } from './r02';
import { r03 } from './r03';
import { r04 } from './r04';
export const courseUnits = [r02, r03, r04];
export const courseQuestions = courseUnits.flatMap((u) => [...u.questions, u.lab.question]);
export const courseQuestionById = new Map(courseQuestions.map((q) => [q.id, q]));
export const courseLessonById = new Map(
  courseUnits.flatMap((u) => u.lessons.map((l) => [l.id, l] as const)),
);
export const unitById = new Map(courseUnits.map((u) => [u.id as string, u]));
export const courseHref = (unitId: string, view: string) => `#/unidade/${unitId}/${view}`;
export function courseRoute(route: string) {
  const [prefix, id, view, extra] = route.split('/');
  const unit = unitById.get(id);
  return prefix === 'unidade' &&
    unit &&
    view &&
    !extra &&
    (unit.lessons.some((l) => l.id === view) ||
      ['pratica', 'avaliacao', 'recuperacao', 'revisao', 'historico'].includes(view))
    ? { unit, view }
    : null;
}
// Explicit conceptual prerequisites; never an opaque access gate.
export const r01Knowledge: Record<string, { title: string; route: string }> = {
  'R01-IP': { title: 'IPv4 e rede conectada', route: 'aula/ipv4' },
  'R01-MASK': { title: 'Máscara e decisão local/remota', route: 'aula/mascara' },
  'R01-ROTA': { title: 'Gateway e encaminhamento', route: 'aula/gateway' },
  'R01-DNS': { title: 'Resolução de nomes', route: 'aula/dns' },
  'R01-HTTPS': { title: 'HTTPS e operação de aplicação', route: 'aula/https' },
};
export const knowledge = courseUnits.flatMap((u) =>
  u.lessons.map((l) => ({
    id: l.objective,
    name: l.title,
    explanation: l.takeaway,
    observable: l.observable,
    prerequisites: l.prerequisites,
    unitId: u.id,
    lessonId: l.id,
    exercises: u.questions.filter((q) => q.objective === l.objective).map((q) => q.id),
    labs: [u.id],
    references: u.references,
  })),
);
export function curriculumProblems() {
  const errors: string[] = [];
  const ids = courseQuestions.map((q) => q.id);
  if (new Set(ids).size !== ids.length) errors.push('Questões duplicadas');
  const nodes = new Map(knowledge.map((k) => [k.id, k]));
  const visit = (id: string, path: string[]) => {
    if (path.includes(id)) {
      errors.push(`Ciclo: ${[...path, id].join(' → ')}`);
      return;
    }
    if (Object.hasOwn(r01Knowledge, id)) return;
    const node = nodes.get(id);
    if (!node) {
      errors.push(`Pré-requisito desconhecido: ${id}`);
      return;
    }
    node.prerequisites.forEach((p) => visit(p, [...path, id]));
  };
  knowledge.forEach((k) => visit(k.id, []));
  for (const u of courseUnits)
    for (const l of u.lessons) {
      for (const mode of ['comprehension', 'independent', 'remediation', 'review'])
        if (!u.questions.some((q) => q.lessonId === l.id && q.purpose === mode))
          errors.push(`${u.id}/${l.id}: ${mode} ausente`);
    }
  for (const q of courseQuestions)
    if (
      !q.options.some((o) => o.id === q.correct) ||
      new Set(q.options.map((o) => o.id)).size !== q.options.length ||
      q.options.some((o) => !o.explanation) ||
      !courseLessonById.has(q.lessonId)
    )
      errors.push(`Item inválido: ${q.id}`);
  return errors;
}
