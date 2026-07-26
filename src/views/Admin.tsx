'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Header } from '../components/Header'
import { useSession } from '../hooks/useSession'
import { fetchCloudAdminData, syncToCloud } from '../lib/cloud-sync'
import { getSkillById } from '../data/skills'
import {
  availabilityLabels,
  buildAdminJobGivers,
  buildAdminJobSeekers,
  buildAdminStats,
  deleteJobGiverByPhone,
  deleteJobSeekerByPhone,
  deleteProfile,
  deleteRequest,
  formatRates,
  genderLabels,
  getAllAccounts,
  getProfiles,
  getRequests,
  isSuperAdminSession,
  normalizePhone,
  type AdminJobGiver,
  type AdminJobSeeker,
  type JobRequest,
  type SkillProfile,
  type StoredAccount,
  type UserRole,
} from '../lib/storage'

type Tab = 'overview' | 'seekers' | 'givers' | 'requests'

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function matchesQuery(haystack: string, q: string) {
  if (!q.trim()) return true
  return haystack.toLowerCase().includes(q.trim().toLowerCase())
}

function roleLabels(roles: UserRole[]) {
  return roles
    .map((r) => (r === 'seeker' ? 'I have a skill' : 'I need help'))
    .join(', ')
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '').slice(-10)
  if (digits.length !== 10) return phone
  return `${digits.slice(0, 5)} ${digits.slice(5)}`
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

function formatCoords(lat?: number, lng?: number) {
  if (lat == null || lng == null) return ''
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}

function SkillChips({ skillIds }: { skillIds: string[] }) {
  if (skillIds.length === 0) {
    return <span className="admin-chip admin-chip--muted">No skills yet</span>
  }
  return (
    <div className="admin-chips">
      {skillIds.slice(0, 3).map((id) => (
        <span key={id} className="admin-chip">
          {getSkillById(id)?.name || id}
        </span>
      ))}
      {skillIds.length > 3 && (
        <span className="admin-chip admin-chip--more">+{skillIds.length - 3}</span>
      )}
    </div>
  )
}

function mergeByKey<T>(
  local: T[],
  remote: T[],
  keyFn: (item: T) => string,
): T[] {
  const map = new Map<string, T>()
  for (const item of remote) map.set(keyFn(item), item)
  for (const item of local) {
    const key = keyFn(item)
    if (!map.has(key)) map.set(key, item)
  }
  return Array.from(map.values())
}

