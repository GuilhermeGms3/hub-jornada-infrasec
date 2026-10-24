import { describe, expect, it } from 'vitest';
import { aliases, canonicalRoute, groups, groupNames, pages } from '../src/platform/catalog';
import journey from '../src/platform/journey.json';

describe('organização preservada, sem fabricar disponibilidade', () => {
  it('inventaria 29 responsabilidades únicas nos seis grupos', () => {
    expect(pages).toHaveLength(29);
    expect(new Set(pages.map((p) => p.id)).size).toBe(29);
    expect(new Set(pages.map((p) => p.hash)).size).toBe(29);
    expect([...new Set(pages.map((p) => groupNames[p.group] || p.group))]).toEqual(groups);
    for (const page of pages)
      for (const field of [
        'purpose',
        'internal',
        'flow',
        'gap',
        'representation',
        'rewrite',
        'reuse',
      ] as const)
        expect(page[field].trim()).not.toBe('');
  });
  it('preserva doze semanas e sete missões por semana como roteiro', () => {
    expect(journey).toHaveLength(12);
    expect(journey.flatMap((w) => w.days)).toHaveLength(84);
    for (const week of journey) expect(week.days).toHaveLength(7);
  });
  it('resolve antigos aliases e caminhos contextualizados da R01', () => {
    for (const [alias, target] of Object.entries(aliases))
      expect(canonicalRoute(`#${alias}`)).toBe(target);
    expect(canonicalRoute('#/redes/r01/aula/dns')).toBe('aula/dns');
    expect(canonicalRoute('#redes/r01/avaliacao')).toBe('avaliacao');
    expect(canonicalRoute('')).toBe('hoje');
  });
  it('não interpreta propriedades herdadas como aliases', () => {
    expect(canonicalRoute('#__proto__')).toBe('__proto__');
    expect(canonicalRoute('#constructor')).toBe('constructor');
    expect(canonicalRoute('#toString')).toBe('toString');
  });
});
