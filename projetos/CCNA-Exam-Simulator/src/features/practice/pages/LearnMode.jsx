import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useApp } from '../../../context/AppContext.jsx'
import DragMatch from '../../../components/UI/DragMatch.jsx'
import filterByCategory from '../../../utils/filterByCategory.js'

export default function LearnMode() {
    const { category: catParam } = useParams()
    const navigate = useNavigate()
    const { state, questionsData, setPractice, nextQuestion, prevQuestion, toggleShowAnswer, answerQuestion } = useApp()
    const category = decodeURIComponent(catParam || '')

    const questions = useMemo(() => {
        if (!Array.isArray(questionsData) || questionsData.length === 0) {
            return []
        }
        return filterByCategory(questionsData, category)
    }, [questionsData, category])

    useEffect(() => {
        if (!category) {
            navigate('/practice')
            return
        }
        if (!questions?.length) return
        // initialize practice list if changed
        if (state.category !== category || state.practiceQuestions.length !== questions.length) {
            setPractice(category, questions)
        }
    }, [category, questions, setPractice, state.category, state.practiceQuestions.length, navigate])

    // Get current question
    const q = state.practiceQuestions[state.currentQuestionIndex]

    // Initialize state with current question data
    const [selected, setSelected] = useState([])

    // Calculate default image path based on current question
    const defaultPng = useMemo(() => {
        return q?.hasImage ? (q.imagePath || `/question-${q.id}.png`) : ''
    }, [q?.hasImage, q?.imagePath, q?.id])

    const [imgSrc, setImgSrc] = useState(defaultPng)

    // Reset selected answers when question changes
    useEffect(() => {
        setSelected([])
    }, [state.currentQuestionIndex])

    // Update image source when defaultPng changes
    useEffect(() => {
        if (defaultPng !== imgSrc) {
            setImgSrc(defaultPng)
        }
    }, [defaultPng]) // Remove imgSrc from dependencies to avoid infinite loop

    // NOW you can do conditional returns AFTER all hooks
    if (!q) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">No questions in this category yet.</p>
                    <button
                        className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-700"
                        onClick={() => navigate('/practice')}
                    >
                        Back
                    </button>
                </div>
            </div>
        )
    }

    const options = q?.options ? Object.entries(q.options) : []
    const reveal = state.showAnswer
    const isDrag = q.type === 'drag-drop'
    const isMulti = !isDrag && Array.isArray(q.correctAnswer) && q.correctAnswer.length > 1

    const onImgError = () => {
        if (!imgSrc) return
        if (imgSrc.endsWith('.png')) setImgSrc(imgSrc.replace('.png', '.jpg'))
        else if (imgSrc.endsWith('.jpg')) setImgSrc(imgSrc.replace('.jpg', '.jpeg'))
        else if (imgSrc.endsWith('.jpeg')) setImgSrc(imgSrc.replace('.jpeg', '.webp'))
    }

    const handleSelect = (key) => {
        if (isDrag) return
        if (isMulti) {
            const exists = selected.includes(key)
            const next = exists ? selected.filter(k => k !== key) : [...selected, key]
            setSelected(next)
            answerQuestion(q.id, next)
        } else {
            const next = [key]
            setSelected(next)
            answerQuestion(q.id, next)
        }
    }

    const isCorrect = (key) => Array.isArray(q.correctAnswer) && q.correctAnswer.includes(key)

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <button
                            className="px-3 py-1.5 rounded border border-gray-300 bg-white text-sm hover:bg-gray-50"
                            onClick={() => navigate('/practice')}
                        >
                            ← Back
                        </button>
                    </div>
                    <div className="text-sm text-gray-600">
                        {state.currentQuestionIndex + 1} / {state.practiceQuestions.length}
                    </div>
                </div>

                <h2 className="text-lg font-semibold mb-4">{q.question}</h2>

                {q.hasImage && imgSrc && (
                    <div className="flex justify-center mb-4">
                        <img
                            src={imgSrc}
                            onError={onImgError}
                            alt={`Question ${q.id}`}
                            className="max-h-72 object-contain"
                        />
                    </div>
                )}

                {!isDrag ? (
                    <div className="space-y-2">
                        {options.map(([key, text]) => {
                            const selectedThis = selected.includes(key)
                            const base = 'w-full text-left rounded border p-3 transition-colors'
                            let classes = 'border-gray-200 bg-white hover:bg-gray-50'
                            if (reveal) {
                                if (isCorrect(key)) classes = 'border-emerald-300 bg-emerald-50'
                                else if (selectedThis) classes = 'border-red-300 bg-red-50'
                            } else if (selectedThis) {
                                classes = 'border-blue-300 bg-blue-50'
                            }
                            return (
                                <button
                                    key={key}
                                    className={`${base} ${classes}`}
                                    onClick={() => handleSelect(key)}
                                    disabled={reveal}
                                >
                                    <span className="font-mono mr-2">{key}.</span>{text}
                                </button>
                            )
                        })}
                    </div>
                ) : (
                    <div className="mt-2">
                        <DragMatch
                            pairs={q.pairs || []}
                            value={selected}
                            onChange={(tokens) => {
                                setSelected(tokens)
                                answerQuestion(q.id, tokens)
                            }}
                            reveal={reveal}
                            correctTokens={q.correctAnswer || []}
                        />
                    </div>
                )}

                <div className="mt-6 flex items-center gap-3">
                    <button
                        className="px-4 py-2 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={prevQuestion}
                        disabled={state.currentQuestionIndex === 0}
                    >
                        Prev
                    </button>
                    <button
                        className="px-4 py-2 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={nextQuestion}
                        disabled={state.currentQuestionIndex >= state.practiceQuestions.length - 1}
                    >
                        Next
                    </button>
                    <button
                        className="ml-auto px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-700"
                        onClick={toggleShowAnswer}
                    >
                        {reveal ? 'Hide Answer' : 'Show Answer'}
                    </button>
                </div>

                {reveal && (
                    <div className="mt-6 rounded-lg border border-blue-200 bg-white shadow-sm">
                        <div className="px-4 py-3 border-b border-blue-100 bg-blue-50/60 rounded-t-lg">
                            <div className="text-sm font-semibold text-blue-900">Answer & Explanation</div>
                        </div>
                        <div className="px-4 py-4 space-y-3">
                            {isDrag && Array.isArray(q.correctAnswer) && q.correctAnswer.length > 0 && (
                                <div>
                                    <div className="text-sm font-medium text-gray-700 mb-2">Correct mapping</div>
                                    <ul className="text-sm text-gray-800 list-disc pl-5">
                                        {q.correctAnswer.map((t, idx) => {
                                            const m = /^L(\d+):R(\d+)$/.exec(t)
                                            if (!m) return <li key={idx}>{t}</li>
                                            const l = Number(m[1])
                                            const r = Number(m[2])
                                            const left = q.pairs?.[l]?.left ?? `L${l}`
                                            const right = q.pairs?.[r]?.right ?? `R${r}`
                                            return (
                                                <li key={idx}>
                                                    {left} <span className="mx-1 text-gray-500">→</span> {right}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            )}
                            {q.explanation && (
                                <div>
                                    <div className="text-sm font-medium text-gray-700 mb-1">Explanation</div>
                                    <p className="text-sm leading-relaxed text-gray-800">{q.explanation}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}