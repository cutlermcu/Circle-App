'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { CircleData, Question, Prompt } from '@/types'
import { markQuestionUsed, resetUsedQuestions } from '@/actions/circle'

const STEPS = [
  { key: 'agreements', label: 'Agreements' },
  { key: 'grounding', label: 'Grounding' },
  { key: 'checkin', label: 'Check-in' },
  { key: 'questions', label: 'Question Rounds' },
  { key: 'appreciations', label: 'Appreciations' },
] as const

type StepKey = typeof STEPS[number]['key']

export default function CircleRunner({
  data,
  teacherId,
}: {
  data: CircleData
  teacherId: string
}) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [questions, setQuestions] = useState<Question[]>(data.questions)
  const [showQuestionPicker, setShowQuestionPicker] = useState(false)
  const [isPending, startTransition] = useTransition()

  const unusedQuestions = questions.filter(q => !q.used)
  const usedQuestions = questions.filter(q => q.used)

  const getRandomPrompt = useCallback((prompts: Prompt[]) => {
    return prompts[Math.floor(Math.random() * prompts.length)] ?? null
  }, [])

  function handleStepEnter(stepIndex: number) {
    const step = STEPS[stepIndex].key
    if (step === 'grounding') {
      setCurrentPrompt(getRandomPrompt(data.groundingPrompts))
    } else if (step === 'checkin') {
      setCurrentPrompt(getRandomPrompt(data.checkinPrompts))
    } else if (step === 'appreciations') {
      setCurrentPrompt(getRandomPrompt(data.appreciationPrompts))
    } else if (step === 'questions') {
      pickRandomQuestion()
    }
  }

  function goToStep(index: number) {
    setShowQuestionPicker(false)
    setCurrentStep(index)
    handleStepEnter(index)
  }

  function nextStep() {
    if (currentStep < STEPS.length - 1) {
      goToStep(currentStep + 1)
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      goToStep(currentStep - 1)
    }
  }

  function pickRandomQuestion() {
    const unused = questions.filter(q => !q.used)
    if (unused.length === 0) return
    const pick = unused[Math.floor(Math.random() * unused.length)]
    setCurrentQuestion(pick)
    setShowQuestionPicker(false)
  }

  function selectQuestion(question: Question) {
    setCurrentQuestion(question)
    setShowQuestionPicker(false)
  }

  function markCurrentUsed() {
    if (!currentQuestion) return
    startTransition(async () => {
      await markQuestionUsed(teacherId, currentQuestion.id)
      setQuestions(prev =>
        prev.map(q => q.id === currentQuestion.id ? { ...q, used: true } : q)
      )
      setCurrentQuestion(prev => prev ? { ...prev, used: true } : null)
    })
  }

  function handleResetUsed() {
    startTransition(async () => {
      await resetUsedQuestions(teacherId)
      setQuestions(prev => prev.map(q => ({ ...q, used: false })))
      setCurrentQuestion(null)
    })
  }

  const step = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => goToStep(i)}
              className={`flex flex-col items-center gap-1 flex-1 ${i <= currentStep ? 'opacity-100' : 'opacity-40'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                i === currentStep
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : i < currentStep
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-600'
                  : 'bg-white border-slate-300 text-slate-400'
              }`}>
                {i < currentStep ? '✓' : i + 1}
              </div>
              <span className={`hidden sm:block text-xs font-medium ${
                i === currentStep ? 'text-indigo-700' : 'text-slate-400'
              }`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div
            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1">
        {step.key === 'agreements' && (
          <StepAgreements agreements={data.agreements} />
        )}
        {step.key === 'grounding' && (
          <StepPrompt
            title="Grounding"
            prompt={currentPrompt}
            allPrompts={data.groundingPrompts}
            onPickRandom={() => setCurrentPrompt(getRandomPrompt(data.groundingPrompts))}
            onSelect={(p) => setCurrentPrompt(p)}
          />
        )}
        {step.key === 'checkin' && (
          <StepPrompt
            title="Check-in"
            prompt={currentPrompt}
            allPrompts={data.checkinPrompts}
            onPickRandom={() => setCurrentPrompt(getRandomPrompt(data.checkinPrompts))}
            onSelect={(p) => setCurrentPrompt(p)}
          />
        )}
        {step.key === 'questions' && (
          <StepQuestions
            currentQuestion={currentQuestion}
            questions={questions}
            unusedCount={unusedQuestions.length}
            showPicker={showQuestionPicker}
            isPending={isPending}
            onPickRandom={pickRandomQuestion}
            onTogglePicker={() => setShowQuestionPicker(!showQuestionPicker)}
            onSelectQuestion={selectQuestion}
            onMarkUsed={markCurrentUsed}
            onResetUsed={handleResetUsed}
          />
        )}
        {step.key === 'appreciations' && (
          <StepPrompt
            title="Appreciations"
            prompt={currentPrompt}
            allPrompts={data.appreciationPrompts}
            onPickRandom={() => setCurrentPrompt(getRandomPrompt(data.appreciationPrompts))}
            onSelect={(p) => setCurrentPrompt(p)}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-200">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>

        {isLastStep ? (
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Complete Circle ✓
          </button>
        ) : (
          <button
            onClick={nextStep}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Next Step →
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Step Components ───────────────────────────────────────────────────────────

function StepAgreements({ agreements }: { agreements: CircleData['agreements'] }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Circle Agreements</h2>
        <p className="text-slate-500 mt-1">Read each agreement aloud together before beginning.</p>
      </div>
      <div className="space-y-3">
        {agreements.map((agreement, i) => (
          <div key={agreement.id} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
              {i + 1}
            </div>
            <p className="text-slate-800">{agreement.text}</p>
          </div>
        ))}
        {agreements.length === 0 && (
          <p className="text-slate-400 text-sm">No agreements found. Add some in Settings → Agreements.</p>
        )}
      </div>
    </div>
  )
}

function StepPrompt({
  title,
  prompt,
  allPrompts,
  onPickRandom,
  onSelect,
}: {
  title: string
  prompt: Prompt | null
  allPrompts: Prompt[]
  onPickRandom: () => void
  onSelect: (p: Prompt) => void
}) {
  const [showAll, setShowAll] = useState(false)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      </div>

      {prompt ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-6">
          <p className="text-lg text-slate-800 leading-relaxed">{prompt.text}</p>
        </div>
      ) : (
        <div className="bg-slate-100 rounded-2xl p-8 mb-6 text-center text-slate-400">
          No prompt selected
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={onPickRandom}
          className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
        >
          ↻ Try another
        </button>
        <button
          onClick={() => setShowAll(!showAll)}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          {showAll ? 'Hide list' : 'Choose from list'}
        </button>
      </div>

      {showAll && (
        <div className="space-y-2">
          {allPrompts.map(p => (
            <button
              key={p.id}
              onClick={() => { onSelect(p); setShowAll(false) }}
              className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${
                prompt?.id === p.id
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                  : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50 text-slate-700'
              }`}
            >
              {p.text}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function StepQuestions({
  currentQuestion,
  questions,
  unusedCount,
  showPicker,
  isPending,
  onPickRandom,
  onTogglePicker,
  onSelectQuestion,
  onMarkUsed,
  onResetUsed,
}: {
  currentQuestion: Question | null
  questions: Question[]
  unusedCount: number
  showPicker: boolean
  isPending: boolean
  onPickRandom: () => void
  onTogglePicker: () => void
  onSelectQuestion: (q: Question) => void
  onMarkUsed: () => void
  onResetUsed: () => void
}) {
  const categories = [...new Set(questions.map(q => q.category))].sort()

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Question Rounds</h2>
        <p className="text-slate-500 mt-1">
          {unusedCount} unused question{unusedCount !== 1 ? 's' : ''} remaining
        </p>
      </div>

      {currentQuestion ? (
        <div className={`rounded-2xl border-2 p-8 mb-6 transition-colors ${
          currentQuestion.used ? 'border-slate-200 bg-slate-50' : 'border-indigo-200 bg-white'
        }`}>
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-3">
            {currentQuestion.category}
          </div>
          <p className="text-xl text-slate-900 leading-relaxed font-medium">{currentQuestion.text}</p>
          {currentQuestion.used && (
            <div className="mt-3 text-xs text-slate-400 bg-slate-100 inline-block px-2 py-0.5 rounded">
              Already used
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 mb-6 text-center">
          <p className="text-slate-400">Select a question to get started</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={onPickRandom}
          disabled={unusedCount === 0 || isPending}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ↻ Random unused question
        </button>
        <button
          onClick={onTogglePicker}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          {showPicker ? 'Hide list' : 'Choose from list'}
        </button>
        {currentQuestion && !currentQuestion.used && (
          <button
            onClick={onMarkUsed}
            disabled={isPending}
            className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Saving…' : '✓ Mark as used'}
          </button>
        )}
        {unusedCount === 0 && (
          <button
            onClick={onResetUsed}
            disabled={isPending}
            className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 disabled:opacity-50 transition-colors"
          >
            Reset used questions
          </button>
        )}
      </div>

      {showPicker && (
        <div className="space-y-4">
          {categories.map(cat => {
            const catQuestions = questions.filter(q => q.category === cat)
            return (
              <div key={cat}>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  {cat}
                </h3>
                <div className="space-y-1.5">
                  {catQuestions.map(q => (
                    <button
                      key={q.id}
                      onClick={() => onSelectQuestion(q)}
                      className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${
                        currentQuestion?.id === q.id
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                          : q.used
                          ? 'border-slate-100 bg-slate-50 text-slate-400'
                          : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50 text-slate-700'
                      }`}
                    >
                      <span>{q.text}</span>
                      {q.used && <span className="ml-2 text-xs text-slate-300">(used)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
