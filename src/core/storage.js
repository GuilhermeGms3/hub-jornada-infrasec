  const keys = Object.freeze({
    TASK_PROGRESS: 'infrasec-task-progress',
    CURRENT_WEEK: 'infrasec-current-week',
    GUIDED_PROGRESS: 'infrasec-guided-progress',
    GUIDED_CURRENT_DAY: 'infrasec-guided-current-day',
    ACTIVE_PAGE: 'infrasec-active-page',
    LEARNER_PROFILE: 'infrasec-learner-profile',
    MASTERY_EXAMS: 'infrasec-mastery-exams',
    ALWAYS_SHOW_FULL_CONTENT: 'infrasec-always-show-full-content',
    LEVEL_ONBOARDING_SHOWN: 'infrasec-level-onboarding-shown',
    DELIVERABLES: 'infrasec-deliverables',
    TICKET_ATTEMPTS: 'infrasec-ticket-attempts',
    LAB_PROGRESS: 'infrasec-lab-progress',
    EXAM_HISTORY: 'infrasec-exam-history',
    READING_QUEUE: 'infrasec-reading-queue',
    INTERVIEW_HISTORY: 'infrasec-interview-history',
    ENGLISH_PRACTICE: 'infrasec-english-practice',
    CAREER_TAB: 'infrasec-career-tab',
    DEEP_JOURNEY: 'infrasec-deep-journey',
    DEEP_INCIDENTS: 'infrasec-deep-incidents',
    DEEP_SOC: 'infrasec-deep-soc',
    DEEP_CLOUD: 'infrasec-deep-cloud',
    DEEP_TERMINAL: 'infrasec-deep-terminal',
    DEEP_CERTS: 'infrasec-deep-certs',
    DEEP_ARCHITECTURE: 'infrasec-deep-architecture'
  });

  const codecs = new Map([
    [keys.TASK_PROGRESS, 'json'],
    [keys.CURRENT_WEEK, 'raw'],
    [keys.GUIDED_PROGRESS, 'json'],
    [keys.GUIDED_CURRENT_DAY, 'json'],
    [keys.ACTIVE_PAGE, 'raw'],
    [keys.LEARNER_PROFILE, 'json'],
    [keys.MASTERY_EXAMS, 'json'],
    [keys.ALWAYS_SHOW_FULL_CONTENT, 'boolean-string'],
    [keys.LEVEL_ONBOARDING_SHOWN, 'boolean-string'],
    [keys.DELIVERABLES, 'json'],
    [keys.TICKET_ATTEMPTS, 'json'],
    [keys.LAB_PROGRESS, 'json'],
    [keys.EXAM_HISTORY, 'json'],
    [keys.READING_QUEUE, 'json'],
    [keys.INTERVIEW_HISTORY, 'json'],
    [keys.ENGLISH_PRACTICE, 'json'],
    [keys.CAREER_TAB, 'json'],
    [keys.DEEP_JOURNEY, 'json'],
    [keys.DEEP_INCIDENTS, 'json'],
    [keys.DEEP_SOC, 'json'],
    [keys.DEEP_CLOUD, 'json'],
    [keys.DEEP_TERMINAL, 'json'],
    [keys.DEEP_CERTS, 'json'],
    [keys.DEEP_ARCHITECTURE, 'json']
  ]);

  function assertCodec(key, allowed) {
    const codec = codecs.get(key);
    if (!codec) throw new TypeError(`Storage key desconhecida: ${key}`);
    if (!allowed.includes(codec)) throw new TypeError(`Codec ${codec} incompativel com ${key}`);
  }

  function readJson(key, fallback) {
    assertCodec(key, ['json']);
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    assertCodec(key, ['json']);
    localStorage.setItem(key, JSON.stringify(value));
  }

  function readRaw(key, fallback) {
    assertCodec(key, ['raw', 'boolean-string']);
    const value = localStorage.getItem(key);
    return value == null ? fallback : value;
  }

  function writeRaw(key, value) {
    assertCodec(key, ['raw', 'boolean-string']);
    localStorage.setItem(key, String(value));
  }

  function getLearnerProfile(fallback = {}) {
    return readJson(keys.LEARNER_PROFILE, fallback);
  }

  function setLearnerProfile(value) {
    writeJson(keys.LEARNER_PROFILE, value);
  }

  function getMasteryExams() {
    return readJson(keys.MASTERY_EXAMS, {}) || {};
  }

  function setMasteryExams(value) {
    writeJson(keys.MASTERY_EXAMS, value);
  }

  function getDeliverables(fallback = []) {
    return readJson(keys.DELIVERABLES, fallback);
  }

  function setDeliverables(value) {
    writeJson(keys.DELIVERABLES, value);
  }

  function getGuidedProgress(fallback = {}) {
    return readJson(keys.GUIDED_PROGRESS, fallback);
  }

  function setGuidedProgress(value) {
    writeJson(keys.GUIDED_PROGRESS, value);
  }

  function getCurrentWeek(fallback = '0') {
    return readRaw(keys.CURRENT_WEEK, fallback);
  }

  function setCurrentWeek(value) {
    writeRaw(keys.CURRENT_WEEK, value);
  }

  function getAlwaysShowFullContent() {
    return readRaw(keys.ALWAYS_SHOW_FULL_CONTENT, 'false') === 'true';
  }

  function setAlwaysShowFullContent(value) {
    writeRaw(keys.ALWAYS_SHOW_FULL_CONTENT, String(value));
  }

  export const storage = Object.freeze({
    keys,
    listKeys: () => [...codecs.keys()],
    codecFor: (key) => codecs.get(key),
    readJson,
    writeJson,
    readRaw,
    writeRaw,
    getLearnerProfile,
    setLearnerProfile,
    getMasteryExams,
    setMasteryExams,
    getDeliverables,
    setDeliverables,
    getGuidedProgress,
    setGuidedProgress,
    getCurrentWeek,
    setCurrentWeek,
    getAlwaysShowFullContent,
    setAlwaysShowFullContent
  });

export const storageKeys = keys;
