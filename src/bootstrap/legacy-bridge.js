import { storage } from '../core/storage.js';
import { eventBus } from '../core/events.js';
import { getActivePage, navigateToPage, pages } from '../core/navigation.js';
import { adaptiveApi } from '../features/adaptive/controller.js';
import { assessment } from '../learning/assessment.js';
import { evidenceRules } from '../learning/evidence.js';
import { progression } from '../learning/progression.js';
import { recommendationRules } from '../learning/recommendations.js';
import { scoring } from '../practice/scoring.js';
import { readinessRules } from '../readiness/rules.js';

export function installLegacyBridges() {
  window.InfraSecStorage = storage;
  window.InfraSecEvents = eventBus;
  window.InfraSecDomain = Object.freeze({
    assessment,
    evidence: evidenceRules,
    progression,
    recommendations: recommendationRules,
    readiness: readinessRules,
    scoring
  });
  window.InfraSecHub = Object.freeze({ navigateToPage, getActivePage, pages });
  window.InfraSecAdaptive = adaptiveApi;
}
