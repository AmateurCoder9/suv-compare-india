export interface EMIResult {
  loanAmount:    number   // in lakhs
  downPayment:   number   // in lakhs
  monthlyEMI:    number   // absolute INR
  totalInterest: number   // in lakhs
  totalAmount:   number   // in lakhs
  effectiveCost: number   // total amount + down payment (in lakhs)
}

export function computeEMI(
  principalLakh: number,
  downPaymentPercent: number,
  annualRatePercent: number,
  tenureYears: number
): EMIResult {
  const downPayment = principalLakh * (downPaymentPercent / 100)
  const loanAmountLakh = principalLakh - downPayment
  const loanAmount = loanAmountLakh * 100000
  
  const monthlyRate = (annualRatePercent / 12) / 100
  const tenureMonths = tenureYears * 12
  
  let monthlyEMI = 0
  if (monthlyRate > 0) {
    monthlyEMI = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                 (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  } else {
    monthlyEMI = loanAmount / tenureMonths
  }
  
  const totalAmountPaid = monthlyEMI * tenureMonths
  const totalInterest = totalAmountPaid - loanAmount
  const effectiveCost = totalAmountPaid + (downPayment * 100000)

  return {
    loanAmount: loanAmountLakh,
    downPayment: downPayment,
    monthlyEMI: Math.round(monthlyEMI),
    totalInterest: totalInterest / 100000,
    totalAmount: totalAmountPaid / 100000,
    effectiveCost: effectiveCost / 100000
  }
}
