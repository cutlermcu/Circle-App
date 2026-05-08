'use client'

import { useState, useTransition } from 'react'
import type { Agreement } from '@/types'
import {
  addAgreement,
  deleteAgreement,
  toggleAgreement,
} from '@/actions/settings'

export default function AgreementsManager({
  globalAgreements,
  myAgreements,
  teacherId,
}: {
  globalAgreements: Agreement[]
  myAgreements: Agreement[]
  teacherId: string
}) {
  const [myList, setMyList] = useState(myAgreements)
  const [globalList, setGlobalList] = useState(globalAgreements)
  const [newText, setNewText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newText.trim()) return
    setError(null)

    startTransition(async () => {
      const result = await addAgreement(teacherId, newText.trim())
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
      await deleteAgreement(teacherId, id)
      setMyList(prev => prev.filter(a => a.id !== id))
    })
  }

  function handleToggleGlobal(id: string, current: boolean) {
    startTransition(async () => {
      await toggleAgreement(id, !current)
      setGlobalList(prev =>
        prev.map(a => a.id === id ? { ...a, is_active: !current } : a)
      )
    })
  }

  return (
    <div className="space-y-8">
      {/* Global agreements */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
          Default Agreements
        </h2>
        <p className="text-xs text-slate-400 mb-3">
          Toggle which default agreements are included in your circles.
        </p>
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {globalList.map(agreement => (
            <div key={agreement.id} className="flex items-center gap-3 px-4 py-3">
              <button
                onClick={() => handleToggleGlobal(agreement.id, agreement.is_active)}
                disabled={isPending}
                className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                  agreement.is_active ? 'bg-indigo-500' : 'bg-slate-200'
                }`}
              >
                <span className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${
                  agreement.is_active ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
              <p className={`text-sm flex-1 ${agreement.is_active ? 'text-slate-800' : 'text-slate-400'}`}>
                {agreement.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* My custom agreements */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
          My Custom Agreements
        </h2>
        {myList.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 mb-4">
            {myList.map(agreement => (
              <div key={agreement.id} className="flex items-center gap-3 px-4 py-3">
                <p className="text-sm text-slate-800 flex-1">{agreement.text}</p>
                <button
                  onClick={() => handleDelete(agreement.id)}
                  disabled={isPending}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="Write a new agreement…"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={isPending || !newText.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            Add
          </button>
        </form>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  )
}
