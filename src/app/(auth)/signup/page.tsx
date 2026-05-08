'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Create your account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Your name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Ms. Johnson"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="you@school.edu"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="At least 6 characters"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
