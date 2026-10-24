import { useId, useState } from 'react';
import { ipv4Network } from '../domain/addressing';

export function NetworkDiagram() {
  const id = useId();
  return (
    <figure className="diagram">
      <svg viewBox="0 0 760 210" role="img" aria-labelledby={id}>
        <title id={id}>Cliente e DNS na LAN; gateway encaminha para o servidor remoto.</title>
        <path
          d="M112 90H260 M320 90H470 M530 90H655 M290 110V160"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect x="38" y="59" width="74" height="54" rx="4" className="node" />
        <path d="M28 123h94" stroke="currentColor" strokeWidth="3" />
        <rect x="260" y="70" width="60" height="40" rx="4" className="node" />
        <path d="M270 90h8m8 0h8m8 0h8" stroke="currentColor" strokeWidth="4" />
        <rect x="470" y="63" width="60" height="50" rx="4" className="node" />
        <path d="M480 63V44m40 19V44" stroke="currentColor" strokeWidth="2" />
        <rect x="655" y="58" width="56" height="66" rx="4" className="node" />
        <path d="M666 76h33m-33 14h33m-33 14h33" stroke="currentColor" strokeWidth="2" />
        <text x="75" y="35">
          Cliente
        </text>
        <text x="290" y="44">
          Switch
        </text>
        <text x="500" y="27">
          Gateway
        </text>
        <text x="683" y="35">
          Servidor remoto
        </text>
        <text x="75" y="150">
          192.168.10.25
        </text>
        <text x="500" y="150">
          192.168.10.1
        </text>
        <text x="683" y="150">
          203.0.113.40
        </text>
        <text x="290" y="185">
          DNS local · 192.168.10.10
        </text>
        <text x="585" y="76">
          outras redes
        </text>
      </svg>
      <ol className="network-mobile">
        <li>
          <strong>Cliente · 192.168.10.25</strong>
          <span>Interface na rede local</span>
        </li>
        <li>
          <strong>Switch · enlace local</strong>
          <span>Conecta cliente, DNS local e gateway</span>
        </li>
        <li>
          <strong>DNS · 192.168.10.10</strong>
          <span>Consulta local se o nome não estiver em cache</span>
        </li>
        <li>
          <strong>Gateway · 192.168.10.1</strong>
          <span>Próximo salto da rota remota do exemplo</span>
        </li>
        <li>
          <strong>Servidor · 203.0.113.40</strong>
          <span>Destino em outra rede</span>
        </li>
      </ol>
      <figcaption>
        Na LAN, o cliente alcança o DNS local pelo switch. Para o servidor em outra rede, a rota do
        exemplo usa o gateway. O DNS não fica obrigatoriamente no caminho de cada pacote web.
      </figcaption>
    </figure>
  );
}

export function MaskDemo() {
  const [prefix, setPrefix] = useState(24);
  const [destination, setDestination] = useState('192.168.10.80');
  const sourceNet = ipv4Network('192.168.10.25', prefix);
  const targetNet = ipv4Network(destination, prefix);
  return (
    <section className="demonstration" aria-label="Demonstração de máscara">
      <h3>Experimente a decisão local/remota</h3>
      <p>
        Origem fixa: <code>192.168.10.25</code>. A máscara selecionada é aplicada aos dois
        endereços. Sem rotas adicionais neste exemplo.
      </p>
      <div className="form-row">
        <div>
          <label htmlFor="network-prefix">Prefixo</label>
          <select
            id="network-prefix"
            value={prefix}
            onChange={(e) => setPrefix(Number(e.target.value))}
          >
            <option value={24}>/24 · 255.255.255.0</option>
            <option value={26}>/26 · 255.255.255.192</option>
          </select>
        </div>
        <label>
          IPv4 do destino
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            inputMode="decimal"
            maxLength={15}
          />
        </label>
      </div>
      <div role="status">
        {targetNet ? (
          <>
            <p>
              Rede da origem:{' '}
              <code>
                {sourceNet}/{prefix}
              </code>
              <br />
              Rede do destino:{' '}
              <code>
                {targetNet}/{prefix}
              </code>
            </p>
            <strong>
              {sourceNet === targetNet
                ? 'Mesmo prefixo: rede diretamente conectada.'
                : 'Prefixos diferentes: procurar rota remota.'}
            </strong>
          </>
        ) : (
          <p>Informe quatro números de 0 a 255 separados por pontos.</p>
        )}
      </div>
      <p className="caption">
        Para /26, o último octeto da máscara é 11000000. AND entre 25 (00011001) e 192 resulta 0;
        entre 80 (01010000) e 192 resulta 64. A mudança de prefixo muda a rede calculada.
      </p>
    </section>
  );
}

