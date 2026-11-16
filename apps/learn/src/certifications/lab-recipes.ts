export const labRecipes: Record<
  number,
  { topology: string; commands: string; verify: string; fault: string }
> = {
  2: {
    topology:
      'PC-A — SW1 — R1 — SW2 — PC-B. LAN A 192.168.7.160/28; LAN B 192.168.7.176/28. Adapte Gi0/0 e Gi0/1 aos nomes do equipamento.',
    commands: `! R1, a partir do modo privilegiado
configure terminal
interface GigabitEthernet0/0
 ip address 192.168.7.161 255.255.255.240
 no shutdown
interface GigabitEthernet0/1
 ip address 192.168.7.177 255.255.255.240
 no shutdown
end
! PC-A: .162/28, gateway .161
! PC-B: .178/28, gateway .177`,
    verify:
      'Antes de pingar, preveja os ARPs. PC-A deve alcançar .161 e .178; confira show ip route e show arp em R1. No Simulation, observe MAC do gateway no primeiro quadro e novo Ethernet ao sair de R1.',
    fault:
      'Troque somente a máscara do PC-A para /24. Ele passa a tentar ARP diretamente por .178. Compare com o caso /28, restaure e repita. A simulação pode esconder o sintoma se houver proxy ARP; nesse caso observe o mecanismo e documente a diferença.',
  },
  3: {
    topology:
      'PC-A 192.168.10.10/24 GW .1 — R1 10.0.12.1/30 — R2 10.0.12.2/30 — PC-B 192.168.20.10/24 GW .1. Configure as interfaces e no shutdown antes das rotas.',
    commands: `! R1
configure terminal
ip route 192.168.20.0 255.255.255.0 10.0.12.2
end
! R2
configure terminal
ip route 192.168.10.0 255.255.255.0 10.0.12.1
end
! Conferir em ambos
show ip route
show ip interface brief`,
    verify:
      'Ping PC-A→PC-B e PC-B→PC-A. Use ping estendido de R1 com origem 192.168.10.1. Registre o prefixo e next hop de cada roteador. Só acrescente rota flutuante depois de montar um segundo caminho independente.',
    fault:
      'Remova somente a estática de R2 com no ip route e repita os três testes. Explique por que ping no endereço de trânsito não testa retorno até a LAN. Reponha a rota e valide.',
  },
  5: {
    topology:
      'S1, S2 e S3 em triângulo, trunks transportando VLAN 10; PC em porta access VLAN 10 de cada switch. Use portas existentes e isole o laboratório.',
    commands: `! Em todos, configure VLAN 10 e trunks primeiro
configure terminal
spanning-tree mode rapid-pvst
end
! S1
configure terminal
spanning-tree vlan 10 root primary
end
! S2
configure terminal
spanning-tree vlan 10 root secondary
end
show spanning-tree vlan 10
show interfaces trunk`,
    verify:
      'Desenhe root/designated/alternate e estados usando as saídas. Com tráfego entre PCs, derrube o enlace S1–S3 e observe o novo caminho. S1 deve continuar root quando apenas esse enlace falhar.',
    fault:
      'Altere a prioridade de S3 para ele se tornar root da VLAN e justifique cada mudança. Restaure a política primary/secondary. Para BPDU guard use uma porta de borda separada, nunca o uplink de gestão.',
  },
  6: {
    topology:
      'R1 LAN 192.168.10.0/24 e trânsito 10.0.12.1/30; R2 LAN 192.168.20.0/24 e trânsito 10.0.12.2/30. Interfaces configuradas e up. Adapte interface de trânsito e LAN.',
    commands: `! R1
configure terminal
router ospf 1
 router-id 1.1.1.1
 network 10.0.12.0 0.0.0.3 area 0
 network 192.168.10.0 0.0.0.255 area 0
 passive-interface GigabitEthernet0/0
end
! R2: router-id 2.2.2.2, trânsito igual e LAN 192.168.20.0
show ip ospf neighbor
show ip ospf interface
show ip route ospf`,
    verify:
      'Confirme que a interface passive é a LAN, não o trânsito. Vizinho Full, LAN remota instalada e pings de hosts bidirecionais. Para o exercício DR/BDR, acrescente um terceiro roteador ao mesmo switch de trânsito: três enlaces /30 separados não são um segmento broadcast compartilhado.',
    fault:
      'No R2 remova a seleção do trânsito na área 0 e coloque-a na área 1. Observe a queda e os logs; restaure área 0 antes de testar divergência de timers. Registre uma falha por vez. OSPFv3 exige bancada compatível separada e não está executado por esta receita.',
  },
};
