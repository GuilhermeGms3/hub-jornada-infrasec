import { useState } from 'react';

export const policyFlows = [
  {
    id: 'web',
    label: 'PC da LAN → aplicação HTTPS',
    incoming: 'LAN',
    outgoing: 'WAN',
    service: 'HTTPS',
  },
  {
    id: 'ssh',
    label: 'PC da LAN → aplicação SSH',
    incoming: 'LAN',
    outgoing: 'WAN',
    service: 'SSH',
  },
  {
    id: 'guest',
    label: 'Visitante → aplicação HTTPS',
    incoming: 'GUEST',
    outgoing: 'WAN',
    service: 'HTTPS',
  },
];
export const policyRules = [
  {
    id: '10',
    label: 'LAN → WAN · todos os serviços · accept',
    incoming: 'LAN',
    outgoing: 'WAN',
    service: 'ALL',
    action: 'accept',
  },
  {
    id: '20',
    label: 'LAN → WAN · SSH · deny',
    incoming: 'LAN',
    outgoing: 'WAN',
    service: 'SSH',
    action: 'deny',
  },
  {
    id: '30',
    label: 'LAN → WAN · HTTPS · accept',
    incoming: 'LAN',
    outgoing: 'WAN',
    service: 'HTTPS',
    action: 'accept',
  },
] as const;
export function policyTrace(flowId: string, broad: boolean) {
  const flow = policyFlows.find((f) => f.id === flowId);
  if (!flow) throw new Error('Fluxo desconhecido.');
  const rules = broad ? policyRules : policyRules.slice(1);
  const result = [];
  for (const rule of rules) {
    const matches =
      flow.incoming === rule.incoming &&
      flow.outgoing === rule.outgoing &&
      (rule.service === 'ALL' || flow.service === rule.service);
    result.push({
      id: rule.id as string,
      label: rule.label as string,
      matches,
      explanation: matches
        ? `Entrada ${flow.incoming}, saída ${flow.outgoing} e serviço ${flow.service} correspondem. A ação ${rule.action} encerra esta busca.`
        : `O fluxo ${flow.incoming} → ${flow.outgoing} / ${flow.service} não corresponde a todos os critérios desta linha.`,
      action: rule.action as string,
    });
    if (matches) return result;
  }
  return [
    ...result,
    {
      id: 'implicit',
      label: 'Negação implícita',
      matches: true,
      explanation: 'Nenhuma política explícita deste modelo correspondeu. O fluxo é negado.',
      action: 'deny',
    },
  ];
}

export function PolicyWalkthrough() {
  const [flow, setFlow] = useState('ssh');
  const [broad, setBroad] = useState(true);
  const [step, setStep] = useState(0);
  const trace = policyTrace(flow, broad);
  const current = trace[step];
  return (
    <section className="demonstration" aria-label="Percurso de política de firewall">
      <h2>Acompanhe a primeira correspondência</h2>
      <p>
        Modelo didático finito: considera apenas interfaces e serviço, com endereços já incluídos
        nos objetos. Não emula FortiOS, NAT/VIP, identidade, perfis ou sessão existente e não
        concede nota.
      </p>
      <div className="actions">
        <button
          aria-pressed={broad}
          onClick={() => {
            setBroad(true);
            setStep(0);
          }}
        >
          Com regra ampla no topo
        </button>
        <button
          aria-pressed={!broad}
          onClick={() => {
            setBroad(false);
            setStep(0);
          }}
        >
          Somente regras específicas
        </button>
      </div>
      <label htmlFor="policy-flow">Fluxo para investigar</label>
      <select
        id="policy-flow"
        value={flow}
        onChange={(e) => {
          setFlow(e.target.value);
          setStep(0);
        }}
      >
        {policyFlows.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>
      <ol className="policy-rules">
        {(broad ? policyRules : policyRules.slice(1)).map((r) => (
          <li key={r.id} aria-current={current.id === r.id ? 'step' : undefined}>
            <code>{r.id}</code> {r.label}
          </li>
        ))}
      </ol>
      <div className="feedback" role="status">
        <strong>
          {current.id === 'implicit' ? current.label : `Examinando regra ${current.id}`}
        </strong>
        <p>{current.explanation}</p>
        {current.matches && (
          <p>
            <strong>Decisão deste modelo: {current.action}.</strong> Regras posteriores não são
            consultadas. Isso não prova sucesso da aplicação.
          </p>
        )}
      </div>
      <div className="actions">
        <button disabled={step === 0} onClick={() => setStep(step - 1)}>
          Regra anterior
        </button>
        <button disabled={step === trace.length - 1} onClick={() => setStep(step + 1)}>
          Examinar próxima regra
        </button>
      </div>
      <p className="scope-note">
        Experimente SSH com e sem regra ampla; depois tente o visitante. Preveja o resultado antes
        de trocar o fluxo.
      </p>
    </section>
  );
}