const flowSteps = [
  [
    'O navegador recebe a URL',
    'https://portal.example/curso identifica esquema, nome e caminho. O browser procura informações já disponíveis; o exemplo não usa proxy ou VPN.',
  ],
  [
    'Usar cache ou consultar DNS',
    'Se houver endereço válido em cache, não é necessário repetir a consulta. Caso contrário, o cliente consulta o resolvedor. DNS entrega informação de nome, não a página.',
  ],
  [
    'Chegar ao próprio resolvedor',
    'O DNS deste exemplo é local (192.168.10.10). Se fosse remoto, o envio da consulta já precisaria de uma rota, possivelmente pelo gateway, antes de obter o IP do portal.',
  ],
  [
    'Escolher rota para o portal',
    'O portal retornou 203.0.113.40. No exemplo, a rota default aponta para 192.168.10.1; uma rota mais específica teria preferência.',
  ],
  [
    'Entregar ao próximo salto',
    'Se necessário, ARP descobre o MAC do gateway no enlace IPv4 local. O quadro vai ao gateway; o pacote mantém o IP do portal. Cada roteador encaminha pelo próximo enlace.',
  ],
  [
    'Estabelecer TCP',
    'Neste acesso HTTP/2 sobre TCP, cliente e serviço negociam conexão. A porta 443 é o endpoint do exemplo. O caminho de retorno também precisa funcionar.',
  ],
  [
    'Negociar TLS',
    'São negociadas proteções e verificada a identidade apresentada pelo serviço. Conexão TCP positiva não garante certificado válido.',
  ],
  [
    'Trocar HTTP e processar a resposta',
    'O navegador pede /curso e processa o resultado HTTP. O exemplo usa uma conexão nova; caches e reutilização podem evitar etapas em acessos reais. HTTP/3 usa QUIC sobre UDP.',
  ],
];
export function FlowDiagram() {
  const [step, setStep] = useState(0);
  return (
    <section className="demonstration" aria-label="Percurso passo a passo">
      <h3>Siga as decisões de uma requisição</h3>
      <NetworkDiagram />
      <div className="step-controls">
        <button disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Etapa anterior
        </button>
        <span>
          {step + 1} de {flowSteps.length}
        </span>
        <button disabled={step === flowSteps.length - 1} onClick={() => setStep((s) => s + 1)}>
          Próxima etapa
        </button>
      </div>
      <div className="flow-explanation" aria-live="polite">
        <h4>{flowSteps[step][0]}</h4>
        <p>{flowSteps[step][1]}</p>
      </div>
      <details>
        <summary>Ler o percurso completo em texto</summary>
        <ol>
          {flowSteps.map(([title, detail]) => (
            <li key={title}>
              <strong>{title}.</strong> {detail}
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
export function LayersDiagram() {
  return (
    <figure className="layers">
      <dl>
        <div>
          <dt>HTTP</dt>
          <dd>Requisição e resposta da aplicação</dd>
        </div>
        <div>
          <dt>TLS</dt>
          <dd>Proteção e identidade no HTTPS do exemplo</dd>
        </div>
        <div>
          <dt>TCP</dt>
          <dd>Conexão e fluxo ordenado entre endpoints</dd>
        </div>
        <div>
          <dt>IP + enlace</dt>
          <dd>Destino, rotas e entrega ao próximo salto</dd>
        </div>
      </dl>
      <figcaption>
        Recorte didático de HTTP/1.1 ou HTTP/2 sobre TLS/TCP. Não representa todo acesso web: HTTP/3
        usa QUIC sobre UDP.
      </figcaption>
    </figure>
  );
}
