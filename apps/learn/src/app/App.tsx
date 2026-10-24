import { useEffect, useState } from 'react';
import { lessons } from '../content/lessons';
import { activeRun, validRoute } from '../domain/learning';
import { useLearning } from './useLearning';
import { LessonReader } from '../features/LessonReader';
import { Practice } from '../features/Practice';
import { Assessment } from '../features/Assessment';
import { Recovery } from '../features/Recovery';
import { ProgressView } from '../features/ProgressView';
import { BackupPanel } from '../components/BackupPanel';

const tools = [
  ['pratica', 'Laboratório guiado'],
  ['avaliacao', 'Avaliação independente'],
  ['recuperacao', 'Recuperar conceitos'],
  ['revisao', 'Revisão posterior'],
  ['progresso', 'Evidências e histórico'],
];
function hashRoute() {
  return location.hash.replace(/^#redes\/r01\/?/, '').replace(/^#\/?/, '');
}
export function App({
  embedded = false,
  rootNode = document,
}: {
  embedded?: boolean;
  rootNode?: Document | ShadowRoot;
}) {
  const store = useLearning();
  const [route, setRoute] = useState(() =>
    validRoute(hashRoute()) ? hashRoute() : store.envelope.progress.route,
  );
  const [invalid, setInvalid] = useState(Boolean(hashRoute() && !validRoute(hashRoute())));
  const [menu, setMenu] = useState(false);
  const [backup, setBackup] = useState(false);
  useEffect(() => {
    function navigate() {
      if (embedded && !location.hash.startsWith('#redes/r01')) {
        store.update((p) => ({
          ...p,
          runs: p.runs.map((r) => (r.id === activeRun(p)?.id ? { ...r, consulted: true } : r)),
        }));
        return;
      }
      const candidate = hashRoute();
      const next = validRoute(candidate)
        ? candidate
        : embedded && !candidate
          ? store.getProgress().route
          : 'aula/redes';
      setInvalid(Boolean(candidate && !validRoute(candidate)));
      setRoute(next);
      setMenu(false);
      store.update((p) => {
        const active = activeRun(p);
        const consulted = active && next !== (active.kind === 'review' ? 'revisao' : 'avaliacao');
        return {
          ...p,
          route: next,
          runs: consulted
            ? p.runs.map((r) => (r.id === active.id ? { ...r, consulted: true } : r))
            : p.runs,
        };
      });
    }
    if (!location.hash) history.replaceState(null, '', `#/${route}`);
    else if (route !== store.envelope.progress.route) navigate();
    if (!embedded) window.addEventListener('hashchange', navigate);
    if (embedded) window.addEventListener('infrasec:page-changed', navigate);
    return () => {
      window.removeEventListener('hashchange', navigate);
      window.removeEventListener('infrasec:page-changed', navigate);
    };
    // The store exposes event-driven operations backed by a current-state ref.
    // Routing subscribes once; no state snapshot is read by the event callback.
  }, []);
  useEffect(() => {
    rootNode.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [route, rootNode]);
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          rootNode.querySelector<HTMLElement>('#main')?.focus();
        }}
      >
        Pular para o conteúdo
      </a>
      <header className="topbar">
        <a href="#/aula/redes" className="brand" aria-label="InfraSec, início da unidade">
          Infra<span>Sec</span>
        </a>
        <span className="course-name">Redes do zero</span>
        <div className="header-actions">
          <a href="#/progresso">Progresso</a>
          <button
            onClick={() => setBackup((b) => !b)}
            aria-expanded={backup}
            aria-controls="backup-region"
          >
            Salvar cópia
          </button>
        </div>
      </header>
      <button
        className="mobile-menu"
        onClick={() => setMenu((m) => !m)}
        aria-expanded={menu}
        aria-controls="course-nav"
      >
        {menu ? 'Fechar' : 'Abrir'} sumário da unidade
      </button>
      <aside className={`sidebar ${menu ? 'expanded' : ''}`} id="course-nav">
        <h2>Como um computador acessa um site</h2>
        <p>Fundamentos de redes · NET-R01</p>
        <nav aria-label="Lições da unidade">
          <ol>
            {lessons.map((l, index) => (
              <li key={l.id}>
                <a
                  href={`#/aula/${l.id}`}
                  aria-current={route === `aula/${l.id}` ? 'page' : undefined}
                >
                  <span className="lesson-number">{String(index + 1).padStart(2, '0')}</span>
                  <span>{l.title}</span>
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
        <nav className="practice-nav" aria-label="Praticar e acompanhar">
          {tools.map(([id, title]) => (
            <a key={id} href={`#/${id}`} aria-current={route === id ? 'page' : undefined}>
              {title}
            </a>
          ))}
        </nav>
        <p className="sidebar-note">
          Aprenda aqui. Pratique aqui.
          <br />
          Avance com evidências.
        </p>
      </aside>
      <main id="main" tabIndex={-1}>
        <div className="main-inner">
          <p className={`save-state ${store.error ? 'unsaved' : ''}`} role="status">
            {store.message}
          </p>
          {store.error && (
            <aside className="feedback negative" role="alert">
              <strong>{store.error}</strong>
              <p>
                Os dados antigos não foram sobrescritos. Você pode estudar nesta sessão, baixar uma
                cópia ou recarregar.
              </p>
              <button onClick={() => setBackup(true)}>Abrir cópias e recuperação</button>
              <button onClick={() => location.reload()}>Recarregar</button>
            </aside>
          )}
          {invalid && (
            <p role="alert">
              Esse endereço não pertence à unidade. A primeira aula foi aberta; seu histórico foi
              preservado.
            </p>
          )}
          <div id="backup-region">{backup && <BackupPanel store={store} />}</div>
          {route.startsWith('aula/') && (
            <LessonReader key={route} lessonId={route.slice(5)} store={store} />
          )}
          {route === 'pratica' && <Practice store={store} />}
          {route === 'avaliacao' && (
            <Assessment key="independent" store={store} kind="independent" />
          )}
          {route === 'revisao' && <Assessment key="review" store={store} kind="review" />}
          {route === 'recuperacao' && <Recovery store={store} />}
          {route === 'progresso' && <ProgressView store={store} />}
          <footer className="page-footer">
            InfraSec · NET-R01, versão 1.0 · Estudo pessoal local
            <br />
            Base para continuar aprendendo redes. Não é curso completo de CCNA ou exame
            supervisionado.
          </footer>
        </div>
      </main>
    </>
  );
}
