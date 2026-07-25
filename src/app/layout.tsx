import type { Metadata, Viewport } from 'next'
import '../index.css'

export const metadata: Metadata = {
  title: 'Swayam Nirman — Work with Dignity — Hire with Respect',
  description:
    'Swayam Nirman — build yourself through skill, earn with dignity, and connect with trust.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Swayam Nirman',
  },
  icons: {
    icon: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,800&family=Noto+Serif+Bengali:wght@700&family=Noto+Serif+Devanagari:wght@700&family=Noto+Serif+Gujarati:wght@700&family=Noto+Serif+Gurmukhi:wght@700&family=Noto+Serif+Kannada:wght@700&family=Noto+Serif+Malayalam:wght@700&family=Noto+Serif+Oriya:wght@700&family=Noto+Serif+Tamil:wght@700&family=Noto+Serif+Telugu:wght@700&family=Noto+Nastaliq+Urdu:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
