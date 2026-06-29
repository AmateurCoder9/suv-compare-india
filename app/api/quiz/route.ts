import { NextRequest, NextResponse } from 'next/server'
import { scoreVariantsForQuiz, QuizAnswers } from '@/lib/quiz-engine'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const budget = parseFloat(searchParams.get('budget') || '20')
    const usage = (searchParams.get('usage') || 'city') as QuizAnswers['usage']
    const family = (searchParams.get('family') || 'small') as QuizAnswers['familySize']
    const transmission = (searchParams.get('transmission') || 'any') as QuizAnswers['transmission']
    const priority = (searchParams.get('priority') || 'luxury') as QuizAnswers['priority']

    const answers: QuizAnswers = {
      budgetMax: budget,
      usage,
      familySize: family,
      transmission,
      priority
    }

    const top3 = await scoreVariantsForQuiz(answers)
    return NextResponse.json({ data: { top3 } })
  } catch (error) {
    console.error('Quiz recommendation failed:', error)
    return NextResponse.json({ error: 'Quiz recommendation failed' }, { status: 500 })
  }
}
