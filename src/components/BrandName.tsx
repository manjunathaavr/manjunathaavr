'use client'

import { useEffect, useState } from 'react'

const INTERVAL_MS = 10_000

/** Brand + tagline in major Indian languages — rotate together every 10 seconds */
export const heroLocales = [
  {
    lang: 'English',
    brand: 'Swayam Nirman',
    tagline: 'Work with Dignity. Partner with Trust.',
  },
  {
    lang: 'Hindi',
    brand: 'स्वयं निर्माण',
    tagline: 'गरिमा से काम करें। विश्वास के साथ साझेदारी करें।',
  },
  {
    lang: 'Kannada',
    brand: 'ಸ್ವಯಂ ನಿರ್ಮಾಣ',
    tagline: 'ಘನತೆಯಿಂದ ಕೆಲಸ ಮಾಡಿ. ನಂಬಿಕೆಯೊಂದಿಗೆ ಪಾಲುದಾರರಾಗಿ.',
  },
  {
    lang: 'Telugu',
    brand: 'స్వయం నిర్మాణ',
    tagline: 'గౌరవంతో పని చేయండి. నమ్మకంతో భాగస్వామ్యం చేయండి.',
  },
  {
    lang: 'Tamil',
    brand: 'சுயம் நிர்மாணம்',
    tagline: 'கண்ணியத்துடன் உழை. நம்பிக்கையுடன் பங்குதாரராகு.',
  },
  {
    lang: 'Malayalam',
    brand: 'സ്വയം നിർമ്മാണം',
    tagline: 'അന്തസ്സോടെ ജോലി ചെയ്യൂ. വിശ്വാസത്തോടെ പങ്കാളിയാകൂ.',
  },
  {
    lang: 'Marathi',
    brand: 'स्वयं निर्माण',
    tagline: 'सन्मानाने काम करा. विश्वासासह भागीदारी करा.',
  },
  {
    lang: 'Bengali',
    brand: 'স্বয়ং নির্মাণ',
    tagline: 'মর্যাদার সাথে কাজ করুন। বিশ্বাসের সাথে অংশীদার হন।',
  },
  {
    lang: 'Gujarati',
    brand: 'સ્વયં નિર્માણ',
    tagline: 'ગૌરવથી કામ કરો. વિશ્વાસ સાથે ભાગીદારી કરો.',
  },
  {
    lang: 'Punjabi',
    brand: 'ਸਵੈਂ ਨਿਰਮਾਣ',
    tagline: 'ਇੱਜ਼ਤ ਨਾਲ ਕੰਮ ਕਰੋ। ਭਰੋਸੇ ਨਾਲ ਸਾਂਝੇਦਾਰੀ ਕਰੋ।',
  },
  {
    lang: 'Odia',
    brand: 'ସ୍ୱୟଂ ନିର୍ମାଣ',
    tagline: 'ମର୍ଯ୍ୟାଦାରେ କାମ କରନ୍ତୁ। ବିଶ୍ୱାସରେ ସହଭାଗୀ ହୁଅନ୍ତୁ।',
  },
  {
    lang: 'Assamese',
    brand: 'স্বয়ং নিৰ্মাণ',
    tagline: 'সন্মানেৰে কাম কৰক। বিশ্বাসেৰে অংশীদাৰ হওক।',
  },
  {
    lang: 'Urdu',
    brand: 'سویَم نِرمَان',
    tagline: 'وقار کے ساتھ کام کریں۔ اعتماد کے ساتھ شراکت کریں۔',
  },
  {
    lang: 'Sanskrit',
    brand: 'स्वयं निर्माणम्',
    tagline: 'गौरवेण कर्म कुरुत। विश्वासेन सहभागिनः भवन्तु।',
  },
] as const

function useLocaleRotation() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const id = window.setInterval(() => {
      setVisible(false)
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % heroLocales.length)
        setVisible(true)
      }, 350)
    }, INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  return { current: heroLocales[index], visible }
}

/** Brand name + tagline, synced across languages */
export function BrandName() {
  const { current, visible } = useLocaleRotation()
  const fade = visible ? ' hero__brand--in' : ' hero__brand--out'

  return (
    <div className="hero__identity" title={current.lang}>
      <p
        className={`hero__brand${fade}`}
        lang={current.lang === 'English' ? 'en' : undefined}
        aria-live="polite"
      >
        {current.brand}
      </p>
      <h1
        className={`hero__title${fade}`}
        lang={current.lang === 'English' ? 'en' : undefined}
        aria-live="polite"
      >
        {current.tagline}
      </h1>
    </div>
  )
}
