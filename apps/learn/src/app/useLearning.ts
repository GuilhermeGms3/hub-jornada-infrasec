import { useEffect, useRef, useState } from 'react';
import type { Envelope, Progress } from '../domain/types';
import { load, save, STORAGE_KEY } from '../persistence/storage';

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
  function update(change: (p: Progress) => Progress) {
    const current = ref.current;
    const envelope = { ...current.envelope, progress: change(current.envelope.progress) };
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
  return { ...state, update, replace, getProgress: () => ref.current.envelope.progress };
}
export type LearningStore = ReturnType<typeof useLearning>;
