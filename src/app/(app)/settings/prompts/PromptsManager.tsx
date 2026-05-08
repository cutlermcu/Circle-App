'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import type { Prompt } from '@/types'
import { addPrompt, deletePrompt } from '@/actions/settings'
import { setPromptImage } from '@/actions/images'
import ImageUpload from '@/components/ImageUpload'

type Section = 'grounding' | 'checkin' | 'appreciation'

const SECTION_META: Record<Section, { label: string; desc: string }> = {
  grounding: { label: 'Grounding', desc: 'Opening breathing or mindfulness exercise' },
  checkin: { label: 'Check-in', desc: 'Brief prompt for each person to share how they\'re doing' },
  appreciation: { label: 'Appreciations', desc: 'Closing gratitude practice' },
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
  const [expandedId, setExpandedId] = useState<string | null>(null)
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
        setExpandedId(result.data!.id)
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deletePrompt(teacherId, id)
      setMyList(prev => prev.filter(p => p.id !== id))
    })
  }

  function handleImageUpload(id: string, url: string) {
    startTransition(async () => {
      await setPromptImage(teacherId, id, url)
      setMyList(prev => prev.map(p => p.id === id ? { ...p, image_url: url } : p))
    })
  }

  function handleImageRemove(id: string) {
    startTransition(async () => {
      await setPromptImage(teacherId, id, null)
      setMyList(prev => prev.map(p => p.id === id ? { ...p, image_url: null } : p))
    })
  }

  const mySection = myList.filter(p => p.section === activeSection)
  const globalSection = globalMap[activeSection]
  const meta = SECTION_META[activeSection]

  return (
    <div className="space-y-6">
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {(Object.keys(SECTION_META) as Section[]).map(section => (
          <button key={section}
            onClick={() => { setActiveSection(section); setNewText(''); setError(null); setExpandedId(null) }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === section ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
            {SECTION_META[section].label}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-500">{meta.desc}</p>

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
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-start gap-3 px-4 py-3">
                  {p.image_url && (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 mt-0.5">
                      <Image src={p.image_url} alt="" fill className="object-cover" />
                    </div>
                  )}
                  <p className="text-sm text-slate-800 flex-1">{p.text}</p>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-600 transition-colors">
                      {expandedId === p.id ? 'Hide' : (p.image_url ? 'Change image' : 'Add image')}
                    </button>
                    <button onClick={() => handleDelete(p.id)} disabled={isPending}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50">
                      Delete
                    </button>
                  </div>
                </div>
                {expandedId === p.id && (
                  <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                    <ImageUpload
                      teacherId={teacherId}
                      currentUrl={p.image_url}
                      onUpload={url => { handleImageUpload(p.id, url); setExpandedId(null) }}
                      onRemove={() => { handleImageRemove(p.id); setExpandedId(null) }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAdd} className="space-y-2">
          <textarea value={newText} onChange={e => setNewText(e.target.value)}
            placeholder={`Write a ${meta.label.toLowerCase()} prompt…`} rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          <button type="submit" disabled={isPending || !newText.trim()}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 transition-colors">
            Add {meta.label} Prompt
          </button>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  )
}
