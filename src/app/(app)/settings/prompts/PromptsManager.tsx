'use client'

import { useState, useTransition } from 'react'
import type { Prompt } from '@/types'
import { addPrompt, deletePrompt } from '@/actions/settings'

type Section = 'grounding' | 'checkin' | 'appreciation'

const SECTION_META: Record<Section, { label: string; icon: string; desc: string }> = {
  grounding: { label: 'Grounding', icon: '🌿', desc: 'Opening breathing or mindfulness exercise' },
  checkin: { label: 'Check-in', icon: '💬', desc: 'Brief prompt for each person to share how they\'re doing' },
  appreciation: { label: 'Appreciations', icon: '✨', desc: 'Closing gratitude practice' },
}

export default function PromptsManager({
  globalGrounding,
  globalCheckin,
  globalAppreciation,
  myPrompts,
  teacherId,
}: {
  globalGrounding: Prompt[]
  globalCheckin: Prompt[]
  globalAppreciation: Prompt[]
  myPrompts: Prompt[]
  teacherId: string
}) {
  const [myList, setMyList] = useState(myPrompts)
  const [activeSection, setActiveSection] = useState<Section>('grounding')
  const [newText, setNewText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const globalMap: Record<Section, Prompt[]> = {
    grounding: globalGrounding,
    checkin: globalCheckin,
    appreciation: globalAppreciation,
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newText.trim()) return
    setError(null)

    startTransition(async () => {
      const result = await addPrompt(teacherId, activeSection, newText.trim())
      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        setMyList(prev => [...prev, result.data!])
        setNewText('')
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deletePrompt(teacherId, id)
      setMyList(prev => prev.filter(p => p.id !== id))
    })
  }

  const mySection = myList.filter(p => p.section === activeSection)
  const globalSection = globalMap[activeSection]
  const meta = SECTION_META[activeSection]

  return (
    <div className="space-y-6">
      {/* Section tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {(Object.keys(SECTION_META) as Section[]).map(section => (
          <button
            key={section}
            onClick={() => { setActiveSection(section); setNewText(''); setError(null) }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === section ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            {SECTION_META[section].icon} {SECTION_META[section].label}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-500">{meta.desc}</p>

      {/* Default prompts */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Default Prompts ({globalSection.length})
        </h3>
        <div className="space-y-2">
          {globalSection.map(p => (
            <div key={p.id} className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-700">{p.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* My custom prompts */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          My Custom Prompts
          {mySection.length > 0 && <span className="ml-1 text-indigo-400">({mySection.length})</span>}
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          Your custom prompts are private and will be included in the rotation when running circles.
        </p>

        {mySection.length > 0 && (
          <div className="space-y-2 mb-4">
            {mySection.map(p => (
              <div key={p.id} className="flex items-start gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200">
                <p className="text-sm text-slate-800 flex-1">{p.text}</p>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={isPending}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors flex-shrink-0 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAdd} className="space-y-2">
          <textarea
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder={`Write a ${meta.label.toLowerCase()} prompt…`}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <button
            type="submit"
            disabled={isPending || !newText.trim()}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            Add {meta.label} Prompt
          </button>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  )
}
