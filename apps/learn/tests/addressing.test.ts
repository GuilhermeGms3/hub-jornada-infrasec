import { expect, it } from 'vitest';
import { ipv4Network } from '../src/domain/addressing';

it.each([
  ['192.168.10.25', 24, '192.168.10.0'],
  ['192.168.10.80', 26, '192.168.10.64'],
  ['192.168.10.25', 26, '192.168.10.0'],
  ['10.255.255.1', 8, '10.0.0.0'],
  ['255.255.255.255', 32, '255.255.255.255'],
  ['192.168.1.1', 0, '0.0.0.0'],
  ['192..10.1', 24, null],
  ['192.168.10.999', 24, null],
  ['01.2.3.4', 24, null],
  ['1.2.3', 24, null],
  ['1.2.3.4', 33, null],
  ['1.2.3.4', -1, null],
] as const)('AND IPv4 de %s/%s é %s', (ip, prefix, expected) =>
  expect(ipv4Network(ip, prefix)).toBe(expected),
);
