# Bancada avançada CCNA

Estude as aulas internas nas semanas 3, 6, 8, 9 e 10. Este arquivo documenta a execução da bancada, não substitui o ensino na aplicação.

## Requisitos
Docker com engine Linux e suporte IPv6, Compose v2, Python 3.10+. Imagem FRR oficial fixa 10.3.1; Ansible core 2.19.4 no runner opcional. Rede interna exclusiva, sem portas publicadas. Roteadores usam NET_ADMIN/NET_RAW/SYS_ADMIN; runner tem socket Docker e portanto pode controlar o engine. Somente bancada pessoal; sem dados ou redes de produção. Não há imagens IOS ou arquivos .pkt gerados.

## Executar a partir desta pasta
```
docker compose up -d
python verify.py healthy
python verify.py fault
python verify.py recover
docker compose --profile tools build ansible
docker compose --profile tools run --rm ansible
python verify.py fault
docker compose --profile tools run --rm ansible
# O playbook acima DEVE sair com erro porque o vizinho não está Full.
python verify.py recover
docker compose --profile tools run --rm ansible
docker compose down
```

Healthy/recover exigem Full, /128 remoto aprendido e ping bidirecional com origem loopback. Fault troca área de R2 e exige retirada. A retirada pode esperar o dead timer. O script limita a espera; erro de processo, timeout ou ping sem retorno não são aprovados. Alterações de fault/recover só existem na configuração em execução e não são gravadas nos arquivos base.

LF obrigatório nos arquivos daemons e .conf: CRLF pode ser interpretado como parte dos argumentos pelos scripts Linux. .gitattributes protege o checkout Windows. Se não houver IPv6, valide Docker/WSL antes de mudar OSPF. OSPFv3 FRR não é CLI IOS; receitas e compatibilidade Cisco estão explicadas na aula. Loopbacks /128 não demonstram RA/SLAAC de cliente.

## Ansible
collect.yaml usa inventário local r1/r2 e Docker CLI para executar uma consulta real. Sem SSH ou credenciais, sem escrita de configuração. changed=0 é relatório de leitura; o assert verifica Full. Não é prova de idempotência de escrita. O runner efêmero é opcional; WSL/Linux pode executar o mesmo inventário/playbook com Docker e Ansible instalados. Não exponha o socket Docker.
