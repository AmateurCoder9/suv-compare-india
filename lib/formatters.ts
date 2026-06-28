export function formatCurrencyLakh(valueInLakh: number): string {
  return `₹${valueInLakh.toFixed(2)} Lakh`
}

export function formatEngineDisplacement(cc: number): string {
  return `${cc} cc`
}

export function formatFuelEconomy(kmpl: number): string {
  return `${kmpl.toFixed(1)} kmpl`
}

export function formatPower(bhp: number, rpm?: number): string {
  return rpm ? `${bhp.toFixed(1)} bhp @ ${rpm} rpm` : `${bhp.toFixed(1)} bhp`
}

export function formatTorque(nm: number, rpm?: number): string {
  return rpm ? `${nm.toFixed(1)} Nm @ ${rpm} rpm` : `${nm.toFixed(1)} Nm`
}
