export type Profile = {
  id: string
  name: string
  email: string
  created_at: string
}

export type Agreement = {
  id: string
  teacher_id: string | null
  text: string
  is_active: boolean
  sort_order: number
  created_at: string
}

export type Question = {
  id: string
  teacher_id: string | null
  text: string
  category: string
  image_url: string | null
  created_at: string
  used?: boolean
}

export type UsedQuestion = {
  id: string
  teacher_id: string
  question_id: string
  used_at: string
}

export type Prompt = {
  id: string
  teacher_id: string | null
  section: 'grounding' | 'checkin' | 'appreciation'
  text: string
  image_url: string | null
  created_at: string
}

export type CircleSession = {
  id: string
  teacher_id: string
  created_at: string
  completed_at: string | null
}

export type CircleStep = 'agreements' | 'grounding' | 'checkin' | 'questions' | 'appreciations'

export type CircleData = {
  agreements: Agreement[]
  groundingPrompts: Prompt[]
  checkinPrompts: Prompt[]
  appreciationPrompts: Prompt[]
  questions: Question[]
}
