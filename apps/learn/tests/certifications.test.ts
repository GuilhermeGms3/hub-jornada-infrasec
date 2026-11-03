import { describe, expect, it } from 'vitest';
import {
  certifications,
  certificationHref,
  certificationRoute,
  lessonIndex,
} from '../src/certifications/catalog';
import { networkLessons } from '../src/certifications/lessons-network';
import { securityLessons } from '../src/certifications/lessons-security';
import { cloudLessons } from '../src/certifications/lessons-cloud';
import { operationsLessons } from '../src/certifications/lessons-operations';
import {
  initialCertifications,
  noteKey,
  recordReading,
  saveNote,
  submitComprehension,
  validateCertifications,
} from '../src/certifications/model';
import {
  emptyEnvelope,
  exportBackup,
  importBackup,
  parseEnvelope,
  load,
  STORAGE_KEY,
} from '../src/persistence/storage';
import { initialCoursework } from '../src/coursework/model';
import { policyTrace } from '../src/certifications/PolicyWalkthrough';

const lessons = [...networkLessons, ...securityLessons, ...cloudLessons, ...operationsLessons];
const started = () => ({
  ...initialCertifications(),
  route: 'certificacao/ccna/semana/2/aula/subnetting',
});

describe('roteiros e ensino com disponibilidade explícita', () => {
  it('modelo de política encerra na primeira correspondência, sem escolher regra específica posterior', () => {
    expect(policyTrace('ssh', true).map((r) => r.id)).toEqual(['10']);
    expect(policyTrace('ssh', true).at(-1)?.action).toBe('accept');
    expect(policyTrace('ssh', false).map((r) => r.id)).toEqual(['20']);
    expect(policyTrace('ssh', false).at(-1)?.action).toBe('deny');
  });
  it('modelo distingue interfaces e serviço e preserva negação sem correspondência', () => {
    expect(policyTrace('web', false).map((r) => r.id)).toEqual(['20', '30']);
    expect(policyTrace('web', false).at(-1)?.action).toBe('accept');
    expect(policyTrace('guest', true).at(-1)?.id).toBe('implicit');
    expect(policyTrace('guest', true).at(-1)?.action).toBe('deny');
    expect(() => policyTrace('inventado', false)).toThrow();
  });
  it('restaura cada certificação solicitada com 12 semanas próprias e links internos válidos', () => {
    expect(certifications.map((c) => c.id)).toEqual([
      'ccna',
      'nse1',
      'nse2',
      'nse3',
      'nse4',
      'nse5',
      'nse6',
      'nse7',
      'aws-clf',
      'az900',
      'sc900',
      'sc200',
      'sc300',
      'securityplus',
      'linux',
      'kcna',
    ]);
    expect(new Set(certifications.map((c) => c.id)).size).toBe(certifications.length);
    for (const c of certifications) {
      expect(c.weeks.map((w) => w.number)).toEqual(Array.from({ length: 12 }, (_, i) => i + 1));
      expect(new Set(c.weeks.map((w) => w.title)).size).toBe(12);
      expect(certificationRoute(certificationHref(c.id).slice(2))?.certification.id).toBe(c.id);
      for (const w of c.weeks) {
        expect(w.lessons.length).toBeGreaterThan(0);
        for (const text of [w.objective, w.practice, w.evidence, w.gap])
          expect(text.trim()).not.toBe('');
        for (const id of w.lessons) {
          expect(lessons.find((l) => l.id === id)).toBeDefined();
          expect(certificationRoute(certificationHref(c.id, w.number, id).slice(2))?.lessonId).toBe(
            id,
          );
        }
      }
    }
  });
  it('não aceita semanas, aulas, segmentos ou identificadores herdados inventados', () => {
    for (const route of [
      'certificacao/constructor',
      'certificacao/ccna/semana/0',
      'certificacao/ccna/semana/13',
      'certificacao/ccna/semana/01',
      'certificacao/ccna/semana/2/aula/fort-policy',
      'certificacao/ccna/semana/2/aula/subnetting/extra',
      'certificacao/ccna/extra',
    ])
      expect(certificationRoute(route)).toBeNull();
  });
  it('o índice usado no backup corresponde exatamente às aulas e opções publicadas', () => {
    expect(lessons).toHaveLength(60);
    expect(lessonIndex.size).toBe(lessons.length);
    for (const l of lessons) {
      expect(lessonIndex.get(l.id)).toEqual({
        id: l.id,
        title: l.title,
        version: l.version,
        options: l.question.options.map((o) => o.id),
        correct: l.question.correct,
      });
      expect(l.question.options).toHaveLength(3);
      expect(l.question.options.some((o) => o.id === l.question.correct)).toBe(true);
      expect(l.question.options.every((o) => o.explanation.trim())).toBe(true);
      expect(l.paragraphs.length).toBeGreaterThanOrEqual(3);
      expect(l.example.reasoning.length).toBeGreaterThanOrEqual(3);
      expect(l.recovery.trim()).not.toBe('');
      expect(l.source).toMatch(/^https:\/\//);
    }
  });
  it('CCNA usa v2.0 e todos os cinco domínios; Fortinet não impõe NSE5 antes de NSE6', () => {
    const ccna = certifications[0];
    expect(ccna.version).toContain('2.0');
    for (const domain of ['1.', '2.', '3.', '4.', '5.'])
      expect(ccna.weeks.some((w) => w.blueprint.includes(domain))).toBe(true);
    const six = certifications.find((c) => c.id === 'nse6')!;
    expect(six.prerequisites).toContain('NSE 5 não é pré-requisito');
    expect(certifications.find((c) => c.id === 'nse7')!.prerequisites).toContain('NSE 5 ou NSE 6');
    expect(certifications.find((c) => c.id === 'nse5')!.description).toContain('SD-WAN Core');
  });
  it('corrige as conclusões problemáticas dos casos antigos', () => {
    expect(lessons.find((l) => l.id === 'azure-rbac')!.paragraphs.join(' ')).toContain(
      'ainda permite muito mais',
    );
    expect(lessons.find((l) => l.id === 'incident-triage')!.paragraphs.join(' ')).toContain(
      'não rotule automaticamente'.replace('não', 'Não'),
    );
    expect(lessons.find((l) => l.id === 'ospf')!.paragraphs.join(' ')).toContain('2-WAY');
  });
});

describe('mesma cópia, sem transformar estudo em certificação', () => {
  it('leitura compartilhada é idempotente e não cria aprovação, tentativa nem avaliação R01', () => {
    const p = recordReading(recordReading(started(), 'subnetting', true), 'subnetting', true);
    expect(p.read).toEqual(['subnetting']);
    expect(p.attempts).toEqual([]);
    expect(Object.keys(p).sort()).toEqual(['attempts', 'notes', 'read', 'route', 'version']);
    expect(recordReading(p, 'subnetting', false).read).toEqual([]);
  });
  it('resposta registra contexto e só conta como compreensão; submissão duplicada é idempotente', () => {
    const p = submitComprehension(started(), 'subnetting', 'o2', 'event-1');
    expect(p.attempts[0]).toMatchObject({
      certificationId: 'ccna',
      week: 2,
      lessonId: 'subnetting',
      lessonVersion: '1.0',
      mode: 'comprehension',
    });
    expect(submitComprehension(p, 'subnetting', 'o2', 'event-1')).toBe(p);
    expect(() => submitComprehension(p, 'subnetting', 'o1', 'event-1')).toThrow();
    expect(() => submitComprehension(p, 'fort-policy', 'o1', 'event-2')).toThrow();
    expect(() => submitComprehension(p, 'subnetting', 'inventada', 'event-2')).toThrow();
  });
  it('anotação é limitada, por certificação/semana e não cria respostas', () => {
    const p = saveNote(started(), noteKey('nse6', 2), 'Observação sintética.');
    expect(p.notes['nse6:2']).toBe('Observação sintética.');
    expect(p.attempts).toEqual([]);
    expect(() => saveNote(p, 'nse6:13', 'x')).toThrow();
    expect(() => saveNote(p, 'nse6:2', 'x'.repeat(8193))).toThrow();
    expect(() => saveNote(p, '__proto__', 'x')).toThrow();
  });
  it('cópia nova preserva R01, R02–R04 e certificações; cópia antiga segue aceita', async () => {
    const e = emptyEnvelope();
    e.progress.read = ['ipv4'];
    e.coursework = initialCoursework();
    e.certifications = submitComprehension(
      saveNote(recordReading(started(), 'subnetting', true), 'ccna:2', 'Meu raciocínio'),
      'subnetting',
      'o2',
      'event-1',
    );
    const restored = await importBackup(await exportBackup(e));
    expect(restored).toEqual(e);
    expect(parseEnvelope(JSON.stringify(emptyEnvelope())).certifications).toBeUndefined();
    expect(restored.progress.runs).toEqual([]);
    expect(restored.coursework?.runs).toEqual([]);
  });
  it.each(['version', 'route', 'read', 'notes', 'attempts'])(
    'rejeita campo obrigatório %s ausente sem sobrescrever original',
    (key) => {
      const p: Record<string, unknown> = { ...started() };
      delete p[key];
      const raw = JSON.stringify({ ...emptyEnvelope(), certifications: p });
      const storage = new Map([[STORAGE_KEY, raw]]);
      expect(
        load({ getItem: (k) => storage.get(k) || null, setItem: (k, v) => storage.set(k, v) })
          .error,
      ).not.toBe('');
      expect(storage.get(STORAGE_KEY)).toBe(raw);
    },
  );
  it('rejeita duplicidade, versão incompatível, modo forjado e contexto não pertencente à aula', () => {
    const p = submitComprehension(started(), 'subnetting', 'o2', 'event-1');
    expect(() => validateCertifications({ ...p, read: ['subnetting', 'subnetting'] })).toThrow();
    expect(() =>
      validateCertifications({ ...p, attempts: [p.attempts[0], p.attempts[0]] }),
    ).toThrow();
    for (const change of [
      { mode: 'independent' },
      { lessonVersion: '99' },
      { certificationId: 'nse6' },
      { week: 13 },
      { answer: 'o99' },
      { at: 'not-a-date' },
    ])
      expect(() =>
        validateCertifications({ ...p, attempts: [{ ...p.attempts[0], ...change }] }),
      ).toThrow();
    expect(() => validateCertifications({ ...p, mastery: true })).toThrow();
  });
});
