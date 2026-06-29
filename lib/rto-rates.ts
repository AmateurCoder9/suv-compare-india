// RTO tax rates by state (approximations for petrol vehicles)
export const RTO_RATES: Record<string, { name: string; taxPercent: number }> = {
  'DL': { name: 'Delhi', taxPercent: 12.5 },
  'MH': { name: 'Maharashtra', taxPercent: 14 },
  'KA': { name: 'Karnataka', taxPercent: 13 },
  'TN': { name: 'Tamil Nadu', taxPercent: 10 },
  'GJ': { name: 'Gujarat', taxPercent: 12 },
  'UP': { name: 'Uttar Pradesh', taxPercent: 11 },
  'HR': { name: 'Haryana', taxPercent: 13 },
  'RJ': { name: 'Rajasthan', taxPercent: 10 },
  'WB': { name: 'West Bengal', taxPercent: 10 },
  'TS': { name: 'Telangana', taxPercent: 13 },
  'AP': { name: 'Andhra Pradesh', taxPercent: 12 },
  'PB': { name: 'Punjab', taxPercent: 11 },
  'MP': { name: 'Madhya Pradesh', taxPercent: 11 },
  'BR': { name: 'Bihar', taxPercent: 9 },
  'KL': { name: 'Kerala', taxPercent: 14 },
}

export interface OnRoadBreakdown {
  exShowroom:       number   // in lakhs
  rtoTax:           number
  insurance1yr:     number   // estimated first year comprehensive
  fastag:           number   // fixed ₹500
  accessories:      number   // default ₹10,000
  extendedWarranty: number   // default ₹0 (user can toggle)
  total:            number
  stateCode:        string
}

export function computeOnRoadPrice(
  exShowroomLakh: number,
  stateCode: string,
  includeWarranty: boolean = false,
  accessoriesBudget: number = 10000
): OnRoadBreakdown {
  const exShowroom = exShowroomLakh * 100000
  const rate = RTO_RATES[stateCode]?.taxPercent || 12
  const rtoTax = exShowroom * (rate / 100)
  
  // Comprehensive insurance estimation (approx 3.5% of ex-showroom + base)
  const insurance1yr = exShowroom * 0.035 + 15000
  const fastag = 500
  const accessories = accessoriesBudget
  const extendedWarranty = includeWarranty ? 25000 : 0
  
  const total = exShowroom + rtoTax + insurance1yr + fastag + accessories + extendedWarranty

  return {
    exShowroom: exShowroomLakh,
    rtoTax: rtoTax / 100000,
    insurance1yr: insurance1yr / 100000,
    fastag: fastag / 100000,
    accessories: accessories / 100000,
    extendedWarranty: extendedWarranty / 100000,
    total: total / 100000,
    stateCode
  }
}
