'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BrandName } from '../components/BrandName'
import { Header } from '../components/Header'
import { SkillGrid } from '../components/SkillGrid'
import { useSession } from '../hooks/useSession'

function OfferIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M18 4v6M15 7h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function FindIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** Trial: color photos instead of pencil sketches (easy to revert). */
const USE_COLOR_PHOTOS = false

/** Locked pairs: each pair = one skill seeker + one job giver (equal dignity). */
const sketchPairs = [
  {
    skill: {
      src: '/images/hero-man-skill.png?v=18',
      alt: 'Man offering his skill with dignity — traditional equal respect',
    },
    help: {
      src: '/images/hero-man-help.png?v=18',
      alt: 'Man welcoming skilled help — traditional equal respect',
    },
  },
  {
    skill: {
      src: '/images/hero-woman-skill.png?v=20',
      alt: 'Woman offering her skill with dignity — traditional equal respect',
    },
    help: {
      src: '/images/hero-woman-help.png?v=18',
      alt: 'Woman welcoming skilled help — traditional equal respect',
    },
  },
  {
    skill: {
      src: '/images/hero-modern-man-skill.png?v=18',
      alt: 'Man offering his skill with dignity — modern equal respect',
    },
    help: {
      src: '/images/hero-modern-man-help.png?v=18',
      alt: 'Man welcoming skilled help — modern equal respect',
    },
  },
  {
    skill: {
      src: '/images/hero-modern-woman-skill.png?v=18',
      alt: 'Woman offering her skill with dignity — modern equal respect',
    },
    help: {
      src: '/images/hero-modern-woman-help.png?v=18',
      alt: 'Woman welcoming skilled help — modern equal respect',
    },
  },
  {
    skill: {
      src: '/images/pair-corp-left.png?v=18',
      alt: 'Employee offering his skill with dignity — corporate equal respect',
    },
    help: {
      src: '/images/pair-corp-right.png?v=18',
      alt: 'Employer welcoming skilled help — corporate equal respect',
    },
  },
] as const

const photoPairs = [
  {
    skill: {
      src: '/images/trial-skill-man.jpg?v=1',
      alt: 'Person offering a skill',
    },
    help: {
      src: '/images/trial-help-man.jpg?v=1',
      alt: 'Person seeking help',
    },
  },
  {
    skill: {
      src: '/images/trial-skill-woman.jpg?v=1',
      alt: 'Person offering a skill',
    },
    help: {
      src: '/images/trial-help-woman.jpg?v=1',
      alt: 'Person seeking help',
    },
  },
] as const

const heroPairs = USE_COLOR_PHOTOS ? photoPairs : sketchPairs
const PAIR_ROTATE_MS = 8000

export function Home() {
  const session = useSession()
  const [pairIndex, setPairIndex] = useState(0)
  const [fading, setFading] = useState(false)

  const skillEntry =
    session?.activeRole === 'seeker'
      ? '/offer'
      : '/account?role=seeker&tab=login'
  const helpEntry =
    session?.activeRole === 'giver'
      ? '/find'
      : '/account?role=giver&tab=login'

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const id = window.setInterval(() => {
      setFading(true)
      window.setTimeout(() => {
        setPairIndex((i) => (i + 1) % heroPairs.length)
        setFading(false)
      }, 400)
    }, PAIR_ROTATE_MS)

    return () => window.clearInterval(id)
  }, [])

  const pair = heroPairs[pairIndex]
  const fadeClass = fading ? ' hero__portrait-img--fading' : ''

  return (
    <div className="page">
      <Header />

      <section className={`hero${USE_COLOR_PHOTOS ? ' hero--photos' : ''}`}>
        <div className="hero__wash" aria-hidden="true" />

        <div className="hero__inner">
          <figure className="hero__portrait hero__portrait--dignity">
            <img
              className={`hero__portrait-img${USE_COLOR_PHOTOS ? ' hero__portrait-img--photo' : ''}${fadeClass}`}
              src={pair.skill.src}
              alt={pair.skill.alt}
              width={480}
              height={640}
            />
            <Link className="btn btn--primary hero__portrait-btn" href={skillEntry}>
              <OfferIcon />
              I have a skill
            </Link>
          </figure>

          <div className="hero__content">
            <BrandName />
          </div>

          <figure className="hero__portrait hero__portrait--humility">
            <img
              className={`hero__portrait-img${USE_COLOR_PHOTOS ? ' hero__portrait-img--photo' : ''}${fadeClass}`}
              src={pair.help.src}
              alt={pair.help.alt}
              width={480}
              height={640}
            />
            <Link className="btn btn--forest hero__portrait-btn" href={helpEntry}>
              <FindIcon />
              I need help
            </Link>
          </figure>
        </div>
      </section>

      <section className="section" id="skills">
        <h2>Choose your skill</h2>
        <p className="section__lead">
          {session?.activeRole === 'seeker'
            ? 'Every picture is a path to earn. Tap the one that is yours.'
            : 'Log in as I have a skill to list your skill from these options.'}
        </p>
        {session?.activeRole === 'seeker' ? (
          <SkillGrid mode="offer" />
        ) : (
          <Link className="btn btn--primary" href={skillEntry}>
            Log in to offer a skill
          </Link>
        )}
      </section>

      <section className="section section--invite">
        <div className="invite">
          <h2>Today is a good day to begin.</h2>
          <p>
            Offer your skill with pride — or find help with honour.
            On Swayam Nirman, both sides stand tall together.
          </p>
          <div className="hero__actions">
            <Link className="btn btn--primary" href={skillEntry}>
              <OfferIcon />
              I have a skill
            </Link>
            <Link className="btn btn--invite-ghost" href={helpEntry}>
              <FindIcon />
              I need help
            </Link>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <p>
          <strong>Swayam Nirman</strong> — Work with Dignity. Partner with Trust.
        </p>
        <p className="muted">Local demo · data saved in this browser only</p>
      </footer>
    </div>
  )
}
