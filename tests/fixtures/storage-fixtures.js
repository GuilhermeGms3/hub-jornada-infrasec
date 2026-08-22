const ABSENT = Symbol('absent');

const STORAGE_KEYS = [
  'infrasec-task-progress',
  'infrasec-current-week',
  'infrasec-guided-progress',
  'infrasec-guided-current-day',
  'infrasec-active-page',
  'infrasec-learner-profile',
  'infrasec-mastery-exams',
  'infrasec-always-show-full-content',
  'infrasec-level-onboarding-shown',
  'infrasec-deliverables',
  'infrasec-ticket-attempts',
  'infrasec-lab-progress',
  'infrasec-exam-history',
  'infrasec-reading-queue',
  'infrasec-interview-history',
  'infrasec-english-practice',
  'infrasec-career-tab',
  'infrasec-deep-journey',
  'infrasec-deep-incidents',
  'infrasec-deep-soc',
  'infrasec-deep-cloud',
  'infrasec-deep-terminal',
  'infrasec-deep-certs',
  'infrasec-deep-architecture'
];

const RAW_KEYS = new Set([
  'infrasec-current-week',
  'infrasec-active-page',
  'infrasec-always-show-full-content',
  'infrasec-level-onboarding-shown'
]);

const defaults = {
  'infrasec-task-progress': {},
  'infrasec-current-week': '0',
  'infrasec-guided-progress': {},
  'infrasec-guided-current-day': {},
  'infrasec-active-page': 'today',
  'infrasec-learner-profile': {},
  'infrasec-mastery-exams': {},
  'infrasec-always-show-full-content': 'false',
  'infrasec-level-onboarding-shown': 'true',
  'infrasec-deliverables': [],
  'infrasec-ticket-attempts': [],
  'infrasec-lab-progress': {},
  'infrasec-exam-history': [],
  'infrasec-reading-queue': [],
  'infrasec-interview-history': [],
  'infrasec-english-practice': {},
  'infrasec-career-tab': 'portfolio',
  'infrasec-deep-journey': {},
  'infrasec-deep-incidents': [],
  'infrasec-deep-soc': [],
  'infrasec-deep-cloud': [],
  'infrasec-deep-terminal': {},
  'infrasec-deep-certs': {},
  'infrasec-deep-architecture': {}
};

const raw = (value) => ({ raw: value });

function encode(value, key) {
  if (value === ABSENT) return ABSENT;
  if (value && typeof value === 'object' && Object.hasOwn(value, 'raw')) return value.raw;
  return RAW_KEYS.has(key) ? String(value) : JSON.stringify(value);
}

function fixture(overrides = {}, absent = []) {
  return Object.fromEntries(STORAGE_KEYS.map((key) => {
    const value = absent.includes(key) ? ABSENT : Object.hasOwn(overrides, key) ? overrides[key] : defaults[key];
    return [key, encode(value, key)];
  }));
}

const emptyProfile = Object.fromEntries(STORAGE_KEYS.map((key) => [key, ABSENT]));

const partialProfile = fixture({
  'infrasec-task-progress': { '0-0': 'feito', '0-1': 'revisar' },
  'infrasec-guided-progress': { '0-0': 'done', '0-1': 'doing' },
  'infrasec-guided-current-day': { 0: 1 },
  'infrasec-learner-profile': { levels: { network: 2, operations: 1 }, answers: [1, 2], completedAt: '2026-01-01T00:00:00.000Z' },
  'infrasec-deliverables': [{ id: 'old-1', sourceId: 'manual-1', type: 'Ticket', week: 1, title: 'Primeiro ticket', body: 'Registro parcial', evidence: '', status: 'rascunho', createdAt: '2026-01-01T00:00:00.000Z' }]
});

const intermediateProfile = fixture({
  'infrasec-current-week': '5',
  'infrasec-active-page': 'level',
  'infrasec-guided-progress': { '0-0': 'done', '0-1': 'done', '1-0': 'done', '2-0': 'blocked' },
  'infrasec-guided-current-day': { 0: 1, 1: 0, 2: 0 },
  'infrasec-learner-profile': { levels: { network: 2, operations: 2, linux: 1, security: 1, cloud: 0, architecture: 0, career: 1, english: 0 }, answers: [], completedAt: '2026-01-02T00:00:00.000Z' },
  'infrasec-mastery-exams': {
    network: { foundation: { passed: true, best: 100, attempts: 1 }, applied: { passed: true, best: 75, attempts: 1 }, history: [] },
    operations: { foundation: { passed: true, best: 75, attempts: 1 }, history: [] }
  },
  'infrasec-deep-journey': { w1: { score: 79, passed: false } },
  'infrasec-ticket-attempts': [{ id: 'ticket-1', score: 70 }],
  'infrasec-deliverables': [{ id: 'd1', sourceId: 'task-0-0', type: 'README de lab', week: 1, title: 'Lab', body: 'Body', evidence: '', status: 'concluido', createdAt: '2026-01-02T00:00:00.000Z' }]
});

