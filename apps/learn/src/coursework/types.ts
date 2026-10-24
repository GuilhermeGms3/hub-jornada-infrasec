import type { Example, Option, Section, Mode } from '../domain/types';

export type UnitId = 'net-r02' | 'net-r03' | 'net-r04';
export interface CourseQuestion {
  id: string;
  unitId: UnitId;
  version: string;
  family: string;
  objective: string;
  lessonId: string;
  purpose: Mode;
  prompt: string;
  context?: string;
  options: Option[];
  correct: string;
  hint: string;
  source: string;
}
export interface CourseLesson {
  id: string;
  title: string;
  objective: string;
  observable: string;
  prerequisites: string[];
  sections: Section[];
  example: Example;
  misconception: string;
  takeaway: string;
  recovery: string;
  vocabulary: string;
  diagram: string[];
}
export interface CourseUnit {
  id: UnitId;
  version: string;
  title: string;
  motivation: string;
  prerequisite: string;
  lessons: CourseLesson[];
  questions: CourseQuestion[];
  references: { title: string; url: string }[];
  lab: {
    title: string;
    scenario: string;
    outputs: { id: string; label: string; output: string }[];
    question: CourseQuestion;
    required: string[];
  };
}
export interface CourseAttempt {
  id: string;
  unitId: UnitId;
  unitVersion: string;
  questionId: string;
  questionVersion: string;
  objective: string;
  answer: string;
  mode: Mode;
  hintLevel: number;
  at: string;
  source: string;
  runId?: string;
}
export interface CourseRun {
  id: string;
  unitId: UnitId;
  unitVersion: string;
  kind: 'independent' | 'review';
  questionIds: string[];
  versions: string[];
  answers: Record<string, string>;
  consulted: boolean;
  status: 'active' | 'completed';
  at: string;
  finishedAt?: string;
}
export interface Coursework {
  version: 1;
  route: string;
  read: string[];
  drafts: Record<string, { answer: string; hint: boolean }>;
  attempts: CourseAttempt[];
  runs: CourseRun[];
  collected: Record<string, string[]>;
  artifacts: Record<string, Record<string, string>>;
}
