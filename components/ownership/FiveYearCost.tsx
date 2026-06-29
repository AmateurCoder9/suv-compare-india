'use client'

import React, { useState } from 'react'
import { computeFiveYearOwnershipCost } from '@/lib/ownership-cost'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Landmark } from 'lucide-react'

interface FiveYearCostProps {
  exShowroomLakh: number
  araiKmpl: number
  annualServiceCostInr?: number
  insuranceEstInrLakh?: number
  tyreReplacementCostInr?: number
  resaleEstimatePercent?: number
}

export function FiveYearCost({
  exShowroomLakh,
  araiKmpl,
  annualServiceCostInr = 8000,
  insuranceEstInrLakh = 0,
  tyreReplacementCostInr = 24000,
  resaleEstimatePercent = 55
}: FiveYearCostProps) {
  const [annualKm, setAnnualKm] = useState<number>(15000)
  const [fuelPrice, setFuelPrice] = useState<number>(104)

  const breakdown = computeFiveYearOwnershipCost(
    exShowroomLakh,
    araiKmpl,
    annualServiceCostInr,
    insuranceEstInrLakh,
    tyreReplacementCostInr,
    resaleEstimatePercent,
    annualKm,
    fuelPrice
  )

  const formatLakh = (val: number) => {
    return `₹${val.toFixed(2)} Lakh`
  }

  // Chart Data: Two horizontal bars for comparison
  // Bar 1: Total Expenses
  // Bar 2: Resale Offset Value
  const chartData = [
    {
      name: 'Expenses',
      'Ex-Showroom': parseFloat(breakdown.purchasePrice.toFixed(2)),
      'Insurance': parseFloat(breakdown.totalInsurance.toFixed(2)),
      'Fuel Cost': parseFloat(breakdown.totalFuelCost.toFixed(2)),
      'Service Cost': parseFloat(breakdown.totalService.toFixed(2)),
      'Tyres': parseFloat(breakdown.tyreReplacement.toFixed(2)),
    },
    {
      name: 'Resale Value',
      'Resale Value': parseFloat(breakdown.resaleValue.toFixed(2)),
    }
  ]

  return (
    <div 
      className="border border-[var(--surface-3)] bg-[var(--surface-1)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] space-y-6"
    >
      <div className="flex items-center gap-2 border-b border-[var(--surface-3)] pb-3">
        <Landmark className="w-5 h-5 text-[var(--accent-color)]" />
        <h3 className="text-base font-bold text-[var(--text-primary)]">5-Year True Cost of Ownership</h3>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Annual Mileage (km)
          </label>
          <select
            className="w-full bg-[var(--surface-2)] border border-[var(--surface-3)] rounded-[var(--radius-md)] p-2 text-xs text-[var(--text-primary)] font-medium focus:ring-1 focus:ring-[var(--accent-color)] focus:outline-none"
            value={annualKm}
            onChange={(e) => setAnnualKm(parseInt(e.target.value))}
          >
            <option value={10000}>10,000 km / year</option>
            <option value={15000}>15,000 km / year</option>
            <option value={20000}>20,000 km / year</option>
            <option value={25000}>25,000 km / year</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            <span>Fuel Price (Petrol)</span>
            <span className="font-mono text-xs text-[var(--text-primary)]">₹{fuelPrice}/L</span>
          </div>
          <input
            type="range"
            min="90"
            max="120"
            step="1"
            className="w-full h-1.5 bg-[var(--surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
            value={fuelPrice}
            onChange={(e) => setFuelPrice(parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={80} style={{ fontSize: 10, fontWeight: 600 }} />
            <Tooltip formatter={(value: number) => `₹${value}L`} />
            <Bar dataKey="Ex-Showroom" stackId="a" fill="#1C1C1E" />
            <Bar dataKey="Insurance" stackId="a" fill="#FF9500" />
            <Bar dataKey="Fuel Cost" stackId="a" fill="#007AFF" />
            <Bar dataKey="Service Cost" stackId="a" fill="#34C759" />
            <Bar dataKey="Tyres" stackId="a" fill="#FF3B30" />
            <Bar dataKey="Resale Value" fill="#34C759" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Map */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] justify-center text-[var(--text-secondary)] font-semibold uppercase tracking-wider bg-[var(--surface-2)] p-2.5 rounded-[var(--radius-md)]">
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#1C1C1E] rounded-sm" /> Ex-Showroom</div>
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#FF9500] rounded-sm" /> Insurance</div>
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#007AFF] rounded-sm" /> Fuel Cost</div>
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#34C759] rounded-sm" /> Service</div>
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#FF3B30] rounded-sm" /> Tyres</div>
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-[#34C759] bg-[var(--surface-1)] rounded-sm" /> Resale Offset</div>
      </div>

      {/* Outputs Breakdown */}
      <div className="grid sm:grid-cols-3 gap-4 border-t border-[var(--surface-3)] pt-4 text-center">
        <div className="bg-[var(--surface-0)] border border-[var(--surface-3)] rounded-[var(--radius-md)] p-3">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
            Net Ownership Cost
          </span>
          <span className="text-base font-extrabold text-[var(--text-primary)] font-mono mt-0.5 block">
            {formatLakh(breakdown.netCostOfOwning)}
          </span>
        </div>
        <div className="bg-[var(--surface-0)] border border-[var(--surface-3)] rounded-[var(--radius-md)] p-3">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
            Cost Per Kilometer
          </span>
          <span className="text-base font-extrabold text-[var(--accent-color)] font-mono mt-0.5 block">
            ₹{breakdown.costPerKm.toFixed(2)}/km
          </span>
        </div>
        <div className="bg-[var(--surface-0)] border border-[var(--surface-3)] rounded-[var(--radius-md)] p-3">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
            5-Year Resale Value
          </span>
          <span className="text-base font-extrabold text-[var(--green)] font-mono mt-0.5 block">
            {formatLakh(breakdown.resaleValue)}
          </span>
        </div>
      </div>
    </div>
  )
}
