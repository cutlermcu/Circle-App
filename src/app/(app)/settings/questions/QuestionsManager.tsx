'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import type { Question } from '@/types'
import { addQuestion, deleteQuestion } from '@/actions/settings'
import { setQuestionImage } from '@/actions/images'
import ImageUpload from '@/components/ImageUpload'

const CATEGORIES = ['Community', 'Reflection', 'Social-Emotional', 'Gratitude', 'Aspirations', 'Identity', 'Fun', 'Current', 'Other']

export default function QuestionsManager({
  globalQuestions,
  myQuestions,
  teacherId,
}: {
  globalQuestions: Question[]
  myQuestions: Question[]
  teacherId: string
}) {
  const [myList, setMyList] = useState(myQuestions)
  const [newText, setNewText] = useState('')
  const [newCategory, setNewCategory] = useState('Other')
  const [activeTab, setActiveTab] = useState<'bank' | 'mine'>('bank')
  const [filterCategory, setFilterCategory] = useState<string>('All')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newText.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await addQuestion(teacherId, newText.trim(), newCategory)
      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        setMyList(prev => [{ ...result.data!, used: false }, ...prev])
        setNewText('')
        setExpandedId(result.data!.id)
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteQuestion(teacherId, id)
      setMyList(prev => prev.filter(q => q.id !== id))
    })
  }

  function handleImageUpload(id: string, url: string) {
    startTransition(async () => {
      await setQuestionImage(teacherId, id, url)
      setMyList(prev => prev.map(q => q.id === id ? { ...q, image_url: url } : q))
    })
  }

  function handleImageRemove(id: string) {
    startTransition(async () => {
      await setQuestionImage(teacherId, id, null)
      setMyList(prev => prev.map(q => q.id === id ? { ...q, image_url: null } : q))
    })
  }

  const globalCategories = ['All', ...CATEGORIES.filter(c => globalQuestions.some(q => q.category === c))]
  const filteredGlobal = filterCategory === 'All' ? globalQuestions : globalQuestions.filter(q => q.category === filterCategory)
  const unusedCount = [...globalQuestions, ...myList].filter(q => !q.used).length

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 rounded-xl p-4 flex items-center justify-between">
        <div>
          <span className="text-indigo-700 font-semibold">{unusedCount}</span>
          <span className="text-indigo-600 text-sm ml-1">unused questions available</span>
        </div>
        <span className="text-xs text-indigo-400">{globalQuestions.length + myList.length} total</span>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        <button onClick={() => setActiveTab('bank')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bank' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
          Question Bank ({globalQuestions.length})
        </button>
        <button onClick={() => setActiveTab('mine')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'mine' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
          My Questions ({myList.length})
        </button>
      </div>

      {activeTab === 'bank' && (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {globalCategories.map(cat => (
              <button key={cat} onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            {filteredGlobal.map(q => (
              <div key={q.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${q.used ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200'}`}>
                {q.image_url && (
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={q.image_url} alt="" fill className="object-cover" />
                  </div>
                )}
                <span className="text-xs font-semibold text-indigo-300 w-20 flex-shrink-0">{q.category}</span>
                <p className={`text-sm flex-1 ${q.used ? 'text-slate-400' : 'text-slate-800'}`}>{q.text}</p>
                {q.used && <span className="text-xs text-slate-300">used</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'mine' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Add a question</h3>
            <p className="text-xs text-slate-400 mb-3">Your custom questions are private — only you can see them.</p>
            <form onSubmit={handleAdd} className="space-y-3">
              <textarea value={newText} onChange={e => setNewText(e.target.value)}
                placeholder="Write your question…" rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              <div className="flex gap-2">
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button type="submit" disabled={isPending || !newText.trim()}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 transition-colors">
                  Add Question
                </button>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
            </form>
          </div>

          {myList.length > 0 ? (
            <div className="space-y-2">
              {myList.map(q => (
                <div key={q.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="flex items-start gap-3 px-4 py-3">
                    {q.image_url && (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 mt-0.5">
                        <Image src={q.image_url} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <span className="text-xs font-semibold text-indigo-300 w-20 flex-shrink-0 mt-0.5">{q.category}</span>
                    <p className="text-sm text-slate-800 flex-1">{q.text}</p>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                        className="text-xs text-indigo-400 hover:text-indigo-600 transition-colors">
                        {expandedId === q.id ? 'Hide' : (q.image_url ? 'Change image' : 'Add image')}
                      </button>
                      <button onClick={() => handleDelete(q.id)} disabled={isPending}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50">
                        Delete
                      </button>
                    </div>
                  </div>
                  {expandedId === q.id && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                      <ImageUpload
                        teacherId={teacherId}
                        currentUrl={q.image_url}
                        onUpload={url => { handleImageUpload(q.id, url); setExpandedId(null) }}
                        onRemove={() => { handleImageRemove(q.id); setExpandedId(null) }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">No custom questions yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
