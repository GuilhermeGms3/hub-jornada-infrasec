import { lessons, objectives } from './lessons';
import {
  questions,
  checks,
  assessmentA,
  assessmentB,
  reviewQuestions,
  recoveryQuestions,
} from './questions';
import { remediation } from './remediation';

export function validateContent() {
  const errors: string[] = [];
  for (const [name, collection] of [
    ['lesson', lessons],
    ['question', questions],
    ['recovery', remediation],
  ] as const) {
    const ids = collection.map((item) => item.id);
    if (new Set(ids).size !== ids.length) errors.push(`IDs duplicados em ${name}`);
  }
  for (const q of questions) {
    if (!q.version || !q.family || !Object.hasOwn(objectives, q.objective))
      errors.push(`Metadados incompletos: ${q.id}`);
    if (
      !q.options.some((o) => o.id === q.correct) ||
      new Set(q.options.map((o) => o.id)).size !== q.options.length
    )
      errors.push(`Gabarito inválido: ${q.id}`);
    if (
      new Set(q.options.map((o) => o.text)).size !== q.options.length ||
      q.options.some((o) => !o.explanation.trim())
    )
      errors.push(`Alternativas/feedback: ${q.id}`);
    if (!remediation.some((r) => r.id === q.remediation))
      errors.push(`Recuperação desconhecida: ${q.id}`);
  }
  for (const lesson of lessons) {
    if (!checks.some((q) => q.id === lesson.questionId)) errors.push(`Sem checagem: ${lesson.id}`);
    if (!lesson.example.reasoning.length || !lesson.example.limit || lesson.sections.length < 3)
      errors.push(`Ensino incompleto: ${lesson.id}`);
  }
  for (const objective of Object.keys(objectives)) {
    if (!lessons.some((l) => l.objective === objective || (objective === 'O05' && l.id === 'dns')))
      errors.push(`Objetivo sem aula: ${objective}`);
    for (const [name, items] of [
      ['A', assessmentA],
      ['B', assessmentB],
      ['review', reviewQuestions],
    ] as const) {
      if (!items.some((q) => q.objective === objective))
        errors.push(`Objetivo sem avaliação ${name}: ${objective}`);
    }
  }
  for (const r of remediation) {
    if (
      !lessons.some((l) => l.id === r.lesson) ||
      !recoveryQuestions.some((q) => q.id === r.question)
    )
      errors.push(`Referência de recuperação: ${r.id}`);
  }
  return errors;
}
