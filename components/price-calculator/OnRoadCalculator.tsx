'use client'

import React, { useState } from 'react'
import { RTO_RATES, computeOnRoadPrice } from '@/lib/rto-rates'
import { EMICalculator } from './EMICalculator'

interface OnRoadCalculatorProps {
  exShowroomPrice: number
}

export function OnRoadCalculator({ exShowroomPrice }: OnRoadCalculatorProps) {
  const [activeTab, setActiveTab] = useState<'onroad' | 'emi'>('onroad')
  const [stateCode, setStateCode] = useState<string>('DL')
  const [includeWarranty, setIncludeWarranty] = useState<boolean>(false)
  const [accessoriesBudget, setAccessoriesBudget] = useState<number>(10000)

  const breakdown = computeOnRoadPrice(
    exShowroomPrice,
    stateCode,
    includeWarranty,
    accessoriesBudget
  )

  const formatCost = (val: number) => {
    return `₹${Math.round(val * 100000).toLocaleString('en-IN')}`
  }

  return (
    <div 
      className="border border-[var(--surface-3)] bg-[var(--surface-1)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] space-y-6"
    >
      <div className="flex items-center justify-between border-b border-[var(--surface-3)] pb-3">
        <h3 className="text-base font-bold text-[var(--text-primary)]">Finance & Pricing Calculator</h3>
        <div className="flex bg-[var(--surface-2)] p-0.5 rounded-[var(--radius-md)]">
          <button
            onClick={() => setActiveTab('onroad')}
            className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-sm)] transition-all cursor-pointer ${
              activeTab === 'onroad' 
                ? 'bg-[var(--surface-0)] text-[var(--text-primary)] shadow-sm' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            On-Road Estimate
          </button>
          <button
            onClick={() => setActiveTab('emi')}
            className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-sm)] transition-all cursor-pointer ${
              activeTab === 'emi' 
                ? 'bg-[var(--surface-0)] text-[var(--text-primary)] shadow-sm' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            EMI Calculator
          </button>
        </div>
      </div>

      {activeTab === 'onroad' ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Registration State (RTO)
              </label>
              <select
                className="w-full bg-[var(--surface-2)] border border-[var(--surface-3)] rounded-[var(--radius-md)] p-2.5 text-xs text-[var(--text-primary)] font-medium focus:ring-1 focus:ring-[var(--accent-color)] focus:outline-none"
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
              >
                {Object.entries(RTO_RATES).map(([code, details]) => (
                  <option key={code} value={code}>
                    {details.name} ({details.taxPercent}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                <span>Accessories Budget</span>
                <span className="font-mono text-xs text-[var(--text-primary)]">
                  ₹{accessoriesBudget.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50000"
                step="5000"
                className="w-full h-1.5 bg-[var(--surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
                value={accessoriesBudget}
                onChange={(e) => setAccessoriesBudget(parseInt(e.target.value))}
              />
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <input
                type="checkbox"
                id="warrantyToggle"
                className="w-4 h-4 rounded border-[var(--surface-3)] text-[var(--accent-color)] focus:ring-[var(--accent-color)] cursor-pointer"
                checked={includeWarranty}
                onChange={(e) => setIncludeWarranty(e.target.checked)}
              />
              <label 
                htmlFor="warrantyToggle" 
                className="text-xs font-medium text-[var(--text-secondary)] cursor-pointer select-none"
              >
                Include Extended 5-Year Warranty (+₹25,000)
              </label>
            </div>
          </div>

          {/* Outputs */}
          <div className="bg-[var(--surface-0)] border border-[var(--surface-3)] rounded-[var(--radius-md)] p-4 space-y-4">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--surface-3)] pb-2">
              Breakdown Estimate
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Ex-Showroom Price</span>
                <span className="font-mono text-[var(--text-primary)]">{formatCost(breakdown.exShowroom)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">RTO Tax ({RTO_RATES[stateCode]?.taxPercent}%)</span>
                <span className="font-mono text-[var(--text-primary)]">+{formatCost(breakdown.rtoTax)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Comprehensive Insurance (1-Yr est.)</span>
                <span className="font-mono text-[var(--text-primary)]">+{formatCost(breakdown.insurance1yr)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">FASTag Fees</span>
                <span className="font-mono text-[var(--text-primary)]">+{formatCost(breakdown.fastag)}</span>
              </div>
              {accessoriesBudget > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Accessories</span>
                  <span className="font-mono text-[var(--text-primary)]">+{formatCost(breakdown.accessories)}</span>
                </div>
              )}
              {includeWarranty && (
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Extended Warranty</span>
                  <span className="font-mono text-[var(--text-primary)]">+{formatCost(breakdown.extendedWarranty)}</span>
                </div>
              )}
              <div className="border-t border-[var(--surface-3)] pt-3 flex justify-between items-center font-bold text-sm">
                <span className="text-[var(--text-primary)] font-bold">Estimated On-Road</span>
                <span className="font-mono text-[var(--accent-color)] text-base font-extrabold">
                  {formatCost(breakdown.total)}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] italic leading-normal">
              Note: On-road prices are approximations. Road taxes and insurance premiums vary by city. Check with local dealers for final quotes.
            </p>
          </div>
        </div>
      ) : (
        <EMICalculator totalOnRoad={breakdown.total} />
      )}
    </div>
  )
}
