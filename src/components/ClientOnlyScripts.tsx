'use client'

import { useEffect } from 'react'

export default function ClientOnlyScripts() {
  useEffect(() => {
    // ✅ โหลดเฉพาะฝั่ง client
    const scripts = [
      '/assets/js/vendor.min.js',
      '/assets/js/app.min.js'
    ]

    scripts.forEach(src => {
      const script = document.createElement('script')
      script.src = src
      script.async = false // รันเรียงตามลำดับ
      document.body.appendChild(script)
    })

    // ✅ Cleanup ป้องกันโหลดซ้ำเวลาเปลี่ยนหน้า
    return () => {
      scripts.forEach(src => {
        const el = document.querySelector(`script[src="${src}"]`)
        if (el) el.remove()
      })
    }
  }, [])

  return null
}
