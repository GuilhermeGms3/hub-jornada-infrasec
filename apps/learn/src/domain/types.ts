export const UNIT_VERSION = '1.0';
export type Objective = 'O01' | 'O02' | 'O03' | 'O04' | 'O05' | 'O06' | 'O07' | 'O08';
export type Mode = 'comprehension' | 'guided' | 'independent' | 'remediation' | 'review';
export interface Option {
  id: string;
  text: string;
  explanation: string;
}
export interface Question {
  id: string;
  version: string;
  family: string;
  objective: Objective;
  prompt: string;
  context?: string;
  options: Option[];
  correct: string;
  essential: boolean;
  remediation: string;
  hints: string[];
}
export interface Example {
  title: string;
  data: string;
  reasoning: string[];
  conclusion: string;
  limit: string;
}
export interface Section {
  title: string;
  paragraphs: string[];
  output?: string;
}
export interface Lesson {
  id: string;
  title: string;
  heading: string;
  lead: string;
  objective: Objective;
  sections: Section[];
  example: Example;
  misconception: string;
  takeaway: string;
  diagram?: 'network' | 'mask' | 'flow' | 'layers';
  questionId: string;
}
export interface Attempt {
  id: string;
  questionId: string;
  questionVersion: string;
  unitVersion: string;
  mode: Mode;
  answer: string;
  hintLevel: number;
  at: string;
  runId?: string;
}
export interface Run {
  id: string;
  kind: 'independent' | 'review';
  questionIds: string[];
  versions: string[];
  answers: Record<string, string>;
  status: 'active' | 'completed' | 'abandoned';
  assisted: boolean;
  consulted: boolean;
  startedAt: string;
  finishedAt?: string;
}
export interface Draft {
  answer: string;
  hintLevel: number;
}
export interface ReviewEvent {
  runId: string;
  at: string;
}
export interface LabAttempt {
  id: string;
  scenarioId: string;
  commands: string[];
  answer: string;
  hintLevel: number;
  at: string;
}
export interface Progress {
  unitVersion: string;
  route: string;
  read: string[];
  drafts: Record<string, Draft>;
  attempts: Attempt[];
  runs: Run[];
  reviews: ReviewEvent[];
  labAttempts: LabAttempt[];
  simulator: { scenarioId: string; commands: string[]; answer: string; hintLevel: number };
}
export interface Envelope {
  appId: 'infrasec-learn';
  schemaVersion: 1;
  revision: number;
  savedAt: string;
  progress: Progress;
  coursework?: import('../coursework/types').Coursework;
}
