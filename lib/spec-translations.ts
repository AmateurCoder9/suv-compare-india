export function translateSpec(field: string, value: number): string | null {
  const translations: Record<string, (v: number) => string> = {
    wheelbaseMm: (v) => {
      if (v >= 2700) return "Excellent rear legroom — comfortable for 3 adults"
      if (v >= 2600) return "Good rear legroom — 2 adults comfortable, 3 tight"
      return "Compact wheelbase — better for city maneuverability"
    },
    bootLitres: (v) => {
      if (v >= 450) return "Fits 2 large + 1 cabin bag — ideal for family trips"
      if (v >= 380) return "Fits 1 large + 2 cabin bags — decent for 4 people"
      return "Fits 2 cabin bags — enough for quick getaways"
    },
    groundClearanceMm: (v) => {
      if (v >= 210) return "Handles bad roads, speed breakers, mild off-road comfortably"
      if (v >= 190) return "Manages typical Indian roads well; cautious on very rough terrain"
      return "Good for smooth city roads; be careful on bad surfaces"
    },
    maxPowerBhp: (v) => {
      if (v >= 140) return "Strong performance — confident highway overtakes"
      if (v >= 115) return "Adequate power — comfortable city and highway use"
      return "Sufficient for city driving; may feel underpowered on highway"
    },
    araiKmpl: (v) => {
      if (v >= 18) return `At ₹104/L petrol, real-world ~₹6.50 per km (est.)`
      if (v >= 15) return `At ₹104/L petrol, real-world ~₹7.50 per km (est.)`
      return `At ₹104/L petrol, real-world ~₹9+ per km (est.)`
    },
    fuelTankLitres: (v) =>
      `Full tank range: ~${Math.round(v * 14)} km (est. 14 km/L real-world)`,
    kerbWeightKg: (v) => {
      if (v >= 1400) return "Heavier build — generally better highway stability and safety"
      return "Lighter weight — slightly better fuel economy and agility"
    },
    maxTorqueNm: (v) => {
      if (v >= 300) return "Very strong low-end pull — effortless city stop-go and highway"
      if (v >= 200) return "Good torque — confident in city traffic and inclines"
      return "Adequate torque — fine for flat city roads"
    },
  }
  const fn = translations[field]
  return fn ? fn(value) : null
}
