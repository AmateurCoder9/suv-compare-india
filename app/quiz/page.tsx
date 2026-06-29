'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Loader2, RefreshCw, GitCompare } from 'lucide-react'
import { QuizAnswers, ScoredVariant } from '@/lib/quiz-engine'

interface QuizStep {
  title: string
  question: string
  field: keyof QuizAnswers
  options: { label: string; value: any }[]
}

const QUIZ_STEPS: QuizStep[] = [
  {
    title: "Budget",
    question: "What is your maximum budget (Ex-Showroom)?",
    field: 'budgetMax',
    options: [
      { label: "Under ₹12 Lakh", value: 12 },
      { label: "₹12–15 Lakh", value: 15 },
      { label: "₹15–18 Lakh", value: 18 },
      { label: "₹18–20 Lakh", value: 20 }
    ]
  },
  {
    title: "Usage",
    question: "How do you mostly drive?",
    field: 'usage',
    options: [
      { label: "Mostly city traffic", value: "city" },
      { label: "Mostly highways", value: "highway" },
      { label: "Both city and highway equally", value: "mixed" },
      { label: "Weekend trips only", value: "weekend" }
    ]
  },
  {
    title: "Family Size",
    question: "How many people usually ride with you?",
    field: 'familySize',
    options: [
      { label: "Just me or a couple", value: "couple" },
      { label: "Small family (1–2 kids)", value: "small" },
      { label: "Large family (3+ or joint family)", value: "large" },
      { label: "Frequent airport drops", value: "airport" }
    ]
  },
  {
    title: "Transmission",
    question: "Gearbox preference?",
    field: 'transmission',
    options: [
      { label: "Manual — I like control", value: "manual" },
      { label: "Automatic — city convenience", value: "automatic" },
      { label: "No preference", value: "any" }
    ]
  },
  {
    title: "Priority Feature",
    question: "Your single most important priority?",
    field: 'priority',
    options: [
      { label: "Panoramic Sunroof", value: "sunroof" },
      { label: "ADAS / safety tech", value: "adas" },
      { label: "Boot space and practicality", value: "boot" },
      { label: "Ventilated + premium cabin", value: "luxury" },
      { label: "Best fuel economy", value: "economy" },
      { label: "Lowest ownership cost", value: "ownership" }
    ]
  }
]

export default function QuizPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [results, setResults] = useState<ScoredVariant[]>([])

  const handleOptionSelect = (value: any) => {
    const field = QUIZ_STEPS[currentStep].field
    const newAnswers = { ...answers, [field]: value }
    setAnswers(newAnswers)

    if (currentStep < QUIZ_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Last step: Submit
      submitQuiz(newAnswers as QuizAnswers)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const submitQuiz = async (finalAnswers: QuizAnswers) => {
    setLoading(true)
    setCurrentStep(QUIZ_STEPS.length) // Go to results view
    try {
      const query = new URLSearchParams({
        budget: finalAnswers.budgetMax.toString(),
        usage: finalAnswers.usage,
        family: finalAnswers.familySize,
        transmission: finalAnswers.transmission,
        priority: finalAnswers.priority
      }).toString()

      const res = await fetch(`/api/quiz?${query}`)
      if (res.ok) {
        const json = await res.json()
        setResults(json.data?.top3 || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const resetQuiz = () => {
    setAnswers({})
    setCurrentStep(0)
    setResults([])
  }

  // Progress Bar Width
  const progressPercent = currentStep === QUIZ_STEPS.length 
    ? 100 
    : ((currentStep) / QUIZ_STEPS.length) * 100

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl min-h-[75vh] flex flex-col justify-center">
      {/* Progress Bar (Only show during quiz) */}
      {currentStep < QUIZ_STEPS.length && (
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            <span>Question {currentStep + 1} of {QUIZ_STEPS.length}</span>
            <span>{QUIZ_STEPS[currentStep].title}</span>
          </div>
          <div className="h-1 bg-[var(--surface-3)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--accent-color)] transition-all duration-300 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Quiz Steps (Q1 to Q5) */}
      {currentStep < QUIZ_STEPS.length && (
        <div className="border border-[var(--surface-3)] bg-[var(--surface-1)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-sm)] space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              {QUIZ_STEPS[currentStep].question}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">Select one option to proceed</p>
          </div>

          <div className="grid gap-3">
            {QUIZ_STEPS[currentStep].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(opt.value)}
                className="w-full text-left bg-[var(--surface-0)] border border-[var(--surface-3)] hover:border-[var(--accent-color)] hover:bg-[var(--accent-light)]/10 text-xs font-semibold text-[var(--text-primary)] p-4 rounded-[var(--radius-md)] cursor-pointer transition-all duration-150 h-[56px] flex items-center justify-between group"
              >
                <span>{opt.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--accent-color)] group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>

          {currentStep > 0 && (
            <div className="flex justify-start border-t border-[var(--surface-3)] pt-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading Screen */}
      {currentStep === QUIZ_STEPS.length && loading && (
        <div className="border border-[var(--surface-3)] bg-[var(--surface-1)] rounded-[var(--radius-lg)] p-12 text-center shadow-[var(--shadow-sm)] space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-color)] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Analyzing Database</h3>
            <p className="text-xs text-[var(--text-secondary)]">Calculating specs match scoring matching your requirements...</p>
          </div>
        </div>
      )}

      {/* Results Screen */}
      {currentStep === QUIZ_STEPS.length && !loading && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Your SUV Matches</h2>
            <p className="text-xs text-[var(--text-secondary)]">Based on your budget, transmission, usage splits, and priority needs</p>
          </div>

          <div className="space-y-4">
            {results.map((item, idx) => (
              <div 
                key={item.slug}
                className="border border-[var(--surface-3)] bg-[var(--surface-0)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] relative overflow-hidden"
              >
                {/* Ranking Ribbon */}
                <div className="absolute top-0 right-0 bg-[var(--accent-light)] text-[var(--accent-color)] text-[10px] font-extrabold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  #{idx + 1} Recommendation
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      {item.manufacturerName}
                    </span>
                    <h3 className="text-base font-bold text-[var(--text-primary)] mt-0.5">
                      {item.modelName} <span className="text-[var(--accent-color)]">{item.name}</span>
                    </h3>
                  </div>

                  <div className="flex justify-between items-center text-xs border-y border-[var(--surface-3)]/60 py-2">
                    <div>
                      <span className="text-[var(--text-secondary)] block">Ex-Showroom Price</span>
                      <strong className="text-[var(--text-primary)] font-bold">₹{item.price.toFixed(2)} Lakh</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[var(--text-secondary)] block">Quiz Match Score</span>
                      <strong className="text-[var(--green)] font-bold">{item.score}/100</strong>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.explanation}
                  </p>

                  <div className="flex justify-end pt-1">
                    <Link
                      href={`/variants/${item.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-color)] hover:underline"
                    >
                      View Full Specs <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {results.length >= 2 && (
            <button
              onClick={() => {
                const slugs = results.map(r => r.slug).join(',')
                router.push(`/compare?slugs=${slugs}`)
              }}
              className="w-full bg-[var(--accent-color)] text-white border-none rounded-[var(--radius-md)] p-3 text-xs font-bold cursor-pointer transition-all hover:opacity-90 flex items-center justify-center gap-2"
            >
              <GitCompare className="w-4 h-4" /> Compare these {results.length} side-by-side
            </button>
          )}

          <div className="flex justify-center pt-2">
            <button
              onClick={resetQuiz}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retake Find My SUV Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
