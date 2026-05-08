import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-full flex flex-col">
      <Navbar name={profile?.name ?? user.email ?? 'Teacher'} />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
