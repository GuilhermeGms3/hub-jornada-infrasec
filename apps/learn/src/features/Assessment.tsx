import { useState } from 'react';
import type { LearningStore } from '../app/useLearning';
import { questionById } from '../content/questions';
import { activeRun, dueReview, finishRun, runResult, startRun } from '../domain/learning';
import type { Run } from '../domain/types';
import { Correction, Options } from '../components/Exercise';

export function Assessment({ store, kind }: { store: LearningStore; kind: Run['kind'] }) {
  const p = store.envelope.progress;
  const current = activeRun(p);
  const [error, setError] = useState('');
  const last = p.runs.filter((r) => r.kind === kind && r.status === 'completed').at(-1);
  const due = dueReview(p);
  const begin = () => {
    setError('');
    store.update((p) => ({ ...p, runs: [...p.runs, startRun(p, kind)] }));
  };
  const result = last ? runResult(p, last) : null;
  return (
    <article>
      <p className="section-label">
        {kind === 'review'
          ? 'Revisão · observação posterior'
          : 'Avaliação · aplicação independente'}
      </p>
      <h1 tabIndex={-1}>
        {kind === 'review' ? 'Retome em outra situação' : 'Decida com base nas evidências'}
      </h1>
      <p className="lead">
        {kind === 'review'
          ? 'Revisar não é apenas reler. Use outra situação para verificar o raciocínio que ficou disponível.'
          : 'Os casos abaixo mudam o contexto da prática. Responda ao conjunto antes de ver a correção.'}
      </p>
      {kind === 'review' && (
        <p className="concept-note">
          {due
            ? `Próxima revisão sugerida: ${new Date(due.dueAt).toLocaleString('pt-BR')}. ${Date.now() < Date.parse(due.dueAt) ? 'Você pode treinar agora; uma tentativa antecipada não conta como revisão no intervalo sugerido.' : 'O intervalo sugerido já foi alcançado.'}`
            : 'Você pode praticar a revisão agora. A agenda de 1, 3 e 7 dias começa após uma avaliação independente aprovada.'}{' '}
          Intervalos são uma organização de estudo, não uma medição de memória.
        </p>
      )}
      {!current && (
        <>
          <p>
            O conjunto tem oito decisões, uma por objetivo. Todos os critérios são essenciais nesta
            primeira unidade: acertar perguntas de outros temas não compensa um erro essencial.
            Textos longos e notas digitadas não fazem parte da correção.
          </p>
          <p>
            Gabarito e explicações só aparecem depois de concluir. Consultar aulas ou pedir ajuda é
            permitido, mas a tentativa fica identificada como assistida. Banco finito: repetir
            famílias não aumenta a diversidade observada.
          </p>
          <button className="primary" onClick={begin}>
            {last
              ? 'Iniciar outra tentativa'
              : kind === 'review'
                ? 'Iniciar revisão'
                : 'Iniciar avaliação'}
          </button>
        </>
      )}
      {current && current.kind !== kind && (
        <aside className="feedback">
          <p>
            Há {current.kind === 'review' ? 'uma revisão' : 'uma avaliação'} em andamento. Retome ou
            encerre antes de iniciar outra.
          </p>
          <a href={current.kind === 'review' ? '#/revisao' : '#/avaliacao'}>Retomar tentativa</a>
        </aside>
      )}
      {current && current.kind === kind && (
        <section className="assessment-run">
          <p role="status">
            {Object.keys(current.answers).length}/{current.questionIds.length} respostas salvas ·{' '}
            {current.assisted || current.consulted ? 'Tentativa assistida' : 'Sem ajuda registrada'}
          </p>
          <div className="actions">
            <button
              onClick={() =>
                store.update((p) => ({
                  ...p,
                  runs: p.runs.map((r) => (r.id === current.id ? { ...r, assisted: true } : r)),
                }))
              }
            >
              Pedir orientação e registrar ajuda
            </button>
            <button
              onClick={() =>
                store.update((p) => ({
                  ...p,
                  runs: p.runs.map((r) =>
                    r.id === current.id ? { ...r, status: 'abandoned' } : r,
                  ),
                }))
              }
            >
              Encerrar sem concluir
            </button>
          </div>
          {current.assisted && (
            <p className="hint">
              Separe as funções envolvidas, identifique o teste observado e evite afirmar uma causa
              além da evidência. Você pode consultar as aulas; a consulta será registrada.
            </p>
          )}
          {current.questionIds.map((id, i) => (
            <section className="assessment-item" key={id}>
              <p className="section-label">
                Decisão {i + 1} · {questionById[id].objective}
              </p>
              <Options
                questionId={id}
                value={current.answers[id] || ''}
                onChange={(answer) =>
                  store.update((p) => ({
                    ...p,
                    runs: p.runs.map((r) =>
                      r.id === current.id ? { ...r, answers: { ...r.answers, [id]: answer } } : r,
                    ),
                  }))
                }
              />
            </section>
          ))}
          <button
            className="primary"
            onClick={() => {
              try {
                store.update((p) => finishRun(p, current.id));
                setError('');
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Não foi possível concluir.');
              }
            }}
          >
            Concluir e ver correção
          </button>
          {error && <p role="alert">{error}</p>}
        </section>
      )}
      {!current && last && result && (
        <section className="assessment-result">
          <h2>
            Resultado observado: {result.correct}/{result.total}
          </h2>
          <p className="feedback">
            {!result.compatible
              ? 'Resultado de conteúdo anterior; não confirma a versão atual.'
              : !result.independent
                ? 'Tentativa assistida. O resultado registra prática e não desempenho independente.'
                : result.passed
                  ? 'Critérios deste conjunto atendidos, sem ajuda registrada. Isso não comprova toda a formação ou prontidão para certificação.'
                  : 'Há critérios essenciais para recuperar antes de uma nova demonstração.'}
          </p>
          <p>
            {result.repeated > 0
              ? `${result.repeated} famílias já haviam sido usadas. Repetição é treino e não aumenta a diversidade de evidência.`
              : 'Este conjunto pode acrescentar observações; veja a cobertura por objetivo no progresso.'}
          </p>
          {last.questionIds.map((id) => (
            <section className="assessment-item" key={id}>
              <h3>{questionById[id].prompt}</h3>
              <Correction questionId={id} answer={last.answers[id]} />
            </section>
          ))}
          <div className="actions">
            <a className="button" href="#/recuperacao">
              Recuperar dificuldades
            </a>
            <a className="button primary" href="#/progresso">
              Ver evidências por objetivo
            </a>
          </div>
        </section>
      )}
    </article>
  );
}
