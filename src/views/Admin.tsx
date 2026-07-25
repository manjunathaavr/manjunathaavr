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
  clearAllMarketplaceData,
  deleteJobGiverByPhone,
  deleteJobSeekerByPhone,
  deleteProfile,
  deleteRequest,
  formatRates,
  genderLabels,
  getAllAccounts,
  getProfileById,
  getProfiles,
  getRequests,
  isSuperAdminSession,
  normalizePhone,
  restoreSampleProfiles,
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

function formatCoords(lat?: number, lng?: number) {
  if (lat == null || lng == null) return ''
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
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
      <section className="section section--top">
        {cloudConfigured === false && (
          <p className="hint admin-cloud-hint">
            Cloud sync is not set up yet — admin only shows users from this
            browser. In Vercel go to Marketplace → Upstash → Redis, connect it
            to this project, then redeploy.
          </p>
        )}
        {cloudConfigured === true && (
          <p className="hint admin-cloud-hint">
            Showing users from all devices (cloud sync active).
          </p>
        )}

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
            <span className="sr-only">Search users</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                tab === 'seekers'
                  ? 'Search seekers by name, phone, skill, city…'
                  : tab === 'givers'
                    ? 'Search givers by name, phone, skill…'
                    : 'Search requests…'
              }
            />
          </label>
        )}

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
            <div className="admin-danger">
              <h2>Delete data</h2>
              <p className="section__lead">
                Permanently remove marketplace data stored in this browser.
              </p>
              <div className="account-head__actions">
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => {
                    if (
                      !confirmDelete(
                        'Delete ALL profiles and requests in this browser? This cannot be undone.',
                      )
                    ) {
                      return
                    }
                    clearAllMarketplaceData()
                    refresh()
                  }}
                >
                  Clear all data
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    restoreSampleProfiles()
                    refresh()
                  }}
                >
                  Restore sample listings
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'seekers' && (
          <div className="admin-panel">
            <h2>Job seekers — full details ({filteredSeekers.length})</h2>
            {filteredSeekers.length === 0 ? (
              <p className="hint">No job seekers match this search.</p>
            ) : (
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
            )}
          </div>
        )}

        {tab === 'givers' && (
          <div className="admin-panel">
            <h2>Job givers — full details ({filteredGivers.length})</h2>
            {filteredGivers.length === 0 ? (
              <p className="hint">
                No job givers match. They appear when someone sends a help
                request.
              </p>
            ) : (
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
            )}
          </div>
        )}

        {tab === 'requests' && (
          <div className="admin-panel">
            <h2>All job requests ({filteredRequests.length})</h2>
            {filteredRequests.length === 0 ? (
              <p className="hint">No requests match.</p>
            ) : (
              <ul className="profile-list">
                {filteredRequests.map((r) => (
                  <RequestRow
                    key={r.id}
                    request={r}
                    onDelete={() => {
                      if (!confirmDelete('Delete this job request?')) return
                      deleteRequest(r.id)
                      refresh()
                    }}
                  />
                ))}
              </ul>
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

  return (
    <li className={`admin-detail-card${open ? ' admin-detail-card--open' : ''}`}>
      <button type="button" className="admin-detail-card__head" onClick={onToggle}>
        <div>
          <strong>{seeker.name}</strong>
          <p className="admin-detail-card__meta">
            {seeker.phone} · {seeker.listingCount} listing
            {seeker.listingCount === 1 ? '' : 's'} · {skillNames || 'No skills'}
          </p>
        </div>
        <span className="admin-detail-card__chevron" aria-hidden="true">
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
      <button type="button" className="admin-detail-card__head" onClick={onToggle}>
        <div>
          <strong>{giver.name}</strong>
          <p className="admin-detail-card__meta">
            {giver.phone} · {giver.requestCount} request
            {giver.requestCount === 1 ? '' : 's'} · {giver.pending} pending
          </p>
        </div>
        <span className="admin-detail-card__chevron" aria-hidden="true">
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

function RequestRow({
  request,
  onDelete,
}: {
  request: JobRequest
  onDelete: () => void
}) {
  const skill = getSkillById(request.skillId)
  const profile = getProfileById(request.profileId)
  return (
    <li className="profile-card">
      <div className="profile-card__top">
        <strong>{request.requesterName}</strong>
        <span className={`status-badge status-badge--${request.status}`}>
          {request.status}
        </span>
      </div>
      <p className="profile-card__meta">Job giver: {request.requesterPhone}</p>
      <p className="profile-card__meta">
        Wants <strong>{skill?.name || request.skillId}</strong>
        {profile ? ` from ${profile.name} (${profile.phone})` : ''}
        {request.hireType
          ? ` · ${availabilityLabels[request.hireType]}`
          : ''}
      </p>
      {request.note && <p>{request.note}</p>}
      {(request.requesterCity ||
        request.requesterPinCode ||
        request.requesterAddress) && (
        <p className="profile-card__meta">
          Location:{' '}
          {[request.requesterCity, request.requesterPinCode, request.requesterAddress]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}
      {formatCoords(request.requesterLatitude, request.requesterLongitude) && (
        <p className="profile-card__meta">
          GPS: {formatCoords(request.requesterLatitude, request.requesterLongitude)}
        </p>
      )}
      <div className="admin-row-actions">
        <p className="hint" style={{ margin: 0 }}>
          {formatWhen(request.createdAt)}
        </p>
        <button type="button" className="btn btn--danger btn--tiny" onClick={onDelete}>
          Delete
        </button>
      </div>
    </li>
  )
}
