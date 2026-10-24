import type { LearningStore } from '../app/useLearning';
import { dueReview, observations, correctAnswer, runResult } from '../domain/learning';
import { lessons } from '../content/lessons';
import { questionById } from '../content/questions';

export function ProgressView({ store }: { store: LearningStore }) {
  const p = store.envelope.progress;
  const due = dueReview(p);
  const modeLabel = {
    comprehension: 'compreensão',
    guided: 'prática guiada',
    independent: 'avaliação independente',
    remediation: 'recuperação',
    review: 'revisão',
  };
  return (
    <article>
      <p className="section-label">Progresso · o que os registros mostram</p>
      <h1 tabIndex={-1}>Estudo e evidência são coisas diferentes</h1>
      <p className="lead">
        Acompanhe o que leu, praticou e demonstrou em decisões específicas. Nenhum número aqui
        estima sua chance de passar numa certificação.
      </p>
      <dl className="progress-facts">
        <div>
          <dt>Leituras reconhecidas</dt>
          <dd>
            {p.read.length}/{lessons.length}
          </dd>
        </div>
        <div>
          <dt>Respostas registradas</dt>
          <dd>{p.attempts.length}</dd>
        </div>
        <div>
          <dt>Casos guiados registrados</dt>
          <dd>{p.labAttempts.length}</dd>
        </div>
      </dl>
      <h2>Por objetivo da unidade</h2>
      <p>
        Duas famílias distintas com respostas independentes corretas sustentam “demonstrado neste
        recorte”. Repetição, leitura e ajuda não aumentam essa diversidade. Um erro independente
        recente mantém a fragilidade visível.
      </p>
      <ul className="observations">
        {observations(p).map((o) => (
          <li key={o.id}>
            <span className="objective-code">{o.id}</span>
            <div>
              <strong>{o.title}</strong>
              <p>{o.status}</p>
              <small>
                {o.families} família(s) independente(s) com acerto
                {o.lastAt
                  ? ` · última observação: ${new Date(o.lastAt).toLocaleDateString('pt-BR')}`
                  : ''}
              </small>
            </div>
          </li>
        ))}
      </ul>
      <h2>Revisão</h2>
      <p>
        {due
          ? `Próxima sugestão: ${new Date(due.dueAt).toLocaleString('pt-BR')}. Etapas posteriores registradas: ${Math.min(due.stage, 3)}/3.`
          : 'A agenda começa quando um conjunto independente atende aos critérios.'}{' '}
        Vencimento significa revisão pendente, não perda de conhecimento comprovada.
      </p>
      <a href="#/revisao">Abrir revisão</a>
      <h2>Histórico de avaliações</h2>
      {!p.runs.length && <p>Nenhuma avaliação iniciada.</p>}
      <ul>
        {p.runs.map((r) => {
          const result = runResult(p, r);
          return (
            <li key={r.id}>
              {r.kind === 'review' ? 'Revisão' : 'Avaliação'} ·{' '}
              {new Date(r.startedAt).toLocaleString('pt-BR')} ·{' '}
              {r.status === 'completed'
                ? `${result.correct}/${result.total}; ${result.independent ? 'sem ajuda registrada' : 'assistida'}`
                : r.status === 'active'
                  ? 'em andamento'
                  : 'encerrada sem concluir'}
            </li>
          );
        })}
      </ul>
      <details>
        <summary>Inspecionar respostas e versões</summary>
        <ol>
          {p.attempts.map((a) => (
            <li key={a.id}>
              <strong>{questionById[a.questionId].prompt}</strong>
              <p>
                {correctAnswer(a.questionId, a.answer) ? 'Acerto' : 'Erro'} · {modeLabel[a.mode]} ·
                ajuda {a.hintLevel}/4 · versão {a.questionVersion} ·{' '}
                {new Date(a.at).toLocaleString('pt-BR')}
              </p>
            </li>
          ))}
        </ol>
      </details>
      <aside className="concept-note">
        <p>
          Esta é uma aplicação local de estudo pessoal. Os gabaritos estão no cliente e os dados
          podem ser inspecionados. Não é exame supervisionado, certificado nem prova de execução
          real. A unidade ainda depende de validação com iniciantes reais.
        </p>
      </aside>
    </article>
  );
}
