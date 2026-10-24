import { describe, expect, it } from 'vitest';
import { lessons } from '../src/content/lessons';
import { questions, assessmentA, assessmentB, reviewQuestions } from '../src/content/questions';
import { validateContent } from '../src/content/validate';

describe('Integridade curricular e editorial', () => {
  it('tem identidades, gabaritos, feedback e cobertura de todos os objetivos', () =>
    expect(validateContent()).toEqual([]));
  it.each(lessons)('ensino desenvolvido e exemplo com limites: $title', (lesson) => {
    const words = lesson.sections
      .flatMap((s) => s.paragraphs)
      .join(' ')
      .split(/\s+/).length;
    expect(words).toBeGreaterThan(250);
    expect(lesson.sections.every((s) => s.paragraphs.length >= 2)).toBe(true);
    expect(lesson.example.reasoning.length).toBeGreaterThanOrEqual(3);
    expect(lesson.example.data).not.toBe('');
    expect(lesson.misconception).not.toBe('');
  });
  it.each(questions)('alternativas existentes e explicadas: $id', (q) => {
    expect(q.options).toHaveLength(3);
    expect(q.options.find((o) => o.id === q.correct)).toBeDefined();
    expect(q.options.every((o) => o.explanation.length > 25)).toBe(true);
  });
  it('as duas avaliações e a revisão não repetem enunciados ou famílias entre si', () => {
    const items = [...assessmentA, ...assessmentB, ...reviewQuestions];
    expect(new Set(items.map((q) => q.prompt)).size).toBe(items.length);
    expect(new Set(items.map((q) => q.family)).size).toBe(items.length);
  });
});
