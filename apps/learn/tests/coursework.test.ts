import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  courseUnits,
  courseQuestions,
  courseQuestionById,
  curriculumProblems,
  courseRoute,
  knowledge,
} from '../src/coursework/catalog';
import {
  initialCoursework,
  startCourseRun,
  finishCourseRun,
  courseRunResult,
  recordPractice,
  visitCoursework,
  courseReviewDue,
  objectiveEvidence,
} from '../src/coursework/model';
import {
  parseEnvelope,
  emptyEnvelope,
  exportBackup,
  importBackup,
} from '../src/persistence/storage';
import { weekOneMissions, missionState } from '../src/coursework/Journey';
import type { Coursework, UnitId, CourseRun } from '../src/coursework/types';
import { shuffle } from '../src/coursework/shuffle';

afterEach(() => vi.useRealTimers());
function complete(
  c: Coursework,
  id: UnitId,
  kind: CourseRun['kind'] = 'independent',
  wrong = false,
) {
  const next = startCourseRun(c, id, kind);
  const r = next.runs.at(-1)!;
  r.answers = Object.fromEntries(
    r.questionIds.map((id, i) => [
      id,
      wrong && i === 0
        ? courseQuestionById
            .get(id)!
            .options.find((o) => o.id !== courseQuestionById.get(id)!.correct)!.id
        : courseQuestionById.get(id)!.correct,
    ]),
  );
  return finishCourseRun(next, r.id);
}
describe('ensino e relações da primeira semana', () => {
  it('tem três unidades operacionais, doze objetivos e banco original sem IDs ambíguos', () => {
    expect(courseUnits).toHaveLength(3);
    expect(knowledge).toHaveLength(12);
    expect(courseQuestions).toHaveLength(51);
    expect(curriculumProblems()).toEqual([]);
    expect(new Set(courseQuestions.map((q) => q.id)).size).toBe(51);
  });
  it.each(courseUnits)(
    '$id contém ensino, exemplos, recuperação alternativa e cobertura de cada objetivo',
    (u) => {
      expect(u.lessons).toHaveLength(4);
      for (const l of u.lessons) {
        expect(l.sections).toHaveLength(3);
        expect(
          l.sections
            .flatMap((s) => s.paragraphs)
            .join(' ')
            .split(/\s+/).length,
        ).toBeGreaterThan(220); // Completeness guard, not proof of teaching quality.
        expect(l.example.reasoning.length).toBeGreaterThanOrEqual(3);
        expect(l.example.limit).toBeTruthy();
        expect(l.recovery).not.toBe(l.takeaway);
        for (const mode of ['comprehension', 'independent', 'remediation', 'review'])
          expect(u.questions.filter((q) => q.lessonId === l.id && q.purpose === mode)).toHaveLength(
            1,
          );
      }
    },
  );
  it('liga todas as sete missões a aulas e avaliações internas, com objetivos explícitos', () => {
    expect(weekOneMissions).toHaveLength(7);
    for (const m of weekOneMissions) {
      expect(m.objectives.length).toBeGreaterThan(0);
      for (const [route] of m.lessons)
        expect(route.startsWith('aula/') || Boolean(courseRoute(route))).toBe(true);
      expect(m.assessment.startsWith('http')).toBe(false);
    }
  });
  it('uma leitura não conclui a missão nem demonstra objetivo', () => {
    const c = initialCoursework();
    c.read = ['net-r02:interfaces'];
    expect(objectiveEvidence(c, 'NET-CONFIG')).toBe('Ainda não avaliado.');
    expect(missionState({ envelope: { ...emptyEnvelope(), coursework: c } }, 1)).toBe(
      'Em aprendizagem',
    );
  });
});
describe.each(courseUnits)('correção de $id', (unit) => {
  it('exige respostas, nunca leitura, texto livre ou checkboxes', () => {
    const c = startCourseRun(
      {
        ...initialCoursework(),
        read: unit.lessons.map((l) => `${unit.id}:${l.id}`),
        collected: { [unit.id]: unit.lab.outputs.map((o) => o.id) },
        artifacts: {
          [unit.id]: {
            impacto: 'gateway DNS DHCP validação rollback',
            evidencias: 'texto longo com palavras técnicas não é uma execução observada',
            passos: 'todos os campos preenchidos, sem responder ao conjunto',
          },
        },
      },
      unit.id,
      'independent',
    );
    expect(() => finishCourseRun(c, c.runs[0].id)).toThrow('todos');
    expect(
      courseRunResult({
        ...c.runs[0],
        questionIds: [],
        versions: [],
        status: 'completed',
        finishedAt: new Date().toISOString(),
      }).passed,
    ).toBe(false);
  });
  it('não compensa um erro essencial com outros acertos', () => {
    const c = complete(initialCoursework(), unit.id, 'independent', true);
    const result = courseRunResult(c.runs[0]);
    expect(result.correct).toBe(3);
    expect(result.passed).toBe(false);
  });
  it('mantém rascunho e congela IDs/versões; envio repetido é idempotente', () => {
    const c = complete(initialCoursework(), unit.id);
    expect(courseRunResult(c.runs[0]).independent).toBe(true);
    expect(c.attempts).toHaveLength(4);
    expect(finishCourseRun(c, c.runs[0].id)).toBe(c);
    expect(parseEnvelope(JSON.stringify({ ...emptyEnvelope(), coursework: c })).coursework).toEqual(
      c,
    );
  });
  it('consulta a outra tela torna o conjunto assistido', () => {
    let c = startCourseRun(initialCoursework(), unit.id, 'independent');
    c = visitCoursework(c, 'hoje');
    const r = c.runs[0];
    r.answers = Object.fromEntries(
      r.questionIds.map((id) => [id, courseQuestionById.get(id)!.correct]),
    );
    c = finishCourseRun(c, r.id);
    expect(courseRunResult(c.runs[0]).passed).toBe(true);
    expect(courseRunResult(c.runs[0]).independent).toBe(false);
    expect(c.attempts.every((a) => a.hintLevel === 1)).toBe(true);
  });
  it('não aceita correção em versão diferente nem dados futuros como aprovação', () => {
    let c = complete(initialCoursework(), unit.id);
    c.runs[0].versions[0] = 'antiga';
    expect(courseRunResult(c.runs[0]).passed).toBe(false);
    c = complete(initialCoursework(), unit.id);
    c.runs[0].finishedAt = '2099-01-01T00:00:00Z';
    expect(courseRunResult(c.runs[0]).passed).toBe(false);
  });
  it('não aceita uma conclusão guiada sem coleta, nem duplica o mesmo evento', () => {
    const q = unit.lab.question;
    expect(() => recordPractice(initialCoursework(), q, q.correct, 'guided', false)).toThrow(
      'Colete',
    );
    const c = { ...initialCoursework(), collected: { [unit.id]: unit.lab.required } };
    const next = recordPractice(c, q, q.correct, 'guided', false, 'ação-estável');
    expect(recordPractice(next, q, q.correct, 'guided', false, 'ação-estável')).toBe(next);
    expect(next.attempts).toHaveLength(1);
  });
});
describe('continuidade e integridade', () => {
  it('abre os pré-requisitos mesmo sem domínio e rejeita rotas desconhecidas', () => {
    expect(courseRoute('unidade/net-r02/interfaces')).toBeTruthy();
    expect(courseRoute('unidade/net-r02/inexistente')).toBeNull();
    expect(courseRoute('unidade/net-r02/interfaces/extra')).toBeNull();
  });
  it('não permite avaliações simultâneas em unidades diferentes', () => {
    const c = startCourseRun(initialCoursework(), 'net-r02', 'independent');
    expect(() => startCourseRun(c, 'net-r03', 'review')).toThrow('andamento');
  });
  it('preserva R01 e carrega cópias anteriores sem criar extensão automaticamente', async () => {
    const original = emptyEnvelope();
    original.progress.read = ['dns'];
    const raw = JSON.stringify(original);
    expect(parseEnvelope(raw).coursework).toBeUndefined();
    const combined = { ...original, coursework: complete(initialCoursework(), 'net-r02') };
    const restored = await importBackup(await exportBackup(combined));
    expect(restored.progress).toEqual(original.progress);
    expect(restored.coursework?.attempts).toHaveLength(4);
    expect(parseEnvelope(raw).progress).toEqual(original.progress);
  });
  it('recusa notas forjadas, eventos duplicados, alternativas inválidas e versões desconhecidas', () => {
    const e = { ...emptyEnvelope(), coursework: complete(initialCoursework(), 'net-r02') };
    for (const mutate of [
      (x: typeof e) => Object.assign(x.coursework, { score: 100 }),
      (x: typeof e) => {
        x.coursework.attempts.push(x.coursework.attempts[0]);
      },
      (x: typeof e) => {
        x.coursework.runs[0].answers[x.coursework.runs[0].questionIds[0]] = 'inexistente';
      },
      (x: typeof e) => Object.assign(x.coursework, { version: 99 }),
    ]) {
      const copy = structuredClone(e);
      mutate(copy);
      expect(() => parseEnvelope(JSON.stringify(copy))).toThrow();
    }
  });
  it('revisão antecipada não avança a agenda; revisão posterior pode avançar', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-24T12:00:00Z'));
    let c = complete(initialCoursework(), 'net-r02');
    c = complete(c, 'net-r02', 'review');
    expect(courseReviewDue(c, 'net-r02')?.stage).toBe(0);
    vi.setSystemTime(new Date('2026-10-25T12:00:01Z'));
    c = complete(c, 'net-r02', 'review');
    expect(courseReviewDue(c, 'net-r02')?.stage).toBe(1);
  });
  it('não limpa erro independente apenas repetindo a mesma família', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-24T12:00:00Z'));
    let c = complete(initialCoursework(), 'net-r02', 'independent', true);
    const wrong = c.attempts.find(
      (a) => courseQuestionById.get(a.questionId)!.correct !== a.answer,
    )!;
    vi.setSystemTime(new Date('2026-10-24T12:01:00Z'));
    c = complete(c, 'net-r02');
    expect(objectiveEvidence(c, wrong.objective)).toContain('Vale revisar');
    vi.setSystemTime(new Date('2026-10-25T12:01:00Z'));
    c = complete(c, 'net-r02', 'review');
    expect(objectiveEvidence(c, wrong.objective)).toContain('Acerto independente');
  });
  it('embaralha sem mudar o banco original nem a identidade dos itens', () => {
    const input = ['id-a', 'id-b', 'id-c'];
    const result = shuffle(input, () => 0);
    expect(input).toEqual(['id-a', 'id-b', 'id-c']);
    expect(result).not.toEqual(input);
    expect([...result].sort()).toEqual([...input].sort());
  });
});
