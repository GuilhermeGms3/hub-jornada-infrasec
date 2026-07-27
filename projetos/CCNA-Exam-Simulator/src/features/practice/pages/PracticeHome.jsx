import { useMemo } from 'react'
import { Link } from 'react-router'
import { useApp } from '../../../context/AppContext.jsx'

export default function PracticeHome() {
    const { questionsData } = useApp()

    const categories = useMemo(() => {
        // Add safety check
        if (!Array.isArray(questionsData) || questionsData.length === 0) {
            return []
        }
        const set = new Set(questionsData.map(q => q?.category).filter(Boolean))
        return Array.from(set)
    }, [questionsData])

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-6 py-10">
                <div className="mb-4">
                    <Link
                        to="/"
                        className="inline-flex items-center px-3 py-1.5 rounded border border-gray-300 bg-white text-sm hover:bg-gray-50"
                    >
                        ← Back
                    </Link>
                </div>
                <h1 className="text-2xl font-bold mb-6">Practice by Category</h1>

                {categories.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No questions available yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {categories.map(cat => (
                            <Link
                                key={cat}
                                to={`/practice/${encodeURIComponent(cat)}`}
                                className="rounded-lg border bg-white p-4 hover:shadow-sm"
                            >
                                <div className="font-medium">{cat}</div>
                                <div className="text-xs text-gray-500">
                                    {questionsData.filter(q => q?.category === cat).length} questions
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}