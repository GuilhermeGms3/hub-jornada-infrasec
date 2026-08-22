  const events = Object.freeze({
    PAGE_CHANGED: 'infrasec:page-changed',
    COMPETENCY_CHANGED: 'infrasec:competency-changed',
    DELIVERABLES_CHANGED: 'infrasec:deliverables-changed'
  });
  const officialNames = new Set(Object.values(events));

  function assertOfficialEvent(eventName) {
    if (!officialNames.has(eventName)) {
      throw new TypeError(`Evento interno desconhecido: ${eventName}`);
    }
  }

  function publish(eventName, detail) {
    assertOfficialEvent(eventName);
    const event = arguments.length > 1
      ? new CustomEvent(eventName, { detail })
      : new CustomEvent(eventName);
    return window.dispatchEvent(event);
  }

  function subscribe(eventName, handler) {
    assertOfficialEvent(eventName);
    window.addEventListener(eventName, handler);
    return handler;
  }

  function unsubscribe(eventName, handler) {
    assertOfficialEvent(eventName);
    window.removeEventListener(eventName, handler);
  }

  export const eventBus = Object.freeze({
    events,
    publish,
    subscribe,
    unsubscribe
  });
