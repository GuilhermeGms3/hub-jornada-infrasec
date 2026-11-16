import { operationsLessons } from './lessons-operations';
import { labRecipes } from './lab-recipes';
import { useEffect, useState } from 'react';
import { subnetCase, roomStatus } from './intensive-model';
import { networkLessons } from './lessons-network';
import { certificationHref } from './catalog';

const jeremy = [
  'Dias 1–12: dispositivos, Ethernet, OSI/TCP-IP, IPv4, interfaces e vida do pacote.',
  'Dias 13–16: subnetting e VLSM; repita os cálculos antes de assistir à solução.',
  'Dias 11, 24 e 31–33: tabelas, estáticas/flutuantes e IPv6. Complemente com troubleshooting v2.0.',
  'Dias 17–19 e 36: VLAN, trunks, inter-VLAN, CDP e LLDP.',
  'Dias 20–23: STP, Rapid STP, proteções e EtherChannel.',
  'Dias 26–29: OSPF e FHRP. Acrescente OSPFv3 de área única exigido na v2.0.',
  'Dias 38, 42–45: DNS, gestão e NAT. Acrescente SCP/SFTP e os seis tipos de registros da matriz.',
  'Dias 34–35 e 48–51: ACLs, port security, snooping e DAI. Acrescente RA guard, storm control e AAA.',
  'Dias 54–58: virtualização e wireless; acrescente diagnóstico real de cliente.',
  'Dias 40–41 e 59–63: SNMP, syslog e automação. Pratique Ansible em inventário isolado.',
  'IA e diagnóstico: use a matriz 2.0 para cobrir agentic AI, avaliação de recomendações e componentes de prompts.',
  'Mega Lab: reconstrua sem solução; depois faça o ensaio autoral e retome os erros por domínio.',
];
export function CcnaSupport({ week }: { week: number }) {
  const [video, setVideo] = useState(false);
  const lab = labRecipes[week];
  return (
    <section className="available-unit">
      <h2>Jeremy + prática deliberada · semana {week}</h2>
      <p>{jeremy[week - 1]}</p>
      <p>
        Estude a explicação interna, assista à aula correspondente e faça o lab do zero. No dia
        seguinte, refaça com outros IPs e uma falha injetada. Revise após 1, 3 e 7 dias. A numeração
        refere-se ao curso 200-301; confira atualizações no canal. Os complementos v2.0 acima não
        são uma declaração de cobertura integral do curso do Jeremy.
      </p>
      <button aria-expanded={video} onClick={() => setVideo(!video)}>
        {video ? 'Fechar aulas do Jeremy' : 'Abrir aulas do Jeremy aqui'}
      </button>
      {video && (
        <iframe
          title="Curso CCNA do Jeremy — playlist oficial"
          width="100%"
          height="360"
          src="https://www.youtube-nocookie.com/embed/videoseries?list=PLxbwE86jKRgMpuZuLBivzlM8s2Dk5lXBQ"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
      <p>
        <a href="https://courses.jeremysitlab.com/p/ccna" target="_blank" rel="noopener noreferrer">
          Curso e materiais oficiais do Jeremy
        </a>{' '}
        ·{' '}
        <a href="https://sendfox.com/jeremysitlab" target="_blank" rel="noopener noreferrer">
          Obter labs e flashcards pelo autor
        </a>
      </p>
      <p>
        Vídeo externo carregado somente ao abrir. Se o provedor bloquear a incorporação, use o curso
        oficial. Explicações, exercícios e correções permanecem no Hub; arquivos e vídeos do Jeremy
        não foram redistribuídos.
      </p>
      {lab && (
        <section>
          <h3>Lab guiado · monte, teste e quebre</h3>
          <p>{lab.topology}</p>
          <pre>{lab.commands}</pre>
          <h4>Verificação esperada</h4>
          <p>{lab.verify}</p>
          <h4>Falha controlada e recuperação</h4>
          <p>{lab.fault}</p>
          <p>
            Salve configuração e observações no caderno abaixo. Os comandos são uma receita de
            bancada; o Hub não executa IOS nem certifica a execução.
          </p>
        </section>
      )}
      {week === 2 && <SubnetTrainer />}
      {week === 10 && <RoomLab />}
      {week === 12 && <ExamDrill />}
    </section>
  );
}
export function SubnetTrainer() {
  const [round, setRound] = useState(0);
  const prefix = [28, 27, 29, 26, 30, 25, 24][round % 7];
  const octet = (173 + round * 37) % 256;
  const expected = subnetCase(octet, prefix);
  const [answer, setAnswer] = useState({ network: '', broadcast: '', hosts: '' });
  const [checked, setChecked] = useState(false);
  return (
    <section className="cert-check">
      <h2>Treino de subnetting com novos endereços</h2>
      <p>
        192.168.7.{octet}/{prefix} · informe apenas o último octeto da rede/broadcast.
      </p>
      {(['network', 'broadcast', 'hosts'] as const).map((key) => (
        <label key={key}>
          {{ network: 'Rede', broadcast: 'Broadcast', hosts: 'Hosts utilizáveis' }[key]}
          <input
            inputMode="numeric"
            value={answer[key]}
            disabled={checked}
            onChange={(e) => setAnswer({ ...answer, [key]: e.target.value })}
          />
        </label>
      ))}
      <button
        disabled={checked || Object.values(answer).some((v) => !/^\d+$/.test(v))}
        onClick={() => setChecked(true)}
      >
        Corrigir cálculo
      </button>
      {checked && (
        <div role="status">
          {Object.entries(answer).every(
            ([key, v]) => Number(v) === expected[key as keyof typeof expected],
          )
            ? 'Cálculo correto.'
            : 'Revise os campos: compare com o cálculo abaixo.'}
          <p>
            32 − {prefix} = {32 - prefix} bits de host. Bloco = {expected.size}; máscara
            255.255.255.{expected.mask}. Piso({octet}/{expected.size}) × {expected.size} ={' '}
            {expected.network}. Rede .{expected.network}; broadcast .{expected.broadcast}; hosts .
            {expected.first}–.{expected.last} ({expected.hosts} utilizáveis).
          </p>
        </div>
      )}
      <button
        onClick={() => {
          setRound(round + 1);
          setAnswer({ network: '', broadcast: '', hosts: '' });
          setChecked(false);
        }}
      >
        Novo endereço e prefixo
      </button>
      <p>
        Exercícios locais /24–/30 em LAN convencional. Resultado desta sessão não é salvo como
        domínio ou aprovação.
      </p>
    </section>
  );
}
export function RoomLab() {
  const [temperature, setTemperature] = useState(25);
  const [water, setWater] = useState(false);
  const [online, setOnline] = useState(true);
  const [hot, setHot] = useState(false);
  const [ack, setAck] = useState(false);
  const status = roomStatus(temperature, water, online, hot);
  function changeTemperature(value: number) {
    setTemperature(value);
    setHot(roomStatus(value, water, online, hot).hot);
    setAck(false);
  }
  return (
    <section className="cert-check">
      <h2>Laboratório NOC · sala de servidores</h2>
      <p>
        Simulação local autoral, sem sensores conectados. Critério didático: alerta ≥32 °C,
        recuperação abaixo de 30 °C; não reproduz os gatilhos temporais do Zabbix original.
      </p>
      <label>
        Temperatura simulada: {temperature} °C
        <input
          type="range"
          min="18"
          max="40"
          value={temperature}
          onChange={(e) => changeTemperature(Number(e.target.value))}
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={water}
          onChange={(e) => {
            setWater(e.target.checked);
            setAck(false);
          }}
        />{' '}
        Água no piso
      </label>
      <label>
        <input
          type="checkbox"
          checked={online}
          onChange={(e) => {
            setOnline(e.target.checked);
            setAck(false);
          }}
        />{' '}
        Sensor enviando leituras
      </label>
      <div role="status">
        {status.stale ? (
          <p>
            Sem dados novos: temperatura e água abaixo são últimas condições conhecidas; não
            confirmam o estado atual.
          </p>
        ) : (
          <p>Leituras simuladas atuais disponíveis.</p>
        )}
        <p>
          Temperatura: {status.hot ? 'alerta de calor' : 'faixa normal'} · Água:{' '}
          {status.water ? 'detectada' : 'não detectada'} · Triagem:{' '}
          {ack ? 'reconhecida pelo operador' : 'sem reconhecimento'}
        </p>
      </div>
      <button
        onClick={() => setAck(true)}
        disabled={ack || !(status.hot || status.water || status.stale)}
      >
        Reconhecer ocorrência
      </button>
      <p>
        Reconhecimento registra triagem e mantém a condição. Experimente 33 → 31 → 29 °C e explique
        a histerese. Desligue o sensor e explique por que uma última leitura normal não comprova
        normalidade.
      </p>
      <details>
        <summary>Executar o sistema real incluído no projeto</summary>
        <p>
          Brendo Nery · MIT · upstream 05706cf4. Requer Docker, Python e ESP32/sensores para a parte
          física. A execução é independente do Hub; a aplicação não inicia serviços nem transmite
          credenciais.
        </p>
        <pre>{`cd projetos/monitoramento-sala-servidores
Copy-Item .env.example .env
# Edite .env: credenciais exclusivas e IPs da bancada
docker compose config --quiet
docker compose up -d
python zabbix/configurar.py
# Encerrar sem excluir volumes:
docker compose down`}</pre>
        <p>
          Execute em rede isolada. A composição original publica portas e inclui acesso a
          docker.sock; revise o arquivo antes de iniciar. Não existe ponte de autenticação com o
          Hub. Configure hardware/firmware conforme a documentação incluída.
        </p>
        <p>
          <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">
            Abrir Grafana local (após iniciar)
          </a>{' '}
          ·{' '}
          <a href="http://localhost:8080" target="_blank" rel="noopener noreferrer">
            Abrir Zabbix local (após iniciar)
          </a>{' '}
          ·{' '}
          <a
            href="https://github.com/BrendoNyre/monitoramento-sala-servidores"
            target="_blank"
            rel="noopener noreferrer"
          >
            Autor e documentação original
          </a>
        </p>
      </details>
    </section>
  );
}
const drillIds = [
  'packet-life',
  'subnet-28',
  'physical',
  'ipv6',
  'dhcp',
  'stp-deep',
  'vlan',
  'switching',
  'discovery',
  'connectivity',
  'static-deep',
  'routing',
  'ospf-deep',
  'resilience',
  'acl',
  'nat',
  'dns',
  'l2-security',
  'ai-operations',
  'telemetry',
];
const bank = drillIds.map((id) =>
  [...networkLessons, ...operationsLessons].find((l) => l.id === id)!,
);
export function ExamDrill() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [started, setStarted] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (started === null || done) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [started, done]);
  const remaining =
    started === null ? 1800 : Math.max(0, 1800 - Math.floor((now - started) / 1000));
  const finished = done || remaining === 0;
  return (
    <section className="cert-check">
      <h2>Ensaio autoral CCNA · 20 casos / 30 minutos</h2>
      <p>
        Cinco domínios, proporção 5/5/4/4/2. São questões de compreensão com cenários, tabelas e
        saídas, não itens oficiais nem réplica validada do exame. O ensaio é curto, tem consulta
        livre e não executa CLI. Para prática operacional, faça as topologias das semanas 2–8.
      </p>
      {started === null ? (
        <button
          onClick={() => {
            const t = Date.now();
            setStarted(t);
            setNow(t);
          }}
        >
          Iniciar ensaio
        </button>
      ) : (
        <>
          <p role="timer">
            Tempo restante: {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
          </p>
          {bank.map((l, i) => (
            <fieldset key={l.id} disabled={finished}>
              <legend>
                {i + 1}. {l.title}
              </legend>
              <pre>{l.example.data}</pre>
              <p>{l.question.prompt}</p>
              {l.question.options.map((o) => (
                <label key={o.id}>
                  <input
                    type="radio"
                    name={`drill-${l.id}`}
                    value={o.id}
                    checked={answers[l.id] === o.id}
                    onChange={() => setAnswers({ ...answers, [l.id]: o.id })}
                  />
                  {o.text}
                </label>
              ))}
              {finished && (
                <div>
                  <p>
                    {answers[l.id] === l.question.correct
                      ? 'Correto.'
                      : answers[l.id]
                        ? 'Incorreto.'
                        : 'Não respondido.'}
                  </p>
                  {l.question.options.map((o) => (
                    <p key={o.id}>
                      <strong>
                        {o.id === l.question.correct ? 'Resposta correta: ' : ''}
                        {o.text}
                      </strong>{' '}
                      — {o.explanation}
                    </p>
                  ))}
                  <a
                    href={certificationHref(
                      'ccna',
                      [1, 2, 1, 3, 2, 5, 4, 5, 4, 1, 3, 3, 6, 6, 8, 7, 7, 8, 11, 10][i],
                      l.id,
                    )}
                  >
                    Reestudar a aula
                  </a>
                </div>
              )}
            </fieldset>
          ))}
          {!finished ? (
            <button onClick={() => setDone(true)}>
              Encerrar e corrigir (inclui questões em branco)
            </button>
          ) : (
            <div role="status">
              <p>
                {bank.filter((l) => answers[l.id] === l.question.correct).length}/20 acertos.
                Questões em branco contam como erro. Resultado local não prevê aprovação Cisco.
              </p>
              {[
                [0, 5],
                [5, 10],
                [10, 14],
                [14, 18],
                [18, 20],
              ].map(([a, b], i) => (
                <p key={a}>
                  Domínio {i + 1}:{' '}
                  {bank.slice(a, b).filter((l) => answers[l.id] === l.question.correct).length}/
                  {b - a} · retome as aulas dos erros e refaça o lab com dados diferentes.
                </p>
              ))}
              <p>
                Respostas e tempo desta sessão não são persistidos; sair da página descarta o
                ensaio.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