const domainIds = ['network', 'operations', 'linux', 'security', 'cloud', 'architecture', 'career', 'english'];
const completeMastery = Object.fromEntries(domainIds.map((domain) => [domain, {
  foundation: { passed: true, best: 100, attempts: 2 },
  applied: { passed: true, best: 100, attempts: 2 },
  history: []
}]));

const completeN3Profile = fixture({
  'infrasec-task-progress': { '0-0': 'feito', '0-1': 'feito', '1-0': 'feito' },
  'infrasec-guided-progress': { '0-0': 'done', '6-0': 'done', '8-0': 'done', '10-0': 'done', '11-0': 'done' },
  'infrasec-learner-profile': { levels: Object.fromEntries(domainIds.map((id) => [id, 2])), answers: [], completedAt: '2026-01-03T00:00:00.000Z' },
  'infrasec-mastery-exams': completeMastery,
  'infrasec-deep-journey': { w1: { score: 80, passed: true } },
  'infrasec-deep-incidents': [{ id: 'hd-dhcp', area: 'Help Desk', score: 80, passed: true }],
  'infrasec-deep-soc': [{ id: 'spray', score: 80, passed: true }],
  'infrasec-deep-cloud': [{ id: 'aws-iam', provider: 'AWS', score: 80, passed: true }],
  'infrasec-deep-terminal': { 'linux-files': { score: 100, passed: true }, 'linux-perms': { score: 100, passed: true } },
  'infrasec-deep-architecture': { 'client-server': { score: 80, passed: true, report: 'ok' } },
  'infrasec-deliverables': [0, 1, 2].map((index) => ({ id: `d${index}`, sourceId: `manual-${index}`, type: 'README', week: 1, title: `Evidencia ${index}`, body: 'Body', evidence: '', status: 'concluido', createdAt: '2026-01-03T00:00:00.000Z' })),
  'infrasec-english-practice': { 1: { translation: 'ok', ticket: 'ok', interview: 'ok', score: 80 } }
});

const oldIncompleteProfile = fixture({
  'infrasec-learner-profile': { levels: { network: 2 } },
  'infrasec-mastery-exams': { network: { foundation: { passed: true } } },
  'infrasec-deliverables': [{ id: 'legacy', title: 'Sem campos novos', status: 'rascunho' }],
  'infrasec-guided-progress': { '0-0': 'done' },
  'infrasec-deep-terminal': { 'linux-files': { passed: true } }
}, ['infrasec-reading-queue', 'infrasec-english-practice']);

const tolerantCorruptProfile = fixture({
  'infrasec-learner-profile': raw('{broken'),
  'infrasec-mastery-exams': raw('{broken'),
  'infrasec-deliverables': raw('{broken'),
  'infrasec-ticket-attempts': raw('{broken'),
  'infrasec-lab-progress': raw('{broken'),
  'infrasec-exam-history': raw('{broken'),
  'infrasec-reading-queue': raw('{broken'),
  'infrasec-interview-history': raw('{broken'),
  'infrasec-english-practice': raw('{broken'),
  'infrasec-deep-journey': raw('{broken'),
  'infrasec-deep-incidents': raw('{broken'),
  'infrasec-deep-soc': raw('{broken'),
  'infrasec-deep-cloud': raw('{broken'),
  'infrasec-deep-terminal': raw('{broken'),
  'infrasec-deep-certs': raw('{broken'),
  'infrasec-deep-architecture': raw('{broken')
});

module.exports = {
  ABSENT,
  STORAGE_KEYS,
  RAW_KEYS,
  raw,
  fixture,
  emptyProfile,
  partialProfile,
  intermediateProfile,
  completeN3Profile,
  oldIncompleteProfile,
  tolerantCorruptProfile,
  domainIds
};
