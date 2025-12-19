export function getLocalStorageItem(key: string): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key)
  }
  return null
}

export function setLocalStorageItem(key: string, value: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value)
  }
}

export function removeLocalStorageItem(key: string) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key)
  }
}
