import { Fragment } from 'react';
import { lessons, sources } from '../content/lessons';
import type { LearningStore } from '../app/useLearning';
import { Exercise } from '../components/Exercise';
import { FlowDiagram, LayersDiagram, MaskDemo, NetworkDiagram } from '../components/Diagrams';

export function LessonReader({ lessonId, store }: { lessonId: string; store: LearningStore }) {
  const index = lessons.findIndex((l) => l.id === lessonId);
  const lesson = lessons[index];
  const read = store.envelope.progress.read.includes(lesson.id);
  return (
    <article>
      <p className="section-label">
        Unidade NET-R01 · Lição {String(index + 1).padStart(2, '0')} de {lessons.length}
      </p>
      <h1 tabIndex={-1}>{lesson.heading}</h1>
      <p className="lead">{lesson.lead}</p>
      {lesson.sections.map((section, index) => (
        <Fragment key={section.title}>
          <section className="lesson-section">
            <h2>{section.title}</h2>
            {section.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {section.output && (
              <pre>
                <code>{section.output}</code>
              </pre>
            )}
          </section>
          {index === 0 && (
            <>
              {lesson.diagram === 'network' && <NetworkDiagram />}
              {lesson.diagram === 'mask' && <MaskDemo />}
              {lesson.diagram === 'flow' && <FlowDiagram />}
              {lesson.diagram === 'layers' && <LayersDiagram />}
            </>
          )}
        </Fragment>
      ))}
      <section className="worked-example">
        <p className="section-label">Exemplo resolvido · dados sintéticos</p>
        <h2>{lesson.example.title}</h2>
        <pre>
          <code>{lesson.example.data}</code>
        </pre>
        <ol>
          {lesson.example.reasoning.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
        <p>
          <strong>Conclusão:</strong> {lesson.example.conclusion}
        </p>
        <p>
          <strong>Limite:</strong> {lesson.example.limit}
        </p>
      </section>
      <aside className="concept-note">
        <h3>Um erro comum</h3>
        <p>{lesson.misconception}</p>
      </aside>
      <Exercise
        key={lesson.questionId}
        questionId={lesson.questionId}
        mode="comprehension"
        store={store}
      />
      <section>
        <h2>O que levar desta lição</h2>
        <p>{lesson.takeaway}</p>
        <label className="read-toggle">
          <input
            type="checkbox"
            checked={read}
            onChange={(e) => {
              const checked = e.target.checked;
              store.update((p) => ({
                ...p,
                read: checked
                  ? [...new Set([...p.read, lesson.id])]
                  : p.read.filter((id) => id !== lesson.id),
              }));
            }}
          />{' '}
          Registrei a leitura desta lição
        </label>
        <p className="caption">Leitura registrada é diferente de conhecimento demonstrado.</p>
      </section>
      <nav className="lesson-navigation" aria-label="Entre lições">
        {index > 0 ? (
          <a href={`#/aula/${lessons[index - 1].id}`}>← {lessons[index - 1].title}</a>
        ) : (
          <span />
        )}
        {index < lessons.length - 1 ? (
          <a className="button primary" href={`#/aula/${lessons[index + 1].id}`}>
            Continuar: {lessons[index + 1].title} →
          </a>
        ) : (
          <a className="button primary" href="#/pratica">
            Praticar diagnóstico →
          </a>
        )}
      </nav>
      <details className="sources">
        <summary>Fontes, escopo e autoria</summary>
        <p>
          Texto e itens originais, versão 1.0. Revisão editorial assistida; validação com iniciantes
          ainda pendente. Referências complementares, sem necessidade de sair para aprender esta
          unidade:
        </p>
        <ul>
          {sources.map(([title, url]) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noreferrer">
                {title}
              </a>
            </li>
          ))}
        </ul>
        <p>
          Esta unidade é uma base de redes, não um curso completo ou garantia de aprovação no CCNA.
        </p>
      </details>
    </article>
  );
}
