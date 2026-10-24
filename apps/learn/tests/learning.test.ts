import { afterEach, describe, expect, it, vi } from 'vitest';
import { assessmentA, questionById, reviewQuestions } from '../src/content/questions';
import {
  correctAnswer,
  dueReview,
  finishRun,
  initialProgress,
  makeAttempt,
  observations,
  runResult,
  startRun,
} from '../src/domain/learning';
import type { Progress, Run } from '../src/domain/types';

function completed(p: Progress, kind: Run['kind'] = 'independent', wrong = false) {
  const run = startRun(p, kind);
  run.answers = Object.fromEntries(run.questionIds.map((id) => [id, questionById[id].correct]));
  if (wrong)
    run.answers[run.questionIds[0]] = questionById[run.questionIds[0]].options.find(
      (o) => o.id !== questionById[run.questionIds[0]].correct,
    )!.id;
  return finishRun({ ...p, runs: [...p.runs, run] }, run.id);
}
afterEach(() => vi.useRealTimers());
describe('correção e evidências honestas', () => {
  it('não aceita resposta desconhecida ou score declarado', () => {
    expect(correctAnswer('a-roles', '100')).toBe(false);
    expect(correctAnswer('inexistente', 'op-0')).toBe(false);
    expect(() => makeAttempt('a-roles', 'x'.repeat(500), 'comprehension', 0)).toThrow();
  });
  it('leitura, prática e ajuda não geram demonstração independente', () => {
    const p = initialProgress();
    p.read = ['redes'];
    p.attempts.push(makeAttempt('c-redes', questionById['c-redes'].correct, 'guided', 4));
    expect(observations(p).every((o) => o.families === 0)).toBe(true);
  });
  it('uma prova não é evidência diversa suficiente; duas famílias por objetivo são necessárias', () => {
    const one = completed(initialProgress());
    expect(observations(one).every((o) => o.families === 1)).toBe(true);
    const two = completed(one);
    expect(observations(two).every((o) => o.status === 'Demonstrado neste recorte')).toBe(true);
  });
  it('erro essencial impede aprovação mesmo com 7/8 de acerto', () => {
    const p = completed(initialProgress(), 'independent', true);
    const result = runResult(p, p.runs[0]);
    expect(result.correct).toBe(7);
    expect(result.passed).toBe(false);
    expect(observations(p).find((o) => o.id === 'O01')?.fragile).toBe(true);
  });
  it.each(['assisted', 'consulted'] as const)('%s impede demonstração', (field) => {
    const p = initialProgress();
    const run = startRun(p, 'independent');
    run[field] = true;
    run.answers = Object.fromEntries(run.questionIds.map((id) => [id, questionById[id].correct]));
    const next = finishRun({ ...p, runs: [run] }, run.id);
    expect(observations(next).every((o) => o.families === 0)).toBe(true);
    expect(runResult(next, next.runs[0]).independent).toBe(false);
  });
  it('avaliação incompleta ou encerrada não finaliza', () => {
    const p = initialProgress();
    const run = startRun(p, 'independent');
    p.runs = [run];
    expect(() => finishRun(p, run.id)).toThrow('Responda todos');
    run.status = 'abandoned';
    expect(() => finishRun(p, run.id)).toThrow();
  });
  it('tentativa antiga não aprova nova versão', () => {
    const p = completed(initialProgress());
    p.attempts.forEach((a) => (a.questionVersion = '0.1'));
    p.runs[0].versions[0] = '0.1';
    expect(runResult(p, p.runs[0]).compatible).toBe(false);
    expect(observations(p).every((o) => o.families === 0)).toBe(true);
  });
  it('repetir conjunto não aumenta famílias', () => {
    const two = completed(completed(initialProgress()));
    const three = completed(two);
    expect(observations(three).every((o) => o.families === 2)).toBe(true);
    expect(runResult(three, three.runs[2]).repeated).toBe(8);
  });
  it('acertar uma resposta já revelada não apaga a fragilidade de erro anterior', () => {
    const failed = completed(initialProgress(), 'independent', true);
    const second = completed(failed);
    const repeated = completed(second, 'independent', true);
    const fourth = completed(repeated);
    const fifth = completed(fourth);
    expect(observations(fifth).find((o) => o.id === 'O01')?.fragile).toBe(true);
  });
  it('data futura preservada não concede evidência temporal', () => {
    const p = completed(initialProgress());
    p.attempts.forEach((a) => (a.at = '2999-01-01T00:00:00Z'));
    expect(observations(p).every((o) => o.families === 0)).toBe(true);
  });
  it('o banco cobre todos os objetivos sem herdar notas por texto', () => {
    expect(new Set(assessmentA.map((q) => q.objective)).size).toBe(8);
    expect(reviewQuestions).toHaveLength(8);
  });
});
describe('revisão posterior', () => {
  it('não há agenda sem conjunto independente aprovado', () =>
    expect(dueReview(initialProgress())).toBeNull());
  it('revisão antecipada é prática, sem avançar intervalo', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-23T12:00:00Z'));
    const p = completed(initialProgress());
    const early = completed(p, 'review');
    expect(dueReview(early)?.stage).toBe(0);
    expect(dueReview(early)?.dueAt).toBe('2026-10-24T12:00:00.000Z');
  });
  it('resultado posterior avança, erro posterior pede novo intervalo', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-23T12:00:00Z'));
    const p = completed(initialProgress());
    vi.setSystemTime(new Date('2026-10-24T13:00:00Z'));
    const reviewed = completed(p, 'review');
    expect(dueReview(reviewed)?.stage).toBe(1);
    vi.setSystemTime(new Date('2026-10-28T13:00:00Z'));
    const wrong = completed(reviewed, 'review', true);
    expect(dueReview(wrong)?.stage).toBe(0);
  });
});
