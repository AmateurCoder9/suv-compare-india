interface PriceRangeBarProps {
  minPrice: number
  maxPrice: number
  currentPrice: number
  formatPrice?: (price: number) => string
}

export function PriceRangeBar({ minPrice, maxPrice, currentPrice, formatPrice }: PriceRangeBarProps) {
  const range = maxPrice - minPrice
  const percentage = range === 0 ? 50 : ((currentPrice - minPrice) / range) * 100

  const displayMin = formatPrice ? formatPrice(minPrice) : minPrice.toString()
  const displayMax = formatPrice ? formatPrice(maxPrice) : maxPrice.toString()

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{displayMin}</span>
        <span className="text-muted-foreground">{displayMax}</span>
      </div>
      <div className="relative h-2.5 bg-accent/50 rounded-full overflow-hidden">
        <div 
          className="absolute h-full rounded-full transition-all duration-700"
          style={{ 
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, oklch(0.72 0.19 145), oklch(0.65 0.2 250))'
          }}
        />
      </div>
    </div>
  )
}
