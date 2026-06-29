export interface FiveYearBreakdown {
  purchasePrice:    number
  totalInsurance:   number   // 5 years
  totalFuelCost:    number   // 5 years
  totalService:     number   // 5 years
  tyreReplacement:  number   // 1 set
  resaleValue:      number
  netCostOfOwning:  number
  costPerKm:        number
}

export function computeFiveYearOwnershipCost(
  exShowroomLakh: number,
  araiKmpl: number,
  annualServiceCostInr: number,
  insuranceEstInrLakh: number,
  tyreReplacementCostInr: number,
  resaleEstimatePercent: number,
  annualKm: number = 15000,
  fuelPricePerLitre: number = 104
): FiveYearBreakdown {
  const purchasePrice = exShowroomLakh
  
  // 5 Years Insurance: first year is full, subsequent years decrease (depreciation discount)
  // Let's model it as 100% (Year 1) + 70% + 60% + 50% + 45% of first year insurance
  const baseInsurance = insuranceEstInrLakh > 0 ? insuranceEstInrLakh : (exShowroomLakh * 0.035 + 0.15)
  const totalInsurance = baseInsurance * (1 + 0.7 + 0.6 + 0.5 + 0.45)
  
  // 5 Years Fuel: annualKm * 5 / araiKmpl * fuelPrice * 0.85 (derating for real-world driving conditions)
  const kmplReal = Math.max(araiKmpl * 0.80, 8.5) // 20% drop for real-world
  const totalLitres = (annualKm * 5) / kmplReal
  const totalFuelCost = (totalLitres * fuelPricePerLitre) / 100000 // in lakhs
  
  // 5 Years Service: annualServiceCostInr * 5
  const baseService = annualServiceCostInr > 0 ? annualServiceCostInr : 8000
  const totalService = (baseService * 5) / 100000
  
  // Tyre Replacement: 1 set at year 3 (around 45k km)
  const baseTyres = tyreReplacementCostInr > 0 ? tyreReplacementCostInr : 24000
  const tyreReplacement = baseTyres / 100000
  
  // Resale Value after 5 years
  const resalePercent = resaleEstimatePercent > 0 ? resaleEstimatePercent : 55
  const resaleValue = exShowroomLakh * (resalePercent / 100)
  
  const netCostOfOwning = (purchasePrice + totalInsurance + totalFuelCost + totalService + tyreReplacement) - resaleValue
  const costPerKm = (netCostOfOwning * 100000) / (annualKm * 5)

  return {
    purchasePrice,
    totalInsurance,
    totalFuelCost,
    totalService,
    tyreReplacement,
    resaleValue,
    netCostOfOwning,
    costPerKm
  }
}
