'use client'

import Link from 'next/link'
import { memo, useMemo, useState, type CSSProperties } from 'react'
import { skills, type Skill } from '../data/skills'
import { useSession } from '../hooks/useSession'
import { getMySkillIds } from '../lib/storage'
import { SkillGlyph } from './SkillGlyph'

type Props = {
  mode: 'offer' | 'find'
}

type TileProps = {
  skill: Skill
  mode: 'offer' | 'find'
  owned: boolean
}

const SkillTile = memo(function SkillTile({ skill, mode, owned }: TileProps) {
  const style = {
    '--tile': skill.color,
  } as CSSProperties

  const icon = (
    <span className="skill-tile__icon" style={{ background: skill.color }}>
      <SkillGlyph skillId={skill.id} size={26} />
    </span>
  )

  const text = (
    <span className="skill-tile__text">
      <strong>{skill.name}</strong>
      <small>{owned ? 'Already listed' : skill.shortLabel}</small>
    </span>
  )

  if (owned) {
    return (
      <div className="skill-tile skill-tile--owned" role="listitem" style={style}>
        {icon}
        {text}
      </div>
    )
  }

  return (
    <Link
      href={mode === 'offer' ? `/offer/${skill.id}` : `/find/${skill.id}`}
      className="skill-tile"
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

  const ownedSkillIds = useMemo(() => {
    if (mode !== 'offer' || !phone) return new Set<string>()
    return new Set(getMySkillIds())
  }, [mode, phone])

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
            placeholder="Type here — nurse, driver, cook…"
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
          {filtered.map((skill) => (
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
