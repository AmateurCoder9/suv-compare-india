'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Media } from '@prisma/client'

const CATEGORY_MAP: Record<string, string[]> = {
  Exterior: ['Hero', 'Front', 'Front 3/4', 'Rear', 'Rear 3/4', 'Side', 'Top', 'Headlight', 'Tail Light'],
  Interior: ['Interior', 'Door Panel', 'Centre Console', 'Gear Lever', 'Sunroof', 'Panoramic Roof'],
  Dashboard: ['Dashboard', 'Steering Wheel', 'Instrument Cluster', 'Infotainment'],
  Seats: ['Front Seats', 'Rear Seats'],
  Boot: ['Boot'],
  Wheels: ['Wheel'],
  Colours: ['Colour Option'],
  Miscellaneous: ['Press Photo', 'Lifestyle', 'Unknown', 'Engine Bay'],
}

export function ImageGallery({ media }: { media: Media[] }) {
  const [activeTab, setActiveTab] = useState('Exterior')

  // Group media by broad tabs
  const tabbedMedia: Record<string, Media[]> = {}
  
  media.forEach(m => {
    let assignedTab = 'Miscellaneous'
    for (const [tab, categories] of Object.entries(CATEGORY_MAP)) {
      if (categories.includes(m.category)) {
        assignedTab = tab
        break
      }
    }
    
    if (!tabbedMedia[assignedTab]) {
      tabbedMedia[assignedTab] = []
    }
    tabbedMedia[assignedTab].push(m)
  })

  // Filter out empty tabs
  const availableTabs = Object.keys(CATEGORY_MAP).filter(tab => tabbedMedia[tab]?.length > 0)

  if (media.length === 0) {
    return (
      <div className="bg-muted flex items-center justify-center p-12 rounded-xl border border-dashed">
        <p className="text-muted-foreground text-sm font-medium">No gallery images available for this model.</p>
      </div>
    )
  }

  // Ensure active tab is valid
  if (!availableTabs.includes(activeTab) && availableTabs.length > 0) {
    setActiveTab(availableTabs[0])
  }

  const activeMedia = tabbedMedia[activeTab] || []

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {availableTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'bg-accent text-white shadow-md' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {tab} <span className="ml-1 opacity-70 text-xs">({tabbedMedia[tab].length})</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {activeMedia.map(m => (
          <div key={m.id} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted group cursor-pointer border border-border shadow-sm hover:shadow-md hover:border-accent transition-all">
            <Image
              src={m.imageUrl}
              alt={m.category}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-3 left-3 text-white">
                <p className="font-semibold text-sm drop-shadow-md">{m.category}</p>
                {m.sourcePage && <p className="text-[10px] opacity-80 max-w-[200px] truncate">{m.sourcePage}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
