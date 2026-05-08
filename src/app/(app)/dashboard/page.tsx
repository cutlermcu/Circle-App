import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { count: totalQuestions }, { count: usedCount }] = await Promise.all([
    supabase.from('profiles').select('name').eq('id', user!.id).single(),
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('used_questions').select('*', { count: 'exact', head: true })
      .eq('teacher_id', user!.id),
  ])

  const unusedCount = (totalQuestions ?? 0) - (usedCount ?? 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {profile?.name ?? 'Teacher'}
        </h1>
        <p className="mt-1 text-slate-500">Ready to hold a circle?</p>
      </div>

      <Link
        href="/circle"
        className="flex items-center justify-between p-6 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors group"
      >
        <div>
          <div className="text-lg font-semibold">Start a Circle</div>
          <div className="text-indigo-200 text-sm mt-0.5">
            Walk through all 5 steps with your class
          </div>
        </div>
        <div className="text-3xl group-hover:translate-x-1 transition-transform">→</div>
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-3xl font-bold text-indigo-600">{totalQuestions ?? 0}</div>
          <div className="text-sm text-slate-500 mt-1">Questions in bank</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-3xl font-bold text-emerald-600">{unusedCount}</div>
          <div className="text-sm text-slate-500 mt-1">Unused questions</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-3xl font-bold text-amber-500">{usedCount ?? 0}</div>
          <div className="text-sm text-slate-500 mt-1">Questions used</div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
          Circle Steps
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {[
            { step: 1, label: 'Agreements', desc: 'Set the container for the circle', icon: '📜' },
            { step: 2, label: 'Grounding', desc: 'Arrive together with a grounding practice', icon: '🌿' },
            { step: 3, label: 'Check-in', desc: 'Each person shares how they\'re showing up', icon: '💬' },
            { step: 4, label: 'Question Rounds', desc: 'Explore a topic with guided questions', icon: '❓' },
            { step: 5, label: 'Appreciations', desc: 'Close with gratitude', icon: '✨' },
          ].map(item => (
            <div key={item.step} className="flex items-center gap-4 px-5 py-4">
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <div className="font-medium text-slate-900">{item.step}. {item.label}</div>
                <div className="text-sm text-slate-500">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
          Customize Your Circle
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: '/settings/agreements', label: 'Agreements', desc: 'Edit your agreements' },
            { href: '/settings/questions', label: 'Questions', desc: 'Add custom questions' },
            { href: '/settings/prompts', label: 'Prompts', desc: 'Customize prompts' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="font-medium text-slate-900">{item.label}</div>
              <div className="text-sm text-slate-500 mt-0.5">{item.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
