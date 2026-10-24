# Estratégia de testes — proposta para a reconstrução

Status: plano da Fase 0. Nenhum teste da aplicação nova foi criado/executado. Os testes atuais do Hub permanecem separados.

## Camadas de verificação

| Camada | Casos críticos | Evidência de saída |
| --- | --- | --- |
| Conteúdo | IDs únicos, versões, objetivos ensinados/avaliados, opções/gabaritos, feedback, referências, pré-requisitos/ciclos | Relatório de integridade com caminho/ID; não concede revisão semântica |
| Domínio | Score por gabarito, gates essenciais, ajuda, run interrompido, versão incompatível, diversidade/famílias | Testes de valores limite e entradas negativas, sem DOM |
| Persistência | JSON inválido, quota, storage bloqueado, versão futura, tamanho/IDs duplicados, importação cancelada, duas abas | Dados originais preservados; mensagem correta; backup/retomada verificados |
| Componentes | Responder, corrigir, hints, estado de salvamento, ajuda contextual, foco e feedback anunciável | Vitest/Testing Library candidatos após validar toolchain |
| Integração | Resposta → tentativa → persistência → evidência → recuperação/revisão | IDs/versões/ajuda/resultado rastreáveis e não duplicados |
| E2E | Iniciar, navegar, recarregar, concluir guiada, avaliar sem ajuda, recuperar, exportar/importar | Playwright com fluxo observável; desktop/mobile e build em subpasta |
| Revisão humana | Gabaritos, coerência técnica, alternativas plausíveis, capacidade de ensinar | Checklist com revisor/escopo reais; não substituir por lint |

## Regressões que devem falhar no produto novo

- Abrir todas as aulas ou marcar leitura não concede evidência independente.
- Submeter 500 caracteres sem sentido não aprova nada.
- Texto com todas as palavras esperadas não substitui decisão estruturada correta.
- Nota digitada ou `correct:true` externo não altera correção.
- Ajuda completa ou consulta não se torna independente por trocar o modo depois.
- Repetir família com IPs diferentes não aumenta diversidade.
- 80% com erro essencial não aprova conjunto.
- Um run inacabado não vira aprovado ao recarregar.
- Tentativa de versão antiga preserva histórico sem aprovar gabarito novo.
- Falha de gravação mostra não salvo e mantém sessão disponível para exportação.
- JSON inválido não é substituído silenciosamente por progresso vazio.
- Importação não altera nenhuma chave do legado.

## Comandos e responsabilidades

Hoje, na raiz do Hub: `npm test` e `npm run serve:test`. Não existem scripts de lint, typecheck ou build nela. Não executar comandos inventados para produzir relatório verde.

Na futura `apps/learn/`, implementar e documentar scripts reais: `lint`, `typecheck`, `test`, `test:content`, `test:e2e`, `build` e `preview`. Rodar todos no primeiro recorte funcional. O E2E deve incluir o bundle de produção em caminho aninhado, não somente servidor dev na raiz.

Não subir ConcursoOS nem seu PostgreSQL para validar InfraSec. Se um padrão de lá for portado, escrever teste local do contrato adaptado; o sucesso do teste Java original não valida a nova implementação.

## Limite da evidência

Teste de software confirma fluxo/regras, não aprendizagem. Aprovação da R01 precisa de revisão técnica e piloto com iniciantes, conforme [ACCESSIBILITY](ACCESSIBILITY.md). Resultados executados nesta fase ficam somente em [ACCEPTANCE](ACCEPTANCE.md), separados deste plano futuro.
