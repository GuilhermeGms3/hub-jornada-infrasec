// =====================================================================
// acoes.js — os botões que AGEM (Reconhecer, Comentar, Manutenção)
// ---------------------------------------------------------------------
// Ler o Zabbix passa pelo Grafana (dados.js). Agir NÃO pode passar por lá:
// a ponte do plugin só deixa ler. Então os botões chamam o serviço "acoes"
// do docker-compose (acoes/acoes.py), que:
//   1. pergunta ao Grafana quem é você (pelo cookie da sua sessão);
//   2. confere se seu papel é Editor ou Admin;
//   3. faz a ação no Zabbix com um usuário restrito e anota o seu nome.
// O navegador nunca vê senha nenhuma: só manda "reconhecer o alerta 123,
// motivo tal". Ação que não está no catálogo do serviço é recusada.
// =====================================================================

// Mesmo computador do Grafana, porta 8094 (aberta só para este PC).
const URL_ACOES = `${location.protocol}//${location.hostname}:8094`;

async function pedir(caminho, corpo) {
  const resp = await fetch(URL_ACOES + caminho, {
    method: corpo ? 'POST' : 'GET',
    // "include": manda o cookie do Grafana junto, mesmo sendo outra porta.
    credentials: 'include',
    headers: corpo ? { 'Content-Type': 'application/json' } : {},
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(json.erro || `HTTP ${resp.status}`);
  return json;
}

// Quem sou eu e se posso agir. null = serviço fora do ar (os botões somem).
export async function quemSou() {
  try { return await pedir('/quem-sou'); } catch (e) { console.warn('[noc] ações indisponíveis:', e.message); return null; }
}

// { hostid: { ate: <unix>, motivo } } das manutenções abertas pela central.
export const manutencoes = () => pedir('/manutencoes');

// acao: 'reconhecer' | 'comentar' | 'manutencao' | 'encerrar-manutencao'
export const agir = (acao, dados) => pedir('/acao/' + acao, dados);
