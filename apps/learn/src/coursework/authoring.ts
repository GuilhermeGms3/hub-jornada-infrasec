import type { Mode } from '../domain/types';
import type { CourseQuestion, UnitId } from './types';

// IDs are explicit editorial slugs, never generated from question position.
export function question(
  unitId: UnitId,
  slug: string,
  lessonId: string,
  objective: string,
  purpose: Mode,
  prompt: string,
  context: string,
  choices: [string, string][],
  correct: string,
  hint: string,
): CourseQuestion {
  return {
    id: `${unitId}:${slug}`,
    unitId,
    version: '1.0',
    family: `${objective}:${purpose}`,
    objective,
    lessonId,
    purpose,
    prompt,
    context,
    options: choices.map(([text, explanation], i) => ({
      id: ['a', 'b', 'c', 'd'][i],
      text,
      explanation,
    })),
    correct,
    hint,
    source: 'InfraSec · redação original · Semana 1 · 2026-10-24',
  };
}
