import type { LearningStore } from '../app/useLearning';
import { remediation } from '../content/remediation';
import { difficultyIds } from '../domain/learning';
import { Exercise } from '../components/Exercise';

export function Recovery({ store }: { store: LearningStore }) {
  const difficulties = difficultyIds(store.envelope.progress);
  const ordered = [...remediation].sort(
    (a, b) => Number(difficulties.includes(b.id)) - Number(difficulties.includes(a.id)),
  );
  return (
    <article>
      <p className="section-label">Recuperação · contrastes para reensinar</p>
      <h1 tabIndex={-1}>Volte ao ponto que mudou sua decisão</h1>
      <p className="lead">
        Uma resposta errada indica uma dificuldade naquele exercício. Ela não revela sozinha a causa
        do erro nem define sua capacidade.
      </p>
      <p>
        {difficulties.length
          ? 'Os contrastes associados aos erros registrados aparecem primeiro. Eles são sugestões instrucionais, não diagnóstico definitivo.'
          : 'Ainda não há erros objetivos registrados. Você pode explorar os contrastes e praticar.'}
      </p>
      {ordered.map((item) => (
        <section className="recovery-section" key={item.id} id={item.id}>
          <h2>{item.title}</h2>
          {difficulties.includes(item.id) && (
            <p className="caption">Sugerido por uma resposta registrada no histórico.</p>
          )}
          {item.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
          <a href={`#/aula/${item.lesson}`}>Consultar a explicação original</a>
          <Exercise questionId={item.question} mode="remediation" store={store} />
        </section>
      ))}
      <p>
        Concluir uma recuperação não altera retroativamente a avaliação. Um novo caso independente é
        necessário para observar aplicação sem ajuda.
      </p>
      <a className="button primary" href="#/avaliacao">
        Voltar à avaliação
      </a>
    </article>
  );
}
