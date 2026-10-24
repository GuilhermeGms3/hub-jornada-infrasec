# InfraSec Learn — NET-R01

Aplicação independente para estudar **Como um computador acessa um site**. A unidade inclui ensino em PT-BR, exemplos resolvidos, diagramas, demonstração de máscara, percurso por etapas, diagnóstico guiado, avaliação, recuperação e revisão.

Não depende do Hub antigo, do ConcursoOS, de API, banco, conta ou serviços externos para funcionar. Não altera o progresso antigo. Ainda não foi validada com iniciantes reais e não representa um curso completo de CCNA.

## Instalar e iniciar

Node.js 22.13+ (testado com 22.20.0) e npm. Vite/Vitest exigem Node moderno; ESLint 10 exige pelo menos 22.13 na linha Node 22.

No Windows, encerre o servidor de desenvolvimento desta aplicação antes de reinstalar com `npm ci`: o processo pode manter o binário nativo do Vite/Rolldown aberto e impedir sua substituição. Não é necessário encerrar aplicações de outros projetos.

```powershell
cd D:\dsf\hub-jornada-infrasec\apps\learn
npm ci
npm run dev
```

Abra [a aplicação local](http://127.0.0.1:5174/). O script usa loopback e porta fixa; se ela estiver ocupada, encerre a instância anterior ou escolha uma porta explicitamente. A aplicação deve ser servida por HTTP, não aberta com `file://`.

## O que pode ser estudado

Onze lições: redes/LAN/internet; cliente/servidor; IPv4; máscara e rede conectada; MAC/ARP; gateway; DNS; TCP; HTTP/HTTPS/TLS; percurso completo; diagnóstico com ipconfig, ping, nslookup e tracert. São onze exemplos resolvidos, 41 questões originais comentadas, nove cenários de laboratório e seis recuperações com exercícios diferentes.

O simulador é um modelo finito de decisões e outputs sintéticos, não um terminal real. Escolha um teste e explique a situação selecionando uma conclusão sustentada. Casos de avaliação não revelam correção antes do envio do conjunto. Há duas formas de oito decisões e uma revisão de oito itens. O banco é finito; repetir família não aumenta diversidade de evidência.

## Comandos de qualidade

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:content
npm run build
npm run test:e2e
npm audit --audit-level=high
```

E2E usa Chromium/Playwright e o bundle de produção: execute build antes. Se o Chromium não estiver instalado no ambiente, use `npx playwright install chromium`. O teste de subdiretório usa também a porta local 4184; o preview usa 4174. Testes do Hub legado continuam na raiz e não substituem os desta aplicação.

## Build estático

`npm run build` gera `dist/`; `npm run preview` serve em [127.0.0.1:4174](http://127.0.0.1:4174/). Assets usam base relativa e navegação por hash, permitindo servir o conteúdo de `dist` numa subpasta. O teste E2E serve explicitamente `/estudo/index.html#/aula/dns` e recarrega o endereço. Nenhuma configuração de GitHub Pages foi alterada; publicar é uma etapa separada.

## Organização e autoria

- `src/content`: aulas, exemplos, questões, feedback, recuperações e verificador estrutural.
- `src/domain`: contratos, cálculo IPv4, simulação, correção, elegibilidade, agenda e observações.
- `src/features`: leitor, laboratório, avaliação/revisão, recuperação e histórico.
- `src/components`: controles de questão, correção, diagramas e backup.
- `src/app`: composição/navegação e operações de estado local.
- `src/persistence`: validação de entrada, armazenamento e cópias com integridade.
- `tests` e `e2e`: regras/conteúdo e fluxos em Chromium.

Para editar uma lição, altere seus blocos em `src/content/lessons.ts`; mantenha ID e objetivo. Para um item, use `questions.ts`, com família, versão, gabarito, explicação de cada alternativa e destino de recuperação. `correct` é ID de opção, não posição. Mudança material exige versão e análise de impacto no progresso. Execute `test:content`, faça revisão técnica e depois teste o fluxo. O validador não substitui revisão de qualidade do ensino.

IDs `O01`–`O08` são os objetivos da NET-R01; as formas curtas são locais a esta unidade. Ela ainda não é um sistema genérico de múltiplos cursos. Novas unidades precisam de revisão de currículo, sem copiar páginas vazias.

## Estado e segurança

Chave exclusiva: `infrasec-learn:v1`; schema 1 e conteúdo 1.0. Leitura, rascunhos, tentativas, ajuda, casos guiados, avaliações e revisões ficam separados. Resultados são calculados por gabarito, sem aceitar score do cliente. Erros recentes e repetição permanecem visíveis. Consultar aula durante avaliação marca o conjunto como assistido. Não há correção por palavras-chave ou tamanho de texto.

JSON corrompido/versão desconhecida fica preservado. Em falha de escrita, a sessão continua em memória com aviso e exportação. Outra aba pode provocar conflito; use uma aba de estudo por vez e exporte antes de recarregar. localStorage não fornece transação entre abas e pode ser apagado pelo navegador.

“Salvar cópia” exporta backup com SHA-256 e importa somente após validação, prévia e confirmação explícita. Antes da substituição é iniciado download do estado anterior. O navegador controla se o usuário efetivamente guarda o arquivo. Limites: 5 MiB, dez mil tentativas de questões, dez mil de laboratório e dois mil runs. Não há descarte silencioso para caber na quota. Não há migração de outros schemas: versões incompatíveis são preservadas e recusadas.

Checksum detecta corrupção acidental, não autentica aprovação. Como todo cliente local, gabaritos e dados podem ser inspecionados. Não é prova supervisionada nem certificação. Datas usam UTC nos registros e o fuso do navegador na apresentação; a agenda usa intervalos de 24 horas, não modelo calibrado de memória. Não armazenar segredos ou dados reais de clientes.

## Resultados e limites

Veja [o relatório da implementação](../../docs/quality/IMPLEMENTATION_R01.md) para testes executados, capturas e riscos. Validação pedagógica com iniciantes, revisão técnica humana independente, auditoria WCAG e outros navegadores permanecem pendentes.
