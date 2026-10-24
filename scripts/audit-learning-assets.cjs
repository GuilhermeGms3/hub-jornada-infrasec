// Read-only source inspection. Produces metadata, never republishes third-party question text.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.name === ".git" || e.name === "node_modules"
        ? []
        : e.isDirectory()
          ? walk(path.join(dir, e.name))
          : [path.join(dir, e.name)],
    );
}
const examSource = read("projetos/CCNA-Exam-Simulator/src/data/questions.js");
const exam = vm.runInNewContext(
  examSource.replace(/export default questions;?/, "") + ";questions",
  {},
  { timeout: 1000 },
);
const quizHtml = read("projetos/CCNA-1-Study-Hub/quiz.html");
const start = quizHtml.indexOf("const POOL = [");
const end = quizHtml.indexOf("\n];", start) + 3;
const ccna1 = vm.runInNewContext(
  quizHtml.slice(start, end) + ";POOL",
  {},
  { timeout: 1000 },
);
const window = {};
vm.runInNewContext(
  read("projetos/cert-antenas/security-plus-sy0-701/assets/quiz-data.js"),
  { window },
  { timeout: 1000 },
);
function report(items, kind) {
  const id = (q) =>
    kind === "exam"
      ? String(q.id)
      : kind === "security"
        ? String(q.num)
        : hash(q.q.trim().replace(/\s+/g, " ").toLowerCase()).slice(0, 20);
  const prompt = (q) => q.question || q.stem || q.q || "";
  const explanation = (q) => q.explanation || q.explain || "";
  const grouped = new Map();
  for (const q of items) grouped.set(id(q), (grouped.get(id(q)) || 0) + 1);
  const normalized = items.map((q) =>
    prompt(q).trim().replace(/\s+/g, " ").toLowerCase(),
  );
  const structurallyValid = items.filter((q) => {
    const options = Array.isArray(q.options)
      ? q.options
      : Object.values(q.options || {});
    const rawAnswers = q.correctAnswer || q.correct;
    const answers = Array.isArray(rawAnswers)
      ? rawAnswers
      : typeof rawAnswers === "string"
        ? [rawAnswers]
        : [];
    return (
      prompt(q).trim() &&
      options.length >= 2 &&
      new Set(options).size === options.length &&
      Array.isArray(answers) &&
      answers.length > 0 &&
      answers.every((a) =>
        typeof a === "number"
          ? a >= 0 && a < options.length
          : Object.hasOwn(q.options || {}, a),
      ) &&
      explanation(q).trim()
    );
  }).length;
  return {
    found: items.length,
    distinctIds: grouped.size,
    duplicateIds: [...grouped].filter(([, n]) => n > 1),
    distinctNormalizedPrompts: new Set(normalized).size,
    duplicatePromptRecords: items.length - new Set(normalized).size,
    emptyExplanations: items.filter((q) => !explanation(q).trim()).length,
    structurallyValidWithExplanation: structurallyValid,
    semanticReview: "Amostras inspecionadas; banco integral não revisado.",
    reviewedForPublication: 0,
    pending: items.length,
    imported: 0,
    availableInNewApp: 0,
    discarded: 0,
    importManifest: items.map((q, i) => ({
      sourceId: id(q),
      sourceRow: i + 1,
      fingerprint: hash(prompt(q)),
      status:
        grouped.get(id(q)) > 1
          ? "duplicate-id-held"
          : "rights-and-semantic-review-pending",
    })),
  };
}
const origins = [
  "CCNA-Exam-Simulator",
  "CCNA-1-Study-Hub",
  "CCNA_Course_Notes",
  "CCNA-Labs",
  "cert-antenas/security-plus-sy0-701",
  "cert-antenas/AWS-Certified-Cloud-Practitioner-Notes",
  "cert-antenas/az-900",
  "cert-antenas/SC-900-Study-Prep",
  "cert-antenas/Fortinet-Certified-Fundamentals-Cybersecurity",
  "Cloud-Security-Projects-For-Beginners",
  "awesome-soc",
  "soc-roadmap-2026",
  "cybersecurity-career-roadmap",
  "Awesome-CloudSec-Labs",
  "awesome-soc-analyst",
];
const assets = origins.map((origin) => {
  const dir = path.join(root, "projetos", origin);
  const files = walk(dir);
  const licenses = files
    .filter((f) => /^licen[sc]e/i.test(path.basename(f)))
    .map((f) => ({
      file: path.relative(root, f).replaceAll("\\", "/"),
      sha256: hash(fs.readFileSync(f)),
    }));
  return {
    origin,
    files: files.length,
    markdown: files.filter((f) => /\.md$/i.test(f)).length,
    pdf: files.filter((f) => /\.pdf$/i.test(f)).length,
    packetTracer: files.filter((f) => /\.pkt$/i.test(f)).length,
    images: files.filter((f) => /\.(png|jpe?g|svg|webp)$/i.test(f)).length,
    licenses,
  };
});
const mirrorRoot = path.join(root, "projetos/certificacoes");
const localMirrors = fs.existsSync(mirrorRoot)
  ? fs
      .readdirSync(mirrorRoot, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => ({
        origin: `projetos/certificacoes/${e.name}`,
        files: walk(path.join(mirrorRoot, e.name)).length,
        decision:
          "Cópia local ignorada pelo Git; não usada como segunda fonte. Origem canônica auditada em cert-antenas.",
      }))
  : [];
const flashcards = JSON.parse(
  read("projetos/cert-antenas/SC-900-Study-Prep/data/flashcards.json"),
);
const output = {
  date: "2026-10-24",
  head: require("node:child_process")
    .execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" })
    .trim(),
  note: "Metadados do checkout completo; nenhuma ausência foi inferida do ZIP. Validade estrutural não confirma gabarito ou direitos.",
  banks: {
    ccnaExam: report(exam, "exam"),
    ccna1: report(ccna1, "ccna1"),
    security: report(window.QUIZ_DATA, "security"),
    securityPbqFound: window.PBQ_DATA?.length || 0,
  },
  sc900Flashcards: Object.values(flashcards).reduce(
    (n, rows) => n + rows.length,
    0,
  ),
  awsPracticeMarkdown: walk(
    path.join(
      root,
      "projetos/cert-antenas/AWS-Certified-Cloud-Practitioner-Notes/practice-exam",
    ),
  ).filter((f) => /practice-exam-\d+\.md$/i.test(f)).length,
  assets,
};
output.localMirrors = localMirrors;
fs.mkdirSync(path.join(root, "docs/content"), { recursive: true });
fs.writeFileSync(
  path.join(root, "docs/content/ASSET_AUDIT.json"),
  JSON.stringify(output, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    {
      banks: Object.fromEntries(
        Object.entries(output.banks).map(([k, v]) => [
          k,
          typeof v === "object"
            ? {
                found: v.found,
                distinctIds: v.distinctIds,
                duplicateIds: v.duplicateIds,
                emptyExplanations: v.emptyExplanations,
                structurallyValidWithExplanation:
                  v.structurallyValidWithExplanation,
              }
            : v,
        ]),
      ),
      sc900Flashcards: output.sc900Flashcards,
      awsPracticeMarkdown: output.awsPracticeMarkdown,
      assets,
    },
    null,
    2,
  ),
);
