import { createClient } from '@/lib/supabase/server'
import AgreementsManager from './AgreementsManager'

export default async function AgreementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: globalAgreements }, { data: myAgreements }] = await Promise.all([
    supabase.from('agreements').select('*').is('teacher_id', null).order('sort_order'),
    supabase.from('agreements').select('*').eq('teacher_id', user!.id).order('sort_order'),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agreements</h1>
        <p className="text-slate-500 mt-1">
          Manage the agreements read at the start of every circle.
        </p>
      </div>
      <AgreementsManager
        globalAgreements={globalAgreements ?? []}
        myAgreements={myAgreements ?? []}
        teacherId={user!.id}
      />
    </div>
  )
}
