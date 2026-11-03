import type { StudyLesson } from './types';

// Explicit editorial IDs, not array offsets. Each item is a comprehension case, never an exam.
export function lesson(
  id: string,
  title: string,
  paragraphs: string[],
  data: string,
  reasoning: string[],
  conclusion: string,
  practice: string,
  recovery: string,
  prompt: string,
  options: [string, string][],
  correct: number,
  source: string,
  origin = 'InfraSec · conteúdo autoral · 2026-11-02',
): StudyLesson {
  return {
    id,
    title,
    paragraphs,
    example: { data, reasoning, conclusion },
    practice,
    recovery,
    question: {
      prompt,
      options: options.map(([text, explanation], i) => ({ id: `o${i + 1}`, text, explanation })),
      correct: `o${correct + 1}`,
    },
    source,
    origin,
    version: '1.0',
  };
}
