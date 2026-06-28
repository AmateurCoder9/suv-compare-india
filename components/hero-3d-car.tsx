"use client"

import Spline from '@splinetool/react-spline'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

export function Hero3DCar() {
  const [loading, setLoading] = useState(true)

  return (
    <div className="w-full h-[400px] lg:h-[600px] relative rounded-3xl overflow-hidden glass border-white/5">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
          <Loader2 className="w-8 h-8 animate-spin text-white/50" />
        </div>
      )}
      
      {/* We use a stunning public Spline car scene here. 
          This provides the interactive 3D moving car on a black background. */}
      <Spline
        scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
        onLoad={() => setLoading(false)}
        className="w-full h-full object-cover"
      />
      
      {/* Gradient overlay to blend the edges into the black background */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl ring-1 ring-inset ring-white/10 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
    </div>
  )
}
