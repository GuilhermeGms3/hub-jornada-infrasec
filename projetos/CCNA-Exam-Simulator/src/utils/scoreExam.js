import validateAnswer from './validateAnswer.js'

// Default weights per question type
export const QUESTION_WEIGHTS = {
    'multiple-choice:single': 1.0,
    'multiple-choice:multi': 1.5,
    'drag-drop': 2.5,
    'simple': 1.0,
}

export const DEFAULT_PASSING_SCORE = 800 // on a 0–1000 scale

function getWeight(q) {
    if (!q || !q.type) return QUESTION_WEIGHTS['multiple-choice:single']

    if (q.type === 'drag-drop') return QUESTION_WEIGHTS['drag-drop']
    if (q.type === 'simple') return QUESTION_WEIGHTS['simple']

    // Treat multiple-choice with multiple correct answers as heavier
    const isMulti = Array.isArray(q.correctAnswer) && q.correctAnswer.length > 1
    return isMulti ? QUESTION_WEIGHTS['multiple-choice:multi'] : QUESTION_WEIGHTS['multiple-choice:single']
}

/**
 * Scores an exam based on questions and user answers
 * @param {Array} questions - Array of question objects used in the exam
 * @param {Object} userAnswers - Map of { [questionId]: string[] }
 * @param {number} passingScore - Passing threshold (0-1000), default 800
 * @returns {Object} Scoring results
 */
export default function scoreExam(questions = [], userAnswers = {}, passingScore = DEFAULT_PASSING_SCORE) {
    // Validate inputs
    if (!Array.isArray(questions) || questions.length === 0) {
        return {
            correct: 0,
            total: 0,
            percent: 0,
            rawPoints: 0,
            maxPoints: 0,
            scaledScore: 0,
            passed: false,
            passingScore
        }
    }

    let correct = 0
    let rawPoints = 0
    let maxPoints = 0

    for (const q of questions) {
        const weight = getWeight(q)
        maxPoints += weight

        const given = userAnswers[q.id] || []
        const expected = q.correctAnswer || []

        if (validateAnswer(given, expected)) {
            correct++
            rawPoints += weight
        }
    }

    const total = questions.length
    const percent = Math.round((correct / total) * 100)
    const scaledScore = Math.round((rawPoints / maxPoints) * 1000)
    const passed = scaledScore >= passingScore

    return {
        correct,
        total,
        percent,
        rawPoints,
        maxPoints,
        scaledScore,
        passed,
        passingScore
    }
}