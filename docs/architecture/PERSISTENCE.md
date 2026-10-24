# Persistência proposta e recuperação

Atualização: esta proposta da Fase 0 foi implementada no recorte descrito em [`storage.ts`](../../apps/learn/src/persistence/storage.ts) e no [relatório de execução](../quality/IMPLEMENTATION_R01.md). Os dados antigos continuam intactos; nem todos os campos projetados abaixo são usados na primeira versão.

Status: projeto de Fase 0. O Hub continua usando seu storage atual; nenhum dado foi migrado.

## Envelope isolado

Nova chave proposta: `infrasec-learn:v1`. Não ler/apagar/escrever `infrasec-*` legado por prefixo nem promover os resultados antigos. Envelope: `schemaVersion`, `appId`, `revision`, `savedAt`, `timezone`, `progress`. Conteúdo editorial continua em arquivos; progresso não duplica banco de aulas/gabaritos como segunda fonte de verdade.

Um único envelope reduz inconsistência entre chaves. `revision` permite detectar atualização concorrente: ouvir `storage`, comparar revisão antes de salvar e, em caso de conflito, suspender escrita automática e oferecer recarregar/exportar a sessão. Isso não transforma localStorage em banco transacional nem resolve corrida entre abas por completo; a primeira versão orientará uma aba de estudo por vez.

## Leitura, escrita e falhas

1. Storage ausente inicia sessão vazia sem gravar por efeito colateral.
2. Leitura de string passa por tamanho máximo, parse, validação de schema e referências; verificar versão antes de usar.
3. JSON inválido é preservado na chave original. Não gravar fallback vazio sobre ele. Oferecer download do texto bruto e recuperação explícita.
4. Versão futura desconhecida abre aviso e modo de consulta, sem sobrescrever.
5. Escrita usa tratamento de erro (`QuotaExceededError`/indisponibilidade). Falha mantém estado em memória e mostra “não salvo neste dispositivo”, com exportação. Não anunciar sucesso antes de `setItem` concluir.
6. Antes de substituir estado por importação/migração, gerar backup baixável do anterior e só confirmar troca após validação completa. Cancelar preserva o estado original.
7. Migração é função pura `vN → vN+1`, testada com fixtures; em erro manter original e modo recuperável. Primeira versão não precisa de migração fictícia de formatos nunca publicados.

Dados inválidos podem ser grandes demais para duplicar em outra chave; por isso recuperação não depende de conseguir salvar cópia local adicional. Não apagar para “corrigir” quota. Se houver necessidade de IndexedDB após medição de histórico real, registrar ADR e migrar com backup e validação.

## Backup

Arquivo JSON contém envelope, `exportedAt`, identificador de formato e checksum SHA-256 do payload serializado de forma determinística. Checksum detecta corrupção acidental; **não autentica resultado nem impede edição pelo aluno**. A importação recalcula checksum e valida tudo; dados assinados pelo próprio cliente não se tornam prova supervisionada.

Limites iniciais propostos: arquivo até 5 MiB, 10 mil tentativas, textos de reflexão até 20 mil caracteres, IDs até 128 caracteres; limites são hipóteses operacionais revisáveis. Rejeitar antes de materializar estruturas enormes. Sem HTML ativo, execução de comandos, URLs `javascript:` ou scripts provenientes de dados. Validar chaves admitidas, arrays, tipos, datas, IDs, versões, resultados e unicidade; reconstruir projeções dos registros válidos.

Primeiro fluxo: substituição integral confirmada após prévia de contagens/versões, sem mesclagem automática. Duplicidades dentro do backup são erro com localização. Antes de suportar merge entre dispositivos, definir conflitos de IDs e cronologia e testá-los; não implementar “último vence” silencioso. Se o conteúdo daquela versão não estiver disponível, preservar tentativas históricas como não verificáveis e impedir concessão de estado atual.

## Limites assumidos

Sem conta, sincronização, criptografia do histórico ou isolamento contra outro usuário do mesmo perfil do navegador. Não armazenar senhas, outputs reais com segredos ou identificação de clientes. Exercícios usam dados sintéticos. Backup é local e depende de ação do aluno; a aplicação deverá explicar que limpar dados do navegador pode remover progresso.

Teste de ponta a ponta necessário: estudar, responder, exportar, limpar somente a chave nova em contexto de teste, importar e retomar preservando versões e tentativas. Não testar restauração apagando dados pessoais reais.
