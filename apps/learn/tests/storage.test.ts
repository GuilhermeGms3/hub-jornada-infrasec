import { describe, expect, it } from 'vitest';
import {
  emptyEnvelope,
  exportBackup,
  importBackup,
  load,
  parseEnvelope,
  save,
  STORAGE_KEY,
  type Store,
} from '../src/persistence/storage';
import { finishRun, startRun } from '../src/domain/learning';
import { questionById } from '../src/content/questions';

class MemoryStore implements Store {
  values = new Map<string, string>();
  fail = false;
  getItem(k: string) {
    return this.values.get(k) ?? null;
  }
  setItem(k: string, value: string) {
    if (this.fail) throw new Error('quota');
    this.values.set(k, value);
  }
}
describe('progresso recuperável', () => {
  it('começa sem escrever; não altera chaves antigas', () => {
    const s = new MemoryStore();
    s.values.set('infrasec-task-progress', 'original');
    const result = load(s);
    expect(s.values.size).toBe(1);
    save(s, result.envelope, 0);
    expect(s.getItem('infrasec-task-progress')).toBe('original');
    expect(s.values.size).toBe(2);
  });
  it('JSON corrompido fica intacto e gera erro recuperável', () => {
    const s = new MemoryStore();
    s.values.set(STORAGE_KEY, '{broken');
    const result = load(s);
    expect(result.error).not.toBe('');
    expect(s.getItem(STORAGE_KEY)).toBe('{broken');
    expect(() => save(s, result.envelope, 0)).toThrow();
  });
  it('quota ou storage bloqueado não se apresenta como salvo', () => {
    const s = new MemoryStore();
    s.fail = true;
    expect(() => save(s, emptyEnvelope(), 0)).toThrow('quota');
    expect(s.getItem(STORAGE_KEY)).toBeNull();
    expect(
      load({
        getItem() {
          throw new Error('blocked');
        },
        setItem() {},
      }).error,
    ).toBe('blocked');
  });
  it('versão futura é preservada', () => {
    const s = new MemoryStore();
    s.values.set(STORAGE_KEY, JSON.stringify({ schemaVersion: 99 }));
    expect(load(s).error).toContain('incompatível');
    expect(s.getItem(STORAGE_KEY)).toContain('99');
  });
  it('revisão concorrente bloqueia sobrescrita', () => {
    const s = new MemoryStore();
    const one = save(s, emptyEnvelope(), 0);
    save(s, one, 1);
    expect(() => save(s, one, 1)).toThrow('Outra aba');
  });
  it('exporta e restaura tentativas e retomada com verificação de integridade', async () => {
    const e = emptyEnvelope();
    const run = startRun(e.progress, 'independent');
    run.answers = Object.fromEntries(run.questionIds.map((id) => [id, questionById[id].correct]));
    e.progress = finishRun({ ...e.progress, runs: [run] }, run.id);
    e.progress.route = 'aula/dns';
    const backup = await exportBackup(e);
    const restored = await importBackup(backup);
    expect(restored).toEqual(e);
    const corrupt = JSON.parse(backup);
    corrupt.checksum = '000';
    await expect(importBackup(JSON.stringify(corrupt))).rejects.toThrow('corrompida');
  });
  it.each(['__proto__', 'passed', 'score', 'correct'])(
    'não aceita campo extra %s como autoridade',
    (key) => {
      const e = emptyEnvelope();
      const raw = JSON.stringify(e).replace('"revision":0', `"revision":0,"${key}":true`);
      expect(() => parseEnvelope(raw)).toThrow('campos');
    },
  );
  it('recusa IDs duplicados, tentativa órfã e arquivos excessivos', () => {
    const e = emptyEnvelope();
    e.progress.read = ['redes', 'redes'];
    expect(() => parseEnvelope(JSON.stringify(e))).toThrow('duplicados');
    expect(() => parseEnvelope(' '.repeat(5 * 1024 * 1024 + 1))).toThrow('5 MiB');
  });
  it('não aceita resposta independente sem avaliação', () => {
    const e = emptyEnvelope();
    e.progress.attempts = [
      {
        id: 'a',
        questionId: 'a-roles',
        questionVersion: '1.0',
        unitVersion: '1.0',
        mode: 'independent',
        answer: questionById['a-roles'].correct,
        hintLevel: 0,
        at: new Date().toISOString(),
      },
    ];
    expect(() => parseEnvelope(JSON.stringify(e))).toThrow('correspondente');
  });
});
