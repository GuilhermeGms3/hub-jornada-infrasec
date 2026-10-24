import { useEffect, useState } from 'react';
import { activeRun, validRoute } from '../domain/learning';
import { useLearning } from './useLearning';
import { BackupPanel } from '../components/BackupPanel';
import { UnitPlayer } from '../platform/UnitPlayer';
import { Home, Networks, Journey, Area, Level } from '../platform/Pages';
import { canonicalRoute, groups, groupNames, pages } from '../platform/catalog';
import { Icon } from '../platform/Icons';

const readRoute = () => canonicalRoute(location.hash);
export function App() {
  const store = useLearning();
  const [route, setRoute] = useState(() =>
    readRoute() === 'redes/r01' ? store.envelope.progress.route : readRoute(),
  );
  const [menu, setMenu] = useState(false);
  const [backup, setBackup] = useState(false);
  const unit = validRoute(route);
  const page = pages.find((p) => p.hash === route);
  const known = unit || route === 'redes' || Boolean(page);
  const group =
    unit || route === 'redes' ? 'Redes' : page ? groupNames[page.group] || page.group : 'Começar';
  const title = unit ? 'NET-R01' : route === 'redes' ? 'Formação de redes' : page?.name || 'Hoje';
  useEffect(() => {
    function navigate() {
      const candidate = readRoute();
      const next = candidate === 'redes/r01' ? store.getProgress().route : candidate;
      setRoute(next);
      setMenu(false);
      store.update((p) => {
        const active = activeRun(p);
        const consulted = active && next !== (active.kind === 'review' ? 'revisao' : 'avaliacao');
        return {
          ...p,
          route: validRoute(next) ? next : p.route,
          runs: consulted
            ? p.runs.map((r) => (r.id === active.id ? { ...r, consulted: true } : r))
            : p.runs,
        };
      });
    }
    if (!location.hash) history.replaceState(null, '', '#/hoje');
    else navigate();
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
    // Event operations use the hook's current-state ref, not a captured progress snapshot.
  }, []);
  useEffect(() => {
    document.querySelector<HTMLElement>('#main h1')?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    document.title = `InfraSec · ${title}`;
  }, [route, title]);

  return (
    <div className="platform-app">
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Pular para o conteúdo
      </a>
      <header className="mobile-platform-header">
        <a href="#/hoje" className="platform-brand">
          InfraSec
        </a>
        <button onClick={() => setMenu(!menu)} aria-expanded={menu} aria-controls="global-nav">
          {menu ? 'Fechar navegação' : 'Abrir navegação'}
        </button>
      </header>
      <aside className={`global-sidebar ${menu ? 'is-open' : ''}`} id="global-nav">
        <a href="#/hoje" className="platform-brand">
          InfraSec
        </a>
        <p className="brand-subtitle">Estudo com contexto</p>
        <nav aria-label="Navegação global">
          {groups.map((name, index) => (
            <details key={name} className="global-group" open={index < 2 || name === group}>
              <summary>
                <Icon kind={index} />
                {name}
              </summary>
              <div>
                {pages
                  .filter((p) => (groupNames[p.group] || p.group) === name)
                  .map((p) => {
                    const target = p.id === 'network-practice' ? 'redes' : p.hash;
                    const selected = target === route || (unit && target === 'redes');
                    return (
                      <a
                        key={p.id}
                        href={`#/${target}`}
                        aria-current={selected ? 'page' : undefined}
                      >
                        <Icon kind={p.position - 1} />
                        <span>{p.id === 'network-practice' ? 'Formação de redes' : p.name}</span>
                      </a>
                    );
                  })}
              </div>
            </details>
          ))}
        </nav>
        <p className="global-footnote">
          Uma formação por etapas.
          <br />
          Evidências no contexto certo.
        </p>
      </aside>
      <div className="platform-workspace">
        <header className="platform-bar">
          <span>
            {group} <span aria-hidden="true">/</span> <strong>{title}</strong>
          </span>
          <button
            onClick={() => setBackup(!backup)}
            aria-expanded={backup}
            aria-controls="backup-region"
          >
            <Icon kind={5} />
            Progresso neste dispositivo
          </button>
        </header>
        <main id="main" tabIndex={-1} className={unit ? 'platform-main in-unit' : 'platform-main'}>
          <div className={`storage-message ${store.error ? 'has-error' : ''}`} role="status">
            {store.message}
          </div>
          {store.error && (
            <aside className="feedback negative" role="alert">
              <strong>{store.error}</strong>
              <p>
                Os dados antigos não foram sobrescritos. Você pode estudar em memória e exportar
                esta sessão.
              </p>
              <button onClick={() => setBackup(true)}>Abrir cópias e recuperação</button>
            </aside>
          )}
          <div id="backup-region">{backup && <BackupPanel store={store} />}</div>
          {!known && (
            <p role="alert">
              Esse endereço não pertence à plataforma. Hoje foi aberto; seu histórico foi
              preservado.
            </p>
          )}
          {unit ? (
            <>
              <div className="unit-save">
                <button onClick={() => setBackup(!backup)}>Salvar cópia</button>
              </div>
              <UnitPlayer route={route} store={store} />
            </>
          ) : route === 'redes' ? (
            <Networks store={store} />
          ) : route === 'meu-nivel' ? (
            <Level store={store} />
          ) : ['jornada', 'visao-semanal', 'tarefas-jornada', 'semana-1'].includes(route) ? (
            <Journey mode={route} />
          ) : route === 'hoje' || !known ? (
            <Home store={store} />
          ) : (
            <Area route={route} />
          )}
        </main>
      </div>
    </div>
  );
}
