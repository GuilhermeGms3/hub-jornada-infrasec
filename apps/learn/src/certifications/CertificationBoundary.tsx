import { Component, type ReactNode } from 'react';
export class CertificationBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <section role="alert">
          <h1 tabIndex={-1}>Não foi possível abrir este conteúdo</h1>
          <p>
            Seu progresso permanece no armazenamento. Recarregue para tentar buscar os arquivos
            novamente.
          </p>
          <button onClick={() => location.reload()}>Recarregar conteúdo</button>
          <a href="#/hoje">Voltar ao início</a>
        </section>
      );
    return this.props.children;
  }
}
