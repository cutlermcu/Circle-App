'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setQuestionImage(teacherId: string, questionId: string, imageUrl: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== teacherId) throw new Error('Unauthorized')

  await supabase
    .from('questions')
    .update({ image_url: imageUrl })
    .eq('id', questionId)
    .eq('teacher_id', teacherId)

  revalidatePath('/settings/questions')
}

export async function setPromptImage(teacherId: string, promptId: string, imageUrl: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== teacherId) throw new Error('Unauthorized')

  await supabase
    .from('prompts')
    .update({ image_url: imageUrl })
    .eq('id', promptId)
    .eq('teacher_id', teacherId)

  revalidatePath('/settings/prompts')
}
