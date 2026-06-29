'use client'

import React, { useState } from 'react'
import { computeEMI } from '@/lib/emi'

interface EMICalculatorProps {
  totalOnRoad: number
}

export function EMICalculator({ totalOnRoad }: EMICalculatorProps) {
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20)
  const [interestRate, setInterestRate] = useState<number>(8.5)
  const [tenureYears, setTenureYears] = useState<number>(5)

  const result = computeEMI(totalOnRoad, downPaymentPct, interestRate, tenureYears)

  // Suggestion: if EMI > 30,000, calculate EMI with 30% down payment
  const showSuggestion = result.monthlyEMI > 30000
  const suggestionResult = computeEMI(totalOnRoad, 30, interestRate, tenureYears)

  const formatCurrency = (val: number) => {
    return `₹${Math.round(val * 100000).toLocaleString('en-IN')}`
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Inputs */}
      <div className="space-y-5">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            <span>Down Payment ({downPaymentPct}%)</span>
            <span className="font-mono text-xs text-[var(--text-primary)]">
              {formatCurrency(result.downPayment)}
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="50"
            step="5"
            className="w-full h-1.5 bg-[var(--surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
            value={downPaymentPct}
            onChange={(e) => setDownPaymentPct(parseInt(e.target.value))}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            <span>Interest Rate (p.a.)</span>
            <span className="font-mono text-xs text-[var(--text-primary)]">
              {interestRate.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min="7"
            max="13"
            step="0.1"
            className="w-full h-1.5 bg-[var(--surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
            value={interestRate}
            onChange={(e) => setInterestRate(parseFloat(e.target.value))}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Loan Tenure
          </label>
          <div className="grid grid-cols-3 bg-[var(--surface-2)] p-0.5 rounded-[var(--radius-md)]">
            {[3, 5, 7].map((yrs) => (
              <button
                key={yrs}
                onClick={() => setTenureYears(yrs)}
                className={`py-2 text-xs font-semibold rounded-[var(--radius-sm)] transition-all cursor-pointer ${
                  tenureYears === yrs
                    ? 'bg-[var(--surface-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {yrs} Years
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div className="space-y-4">
        <div className="bg-[var(--surface-0)] border border-[var(--surface-3)] rounded-[var(--radius-md)] p-4 space-y-4">
          <div className="text-center space-y-1 border-b border-[var(--surface-3)] pb-3">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
              Estimated Monthly EMI
            </span>
            <span className="text-2xl font-extrabold text-[var(--accent-color)] font-mono block">
              ₹{result.monthlyEMI.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Total Loan Amount</span>
              <span className="font-mono text-[var(--text-primary)]">{formatCurrency(result.loanAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Total Interest Payable</span>
              <span className="font-mono text-[var(--text-primary)]">{formatCurrency(result.totalInterest)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Total Principal + Interest</span>
              <span className="font-mono text-[var(--text-primary)]">{formatCurrency(result.totalAmount)}</span>
            </div>
            <div className="border-t border-[var(--surface-3)] pt-3 flex justify-between items-center font-bold text-xs">
              <span className="text-[var(--text-primary)] font-bold">Effective Cost (Incl. Down Payment)</span>
              <span className="font-mono text-[var(--text-primary)]">{formatCurrency(result.effectiveCost)}</span>
            </div>
          </div>
        </div>

        {showSuggestion && (
          <div className="bg-[var(--amber-light)] border border-[var(--amber)] rounded-[var(--radius-md)] p-3.5 text-xs text-[var(--text-primary)] leading-relaxed">
            💡 <strong>EMI Optimization Tip</strong>: By increasing your down payment to <strong>30%</strong> ({formatCurrency(totalOnRoad * 0.3)}), your monthly EMI drops from ₹{result.monthlyEMI.toLocaleString('en-IN')} to <strong>₹{suggestionResult.monthlyEMI.toLocaleString('en-IN')}</strong> (saving ₹{(result.monthlyEMI - suggestionResult.monthlyEMI).toLocaleString('en-IN')} per month).
          </div>
        )}
      </div>
    </div>
  )
}
