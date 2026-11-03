import { useEffect, useState } from 'react';
import type { LearningStore } from '../app/useLearning';
import type { Certification, StudyLesson, StudyWeek } from './types';
import { certifications, certificationHref, certificationRoute, lessonIndex } from './catalog';
import { networkLessons } from './lessons-network';
import { securityLessons } from './lessons-security';
import { cloudLessons } from './lessons-cloud';
import { operationsLessons } from './lessons-operations';
import {
  initialCertifications,
  noteKey,
  recordReading,
  saveNote,
  submitComprehension,
} from './model';
import { Options, Correction } from '../components/Exercise';
import { download } from '../components/BackupPanel';
import { MaskDemo, FlowDiagram } from '../components/Diagrams';
import { PolicyWalkthrough } from './PolicyWalkthrough';

const lessons = new Map(
  [...networkLessons, ...securityLessons, ...cloudLessons, ...operationsLessons].map((l) => [
    l.id,
    l,
  ]),
);
const groups = ['Todas', 'Redes', 'Fortinet', 'Cloud', 'Segurança', 'Sistemas'];
const related: Record<string, [string, string][]> = {
  connectivity: [
    ['aula/ipv4', 'R01 · percurso completo'],
    ['unidade/net-r03/escopo', 'R03 · troubleshooting'],
  ],
  dhcp: [['unidade/net-r02/dora', 'R02 · DHCP em profundidade']],
  dns: [['aula/dns', 'R01 · resolução de nomes']],
  incidents: [['unidade/net-r03/escopo', 'R03 · delimitar o problema']],
  evidence: [['unidade/net-r04/registro', 'R04 · registro e editor de runbook']],
};

