'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AcceptedContact } from '../components/AcceptedContact'
import { Header } from '../components/Header'
import { getSkillById } from '../data/skills'
import { useSession } from '../hooks/useSession'
import { lookupAddressAt } from '../lib/location'
import { markIncomingSeen } from '../lib/notifications'
import {
  availabilityLabels,
  genderLabels,
  getProfileById,
  getRequestsForOwner,
  updateRequestLocation,
  updateRequestStatus,
  type JobRequest,
} from '../lib/storage'

export function Requests() {
  const session = useSession()
  const [tick, setTick] = useState(0)

  const requests = useMemo(() => {
    void tick
    return getRequestsForOwner()
  }, [tick, session?.phone])

  useEffect(() => {
    if (session?.activeRole === 'seeker') {
      markIncomingSeen()
    }
  }, [session?.activeRole, session?.phone, requests])

  if (!session) {
    return (
      <div className="page">
        <Header />
        <section className="section section--top">
          <h1>Incoming requests</h1>
          <p className="section__lead">
            Log in as <strong>I have a skill</strong> to accept or decline hire
            requests for your skills.
          </p>
          <Link className="btn btn--primary" href="/account">
            Log in
          </Link>
        </section>
      </div>
    )
  }

  if (session.activeRole !== 'seeker') {
    return (
      <div className="page">
        <Header />
        <section className="section section--top">
          <h1>I have a skill — workspace</h1>
          <p className="section__lead">
            Incoming hire requests are only for{' '}
            <strong>I have a skill</strong> login. Log out, then log in as I
            have a skill.
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

  function act(id: string, status: 'accepted' | 'declined') {
    updateRequestStatus(id, status)
    setTick((n) => n + 1)
  }

  return (
    <div className="page">
      <Header />
      <section className="section section--top incoming-page">
        <h1>Incoming requests</h1>
        <p className="section__lead hint--blue">
          Accept a request to share phone numbers and map pins for commuting.
          Until then, contact details stay private.
        </p>

        {requests.length === 0 ? (
          <p className="hint">
            No requests yet. When a job giver taps <strong>Request help</strong>{' '}
            on your listing, it will show up here.
          </p>
        ) : (
          <>
            {pending.length > 0 && (
              <div className="results">
                <h2>{pending.length} pending</h2>
                <ul className="profile-list">
                  {pending.map((r) => (
                    <RequestCard
                      key={r.id}
                      request={r}
                      onAct={act}
                    />
                  ))}
                </ul>
              </div>
            )}

            {decided.length > 0 && (
              <div className="results">
                <h2>Earlier</h2>
                <ul className="profile-list">
                  {decided.map((r) => (
                    <RequestCard
                      key={r.id}
                      request={r}
                      onAct={act}
                    />
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <Link href="/account" className="back-link">
          ← My skills
        </Link>
      </section>
    </div>
  )
}

function formatRequesterFrom(request: JobRequest): string | null {
  const area = (request.requesterAddress || '').trim()
  const city = (request.requesterCity || '').trim()
  if (area && city) {
    const areaLower = area.toLowerCase()
    const cityLower = city.toLowerCase()
    if (areaLower.includes(cityLower)) return `From ${area}`
    return `From ${area}, ${city}`
  }
  if (city) return `From ${city}`
  if (area) return `From ${area}`
  if (request.requesterPinCode) return `From pin ${request.requesterPinCode}`
  return null
}

function RequestCard({
  request,
  onAct,
}: {
  request: JobRequest
  onAct: (id: string, status: 'accepted' | 'declined') => void
}) {
  const profile = getProfileById(request.profileId)
  const skill = getSkillById(request.skillId)
  const [fromLabel, setFromLabel] = useState(() => formatRequesterFrom(request))
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    const existing = formatRequesterFrom(request)
    if (existing) {
      setFromLabel(existing)
      return
    }

    const lat = request.requesterLatitude
    const lon = request.requesterLongitude
    if (lat == null || lon == null) {
      setFromLabel(null)
      return
    }

    let cancelled = false
    setResolving(true)
    void lookupAddressAt(lat, lon)
      .then((place) => {
        if (cancelled) return
        const area = place.locality || place.address || ''
        const city = place.city || ''
        updateRequestLocation(request.id, {
          requesterAddress: area || undefined,
          requesterCity: city || undefined,
          requesterPinCode: place.pinCode || undefined,
        })
        const label =
          area && city
            ? area.toLowerCase().includes(city.toLowerCase())
              ? `From ${area}`
              : `From ${area}, ${city}`
            : city
              ? `From ${city}`
              : area
                ? `From ${area}`
                : null
        setFromLabel(label)
      })
      .catch(() => {
        if (!cancelled) setFromLabel(null)
      })
      .finally(() => {
        if (!cancelled) setResolving(false)
      })

    return () => {
      cancelled = true
    }
  }, [
    request.id,
    request.requesterAddress,
    request.requesterCity,
    request.requesterPinCode,
    request.requesterLatitude,
    request.requesterLongitude,
  ])

  return (
    <li className="profile-card">
      <div className="profile-card__top">
        <strong>
          {request.requesterName}
          {request.requesterGender ? (
            <span className="gender-tag">
              {' '}
              · {genderLabels[request.requesterGender]}
            </span>
          ) : null}
        </strong>
        <span className={`status-badge status-badge--${request.status}`}>
          {request.status}
        </span>
      </div>
      {fromLabel ? (
        <p className="requester-location hint--blue">
          <strong>{fromLabel}</strong>
        </p>
      ) : resolving ? (
        <p className="requester-location hint--blue">Finding location…</p>
      ) : (
        <p className="requester-location request-status--declined">
          Location not shared yet — ask them to send the request again with
          location on
        </p>
      )}
      <p className="profile-card__meta">
        Wants <strong>{skill?.name || request.skillId}</strong>
        {profile ? ` from your ${profile.name} listing` : ''}
        {request.hireType
          ? ` · ${availabilityLabels[request.hireType]}`
          : ''}
      </p>
      {request.note && (
        <p className="hint--blue">Help required on {request.note}</p>
      )}

      {request.status === 'pending' && (
        <div className="request-form__actions">
          <button
            type="button"
            className="btn btn--primary btn--small"
            onClick={() => onAct(request.id, 'accepted')}
          >
            Accept
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => onAct(request.id, 'declined')}
          >
            Decline
          </button>
        </div>
      )}

      {request.status === 'accepted' && (
        <AcceptedContact
          phone={request.requesterPhone}
          latitude={request.requesterLatitude}
          longitude={request.requesterLongitude}
          lead="Accepted — you can call each other now"
        />
      )}

      {request.status === 'declined' && (
        <p className="request-status request-status--declined">Declined</p>
      )}
    </li>
  )
}
