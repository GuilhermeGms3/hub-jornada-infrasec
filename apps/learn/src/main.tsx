import { Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles.css';
import './platform/platform.css';

class LearningBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="fatal">
          <h1>Não foi possível abrir esta tela.</h1>
          <p>
            Seu progresso no dispositivo não foi apagado. Recarregue para tentar recuperar a sessão.
          </p>
          <button onClick={() => location.reload()}>Recarregar aplicação</button>
        </main>
      );
    return this.props.children;
  }
}
createRoot(document.getElementById('root')!).render(
  <LearningBoundary>
    <App />
  </LearningBoundary>,
);
