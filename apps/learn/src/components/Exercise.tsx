import { useState } from 'react';
import { questionById } from '../content/questions';
import type { LearningStore } from '../app/useLearning';
import type { Mode, Question } from '../domain/types';
import { makeAttempt } from '../domain/learning';

export function Options({
  questionId,
  value,
  onChange,
  disabled = false,
  question,
}: {
  questionId: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  question?: Pick<Question, 'prompt' | 'context' | 'options' | 'correct'>;
}) {
  const q = question || questionById[questionId];
  return (
    <fieldset disabled={disabled}>
      <legend>{q.prompt}</legend>
      {q.context && <pre>{q.context}</pre>}
      {q.options.map((option) => (
        <label className={`option ${value === option.id ? 'selected' : ''}`} key={option.id}>
          <input
            type="radio"
            name={questionId}
            value={option.id}
            checked={value === option.id}
            onChange={() => onChange(option.id)}
          />
          <span>{option.text}</span>
        </label>
      ))}
    </fieldset>
  );
}
export function Correction({
  questionId,
  answer,
  question,
  recoveryHref = '#/recuperacao',
}: {
  questionId: string;
  answer: string;
  question?: Pick<Question, 'prompt' | 'context' | 'options' | 'correct'>;
  recoveryHref?: string;
}) {
  const q = question || questionById[questionId];
  const correct = q.correct === answer && q.options.some((o) => o.id === answer);
  return (
    <div className={`feedback ${correct ? 'positive' : 'negative'}`} role="status">
      <strong>{correct ? 'Resposta correta neste exercício.' : 'Vamos rever o raciocínio.'}</strong>
      <p>{q.options.find((o) => o.id === answer)?.explanation}</p>
      {!correct && (
        <>
          <p>
            <strong>Resposta sustentada:</strong> {q.options.find((o) => o.id === q.correct)?.text}
          </p>
          <p>{q.options.find((o) => o.id === q.correct)?.explanation}</p>
          <a href={recoveryHref}>Abrir recuperação contextual</a>
        </>
      )}
      <details>
        <summary>Por que cada alternativa?</summary>
        <ul>
          {q.options.map((o) => (
            <li key={o.id}>
              <strong>{o.text}</strong> {o.explanation}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
export function Exercise({
  questionId,
  mode,
  store,
}: {
  questionId: string;
  mode: Mode;
  store: LearningStore;
}) {
  const q = questionById[questionId];
  const p = store.envelope.progress;
  const last = p.attempts.filter((a) => a.questionId === questionId && a.mode === mode).at(-1);
  const [show, setShow] = useState(Boolean(last));
  const draft = p.drafts[questionId] || { answer: '', hintLevel: 0 };
  const change = (patch: Partial<typeof draft>) =>
    store.update((p) => ({ ...p, drafts: { ...p.drafts, [questionId]: { ...draft, ...patch } } }));
  return (
    <section className="exercise">
      <p className="section-label">
        {mode === 'remediation' ? 'Verifique com outra situação' : 'Cheque sua compreensão'} ·{' '}
        {q.objective}
      </p>
      <Options
        questionId={questionId}
        value={draft.answer}
        disabled={show}
        onChange={(answer) => change({ answer })}
      />
      {!show && (
        <div className="actions">
          <button
            className="primary"
            disabled={!draft.answer}
            onClick={() => {
              store.update((p) => ({
                ...p,
                attempts: [
                  ...p.attempts,
                  makeAttempt(questionId, draft.answer, mode, draft.hintLevel),
                ],
              }));
              setShow(true);
            }}
          >
            Verificar resposta
          </button>
          <button
            disabled={draft.hintLevel === 4}
            onClick={() => change({ hintLevel: Math.min(4, draft.hintLevel + 1) })}
          >
            Pedir pista ({draft.hintLevel}/4)
          </button>
        </div>
      )}
      {draft.hintLevel > 0 && (
        <p className="hint" role="status">
          Pista {draft.hintLevel}: {q.hints[draft.hintLevel - 1]} Ajuda registrada; isto é prática.
        </p>
      )}
      {show && last && (
        <>
          <Correction questionId={questionId} answer={last.answer} />
          <button
            onClick={() => {
              change({ answer: '', hintLevel: 0 });
              setShow(false);
            }}
          >
            Repetir para estudar
          </button>
        </>
      )}
      <p className="caption">
        Esta atividade registra compreensão/prática; não aprova sozinha uma competência.
      </p>
    </section>
  );
}
