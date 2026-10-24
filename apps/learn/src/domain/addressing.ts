export function ipv4Network(address: string, prefix: number): string | null {
  const octets = address.split('.');
  if (
    !Number.isInteger(prefix) ||
    prefix < 0 ||
    prefix > 32 ||
    octets.length !== 4 ||
    octets.some((o) => !/^(0|[1-9]\d{0,2})$/.test(o) || Number(o) > 255)
  )
    return null;
  const ip = octets.map(Number).reduce((n, octet) => ((n << 8) | octet) >>> 0, 0);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const result = (ip & mask) >>> 0;
  return [24, 16, 8, 0].map((shift) => (result >>> shift) & 255).join('.');
}
