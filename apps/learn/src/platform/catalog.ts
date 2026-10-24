import inventory from './inventory.json' with { type: 'json' };

export const pages = inventory;
export const groups = [
  'Começar',
  'Redes',
  'Operação e segurança',
  'Cloud e arquitetura',
  'Carreira',
  'Recursos',
];
export const groupNames: Record<string, string> = {
  Comecar: 'Começar',
  'Operacao e seguranca': 'Operação e segurança',
};
export const aliases: Record<string, string> = {
  inicio: 'hoje',
  'plano-estudos': 'jornada',
  tarefas: 'tarefas-jornada',
  semana1: 'semana-1',
  arvore: 'dependencias',
  'academia-pratica': 'redes',
  laboratorio: 'packet-tracer',
  'central-carreira': 'portfolio',
  estante: 'estante',
  'redes-pratica': 'redes',
};
export function canonicalRoute(raw: string) {
  const route = raw.replace(/^#\/?/, '');
  if (route.startsWith('redes/r01/')) return route.slice(10);
  return (Object.hasOwn(aliases, route) ? aliases[route] : route) || 'hoje';
}
export function legacyUrl(hash: string) {
  // Works for Vite dev and static builds under any deployment subdirectory.
  if (import.meta.env.DEV) return `http://127.0.0.1:4173/hub-estudos-infrasec.html#${hash}`;
  return new URL(`../hub-estudos-infrasec.html#${hash}`, location.href).href;
}
