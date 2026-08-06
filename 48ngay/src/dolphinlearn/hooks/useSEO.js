import { useEffect } from 'react'

export function useSEO({ title, description, keywords }) {
  useEffect(() => {
    if (title) {
      document.title = `${title} — DolphinLearn`
    } else {
      document.title = 'DolphinLearn — Học ngoại ngữ miễn phí'
    }
    
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]')
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.setAttribute('name', 'description')
        document.head.appendChild(metaDesc)
      }
      metaDesc.setAttribute('content', description)
    }

    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', keywords)
    }
  }, [title, description, keywords])
}
