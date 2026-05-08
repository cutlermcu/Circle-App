'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function Navbar({ name }: { name: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/circle', label: 'Run Circle' },
    { href: '/settings/agreements', label: 'Agreements' },
    { href: '/settings/questions', label: 'Questions' },
    { href: '/settings/prompts', label: 'Prompts' },
  ]

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-indigo-900">
              <span className="text-xl">○</span>
              <span className="text-base">Circle App</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-slate-500">{name}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Sign out
            </button>
            <button
              className="md:hidden p-1 text-slate-500"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-3 space-y-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  pathname === link.href
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
