import { createClient } from '@/lib/supabase/server'
import CircleRunner from '@/components/CircleRunner'
import type { CircleData } from '@/types'

export default async function CirclePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: agreements },
    { data: groundingPrompts },
    { data: checkinPrompts },
    { data: appreciationPrompts },
    { data: allQuestions },
    { data: usedQuestions },
  ] = await Promise.all([
    supabase
      .from('agreements')
      .select('*')
      .or(`teacher_id.is.null,teacher_id.eq.${user!.id}`)
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('prompts')
      .select('*')
      .eq('section', 'grounding')
      .or(`teacher_id.is.null,teacher_id.eq.${user!.id}`),
    supabase
      .from('prompts')
      .select('*')
      .eq('section', 'checkin')
      .or(`teacher_id.is.null,teacher_id.eq.${user!.id}`),
    supabase
      .from('prompts')
      .select('*')
      .eq('section', 'appreciation')
      .or(`teacher_id.is.null,teacher_id.eq.${user!.id}`),
    supabase
      .from('questions')
      .select('*')
      .or(`teacher_id.is.null,teacher_id.eq.${user!.id}`)
      .order('category'),
    supabase
      .from('used_questions')
      .select('question_id')
      .eq('teacher_id', user!.id),
  ])

  const usedIds = new Set((usedQuestions ?? []).map(u => u.question_id))

  const questions = (allQuestions ?? []).map(q => ({
    ...q,
    used: usedIds.has(q.id),
  }))

  const circleData: CircleData = {
    agreements: agreements ?? [],
    groundingPrompts: groundingPrompts ?? [],
    checkinPrompts: checkinPrompts ?? [],
    appreciationPrompts: appreciationPrompts ?? [],
    questions,
  }

  return <CircleRunner data={circleData} teacherId={user!.id} />
}
