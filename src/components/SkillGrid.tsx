'use client'

import Link from 'next/link'
import { memo, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { skills, type Skill } from '../data/skills'

const FEATURED_SKILL_ID = 'mr-servant'
import { useSession } from '../hooks/useSession'
import { getMySkillIdsForPhone, subscribeSession } from '../lib/storage'
import { SkillGlyph } from './SkillGlyph'

type Props = {
  mode: 'offer' | 'find'
}

type TileProps = {
  skill: Skill
  mode: 'offer' | 'find'
  owned: boolean
  featured?: boolean
}

const SkillTile = memo(function SkillTile({ skill, mode, owned, featured }: TileProps) {
  const style = {
    '--tile': skill.color,
  } as CSSProperties

  const icon = (
    <span className="skill-tile__icon" style={{ background: skill.color }}>
      <SkillGlyph skillId={skill.id} size={featured ? 34 : 26} />
    </span>
  )

  const text = (
    <span className="skill-tile__text">
      {featured && <span className="skill-tile__badge">Featured</span>}
      <strong>{skill.name}</strong>
      <small>{owned ? 'Already listed' : skill.shortLabel}</small>
      {featured && !owned && (
        <span className="skill-tile__tagline">{skill.description}</span>
      )}
    </span>
  )

  const className = `skill-tile${featured ? ' skill-tile--featured' : ''}${owned ? ' skill-tile--owned' : ''}`

  if (owned) {
    return (
      <div className={className} role="listitem" style={style}>
        {icon}
        {text}
      </div>
    )
  }

  return (
    <Link
      href={mode === 'offer' ? `/offer/${skill.id}` : `/find/${skill.id}`}
      className={className}
      role="listitem"
      style={style}
      prefetch={false}
    >
      {icon}
      {text}
    </Link>
  )
})

export function SkillGrid({ mode }: Props) {
  const [query, setQuery] = useState('')
  const session = useSession()
  const phone = session?.phone
  const [profileTick, setProfileTick] = useState(0)

  useEffect(() => {
    const onProfilesChanged = () => setProfileTick((n) => n + 1)
    const unsubSession = subscribeSession(onProfilesChanged)
    window.addEventListener('sk-profiles-changed', onProfilesChanged)
    return () => {
      unsubSession()
      window.removeEventListener('sk-profiles-changed', onProfilesChanged)
    }
  }, [])

  const ownedSkillIds = useMemo(() => {
    if (mode !== 'offer' || !phone) return new Set<string>()
    void profileTick
    return new Set(getMySkillIdsForPhone(phone))
  }, [mode, phone, profileTick])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return skills
    return skills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.shortLabel.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    )
  }, [query])

  const featuredSkill = filtered.find((s) => s.id === FEATURED_SKILL_ID)
  const gridSkills = filtered.filter((s) => s.id !== FEATURED_SKILL_ID)

  return (
    <div className="skill-picker">
      <label className="skill-search">
        <span className="skill-search__label">Search skill</span>
        <span className="skill-search__box">
          <svg
            className="skill-search__icon"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
            <path
              d="M16.5 16.5L21 21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type here — Mr. Servant, nurse, driver, cook…"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              className="skill-search__clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </span>
      </label>

      {filtered.length === 0 ? (
        <p className="skill-search__empty">
          No skill found for “{query}”. Try another word.
        </p>
      ) : (
        <div className="skill-grid" role="list">
          {featuredSkill && (
            <SkillTile
              skill={featuredSkill}
              mode={mode}
              owned={ownedSkillIds.has(featuredSkill.id)}
              featured
            />
          )}
          {gridSkills.map((skill) => (
            <SkillTile
              key={skill.id}
              skill={skill}
              mode={mode}
              owned={ownedSkillIds.has(skill.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
