import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import styles from './styles.css?inline';
import embeddedStyles from './embedded.css?inline';

// Shadow DOM isolates the existing Hub CSS without a second document or iframe.
export function mount(host: HTMLElement) {
  if (host.shadowRoot) return;
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = styles.replace(':root', ':host') + embeddedStyles;
  const root = document.createElement('div');
  shadow.append(style, root);
  root.addEventListener('click', (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#/"]');
    if (!link || event.defaultPrevented || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    location.hash = `redes/r01/${link.hash.slice(2)}`;
  });
  // Also preserve native open-in-new-tab and copy-link semantics.
  const rewriteLinks = () =>
    root.querySelectorAll<HTMLAnchorElement>('a[href^="#/"]').forEach((a) => {
      a.href = `#redes/r01/${a.hash.slice(2)}`;
    });
  new MutationObserver(rewriteLinks).observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['href'],
  });
  createRoot(root).render(<App embedded rootNode={shadow} />);
}
