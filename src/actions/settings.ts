'use server'

import { createClient } from '@/lib/supabase/server'
import type { Agreement, Question, Prompt } from '@/types'

// ─── Agreements ───────────────────────────────────────────────────────────────

export async function addAgreement(teacherId: string, text: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== teacherId) return { error: 'Unauthorized', data: null }

  const { data, error } = await supabase
    .from('agreements')
    .insert({ teacher_id: teacherId, text, is_active: true })
    .select()
    .single()

  if (error) return { error: error.message, data: null }
  return { error: null, data: data as Agreement }
}

export async function deleteAgreement(teacherId: string, id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== teacherId) throw new Error('Unauthorized')

  await supabase.from('agreements').delete().eq('id', id).eq('teacher_id', teacherId)
}

export async function toggleAgreement(id: string, isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('agreements')
    .update({ is_active: isActive })
    .eq('id', id)
    .is('teacher_id', null)
}

// ─── Questions ────────────────────────────────────────────────────────────────

export async function addQuestion(teacherId: string, text: string, category: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== teacherId) return { error: 'Unauthorized', data: null }

  const { data, error } = await supabase
    .from('questions')
    .insert({ teacher_id: teacherId, text, category })
    .select()
    .single()

  if (error) return { error: error.message, data: null }
  return { error: null, data: data as Question }
}

export async function deleteQuestion(teacherId: string, id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== teacherId) throw new Error('Unauthorized')

  await supabase.from('questions').delete().eq('id', id).eq('teacher_id', teacherId)
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

export async function addPrompt(
  teacherId: string,
  section: 'grounding' | 'checkin' | 'appreciation',
  text: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== teacherId) return { error: 'Unauthorized', data: null }

  const { data, error } = await supabase
    .from('prompts')
    .insert({ teacher_id: teacherId, section, text })
    .select()
    .single()

  if (error) return { error: error.message, data: null }
  return { error: null, data: data as Prompt }
}

export async function deletePrompt(teacherId: string, id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== teacherId) throw new Error('Unauthorized')

  await supabase.from('prompts').delete().eq('id', id).eq('teacher_id', teacherId)
}
