import { describe, expect, it } from 'vitest';
import {
  commandLabels,
  gradeDiagnosis,
  scenarios,
  simulate,
  type Command,
} from '../src/domain/simulator';

describe('simulador determinístico e coerente', () => {
  it.each(scenarios)(
    'todos os testes têm output consistente e diagnóstico exige coleta: $id',
    (s) => {
      for (const command of Object.keys(commandLabels) as Command[])
        expect(simulate(s, command)).toBe(simulate(s, command));
      expect(gradeDiagnosis(s, [], s.diagnosis).correct).toBe(false);
      expect(gradeDiagnosis(s, s.required, s.diagnosis).correct).toBe(true);
      expect(gradeDiagnosis(s, s.required, 'invalid').correct).toBe(false);
      if (!s.configured || !s.lan || !s.gateway || !s.gatewayUp || !s.remoteUp || !s.service)
        expect(simulate(s, 'https')).not.toContain('HTTP 200');
      if (!s.configured || !s.lan || !s.dns) expect(simulate(s, 'dns')).toContain('timed out');
    },
  );
  it('ICMP bloqueado não impede aplicação disponível', () => {
    const s = scenarios.find((s) => s.id === 'icmp-filter')!;
    expect(simulate(s, 'remote')).toContain('expirou');
    expect(simulate(s, 'https')).toContain('HTTP 200');
  });
  it('DNS local pode responder sem rota default, mas HTTPS remoto não', () => {
    const s = scenarios.find((s) => s.id === 'no-gateway')!;
    expect(simulate(s, 'dns')).toContain('203.0.113.40');
    expect(simulate(s, 'https')).not.toContain('HTTP 200');
  });
  it('ICMP do destino pode responder com serviço 443 recusado', () => {
    const s = scenarios.find((s) => s.id === 'service-failure')!;
    expect(simulate(s, 'remote')).toContain('Resposta');
    expect(simulate(s, 'tcp')).toContain('recusada');
  });
});
