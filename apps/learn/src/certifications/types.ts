import type { Option } from '../domain/types';

export interface StudyLesson {
  id: string;
  version: string;
  title: string;
  paragraphs: string[];
  example: { data: string; reasoning: string[]; conclusion: string };
  practice: string;
  recovery: string;
  question: { prompt: string; options: Option[]; correct: string };
  source: string;
  origin: string;
}
export interface StudyWeek {
  number: number;
  title: string;
  objective: string;
  lessons: string[];
  practice: string;
  evidence: string;
  gap: string;
  blueprint: string;
}
export interface Certification {
  id: string;
  title: string;
  group: 'Redes' | 'Fortinet' | 'Cloud' | 'Segurança' | 'Sistemas';
  priority: boolean;
  version: string;
  description: string;
  prerequisites: string;
  officialRequirements: string;
  source: string;
  weeks: StudyWeek[];
}
export interface CertificationProgress {
  version: 1;
  route: string;
  read: string[];
  notes: Record<string, string>;
  attempts: {
    id: string;
    certificationId: string;
    week: number;
    lessonId: string;
    lessonVersion: string;
    answer: string;
    at: string;
    mode: 'comprehension';
  }[];
}
