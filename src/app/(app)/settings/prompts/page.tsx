import { createClient } from '@/lib/supabase/server'
import PromptsManager from './PromptsManager'

export default async function PromptsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: globalGrounding },
    { data: globalCheckin },
    { data: globalAppreciation },
    { data: myPrompts },
  ] = await Promise.all([
    supabase.from('prompts').select('*').eq('section', 'grounding').is('teacher_id', null),
    supabase.from('prompts').select('*').eq('section', 'checkin').is('teacher_id', null),
    supabase.from('prompts').select('*').eq('section', 'appreciation').is('teacher_id', null),
    supabase.from('prompts').select('*').eq('teacher_id', user!.id).order('section'),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Prompts</h1>
        <p className="text-slate-500 mt-1">
          View default prompts and add your own for grounding, check-in, and appreciations.
        </p>
      </div>
      <PromptsManager
        globalGrounding={globalGrounding ?? []}
        globalCheckin={globalCheckin ?? []}
        globalAppreciation={globalAppreciation ?? []}
        myPrompts={myPrompts ?? []}
        teacherId={user!.id}
      />
    </div>
  )
}
