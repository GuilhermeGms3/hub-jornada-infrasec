import { useState } from 'react';
import type { LearningStore } from '../app/useLearning';
import {
  commandLabels,
  diagnoses,
  gradeDiagnosis,
  scenarioById,
  scenarios,
  simulate,
  type Command,
} from '../domain/simulator';

export function Practice({ store }: { store: LearningStore }) {
  const p = store.envelope.progress;
  const sim = p.simulator;
  const scenario = scenarioById[sim.scenarioId];
  const [warning, setWarning] = useState('');
  const last = p.labAttempts.at(-1);
  const submitted =
    last?.scenarioId === sim.scenarioId &&
    last.answer === sim.answer &&
    JSON.stringify(last.commands) === JSON.stringify(sim.commands);
  const result = submitted ? gradeDiagnosis(scenario, sim.commands, sim.answer) : null;
  function command(value: Command) {
    setWarning('');
    store.update((p) => ({
      ...p,
      simulator: { ...p.simulator, commands: [...new Set([...p.simulator.commands, value])] },
    }));
  }
  return (
    <article>
      <p className="section-label">Laboratório · prática guiada</p>
      <h1 tabIndex={-1}>Investigue antes de concluir</h1>
      <p className="lead">
        Escolha um teste, leia a evidência e decida qual hipótese ela sustenta.
      </p>
      <aside className="concept-note">
        <p>
          Simulação didática determinística. Nenhum comando é executado no computador ou na rede
          real. Endereços e outputs são sintéticos. Ajuda e acertos aqui contam como prática, não
          como desempenho independente.
        </p>
      </aside>
      <label htmlFor="practice-scenario">Cenário</label>
      <select
        id="practice-scenario"
        value={sim.scenarioId}
        onChange={(e) => {
          const scenarioId = e.target.value;
          setWarning('');
          store.update((p) => ({
            ...p,
            simulator: { scenarioId, commands: [], answer: '', hintLevel: 0 },
          }));
        }}
      >
        {scenarios.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
        ))}
      </select>
      <h2>{scenario.title}</h2>
      <p>{scenario.problem}</p>
      <p>
        Modelo: uma interface IPv4 Ethernet, DNS local 192.168.10.10, portal remoto 203.0.113.40 e
        HTTPS sobre TCP. Sem VPN, proxy ou rota adicional oculta.
      </p>
      <div className="command-grid" aria-label="Escolher um teste">
        {(Object.keys(commandLabels) as Command[]).map((c) => (
          <button key={c} onClick={() => command(c)}>
            {commandLabels[c]}{' '}
            {sim.commands.includes(c) && <span aria-label="já observado">✓</span>}
          </button>
        ))}
      </div>
      <section className="transcript" aria-label="Evidências coletadas" aria-live="polite">
        <h3>Evidências coletadas</h3>
        {!sim.commands.length && (
          <p>Comece pela configuração ou por um teste que responda à sua hipótese.</p>
        )}
        {sim.commands.map((c) => (
          <div key={c}>
            <h4>{commandLabels[c as Command]}</h4>
            <pre>
              <code>{simulate(scenario, c as Command)}</code>
            </pre>
          </div>
        ))}
      </section>
      <div className="actions">
        <button
          disabled={sim.hintLevel === 4}
          onClick={() =>
            store.update((p) => ({ ...p, simulator: { ...sim, hintLevel: sim.hintLevel + 1 } }))
          }
        >
          Pedir pista ({sim.hintLevel}/4)
        </button>
        <button
          onClick={() => {
            setWarning('');
            store.update((p) => ({
              ...p,
              simulator: { ...sim, commands: [], answer: '', hintLevel: 0 },
            }));
          }}
        >
          Recomeçar coleta
        </button>
      </div>
      {sim.hintLevel > 0 && (
        <p className="hint" role="status">
          {scenario.hints[sim.hintLevel - 1]} Ajuda registrada no laboratório.
        </p>
      )}
      <fieldset>
        <legend>Qual conclusão é mais sustentada?</legend>
        {diagnoses.map(([id, label]) => (
          <label className="option" key={id}>
            <input
              type="radio"
              name="diagnosis"
              value={id}
              checked={sim.answer === id}
              onChange={() => store.update((p) => ({ ...p, simulator: { ...sim, answer: id } }))}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
      <button
        className="primary"
        disabled={!sim.answer}
        onClick={() => {
          const result = gradeDiagnosis(scenario, sim.commands, sim.answer);
          if (result.missing.length) {
            setWarning(
              `Ainda faltam evidências para encerrar este caso: ${result.missing.map((c) => commandLabels[c]).join(', ')}.`,
            );
            return;
          }
          setWarning('');
          store.update((p) => ({
            ...p,
            labAttempts: [
              ...p.labAttempts,
              {
                id: crypto.randomUUID(),
                scenarioId: sim.scenarioId,
                commands: [...sim.commands],
                answer: sim.answer,
                hintLevel: sim.hintLevel,
                at: new Date().toISOString(),
              },
            ],
          }));
        }}
      >
        Verificar diagnóstico
      </button>
      {warning && (
        <p role="alert" className="feedback negative">
          {warning}
        </p>
      )}
      {result && (
        <div className={`feedback ${result.correct ? 'positive' : 'negative'}`} role="status">
          <strong>
            {result.correct
              ? 'Diagnóstico sustentado neste cenário.'
              : 'A conclusão não acompanha todas as evidências.'}
          </strong>
          <p>{result.explanation}</p>
          <p>
            Registro de prática guiada, com {sim.hintLevel} nível(is) de ajuda. Sem declaração de
            execução real.
          </p>
          <a href="#/recuperacao">Rever os conceitos envolvidos</a>
        </div>
      )}
      <nav className="lesson-navigation">
        <a href="#/aula/diagnostico">Voltar à explicação dos testes</a>
        <a className="button primary" href="#/avaliacao">
          Resolver um caso independente →
        </a>
      </nav>
    </article>
  );
}
