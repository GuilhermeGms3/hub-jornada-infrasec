import { useEffect, useRef, useState } from 'react';
import type { Envelope, Progress } from '../domain/types';
import { load, save, STORAGE_KEY } from '../persistence/storage';
import type { Coursework } from '../coursework/types';
import { initialCoursework, visitCoursework } from '../coursework/model';
import { courseRoute } from '../coursework/catalog';
import { validRoute } from '../domain/learning';

const store = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
};
export function useLearning() {
  const [state, setState] = useState(() => {
    const loaded = load(store);
    return {
      ...loaded,
      locked: Boolean(loaded.error),
      message: loaded.error
        ? 'Progresso original preservado; estudo disponível somente nesta sessão.'
        : loaded.raw
          ? 'Progresso salvo neste navegador.'
          : 'Seu progresso será salvo neste navegador.',
    };
  });
  const ref = useRef(state);
  function publish(next: typeof state) {
    ref.current = next;
    setState(next);
  }
  function write(envelope: Envelope) {
    const current = ref.current;
    if (current.locked) {
      publish({ ...current, envelope });
      return;
    }
    try {
      const saved = save(store, envelope, current.envelope.revision);
      publish({
        envelope: saved,
        error: '',
        raw: JSON.stringify(saved),
        locked: false,
        message: 'Progresso salvo neste navegador.',
      });
    } catch (e) {
      publish({
        ...current,
        envelope,
        locked: true,
        error: e instanceof Error ? e.message : 'Falha ao salvar.',
        message: 'Não salvo no dispositivo. Exporte esta sessão para preservá-la.',
      });
    }
  }
  function update(change: (p: Progress) => Progress) {
    const envelope = ref.current.envelope;
    write({ ...envelope, progress: change(envelope.progress) });
  }
  function updateCoursework(change: (c: Coursework) => Coursework) {
    const envelope = ref.current.envelope;
    write({ ...envelope, coursework: change(envelope.coursework || initialCoursework()) });
  }
  function visit(route: string) {
    const envelope = ref.current.envelope;
    const p = envelope.progress;
    const c = envelope.coursework || (courseRoute(route) ? initialCoursework() : undefined);
    write({
      ...envelope,
      progress: {
        ...p,
        route: validRoute(route) ? route : p.route,
        runs: p.runs.map((r) =>
          r.status === 'active' && route !== (r.kind === 'review' ? 'revisao' : 'avaliacao')
            ? { ...r, consulted: true }
            : r,
        ),
      },
      ...(c ? { coursework: visitCoursework(c, route) } : {}),
    });
  }
  function replace(candidate: Envelope) {
    const current = ref.current;
    const observedRaw = store.getItem(STORAGE_KEY);
    if (observedRaw !== current.raw)
      throw new Error('Outra aba alterou os dados. Recarregue antes de substituir.');
    const envelope = {
      ...candidate,
      revision: current.envelope.revision + 1,
      savedAt: new Date().toISOString(),
    };
    store.setItem(STORAGE_KEY, JSON.stringify(envelope));
    publish({
      envelope,
      error: '',
      raw: JSON.stringify(envelope),
      locked: false,
      message: 'Cópia importada e salva neste navegador.',
    });
  }
  useEffect(() => {
    function changed(e: StorageEvent) {
      if (e.key === STORAGE_KEY || e.key === null) {
        const current = ref.current;
        publish({
          ...current,
          locked: true,
          error: 'Outra aba alterou o armazenamento. Esta sessão foi preservada em memória.',
          message: 'Exporte esta sessão ou recarregue para usar os dados da outra aba.',
        });
      }
    }
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, []);
  return {
    ...state,
    update,
    updateCoursework,
    visit,
    replace,
    getProgress: () => ref.current.envelope.progress,
  };
}
export type LearningStore = ReturnType<typeof useLearning>;
