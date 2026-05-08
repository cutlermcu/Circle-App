'use server'

import { createClient } from '@/lib/supabase/server'

export async function markQuestionUsed(teacherId: string, questionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== teacherId) throw new Error('Unauthorized')

  await supabase
    .from('used_questions')
    .upsert({ teacher_id: teacherId, question_id: questionId }, { onConflict: 'teacher_id,question_id' })
}

export async function resetUsedQuestions(teacherId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== teacherId) throw new Error('Unauthorized')

  await supabase
    .from('used_questions')
    .delete()
    .eq('teacher_id', teacherId)
}
