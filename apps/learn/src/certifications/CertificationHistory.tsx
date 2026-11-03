import type { LearningStore } from '../app/useLearning';
import { certificationById, certificationHref, lessonIndex } from './catalog';
export function CertificationHistory({ store }: { store: LearningStore }) {
  const p = store.envelope.certifications;
  const attempts = [...(p?.attempts || [])].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  return (
    <section className="cert-history">
      <h2>Histórico de compreensão · certificações</h2>
      <p>
        Registros dos casos com consulta aberta, separados das avaliações independentes R01–R04.
        Acerto e leitura não são prontidão para exame. As últimas 100 respostas aparecem aqui; a
        cópia completa guarda o histórico.
      </p>
      {!attempts.length ? (
        <p>
          Ainda não há respostas nas aulas-base. <a href="#/certificacoes">Escolha seu roteiro</a>.
        </p>
      ) : (
        <ol className="curriculum-list">
          {attempts.slice(0, 100).map((a) => {
            const c = certificationById.get(a.certificationId)!;
            const lesson = lessonIndex.get(a.lessonId)!;
            return (
              <li key={a.id}>
                <div>
                  <a href={certificationHref(c.id, a.week, a.lessonId)}>
                    {c.title} · Semana {a.week} · {lesson.title}
                  </a>
                  <p>
                    {a.answer === lesson.correct
                      ? 'Acerto neste caso de compreensão'
                      : 'Revisar o raciocínio deste caso'}{' '}
                    · versão {a.lessonVersion}
                  </p>
                  <small>
                    {new Date(a.at).toLocaleString('pt-BR')} · consulta aberta ·{' '}
                    {Date.parse(a.at) > Date.now()
                      ? 'data futura; conferir relógio'
                      : 'registro local sem supervisão'}
                  </small>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