export function Admin() {
  const session = useSession()
  const isAdmin = isSuperAdminSession(session)
  const [tab, setTab] = useState<Tab>('overview')
  const [tick, setTick] = useState(0)
  const [search, setSearch] = useState('')
  const [openSeeker, setOpenSeeker] = useState<string | null>(null)
  const [openGiver, setOpenGiver] = useState<string | null>(null)
  const [openRequest, setOpenRequest] = useState<string | null>(null)
  const [cloudConfigured, setCloudConfigured] = useState<boolean | null>(null)
  const [cloudAccounts, setCloudAccounts] = useState<StoredAccount[]>([])
  const [cloudProfiles, setCloudProfiles] = useState<SkillProfile[]>([])
  const [cloudRequests, setCloudRequests] = useState<JobRequest[]>([])

  function refresh() {
    setTick((n) => n + 1)
  }

  useEffect(() => {
    if (!session || !isAdmin) return
    let cancelled = false

    async function loadCloud() {
      const data = await fetchCloudAdminData(session!.phone)
      if (cancelled) return
      if (!data) {
        setCloudConfigured(false)
        return
      }
      setCloudConfigured(data.configured)
      setCloudAccounts(data.accounts)
      setCloudProfiles(data.profiles)
      setCloudRequests(data.requests)
    }

    void loadCloud()
    const timer = window.setInterval(loadCloud, 20000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [session, isAdmin, tick])

  useEffect(() => {
    if (!isAdmin || !cloudConfigured) return
    for (const account of getAllAccounts()) {
      syncToCloud({ type: 'account', data: account })
    }
    for (const profile of getProfiles()) {
      syncToCloud({ type: 'profile', data: profile })
    }
    for (const request of getRequests()) {
      syncToCloud({ type: 'request', data: request })
    }
  }, [isAdmin, cloudConfigured, tick])

  const mergedProfiles = useMemo(() => {
    void tick
    return mergeByKey(getProfiles(), cloudProfiles, (p) => p.id)
  }, [tick, cloudProfiles])

  const mergedAccounts = useMemo(() => {
    void tick
    return mergeByKey(getAllAccounts(), cloudAccounts, (a) =>
      normalizePhone(a.phone),
    )
  }, [tick, cloudAccounts])

  const mergedRequests = useMemo(() => {
    void tick
    return mergeByKey(getRequests(), cloudRequests, (r) => r.id)
  }, [tick, cloudRequests])

  const profileMap = useMemo(
    () => new Map(mergedProfiles.map((p) => [p.id, p])),
    [mergedProfiles],
  )

  const seekers = useMemo(
    () => buildAdminJobSeekers(mergedProfiles, mergedAccounts),
    [mergedProfiles, mergedAccounts],
  )
  const givers = useMemo(
    () => buildAdminJobGivers(mergedRequests, mergedAccounts),
    [mergedRequests, mergedAccounts],
  )
  const stats = useMemo(
    () => buildAdminStats(mergedProfiles, mergedRequests, seekers, givers),
    [mergedProfiles, mergedRequests, seekers, givers],
  )
  const requests = mergedRequests

  const filteredSeekers = useMemo(() => {
    return seekers.filter((s) =>
      matchesQuery(
        [
          s.name,
          s.phone,
          s.cities.join(' '),
          s.pinCodes.join(' '),
          s.addresses.join(' '),
          s.skills.map((id) => getSkillById(id)?.name || id).join(' '),
          s.education.join(' '),
          s.experience.join(' '),
        ].join(' '),
        search,
      ),
    )
  }, [seekers, search])

  const filteredGivers = useMemo(() => {
    return givers.filter((g) =>
      matchesQuery(
        [
          g.name,
          g.phone,
          g.skillsRequested.map((id) => getSkillById(id)?.name || id).join(' '),
          g.requests.map((r) => `${r.note} ${r.seekerName} ${r.seekerPhone}`).join(' '),
        ].join(' '),
        search,
      ),
    )
  }, [givers, search])

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const profile = profileMap.get(r.profileId)
      return matchesQuery(
        [
          r.requesterName,
          r.requesterPhone,
          r.note,
          r.status,
          getSkillById(r.skillId)?.name || r.skillId,
          profile?.name || '',
          profile?.phone || '',
        ].join(' '),
        search,
      )
    })
  }, [requests, search, profileMap])

  function confirmDelete(message: string) {
    return window.confirm(message)
  }

  if (!session) {
    return (
      <div className="page">
        <Header />
        <section className="section section--top form-section">
          <h1>Admin panel</h1>
          <p className="section__lead">Log in to continue.</p>
          <Link href="/account?tab=login" className="btn btn--primary">
            Log in
          </Link>
        </section>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="page">
        <Header />
        <section className="section section--top form-section">
          <h1>Access denied</h1>
          <p className="section__lead">
            This page is only available to the admin account.
          </p>
          <Link href="/" className="back-link">
            ← Back to site
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="page admin-page">
      <Header />
      <section className="section section--top admin-section">
        <div className="admin-topbar">
          <div>
            <p className="admin-eyebrow">Swayam Nirman</p>
            <h1 className="admin-title">Admin dashboard</h1>
          </div>
          {cloudConfigured === true && (
            <span className="admin-sync admin-sync--on">Cloud sync active</span>
          )}
          {cloudConfigured === false && (
            <span className="admin-sync admin-sync--off">Local browser only</span>
          )}
        </div>

        {cloudConfigured === false && (
          <p className="admin-notice admin-notice--warn">
            Cloud sync is not set up — admin only shows users from this browser.
            Connect Redis in Vercel Marketplace, then redeploy.
          </p>
        )}

        <div className="admin-sticky-bar">
          <div className="admin-tabs" role="tablist" aria-label="Admin sections">
            {(
              [
                ['overview', 'Overview'],
                ['seekers', `Job seekers (${stats.jobSeekers})`],
                ['givers', `Job givers (${stats.jobGivers})`],
                ['requests', `Requests (${stats.requestsTotal})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className={`admin-tab${tab === id ? ' admin-tab--on' : ''}`}
                onClick={() => {
                  setTab(id)
                  setSearch('')
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {tab !== 'overview' && (
            <label className="admin-search">
              <svg
                className="admin-search__icon"
                width="18"
                height="18"
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
              <span className="sr-only">Search users</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  tab === 'seekers'
                    ? 'Search by name, phone, skill, city…'
                    : tab === 'givers'
                      ? 'Search by name, phone, skill…'
                      : 'Search requests…'
                }
              />
            </label>
          )}
        </div>

        {tab === 'overview' && (
          <div className="admin-panel">
            <div className="admin-stats">
              <StatCard label="Job seekers" value={stats.jobSeekers} hint="Skill providers" />
              <StatCard label="Job givers" value={stats.jobGivers} hint="Help requesters" />
              <StatCard label="Skill listings" value={stats.listings} hint="All profiles" />
              <StatCard
                label="Requests"
                value={stats.requestsTotal}
                hint={`${stats.requestsPending} pending`}
              />
              <StatCard label="Accepted" value={stats.requestsAccepted} hint="Contacts shared" />
              <StatCard label="Declined" value={stats.requestsDeclined} hint="Not taken" />
            </div>
            <p className="hint">
              Open <strong>Job seekers</strong> or <strong>Job givers</strong> to
              see every user’s full details. Tap a row to expand.
            </p>
          </div>
        )}

        {tab === 'seekers' && (
          <div className="admin-panel">
            <div className="admin-panel__head">
              <h2>Job seekers</h2>
              <span className="admin-count">{filteredSeekers.length} users</span>
            </div>
            {filteredSeekers.length === 0 ? (
              <p className="admin-empty">No job seekers match this search.</p>
            ) : (
              <div className="admin-data-card">
                <div className="admin-data-head admin-data-head--seekers">
                  <span>Name</span>
                  <span>Phone</span>
                  <span>Skills</span>
                  <span>Listings</span>
                  <span>Location</span>
                  <span aria-hidden="true" />
                </div>
                <ul className="admin-detail-list">
                  {filteredSeekers.map((s) => (
                    <SeekerDetailCard
                      key={s.phone}
                      seeker={s}
                      open={openSeeker === s.phone}
                      onToggle={() =>
                        setOpenSeeker((cur) => (cur === s.phone ? null : s.phone))
                      }
                      onDelete={() => {
                        if (
                          !confirmDelete(
                            `Delete job seeker ${s.name} and all their skill listings?`,
                          )
                        ) {
                          return
                        }
                        deleteJobSeekerByPhone(s.phone)
                        refresh()
                      }}
                      onDeleteListing={(id, label) => {
                        if (!confirmDelete(`Delete listing: ${label}?`)) return
                        deleteProfile(id)
                        refresh()
                      }}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === 'givers' && (
          <div className="admin-panel">
            <div className="admin-panel__head">
              <h2>Job givers</h2>
              <span className="admin-count">{filteredGivers.length} users</span>
            </div>
            {filteredGivers.length === 0 ? (
              <p className="admin-empty">
                No job givers yet. They appear when someone sends a help request.
              </p>
            ) : (
              <div className="admin-data-card">
                <div className="admin-data-head admin-data-head--givers">
                  <span>Name</span>
                  <span>Phone</span>
                  <span>Skills requested</span>
                  <span>Requests</span>
                  <span>Status</span>
                  <span aria-hidden="true" />
                </div>
                <ul className="admin-detail-list">
                  {filteredGivers.map((g) => (
                    <GiverDetailCard
                      key={g.phone}
                      giver={g}
                      open={openGiver === g.phone}
                      onToggle={() =>
                        setOpenGiver((cur) => (cur === g.phone ? null : g.phone))
                      }
                      onDelete={() => {
                        if (
                          !confirmDelete(
                            `Delete all requests from job giver ${g.name}?`,
                          )
                        ) {
                          return
                        }
                        deleteJobGiverByPhone(g.phone)
                        refresh()
                      }}
                      onDeleteRequest={(id) => {
                        if (!confirmDelete('Delete this job request?')) return
                        deleteRequest(id)
                        refresh()
                      }}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === 'requests' && (
          <div className="admin-panel">
            <div className="admin-panel__head">
              <h2>All requests</h2>
              <span className="admin-count">{filteredRequests.length} total</span>
            </div>
            {filteredRequests.length === 0 ? (
              <p className="admin-empty">No requests match.</p>
            ) : (
              <div className="admin-data-card">
                <div className="admin-data-head admin-data-head--requests">
                  <span>Giver</span>
                  <span>Phone</span>
                  <span>Skill</span>
                  <span>Location</span>
                  <span>Status</span>
                  <span aria-hidden="true" />
                </div>
                <ul className="admin-detail-list">
                  {[...filteredRequests]
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                    .map((r) => (
                    <RequestDetailCard
                      key={r.id}
                      request={r}
                      profile={profileMap.get(r.profileId)}
                      open={openRequest === r.id}
                      onToggle={() =>
                        setOpenRequest((cur) => (cur === r.id ? null : r.id))
                      }
                      onDelete={() => {
                        if (!confirmDelete('Delete this job request?')) return
                        deleteRequest(r.id)
                        refresh()
                      }}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <Link href="/" className="back-link">
          ← Back to site
        </Link>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: number
  hint: string
}) {
  return (
    <div className="admin-stat">
      <p className="admin-stat__label">{label}</p>
      <p className="admin-stat__value">{value}</p>
      <p className="admin-stat__hint">{hint}</p>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  if (!value.trim() || value === '—') return null
  return (
    <div className="admin-detail-field">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function SeekerDetailCard({
  seeker,
  open,
  onToggle,
  onDelete,
  onDeleteListing,
}: {
  seeker: AdminJobSeeker
  open: boolean
  onToggle: () => void
  onDelete: () => void
  onDeleteListing: (id: string, label: string) => void
}) {
  const skillNames = seeker.skills
    .map((id) => getSkillById(id)?.name || id)
    .join(', ')
  const location = seeker.cities[0] || seeker.pinCodes[0] || '—'

  return (
    <li className={`admin-detail-card${open ? ' admin-detail-card--open' : ''}`}>
      <button
        type="button"
        className="admin-data-row admin-data-row--seekers"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="admin-data-row__name">
          <span className="admin-avatar" aria-hidden="true">
            {initials(seeker.name)}
          </span>
          <span>
            <strong>{seeker.name}</strong>
            {seeker.gender && (
              <small>{genderLabels[seeker.gender]}</small>
            )}
          </span>
        </span>
        <span className="admin-data-row__phone">{formatPhone(seeker.phone)}</span>
        <span className="admin-data-row__skills">
          <SkillChips skillIds={seeker.skills} />
        </span>
        <span className="admin-data-row__count">
          <span className="admin-num">{seeker.listingCount}</span>
        </span>
        <span className="admin-data-row__location">
          <span className="admin-loc-pill">{location}</span>
        </span>
        <span className="admin-data-row__chevron" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>

      {open && (
        <div className="admin-detail-card__body">
          <dl className="admin-detail-grid">
            <DetailField label="Name" value={seeker.name} />
            <DetailField label="Phone" value={seeker.phone} />
            <DetailField
              label="Gender"
              value={seeker.gender ? genderLabels[seeker.gender] : '—'}
            />
            <DetailField label="Roles" value={roleLabels(seeker.roles) || '—'} />
            <DetailField label="Skills" value={skillNames} />
            <DetailField label="Cities" value={seeker.cities.join(', ') || '—'} />
            <DetailField
              label="Pin codes"
              value={seeker.pinCodes.join(', ') || '—'}
            />
            <DetailField
              label="Addresses"
              value={seeker.addresses.join(' · ') || '—'}
            />
            <DetailField
              label="Education"
              value={seeker.education.join(' · ') || '—'}
            />
            <DetailField
              label="Experience in this skill"
              value={seeker.experience.join(' · ') || '—'}
            />
            <DetailField label="About" value={seeker.about.join(' · ') || '—'} />
            {seeker.registeredAt && (
              <DetailField label="Registered" value={formatWhen(seeker.registeredAt)} />
            )}
            <DetailField label="Last updated" value={formatWhen(seeker.latestAt)} />
          </dl>

          <h3 className="admin-detail-sub">Skill listings</h3>
          <ul className="admin-mini-list">
            {seeker.listings.map((listing) => {
              const skill = getSkillById(listing.skillId)
              const rates = formatRates({
                availability: listing.availability,
                rates: listing.rates,
              } as SkillProfile)
              return (
                <li key={listing.id} className="admin-mini-item">
                  <div>
                    <strong>{skill?.name || listing.skillId}</strong>
                    <p>
                      {[listing.city, listing.pinCode, listing.address]
                        .filter(Boolean)
                        .join(' · ') || 'No location'}
                    </p>
                    {formatCoords(listing.latitude, listing.longitude) && (
                      <p>GPS: {formatCoords(listing.latitude, listing.longitude)}</p>
                    )}
                    {listing.gender && (
                      <p>Gender: {genderLabels[listing.gender]}</p>
                    )}
                    {listing.phone && <p>Listing phone: {listing.phone}</p>}
                    {(listing.education || listing.experience) && (
                      <p>
                        {[listing.education, listing.experience]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                    {rates && <p className="profile-card__rate">{rates}</p>}
                    {listing.about && <p>{listing.about}</p>}
                    <p className="hint">Listed {formatWhen(listing.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn--danger btn--tiny"
                    onClick={() =>
                      onDeleteListing(
                        listing.id,
                        `${seeker.name} · ${skill?.name || listing.skillId}`,
                      )
                    }
                  >
                    Delete listing
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="admin-row-actions">
            <button type="button" className="btn btn--danger btn--tiny" onClick={onDelete}>
              Delete seeker
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

function GiverDetailCard({
  giver,
  open,
  onToggle,
  onDelete,
  onDeleteRequest,
}: {
  giver: AdminJobGiver
  open: boolean
  onToggle: () => void
  onDelete: () => void
  onDeleteRequest: (id: string) => void
}) {
  const skillNames = giver.skillsRequested
    .map((id) => getSkillById(id)?.name || id)
    .join(', ')

  return (
    <li className={`admin-detail-card${open ? ' admin-detail-card--open' : ''}`}>
      <button
        type="button"
        className="admin-data-row admin-data-row--givers"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="admin-data-row__name">
          <span className="admin-avatar admin-avatar--giver" aria-hidden="true">
            {initials(giver.name)}
          </span>
          <span>
            <strong>{giver.name}</strong>
            {giver.gender && <small>{genderLabels[giver.gender]}</small>}
          </span>
        </span>
        <span className="admin-data-row__phone">{formatPhone(giver.phone)}</span>
        <span className="admin-data-row__skills">
          <SkillChips skillIds={giver.skillsRequested} />
        </span>
        <span className="admin-data-row__count">
          <span className="admin-num">{giver.requestCount}</span>
        </span>
        <span className="admin-data-row__status">
          <span className="admin-status-pill admin-status-pill--pending">
            {giver.pending} pending
          </span>
        </span>
        <span className="admin-data-row__chevron" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>

      {open && (
        <div className="admin-detail-card__body">
          <dl className="admin-detail-grid">
            <DetailField label="Name" value={giver.name} />
            <DetailField label="Phone" value={giver.phone} />
            <DetailField
              label="Gender"
              value={giver.gender ? genderLabels[giver.gender] : '—'}
            />
            <DetailField label="Roles" value={roleLabels(giver.roles) || '—'} />
            <DetailField label="Skills requested" value={skillNames || '—'} />
            <DetailField label="Cities" value={giver.cities.join(', ') || '—'} />
            <DetailField
              label="Pin codes"
              value={giver.pinCodes.join(', ') || '—'}
            />
            <DetailField
              label="Addresses"
              value={giver.addresses.join(' · ') || '—'}
            />
            <DetailField
              label="Hire types"
              value={
                giver.hireTypes
                  .map((t) => availabilityLabels[t as keyof typeof availabilityLabels] || t)
                  .join(', ') || '—'
              }
            />
            <DetailField label="Total requests" value={String(giver.requestCount)} />
            <DetailField label="Pending" value={String(giver.pending)} />
            <DetailField label="Accepted" value={String(giver.accepted)} />
            <DetailField label="Declined" value={String(giver.declined)} />
            {giver.registeredAt && (
              <DetailField label="Registered" value={formatWhen(giver.registeredAt)} />
            )}
            <DetailField label="Last active" value={formatWhen(giver.latestAt)} />
          </dl>

          <h3 className="admin-detail-sub">Requests sent</h3>
          <ul className="admin-mini-list">
            {giver.requests
              .slice()
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((r) => (
                <li key={r.id} className="admin-mini-item">
                  <div>
                    <strong>
                      {getSkillById(r.skillId)?.name || r.skillId}
                      <span className={`status-badge status-badge--${r.status}`}>
                        {' '}
                        {r.status}
                      </span>
                    </strong>
                    <p>
                      To seeker: {r.seekerName} ({r.seekerPhone})
                    </p>
                    {r.hireType && (
                      <p>
                        {availabilityLabels[r.hireType] || r.hireType}
                      </p>
                    )}
                    {(r.requesterCity || r.requesterPinCode || r.requesterAddress) && (
                      <p>
                        {[r.requesterCity, r.requesterPinCode, r.requesterAddress]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                    {formatCoords(r.requesterLatitude, r.requesterLongitude) && (
                      <p>GPS: {formatCoords(r.requesterLatitude, r.requesterLongitude)}</p>
                    )}
                    {r.note && <p>{r.note}</p>}
                    <p className="hint">{formatWhen(r.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn--danger btn--tiny"
                    onClick={() => onDeleteRequest(r.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
          </ul>

          <div className="admin-row-actions">
            <button type="button" className="btn btn--danger btn--tiny" onClick={onDelete}>
              Delete giver
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

function RequestDetailCard({
  request,
  profile,
  open,
  onToggle,
  onDelete,
}: {
  request: JobRequest
  profile?: SkillProfile
  open: boolean
  onToggle: () => void
  onDelete: () => void
}) {
  const skill = getSkillById(request.skillId)
  const seekerName = profile?.name || '—'
  const location =
    [request.requesterCity, request.requesterPinCode].filter(Boolean).join(' · ') ||
    '—'

  return (
    <li className={`admin-detail-card${open ? ' admin-detail-card--open' : ''}`}>
      <button
        type="button"
        className="admin-data-row admin-data-row--requests"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="admin-data-row__name">
          <span className="admin-avatar admin-avatar--giver" aria-hidden="true">
            {initials(request.requesterName)}
          </span>
          <span>
            <strong>{request.requesterName}</strong>
          </span>
        </span>
        <span className="admin-data-row__phone">
          {formatPhone(request.requesterPhone)}
        </span>
        <span className="admin-data-row__skills">
          <span className="admin-chip">{skill?.name || request.skillId}</span>
        </span>
        <span className="admin-data-row__location">{location}</span>
        <span className="admin-data-row__status">
          <span className={`admin-status-pill admin-status-pill--${request.status}`}>
            {request.status}
          </span>
        </span>
        <span className="admin-data-row__chevron" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>

      {open && (
        <div className="admin-detail-card__body">
          <dl className="admin-detail-grid">
            <DetailField label="Giver" value={request.requesterName} />
            <DetailField label="Phone" value={formatPhone(request.requesterPhone)} />
            <DetailField label="Skill" value={skill?.name || request.skillId} />
            <DetailField label="Seeker" value={seekerName} />
            <DetailField
              label="Seeker phone"
              value={profile?.phone ? formatPhone(profile.phone) : '—'}
            />
            <DetailField
              label="Hire type"
              value={
                request.hireType
                  ? availabilityLabels[request.hireType] || request.hireType
                  : '—'
              }
            />
            <DetailField label="Status" value={request.status} />
            <DetailField
              label="Location"
              value={
                [request.requesterCity, request.requesterPinCode, request.requesterAddress]
                  .filter(Boolean)
                  .join(' · ') || '—'
              }
            />
            {formatCoords(request.requesterLatitude, request.requesterLongitude) && (
              <DetailField
                label="GPS"
                value={formatCoords(request.requesterLatitude, request.requesterLongitude)}
              />
            )}
            <DetailField label="Note" value={request.note || '—'} />
            <DetailField label="Sent" value={formatWhen(request.createdAt)} />
          </dl>
          <div className="admin-row-actions">
            <button type="button" className="btn btn--danger btn--tiny" onClick={onDelete}>
              Delete request
            </button>
          </div>
        </div>
      )}
    </li>
  )
}
