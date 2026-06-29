'use client'

import React, { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { isInShortlist, addToShortlist, removeFromShortlist } from '@/lib/shortlist-store'

interface ShortlistButtonProps {
  slug: string
  variantName?: string
}

export function ShortlistButton({ slug, variantName }: ShortlistButtonProps) {
  const [saved, setSaved] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    setSaved(isInShortlist(slug))
  }, [slug])

  const toggleSaved = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (saved) {
      removeFromShortlist(slug)
      setSaved(false)
      showToast(`Removed from shortlist`)
    } else {
      const added = addToShortlist(slug)
      if (added) {
        setSaved(true)
        showToast(`Added to shortlist`)
      } else {
        showToast("Shortlist is full! (Max 6 vehicles)")
      }
    }
  }

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage('')
    }, 2000)
  }

  return (
    <>
      <button
        onClick={toggleSaved}
        className="p-1.5 rounded-full hover:bg-muted/60 transition-colors cursor-pointer focus:outline-none"
        title={saved ? "Remove from shortlist" : "Add to shortlist"}
      >
        <Bookmark
          className={`w-4 h-4 transition-all duration-150 ${
            saved ? 'fill-[#007AFF] text-[#007AFF]' : 'text-[var(--text-tertiary)]'
          }`}
        />
      </button>
      
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 bg-[#1C1C1E] text-white text-xs font-semibold rounded-lg shadow-md pointer-events-none">
          {toastMessage}
        </div>
      )}
    </>
  )
}
