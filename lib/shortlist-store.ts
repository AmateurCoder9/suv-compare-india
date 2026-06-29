const KEY = 'suv_compare_shortlist'

export function getShortlist(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function addToShortlist(slug: string): boolean {
  if (typeof window === 'undefined') return false
  const list = getShortlist()
  if (list.length >= 6) return false
  if (!list.includes(slug)) {
    list.push(slug)
    try {
      localStorage.setItem(KEY, JSON.stringify(list))
    } catch (e) {
      console.error(e)
      return false
    }
  }
  return true
}

export function removeFromShortlist(slug: string): void {
  if (typeof window === 'undefined') return
  const list = getShortlist().filter(s => s !== slug)
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch (e) {
    console.error(e)
  }
}

export function isInShortlist(slug: string): boolean {
  if (typeof window === 'undefined') return false
  return getShortlist().includes(slug)
}

export function clearShortlist(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(KEY)
  } catch (e) {
    console.error(e)
  }
}
