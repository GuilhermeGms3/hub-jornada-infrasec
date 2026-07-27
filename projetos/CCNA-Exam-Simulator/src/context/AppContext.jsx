import { createContext, useContext, useMemo, useReducer } from 'react'
import questionsData from '../data/questions.js'
import scoreExam, { DEFAULT_PASSING_SCORE } from '../utils/scoreExam.js'

const AppContext = createContext(null)

const initialState = {
    mode: 'practice',
    category: '',
    practiceQuestions: [],
    examQuestions: [],
    currentQuestionIndex: 0,
    userAnswers: {},
    examSettings: { totalQuestions: 10, timer: 90 },
    showAnswer: false,
}

const getActiveQuestions = (state) =>
    state.mode === 'exam' ? state.examQuestions : state.practiceQuestions

function reducer(state, action) {
    switch (action.type) {
        case 'SET_MODE':
            return { ...state, mode: action.payload }

        case 'SET_CATEGORY':
            return { ...state, category: action.payload }

        case 'SET_PRACTICE_QUESTIONS':
            return {
                ...state,
                practiceQuestions: action.payload,
                currentQuestionIndex: 0,
                showAnswer: false
            }

        case 'SET_EXAM_QUESTIONS':
            return {
                ...state,
                examQuestions: action.payload,
                currentQuestionIndex: 0,
                userAnswers: {},
                showAnswer: false
            }

        case 'SET_EXAM_SETTINGS':
            return {
                ...state,
                examSettings: { ...state.examSettings, ...action.payload }
            }

        case 'ANSWER_QUESTION': {
            const { questionId, answer } = action.payload
            return {
                ...state,
                userAnswers: { ...state.userAnswers, [questionId]: answer }
            }
        }

        case 'NEXT_QUESTION': {
            const questions = getActiveQuestions(state)
            return {
                ...state,
                currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, questions.length - 1),
                showAnswer: false
            }
        }

        case 'PREV_QUESTION':
            return {
                ...state,
                currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
                showAnswer: false
            }

        case 'TOGGLE_SHOW_ANSWER':
            return { ...state, showAnswer: !state.showAnswer }

        case 'RESET_INDEX':
            return { ...state, currentQuestionIndex: 0, showAnswer: false }

        default:
            return state
    }
}

// Process questions once: add imagePath defaults and normalize drag-drop correctAnswer
function processQuestions(questions) {
    if (!Array.isArray(questions)) return []

    return questions.map(q => {
        // Skip if question is invalid
        if (!q || !q.id) return q

        const updates = {}

        // Add default imagePath for questions with images
        if (q.hasImage && !q.imagePath) {
            updates.imagePath = `/question-${q.id}.png`
        }

        // Generate correctAnswer for drag-drop questions if missing
        if (q.type === 'drag-drop' && Array.isArray(q.pairs) && q.pairs.length > 0) {
            if (!Array.isArray(q.correctAnswer) || q.correctAnswer.length === 0) {
                updates.correctAnswer = q.pairs.map((_, i) => `L${i}:R${i}`)
            }
        }

        // Only spread if we have updates to avoid unnecessary object creation
        return Object.keys(updates).length > 0 ? { ...q, ...updates } : q
    })
}

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState)

    // Process questions once on mount
    const processedQuestions = useMemo(() => processQuestions(questionsData), [])

    const value = useMemo(() => {
        // Navigation functions
        const nextQuestion = () => dispatch({ type: 'NEXT_QUESTION' })
        const prevQuestion = () => dispatch({ type: 'PREV_QUESTION' })
        const toggleShowAnswer = () => dispatch({ type: 'TOGGLE_SHOW_ANSWER' })

        // Mode setup functions
        const setPractice = (category, list) => {
            dispatch({ type: 'SET_MODE', payload: 'practice' })
            dispatch({ type: 'SET_CATEGORY', payload: category })
            dispatch({ type: 'SET_PRACTICE_QUESTIONS', payload: list })
        }

        const startExam = (list, settings) => {
            dispatch({ type: 'SET_MODE', payload: 'exam' })
            if (settings) {
                dispatch({ type: 'SET_EXAM_SETTINGS', payload: settings })
            }
            dispatch({ type: 'SET_EXAM_QUESTIONS', payload: list })
        }

        // Answer handling
        const answerQuestion = (questionId, answerArr) => {
            dispatch({
                type: 'ANSWER_QUESTION',
                payload: { questionId, answer: answerArr }
            })
        }

        // Scoring functions
        const calculateScore = () => {
            return scoreExam(state.examQuestions, state.userAnswers, DEFAULT_PASSING_SCORE)
        }

        const submitExam = () => {
            return calculateScore()
        }

        return {
            state,
            questionsData: processedQuestions,
            nextQuestion,
            prevQuestion,
            toggleShowAnswer,
            setPractice,
            startExam,
            answerQuestion,
            submitExam,
            calculateScore,
        }
    }, [state, processedQuestions])

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
    const ctx = useContext(AppContext)
    if (!ctx) {
        throw new Error('useApp must be used within AppProvider')
    }
    return ctx
}