function Catalog({ store, practice }: { store: LearningStore; practice: boolean }) {
  const [filter, setFilter] = useState('Todas');
  const [query, setQuery] = useState('');
  const visible = certifications.filter(
    (c) =>
      (filter === 'Todas' || c.group === filter) &&
      `${c.title} ${c.description}`
        .toLocaleLowerCase('pt-BR')
        .includes(query.trim().toLocaleLowerCase('pt-BR')),
  );
  return (
    <article>
      <h1 tabIndex={-1}>{practice ? 'Prática de certificações' : 'Guia de certificações'}</h1>
      <p className="platform-lead">
        Um roteiro de 12 semanas para cada objetivo. CCNA 2.0 e Fortinet em destaque.
      </p>
      <p>
        Escolha uma certificação por vez. Cada semana liga explicações e casos internos a uma
        prática e uma evidência proposta. Os 12 blocos são flexíveis: retome fundamentos e estenda o
        prazo quando necessário.
      </p>
      <details className="cert-scope">
        <summary>Disponível agora: 16 roteiros e 60 aulas-base compartilhadas</summary>
        <p>
          São 16 roteiros, 60 aulas-base e casos comentados, além das unidades R01–R04. As aulas
          compartilhadas são contadas uma vez, mesmo quando aparecem em mais de um roteiro. Cada
          semana informa o aprofundamento específico ainda necessário. Não há curso completo ou
          simulado calibrado para todos os exames.
        </p>
      </details>
      {store.envelope.certifications && (
        <p className="actions">
          <a className="button primary" href={`#/${store.envelope.certifications.route}`}>
            Retomar certificação
          </a>
        </p>
      )}
      <div className="cert-filters">
        <label>
          Buscar certificação
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="cert-area-filter">
          <label htmlFor="cert-area">Área</label>
          <select id="cert-area" value={filter} onChange={(e) => setFilter(e.target.value)}>
            {groups.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>
      <p role="status">{visible.length} roteiros encontrados.</p>
      <div className="cert-grid">
        {visible.map((c) => (
          <section className="available-unit" key={c.id}>
            <span className="availability available">
              {c.priority ? 'Prioridade · ' : ''}
              {c.group} · 12 semanas
            </span>
            <h2>{c.title}</h2>
            <p className="scope-note">{c.version}</p>
            <p>{c.description}</p>
            <a className="button" href={certificationHref(c.id, practice ? 1 : undefined)}>
              {practice ? 'Abrir primeira semana' : 'Ver roteiro de 12 semanas'}
            </a>
          </section>
        ))}
      </div>
      {!visible.length && (
        <p>Nenhum roteiro corresponde à busca. Limpe o texto ou escolha outra área.</p>
      )}
      <details className="week-row">
        <summary>Fortinet: como os níveis se relacionam</summary>
        <p>
          NSE 1 e 2 são a base; NSE 3 trata operação e NSE 4, administração FortiOS. NSE 5 e NSE 6
          oferecem especializações alternativas, não uma sequência obrigatória entre si. Para NSE 7,
          a trilha e os pré-requisitos precisam corresponder.
        </p>
        <p>
          Aqui, NSE 5 destaca SD-WAN Core, NSE 6 destaca FortiManager e NSE 7 destaca Secure
          Networking Architect. Os caminhos SASE, Cloud Security e Security Operations têm exames
          próprios e não são cobertos automaticamente por esses três roteiros.
        </p>
        <a
          href="https://www.fortinet.com/nse-training-update"
          target="_blank"
          rel="noopener noreferrer"
        >
          Consultar estrutura oficial Fortinet
        </a>
      </details>
      <p className="evidence-note">
        Leitura, anotações e acerto nestes casos de compreensão não concedem certificação nem
        demonstram prontidão. Laboratórios reais usam Packet Tracer, VM, tenant ou equipamento
        autorizado; as explicações permanecem aqui.
      </p>
    </article>
  );
}

function Overview({ cert, store }: { cert: Certification; store: LearningStore }) {
  const uniqueLessons = [...new Set(cert.weeks.flatMap((w) => w.lessons))];
  const read = uniqueLessons.filter((id) =>
    store.envelope.certifications?.read.includes(id),
  ).length;
  return (
    <article>
      <a href="#/certificacoes">← Todas as certificações</a>
      <h1 tabIndex={-1}>{cert.title}</h1>
      <p className="platform-lead">{cert.description}</p>
      <p>{cert.version} · roteiro revisado em 02/11/2026.</p>
      <section className="cert-scope">
        <h2>Antes de começar</h2>
        <p>{cert.prerequisites}</p>
        <p>
          <strong>Credencial oficial:</strong> {cert.officialRequirements}
        </p>
        <p>
          {read}/{uniqueLessons.length} aulas-base com leitura registrada. Reuso entre roteiros não
          cria novas evidências de domínio.
        </p>
      </section>
      <a className="button primary" href={certificationHref(cert.id, 1)}>
        Começar Semana 1
      </a>
      <h2>Seu roteiro de 12 semanas</h2>
      <p>
        Avance por objetivo, não por obrigação de terminar em sete dias. Cada semana reúne
        conteúdo-base, prática específica, entrega e lacunas visíveis.
      </p>
      <ol className="curriculum-list cert-weeks">
        {cert.weeks.map((w) => (
          <li key={w.number}>
            <div>
              <h3>
                <a href={certificationHref(cert.id, w.number)}>
                  Semana {w.number} · {w.title}
                </a>
              </h3>
              <p>{w.objective}</p>
              {w.blueprint && <small>Matriz v2.0: {w.blueprint}</small>}
            </div>
            <span className="availability">Guia + base interna</span>
          </li>
        ))}
      </ol>
      <details className="week-row">
        <summary>Disponibilidade e fontes</summary>
        <p>
          Este é um percurso editorial próprio do InfraSec, com casos autorais e casos do Hub
          revisados. As semanas não representam 12 unidades completas já avaliadas. Consulte em cada
          semana o que falta aprofundar; use a referência oficial para conferir objetivos e versão
          antes de marcar prova.
        </p>
        <a href={cert.source} target="_blank" rel="noopener noreferrer">
          Requisitos e objetivos oficiais
        </a>
      </details>
    </article>
  );
}

function WeekNavigation({ cert, week }: { cert: Certification; week: StudyWeek }) {
  return (
    <nav className="inline-links" aria-label="Semanas do roteiro">
      {week.number > 1 && (
        <a href={certificationHref(cert.id, week.number - 1)}>← Semana {week.number - 1}</a>
      )}
      <a href={certificationHref(cert.id)}>Ver as 12 semanas</a>
      {week.number < 12 && (
        <a href={certificationHref(cert.id, week.number + 1)}>Semana {week.number + 1} →</a>
      )}
    </nav>
  );
}

function Week({
  cert,
  week,
  store,
}: {
  cert: Certification;
  week: StudyWeek;
  store: LearningStore;
}) {
  const p = store.envelope.certifications || initialCertifications();
  const key = noteKey(cert.id, week.number);
  const note = p.notes[key] || '';
  const [error, setError] = useState('');
  return (
    <article>
      <a href={certificationHref(cert.id)}>← {cert.title}</a>
      <h1 tabIndex={-1}>
        Semana {week.number} · {week.title}
      </h1>
      <p className="platform-lead">{week.objective}</p>
      {week.blueprint && (
        <p className="scope-note">
          Objetivos CCNA v2.0: {week.blueprint}. O vínculo indica escopo do roteiro, não cobertura
          integral demonstrada.
        </p>
      )}
      <h2>Estude aqui</h2>
      <ul className="cert-lesson-links">
        {week.lessons.map((id) => (
          <li key={id}>
            <a href={certificationHref(cert.id, week.number, id)}>{lessonIndex.get(id)!.title}</a>
            <span>
              {p.read.includes(id) ? 'Leitura registrada' : 'Aula-base com exemplo e exercício'}
            </span>
          </li>
        ))}
      </ul>
      <section className="available-unit">
        <h2>Prática da semana</h2>
        <p>{week.practice}</p>
        <h3>O que produzir</h3>
        <p>{week.evidence}</p>
        <p className="scope-note">
          Identifique o ambiente: caso interno, simulação ou execução real. A aplicação não executa
          o laboratório e não aprova texto por tamanho ou palavras-chave.
        </p>
      </section>
      <details className="week-row">
        <summary>Distribuir o estudo pelos sete dias</summary>
        <ol>
          <li>Leia as aulas-base e explique o objetivo com suas palavras.</li>
          <li>Refaça os exemplos sem abrir a conclusão; compare depois.</li>
          <li>Responda os casos de compreensão e anote por que as alternativas falham.</li>
          <li>Prepare a prática: topologia, ferramentas, pré-requisitos e recuperação.</li>
          <li>Execute a primeira versão ou modele o caso; guarde observações, erros e limites.</li>
          <li>Consolide a prática indicada acima e faça os testes positivos e negativos.</li>
          <li>Revise os erros em outra situação e planeje o que precisa retomar.</li>
        </ol>
        <p>
          Esse ritmo é uma sugestão. Uma semana avançada pode exigir mais tempo; não há liberação
          automática por calendário.
        </p>
      </details>
      <section className="cert-scope">
        <h2>Aprofundamento ainda necessário</h2>
        <p>{week.gap}</p>
      </section>
      <section className="runbook-editor">
        <h2>Seu caderno da semana</h2>
        <p>
          Anotação autodeclarada, salva na mesma cópia das demais unidades. Não inclua senhas,
          tokens ou dados privados.
        </p>
        <label htmlFor="week-note">
          Observações, raciocínio, erros e próximos testes
          <textarea
            id="week-note"
            rows={7}
            maxLength={8192}
            value={note}
            onChange={(e) => {
              try {
                store.updateCertifications((current) => saveNote(current, key, e.target.value));
                setError('');
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Não foi possível registrar.');
              }
            }}
          />
        </label>
        <p className="scope-note">
          {note.length}/8192 caracteres · conteúdo não avaliado automaticamente.
        </p>
        <button
          onClick={() =>
            download(
              `infrasec-${cert.id}-semana-${week.number}.md`,
              `# ${cert.title} — Semana ${week.number}\n\n${week.title}\n\nObjetivo: ${week.objective}\n\nPrática: ${week.practice}\n\nEvidência proposta: ${week.evidence}\n\nOrigem: anotação autodeclarada; sem aprovação automática.\n\n${note}\n`,
              'text/markdown;charset=utf-8',
            )
          }
        >
          Baixar meu caderno
        </button>
        {error && <p role="alert">{error}</p>}
      </section>
      <WeekNavigation cert={cert} week={week} />
    </article>
  );
}

function Check({
  lesson,
  store,
  recoveryHref,
}: {
  lesson: StudyLesson;
  store: LearningStore;
  recoveryHref: string;
}) {
  const previous = store.envelope.certifications?.attempts
    .filter((a) => a.lessonId === lesson.id && a.lessonVersion === lesson.version)
    .at(-1);
  const [answer, setAnswer] = useState(previous?.answer || '');
  const [submitted, setSubmitted] = useState(Boolean(previous));
  const [id, setId] = useState(() => crypto.randomUUID());
  const [error, setError] = useState('');
  return (
    <section className="cert-check" aria-label="Exercício de compreensão">
      <h2>Decida antes de ver a explicação</h2>
      <p className="scope-note">
        Compreensão com consulta aberta · caso finito, sem nota de prontidão.
      </p>
      <Options
        questionId={`cert-${lesson.id}`}
        question={lesson.question}
        value={answer}
        onChange={setAnswer}
        disabled={submitted}
      />
      {!submitted ? (
        <button
          className="primary"
          disabled={!answer}
          onClick={() => {
            try {
              store.updateCertifications((p) => submitComprehension(p, lesson.id, answer, id));
              setSubmitted(true);
              setError('');
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Não foi possível registrar resposta.');
            }
          }}
        >
          Conferir meu raciocínio
        </button>
      ) : (
        <>
          <Correction
            questionId={`cert-${lesson.id}`}
            question={lesson.question}
            answer={answer}
            recoveryHref={recoveryHref}
            recoveryTarget="cert-recovery"
          />
          <button
            onClick={() => {
              setId(crypto.randomUUID());
              setAnswer('');
              setSubmitted(false);
            }}
          >
            Refazer este caso de compreensão
          </button>
          <p className="scope-note">
            Repetir o mesmo item ajuda a revisar, mas não cria evidência independente de domínio.
          </p>
        </>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}

function Reader({
  cert,
  week,
  lesson,
  store,
}: {
  cert: Certification;
  week: StudyWeek;
  lesson: StudyLesson;
  store: LearningStore;
}) {
  const [showConclusion, setShowConclusion] = useState(false);
  const p = store.envelope.certifications || initialCertifications();
  const index = week.lessons.indexOf(lesson.id);
  const next = week.lessons[index + 1];
  return (
    <article className="lesson cert-reader">
      <a href={certificationHref(cert.id, week.number)}>
        ← Semana {week.number} · {week.title}
      </a>
      <h1 tabIndex={-1}>{lesson.title}</h1>
      <p className="platform-lead">{week.objective}</p>
      <p className="scope-note">
        {cert.title} · aula-base compartilhada · versão {lesson.version}
      </p>
      <section>
        <h2>Entenda o mecanismo</h2>
        {lesson.paragraphs.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </section>
      {lesson.id === 'subnetting' && <MaskDemo />}
      {lesson.id === 'connectivity' && <FlowDiagram />}
      {['fort-policy', 'firewall'].includes(lesson.id) && <PolicyWalkthrough />}
      <section className="worked-example">
        <h2>Exemplo resolvido</h2>
        <pre>{lesson.example.data}</pre>
        <p>Antes de abrir: qual conclusão os dados permitem e o que ainda falta verificar?</p>
        <button aria-expanded={showConclusion} onClick={() => setShowConclusion(!showConclusion)}>
          {showConclusion ? 'Ocultar raciocínio do exemplo' : 'Mostrar raciocínio do exemplo'}
        </button>
        {showConclusion && (
          <div className="feedback">
            <ol>
              {lesson.example.reasoning.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ol>
            <p>
              <strong>Conclusão:</strong> {lesson.example.conclusion}
            </p>
          </div>
        )}
      </section>
      <section>
        <h2>Transfira para outra situação</h2>
        <p>{lesson.practice}</p>
      </section>
      <Check
        lesson={lesson}
        store={store}
        recoveryHref={certificationHref(cert.id, week.number, lesson.id)}
      />
      <section id="cert-recovery" tabIndex={-1} className="cert-scope">
        <h2>Se o raciocínio ainda não encaixou</h2>
        <p>{lesson.recovery}</p>
        <p>
          Releia os dados do caso e escreva uma observação, uma hipótese e um teste que as
          diferencie. Compare depois com o exemplo, sem transformar a resposta memorizada em
          aprovação.
        </p>
      </section>
      <label className="read-marker">
        <input
          type="checkbox"
          checked={p.read.includes(lesson.id)}
          onChange={(e) =>
            store.updateCertifications((current) =>
              recordReading(current, lesson.id, e.target.checked),
            )
          }
        />{' '}
        Registrei a leitura desta aula-base
      </label>
      {related[lesson.id] && (
        <section>
          <h2>Aprofundar nas unidades existentes</h2>
          <div className="inline-links">
            {related[lesson.id].map(([route, text]) => (
              <a key={route} href={`#/${route}`}>
                {text}
              </a>
            ))}
          </div>
        </section>
      )}
      <details className="week-row">
        <summary>Origem e referência complementar</summary>
        <p>{lesson.origin}</p>
        <p>
          Ensino e exercício permanecem nesta aplicação. A documentação complementa o estudo e
          permite verificar detalhes específicos do ambiente.
        </p>
        <a href={lesson.source} target="_blank" rel="noopener noreferrer">
          Consultar referência técnica
        </a>
      </details>
      <div className="actions">
        {next ? (
          <a className="button primary" href={certificationHref(cert.id, week.number, next)}>
            Próxima aula-base →
          </a>
        ) : (
          <a className="button primary" href={certificationHref(cert.id, week.number)}>
            Voltar à prática da semana →
          </a>
        )}
        <a href={certificationHref(cert.id)}>Ver roteiro completo</a>
      </div>
    </article>
  );
}

export default function CertificationPage({
  route,
  store,
}: {
  route: string;
  store: LearningStore;
}) {
  useEffect(() => {
    document.querySelector<HTMLElement>('#main h1')?.focus({ preventScroll: true });
  }, [route]);
  const match = certificationRoute(route);
  if (!match) return <Catalog store={store} practice={route === 'certificacoes-pratica'} />;
  if (!match.week) return <Overview cert={match.certification} store={store} />;
  if (!match.lessonId) return <Week cert={match.certification} week={match.week} store={store} />;
  return (
    <Reader
      cert={match.certification}
      week={match.week}
      lesson={lessons.get(match.lessonId)!}
      store={store}
    />
  );
}
