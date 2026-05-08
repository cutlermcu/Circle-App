import { createClient } from '@/lib/supabase/server'
import QuestionsManager from './QuestionsManager'

export default async function QuestionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: globalQuestions }, { data: myQuestions }, { data: usedData }] = await Promise.all([
    supabase.from('questions').select('*').is('teacher_id', null).order('category'),
    supabase.from('questions').select('*').eq('teacher_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('used_questions').select('question_id').eq('teacher_id', user!.id),
  ])

  const usedIds = new Set((usedData ?? []).map(u => u.question_id))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Questions</h1>
        <p className="text-slate-500 mt-1">
          Browse the question bank and add your own private questions.
        </p>
      </div>
      <QuestionsManager
        globalQuestions={(globalQuestions ?? []).map(q => ({ ...q, used: usedIds.has(q.id) }))}
        myQuestions={(myQuestions ?? []).map(q => ({ ...q, used: usedIds.has(q.id) }))}
        teacherId={user!.id}
      />
    </div>
  )
}
