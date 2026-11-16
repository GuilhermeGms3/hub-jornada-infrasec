export function subnetCase(octet: number, prefix: number) {
  if (
    !Number.isInteger(octet) ||
    octet < 0 ||
    octet > 255 ||
    !Number.isInteger(prefix) ||
    prefix < 24 ||
    prefix > 30
  )
    throw new Error('Use octeto 0–255 e prefixo /24–/30.');
  const size = 2 ** (32 - prefix);
  const network = Math.floor(octet / size) * size;
  return {
    network,
    broadcast: network + size - 1,
    first: network + 1,
    last: network + size - 2,
    hosts: size - 2,
    mask: 256 - size,
    size,
  };
}
export function roomStatus(temperature: number, water: boolean, online: boolean, wasHot: boolean) {
  return { hot: temperature >= 32 || (wasHot && temperature >= 30), water, stale: !online };
}
