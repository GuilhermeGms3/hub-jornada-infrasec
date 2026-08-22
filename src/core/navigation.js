import { storage } from './storage.js';
import { eventBus } from './events.js';
import { journeyCatalog } from '../data/journey/catalog.js';

const { hubPages, legacyHashAliases } = journeyCatalog;
const pageById = Object.fromEntries(hubPages.map((page) => [page.id, page]));
const pageByHash = Object.fromEntries(hubPages.map((page) => [page.hash, page]));
let activePageId = 'today';
let activateFeatureView = () => {};

export const pages = Object.freeze(hubPages.map(({ id, hash, group, title }) => ({ id, hash, group, title })));

export function configureNavigation(options = {}) {
  activateFeatureView = options.activateFeatureView || (() => {});
}

export function resolveRoute(hash = location.hash.slice(1)) {
  return pageByHash[hash]
    || pageById[legacyHashAliases[hash]]
    || pageById[storage.readRaw(storage.keys.ACTIVE_PAGE, null)]
    || pageById.today;
}

export function activatePage(pageId, scroll = true) {
  const page = pageById[pageId] || pageById.today;
  activePageId = page.id;
  document.querySelectorAll('main > section').forEach((section) => { section.hidden = section.id !== page.section; });
  activateFeatureView(page);
  document.body.classList.toggle('route-focused', Boolean(page.depthTab || page.careerTab));
  document.querySelectorAll('[data-hub-page]').forEach((link) => {
    if (link.dataset.hubPage === page.id) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const pageIndex = hubPages.indexOf(page);
  document.getElementById('hubPageGroup').textContent = page.group;
  document.getElementById('hubPageTitle').textContent = page.title;
  document.getElementById('hubPagePosition').textContent = `Modulo ${pageIndex + 1} de ${hubPages.length}`;
  document.getElementById('previousHubPage').disabled = pageIndex === 0;
  document.getElementById('nextHubPage').disabled = pageIndex === hubPages.length - 1;
  document.body.dataset.hubPage = page.id;
  storage.writeRaw(storage.keys.ACTIVE_PAGE, page.id);
  eventBus.publish(eventBus.events.PAGE_CHANGED, { pageId: page.id });
  if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  return page;
}

export function navigateToPage(pageId, replace = false, scroll = true) {
  const page = pageById[pageId] || pageById.today;
  history[replace ? 'replaceState' : 'pushState'](null, '', `#${page.hash}`);
  return activatePage(page.id, scroll);
}

export function handleHash(scroll = true) {
  return activatePage(resolveRoute().id, scroll);
}

export function getActivePage() {
  return activePageId;
}

export function getPageIndex(pageId = activePageId) {
  return hubPages.findIndex((page) => page.id === pageId);
}

export function getPageAt(index) {
  return hubPages[index] || null;
}
