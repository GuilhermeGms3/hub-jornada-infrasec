// The Hub owns global navigation; the player owns only the redes/r01 namespace.
export function initializeLearning() {
  let pending;
  const host = document.getElementById('net-r01-player');
  async function load() {
    if (!/^#redes\/r01(?:\/|$)/.test(location.hash) || pending) return;
    pending = import('../../../modules/net-r01/player.js');
    try {
      const player = await pending;
      host.replaceChildren();
      player.mount(host);
    } catch (error) {
      pending = null;
      const message = document.createElement('p');
      message.setAttribute('role', 'alert');
      message.textContent = 'Não foi possível carregar a unidade. Seu progresso foi preservado.';
      const retry = document.createElement('button');
      retry.textContent = 'Tentar novamente';
      // A failed ESM import can remain cached for this document; reload permits a real retry.
      retry.addEventListener('click', () => location.reload());
      host.replaceChildren(message, retry);
      console.error('Falha ao carregar NET-R01', error);
    }
  }
  window.addEventListener('hashchange', load);
  window.addEventListener('infrasec:page-changed', load);
  load();
}
