import { networkPlans } from './plans-network';
import { otherPlans } from './plans-other';
import index from './lesson-index.json' with { type: 'json' };

export const certifications = [...networkPlans, ...otherPlans];
export const certificationById = new Map(certifications.map((c) => [c.id, c]));
export const lessonIndex = new Map(index.map((l) => [l.id, l]));
export const certificationHref = (id: string, week?: number, lesson?: string) =>
  `#/certificacao/${id}${week ? `/semana/${week}` : ''}${lesson ? `/aula/${lesson}` : ''}`;
export function certificationRoute(route: string) {
  const parts = route.split('/');
  const [prefix, id, marker, weekText, lessonMarker, lessonId] = parts;
  const certification = certificationById.get(id);
  if (prefix !== 'certificacao' || !certification) return null;
  if (parts.length === 2) return { certification, week: undefined, lessonId: undefined };
  const week = certification.weeks.find((w) => String(w.number) === weekText);
  if (marker !== 'semana' || !week) return null;
  if (parts.length === 4) return { certification, week, lessonId: undefined };
  if (parts.length === 6 && lessonMarker === 'aula' && week.lessons.includes(lessonId))
    return { certification, week, lessonId };
  return null;
}
