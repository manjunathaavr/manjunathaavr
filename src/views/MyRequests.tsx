'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AcceptedContact } from '../components/AcceptedContact'
import { Header } from '../components/Header'
import { getSkillById } from '../data/skills'
import { useSession } from '../hooks/useSession'
import { markAcceptedSeen } from '../lib/notifications'
import {
  availabilityLabels,
  getMyOutgoingRequests,
  getProfileById,
  type JobRequest,
} from '../lib/storage'

export function MyRequests() {
  const session = useSession()
  const [tick, setTick] = useState(0)

  const requests = useMemo(() => {
    void tick
    return getMyOutgoingRequests()
  }, [tick, session?.phone])

  useEffect(() => {
    if (session?.activeRole === 'giver') {
      markAcceptedSeen()
    }
  }, [session?.activeRole, session?.phone, requests])

  if (!session) {
    return (
      <div className="page">
        <Header />
        <section className="section section--top">
          <h1>My requests</h1>
          <p className="section__lead">
            Log in as <strong>I need help</strong> to see help requests you sent.
          </p>
          <Link className="btn btn--primary" href="/account">
            Log in
          </Link>
        </section>
      </div>
    )
  }

  if (session.activeRole !== 'giver') {
    return (
      <div className="page">
        <Header />
        <section className="section section--top">
          <h1>I need help — workspace</h1>
          <p className="section__lead">
            My requests are only for <strong>I need help</strong> login. Log
            out, then log in as I need help.
          </p>
          <Link className="btn btn--primary" href="/account">
            Open account
          </Link>
        </section>
      </div>
    )
  }

  const pending = requests.filter((r) => r.status === 'pending')
  const decided = requests.filter((r) => r.status !== 'pending')

  return (
    <div className="page">
      <Header />
      <section className="section section--top">
        <h1>My requests</h1>
        <p className="section__lead">
          Help requests you sent. Phone numbers appear only after the skill
          provider accepts.
        </p>

        {requests.length === 0 ? (
          <p className="hint">
            No requests yet. <Link href="/find">Find help</Link> near you.
          </p>
        ) : (
          <>
            {pending.length > 0 && (
              <div className="results">
                <h2>{pending.length} waiting</h2>
                <ul className="profile-list">
                  {pending.map((r) => (
                    <OutgoingCard key={r.id} request={r} />
                  ))}
                </ul>
              </div>
            )}
            {decided.length > 0 && (
              <div className="results">
                <h2>Earlier</h2>
                <ul className="profile-list">
                  {decided.map((r) => (
                    <OutgoingCard key={r.id} request={r} />
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <button
          type="button"
          className="btn btn--ghost"
          style={{ marginTop: '1rem' }}
          onClick={() => setTick((n) => n + 1)}
        >
          Refresh status
        </button>
      </section>
    </div>
  )
}

function OutgoingCard({ request }: { request: JobRequest }) {
  const skill = getSkillById(request.skillId)
  const profile = getProfileById(request.profileId)

  return (
    <li className="profile-card">
      <div className="profile-card__top">
        <strong>{profile?.name || 'Skill provider'}</strong>
        <span className={`status-badge status-badge--${request.status}`}>
          {request.status}
        </span>
      </div>
      <p className="profile-card__meta">
        {skill?.name || request.skillId}
        {request.hireType
          ? ` · ${availabilityLabels[request.hireType]}`
          : ''}
      </p>
      {request.note && (
        <p className="hint--blue">Help required on {request.note}</p>
      )}
      {request.status === 'accepted' && profile?.phone && (
        <AcceptedContact
          phone={profile.phone}
          latitude={profile.latitude}
          longitude={profile.longitude}
        />
      )}
      {request.status === 'pending' && (
        <p className="request-status request-status--pending">
          Waiting for acceptance — number stays private
        </p>
      )}
      {request.status === 'declined' && (
        <p className="request-status request-status--declined">Declined</p>
      )}
    </li>
  )
}
