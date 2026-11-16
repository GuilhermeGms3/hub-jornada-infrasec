import { describe, expect, it } from 'vitest';
import { subnetCase, roomStatus } from '../src/certifications/intensive-model';
describe('cálculos e condição ambiental', () => {
  it('resolve /28 e os limites de bloco sem sobreposição', () => {
    expect(subnetCase(173, 28)).toMatchObject({
      network: 160,
      broadcast: 175,
      hosts: 14,
      mask: 240,
    });
    for (let prefix = 24; prefix <= 30; prefix++)
      for (let octet = 0; octet < 256; octet++) {
        const s = subnetCase(octet, prefix);
        expect(s.network <= octet && octet <= s.broadcast).toBe(true);
        expect(s.network % s.size).toBe(0);
        expect(s.broadcast - s.network + 1).toBe(s.size);
      }
    expect(() => subnetCase(256, 28)).toThrow();
    expect(() => subnetCase(10, 31)).toThrow();
  });
  it('mantém histerese e ausência de dados independentemente de água', () => {
    expect(roomStatus(32, false, true, false).hot).toBe(true);
    expect(roomStatus(31, false, true, true).hot).toBe(true);
    expect(roomStatus(29, false, true, true).hot).toBe(false);
    expect(roomStatus(25, true, false, false)).toEqual({ hot: false, water: true, stale: true });
  });
});
