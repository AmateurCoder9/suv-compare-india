export const OVERALL_SCORE_WEIGHTS = {
  luxury:           120,
  size:             100,
  interiorQuality:   70,
  comfort:           80,
  rearSeatComfort:   70,
  frontSeatComfort:  40,
  features:          90,
  technology:        60,
  safety:            90,
  adas:              40,
  engine:            80,
  transmission:      50,
  performance:       40,
  rideQuality:       50,
  handling:          30,
  steering:          20,
  refinement:        40,
  practicality:      30,
  boot:              20,
  fuelEconomy:       20,
  reliability:       50,
  ownership:         20,
  resale:            20,
  value:             50,
} as const  // Total: 1000

export const LUXURY_MATRIX = {
  softTouchDashboard:    12,
  leatheretteSeats:       8,
  poweredDriverSeat:      7,
  memorySeats:            5,
  ventilatedSeats:        6,
  ambientLighting:        7,
  panoramicRoof:         10,
  premiumAudio:           8,
  largeScreens:           8,
  digitalCluster:         6,
  cabinInsulation:       15,
  dashboardDesign:        8,
  doorFeel:              10,
  fitAndFinish:          10,
  roadPresence:          10,
} as const  // Total: 120

export const SIZE_MATRIX = {
  exteriorPresence:  25,
  wheelbase:         20,
  cabinWidth:        15,
  rearLegroom:       15,
  boot:              10,
  height:             5,
  groundClearance:    5,
  visualProportion:   5,
} as const  // Total: 100

export const MERCEDES_MATRIX = {
  rideComfort:       12,
  cabinInsulation:   12,
  interiorMaterials: 10,
  dashboardDesign:   10,
  ambientLighting:    8,
  seatComfort:       10,
  doorClosingFeel:    8,
  screenQuality:      8,
  roadPresence:       8,
  highSpeedStability: 8,
  refinement:         6,
} as const  // Total: 100

export function determineWinner(rows: any[], variants: any[]) {
  // Logic to determine winner based on rules
  return rows.map(row => ({ ...row, winnerId: null }))
}
