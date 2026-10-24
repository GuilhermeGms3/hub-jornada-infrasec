import type { LearningStore } from '../app/useLearning';
import { lessons } from '../content/lessons';
import { LessonReader } from '../features/LessonReader';
import { Practice } from '../features/Practice';
import { Assessment } from '../features/Assessment';
import { Recovery } from '../features/Recovery';
import { ProgressView } from '../features/ProgressView';

const tools = [
  ['pratica', 'Laboratório guiado'],
  ['avaliacao', 'Avaliação independente'],
  ['recuperacao', 'Recuperar conceitos'],
  ['revisao', 'Revisão posterior'],
  ['progresso', 'Evidências e histórico'],
];
export function UnitPlayer({ route, store }: { route: string; store: LearningStore }) {
  return (
    <div className="unit-player">
      <div className="unit-location">
        <a href="#/redes">Formação de redes</a>
        <span> / NET-R01</span>
      </div>
      <details className="unit-outline">
        <summary>Sumário da unidade</summary>
        <nav aria-label="Lições da unidade">
          <ol>
            {lessons.map((l, i) => (
              <li key={l.id}>
                <a
                  href={`#/aula/${l.id}`}
                  aria-current={route === `aula/${l.id}` ? 'page' : undefined}
                >
                  <span className="lesson-number">{String(i + 1).padStart(2, '0')}</span> {l.title}
                  {store.envelope.progress.read.includes(l.id) && (
                    <span className="read-mark" aria-label="leitura registrada">
                      ✓
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <nav className="unit-tools" aria-label="Praticar e acompanhar">
          {tools.map(([id, name]) => (
            <a href={`#/${id}`} key={id} aria-current={route === id ? 'page' : undefined}>
              {name}
            </a>
          ))}
        </nav>
      </details>
      <div className="unit-content">
        {route.startsWith('aula/') && (
          <LessonReader key={route} lessonId={route.slice(5)} store={store} />
        )}
        {route === 'pratica' && <Practice store={store} />}
        {route === 'avaliacao' && <Assessment key="independent" store={store} kind="independent" />}
        {route === 'revisao' && <Assessment key="review" store={store} kind="review" />}
        {route === 'recuperacao' && <Recovery store={store} />}
        {route === 'progresso' && <ProgressView store={store} />}
        <footer className="page-footer">
          NET-R01 · versão 1.0 · Simulação e avaliação local. Esta unidade não cobre um curso
          completo de CCNA.
        </footer>
      </div>
    </div>
  );
}
