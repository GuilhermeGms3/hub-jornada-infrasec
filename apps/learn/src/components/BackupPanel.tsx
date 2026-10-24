import { useState } from 'react';
import type { LearningStore } from '../app/useLearning';
import { exportBackup, importBackup, MAX_BYTES, parseEnvelope } from '../persistence/storage';
import type { Envelope } from '../domain/types';

export function download(name: string, text: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function BackupPanel({ store }: { store: LearningStore }) {
  const [candidate, setCandidate] = useState<Envelope | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function exportCurrent() {
    try {
      setBusy(true);
      download('infrasec-progresso.json', await exportBackup(store.envelope));
      setError('');
    } catch {
      setError('Não foi possível gerar a cópia. Mantenha esta sessão aberta e tente novamente.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="backup-panel" aria-label="Cópias e recuperação">
      <h2>Guarde uma cópia do seu estudo</h2>
      <p>
        O progresso fica neste navegador. Limpar dados ou trocar de dispositivo pode removê-lo.
        Exporte uma cópia para guardar; não há conta ou sincronização automática.
      </p>
      <div className="actions">
        <button disabled={busy} onClick={exportCurrent}>
          Baixar cópia desta sessão
        </button>
        {store.raw && (
          <button onClick={() => download('infrasec-original-preservado.json', store.raw!)}>
            Baixar dados originais preservados
          </button>
        )}
      </div>
      <label>
        Importar cópia de progresso
        <input
          type="file"
          accept="application/json,.json"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            setCandidate(null);
            if (!file) return;
            setBusy(true);
            try {
              if (file.size > MAX_BYTES) throw new Error('A cópia deve ter até 5 MiB.');
              setCandidate(await importBackup(await file.text()));
              setError('');
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Não foi possível ler a cópia.');
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {candidate && (
        <div className="feedback">
          <p>
            Cópia válida: {candidate.progress.read.length} leituras,{' '}
            {candidate.progress.attempts.length} respostas e {candidate.progress.labAttempts.length}{' '}
            casos guiados da R01; {candidate.coursework?.attempts.length || 0} respostas das
            unidades novas. Importar substitui o progresso de TODAS as unidades desta aplicação,
            inclusive dados novos ausentes numa cópia antiga; não mescla históricos. O checksum
            verifica corrupção acidental, não autentica resultados.
          </p>
          <button
            className="primary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                if (store.raw) {
                  try {
                    download(
                      'infrasec-antes-da-importacao.json',
                      await exportBackup(parseEnvelope(store.raw)),
                    );
                  } catch {
                    download('infrasec-original-bruto-preservado.json', store.raw);
                  }
                } else
                  download('infrasec-antes-da-importacao.json', await exportBackup(store.envelope));
                store.replace(candidate);
                setCandidate(null);
                setError('');
                location.hash = `#/${candidate.coursework?.route || candidate.progress.route}`;
              } catch (e) {
                setError(
                  e instanceof Error
                    ? e.message
                    : 'Não foi possível salvar. Os dados anteriores permanecem no dispositivo.',
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            Baixar estado anterior e substituir
          </button>
          <button onClick={() => setCandidate(null)}>Cancelar importação</button>
        </div>
      )}
      {error && (
        <p className="feedback negative" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
