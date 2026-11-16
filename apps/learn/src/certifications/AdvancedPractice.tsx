import { useState } from 'react';

export function AdvancedPractice({ week }: { week: number }) {
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const [radius, setRadius] = useState('reject');
  if (![3, 6, 8, 9, 10].includes(week)) return null;
  return (
    <section className="available-unit">
      <h2>Prática avançada · semana {week}</h2>
      {week === 3 && (
        <>
          <p>Delegação 2001:db8:1200:abc0::/60. Quantas LANs /64 cabem nela?</p>
          <label>
            Quantidade de LANs
            <input
              inputMode="numeric"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                setChecked(false);
              }}
            />
          </label>
          <button disabled={!/^\d+$/.test(answer)} onClick={() => setChecked(true)}>
            Conferir prefixo
          </button>
          {checked && (
            <p role="status">
              {Number(answer) === 16 ? 'Correto.' : 'Revise a diferença dos prefixos.'} 64−60=4
              bits; 2⁴=16 LANs. Primeira abc0::/64, última abcf::/64. Um hexadecimal representa
              quatro bits.
            </p>
          )}
        </>
      )}
      {[6, 10].includes(week) && (
        <>
          <p>
            Laboratório executável FRR: dois roteadores, trânsito IPv6 e loopbacks anunciadas em
            OSPFv3. Requer Docker Linux e Python; comandos abaixo são executados no terminal, fora
            do navegador.
          </p>
          <pre>{`cd labs/ccna-advanced
docker compose up -d
python verify.py healthy
python verify.py fault
python verify.py recover`}</pre>
          <p>
            Healthy exige Full, rota /128 remota e ping bidirecional com origem na loopback. Fault
            altera a área de R2 e exige retirada da adjacência/rota. Recover exige o retorno do
            serviço. As saídas vêm dos containers reais. Não é emulação IOS e não cobre RA/SLAAC de
            cliente.
          </p>
          {week === 10 && (
            <>
              <h3>Coletar com Ansible</h3>
              <pre>{`docker compose --profile tools build ansible
docker compose --profile tools run --rm ansible
python verify.py fault
# A próxima execução deve falhar no assert:
docker compose --profile tools run --rm ansible
python verify.py recover
docker compose --profile tools run --rm ansible`}</pre>
              <p>
                Runner efêmero com acesso ao socket Docker local: esse acesso permite controlar o
                Docker. Execute somente o playbook incluído em máquina de laboratório. O playbook
                usa inventário r1/r2, coleta vtysh com argv e verifica Full; não é conexão SSH IOS.
                A consulta reporta changed=0 e erro de domínio gera failed.
              </p>
            </>
          )}
          <p>
            Ao terminar: <code>docker compose down</code>. Sem portas publicadas ou acesso a redes
            de produção. As capacidades Linux dos roteadores são restritas à bancada.
          </p>
        </>
      )}
      {week === 8 && (
        <>
          <p>
            Modelo de decisão AAA: lista group radius local. Escolha o resultado remoto e preveja se
            a base local será tentada. Modelo finito, sem credenciais nem servidor RADIUS.
          </p>
          <label>
            Resposta do servidor
            <select value={radius} onChange={(e) => setRadius(e.target.value)}>
              <option value="reject">Access-Reject</option>
              <option value="timeout">Timeout / indisponível</option>
              <option value="accept">Access-Accept</option>
            </select>
          </label>
          <p role="status">
            {radius === 'reject'
              ? 'Rejeição explícita: login negado; não há segunda chance automática na base local.'
              : radius === 'timeout'
                ? 'Erro/indisponibilidade: o próximo método local pode ser tentado conforme a lista configurada.'
                : 'Credencial aceita: autenticação conclui; autorização ainda determina o que o usuário pode fazer.'}
          </p>
          <details>
            <summary>Receita IOS XE: lista AAA nomeada em VTY de laboratório</summary>
            <p>
              Requer IOS XE com RADIUS e SSH, PC de gestão e servidor RADIUS alcançável. Substitua
              os campos entre &lt; &gt; no terminal; não salve valores reais no caderno. Mantenha o
              console aberto e prepare recuperação local antes de aplicar à VTY. Não executar em
              produção.
            </p>
            <pre>{`! Prepare IP/rota de gestão e usuário local antes de habilitar AAA
configure terminal
username LAB privilege 1 secret <SECRET_LOCAL_EXCLUSIVO>
ip domain name lab.example
crypto key generate rsa modulus 2048
ip ssh version 2
aaa new-model
radius server LAB-RADIUS
 address ipv4 192.168.30.2 auth-port 1812 acct-port 1813
 key <CHAVE_COMPARTILHADA_DO_LAB>
exit
aaa group server radius LAB-GROUP
 server name LAB-RADIUS
exit
aaa authentication login LAB-VTY group LAB-GROUP local
line vty 0 4
 transport input ssh
 login authentication LAB-VTY
end
show aaa servers
show running-config | section aaa`}</pre>
            <p>
              Cadastre no RADIUS o IP de origem real do equipamento e a mesma chave. Teste usuário
              remoto válido e inválido, depois indisponibilidade controlada para testar LAB local.
              Autenticação aceita não concede automaticamente privilege 15. Configure
              autorização/accounting em exercício próprio; esta receita cobre autenticação de
              gestão. Sintaxe e recursos dependem da imagem; não são um arquivo Packet Tracer
              validado.
            </p>
          </details>
          <p>
            Bancada Cisco: mantenha console aberto, configure usuário local com secret próprio,
            prepare SSH e uma lista AAA nomeada antes de aplicá-la à VTY. No servidor AAA, crie
            cliente e usuário de laboratório. Teste accept, reject e indisponibilidade
            separadamente. Registre o comportamento e restaure a conectividade antes de fechar o
            console.
          </p>
        </>
      )}
      {week === 9 && (
        <>
          <h3>Lab wireless em Packet Tracer</h3>
          <ol>
            <li>
              Monte roteador, switch, AP e laptop. LAN 192.168.30.0/24, gateway .1; configure pool
              DHCP que exclua endereços de infraestrutura.
            </li>
            <li>
              No AP, configure SSID LAB-CCNA e WPA2-PSK conforme suporte. Crie uma credencial de
              laboratório e configure a mesma no laptop.
            </li>
            <li>
              Verifique associação, autenticação, concessão DHCP, ping no gateway e acesso ao
              serviço por IP e por nome.
            </li>
            <li>
              Troque só a senha do laptop e compare a etapa que falha. Restaure; depois desligue o
              serviço DHCP e renove a concessão. Registre sintomas diferentes.
            </li>
            <li>
              Reative DHCP, renove e repita testes. Faça a análise de RF em hardware real: o
              simulador não mede propagação, RSSI ou ruído.
            </li>
          </ol>
          <p>
            Não associe sinal forte a serviço saudável. Separe RF, credencial, VLAN, endereço, rota
            e DNS.
          </p>
        </>
      )}
      <p>
        Registre comandos, ambiente e erros no caderno da semana. A aplicação não recebe nem executa
        comandos ou credenciais. Prática concluída exige observar as condições propostas.
      </p>
    </section>
  );
}
