'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState, type FormEvent } from 'react'
import { AcceptedContact } from '../components/AcceptedContact'
import { Header } from '../components/Header'
import { SkillGlyph } from '../components/SkillGlyph'
import { SkillGrid } from '../components/SkillGrid'
import { getSkillById } from '../data/skills'
import { captureCoordinates, pickAddressFromCurrentLocation } from '../lib/location'
import { buyExtraRequestPack, getPaymentConfig } from '../lib/payments'
import {
  createJobRequest,
  enterAsRole,
  EXTRA_PACK_PRICE_INR,
  FREE_REQUESTS_PER_DAY,
  formatRates,
  genderLabels,
  getDailyRequestQuota,
  getRequestForProfile,
  getSenderIdentity,
  getSession,
  PAID_REQUESTS_PER_PACK,
  saveSenderIdentity,
  searchByPin,
  searchByCity,
  searchNearbyProfiles,
  sortProfiles,
  updateRequestLocation,
  type Gender,
  type ProfileSort,
  type SkillProfile,
} from '../lib/storage'

function RequestAction({
  profile,
  skillId,
  onChanged,
}: {
  profile: SkillProfile
  skillId: string
  onChanged: () => void
}) {
  const session = getSession()
  const sender = getSenderIdentity()
  const phone = session?.phone || sender?.phone || ''
  const existing = getRequestForProfile(profile.id, phone)
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [quotaTick, setQuotaTick] = useState(0)

  if (existing?.status === 'accepted') {
    return (
      <AcceptedContact
        phone={profile.phone}
        latitude={profile.latitude}
        longitude={profile.longitude}
      />
    )
  }

  if (existing?.status === 'pending') {
    return (
      <PendingRequestLocation
        requestId={existing.id}
        profileName={profile.name}
        hasLocation={Boolean(
          existing.requesterCity ||
            existing.requesterAddress ||
            existing.requesterPinCode,
        )}
        onChanged={onChanged}
      />
    )
  }

  if (!open) {
    return (
      <div className="request-result">
        {existing?.status === 'declined' && (
          <p className="request-status request-status--declined">
            Request was declined
          </p>
        )}
        <button
          type="button"
          className="btn btn--primary btn--small"
          onClick={() => setOpen(true)}
        >
          {existing?.status === 'declined' ? 'Send again' : 'Request help'}
        </button>
      </div>
    )
  }

  return (
    <RequestForm
      profile={profile}
      skillId={skillId}
      note={note}
      quotaTick={quotaTick}
      setNote={setNote}
      onCancel={() => setOpen(false)}
      onSent={() => {
        setOpen(false)
        onChanged()
      }}
      onQuotaChange={() => setQuotaTick((n) => n + 1)}
    />
  )
}

function PendingRequestLocation({
  requestId,
  profileName,
  hasLocation,
  onChanged,
}: {
  requestId: string
  profileName: string
  hasLocation: boolean
  onChanged: () => void
}) {
  const [busy, setBusy] = useState(false)

  async function shareLocation() {
    if (busy) return
    setBusy(true)
    try {
      const place = await pickAddressFromCurrentLocation()
      const area = place.locality || place.address || ''
      if (!place.city && !area) {
        alert(
          'Could not detect your area. Please enable location and try again.',
        )
        return
      }
      updateRequestLocation(requestId, {
        requesterLatitude: place.latitude,
        requesterLongitude: place.longitude,
        requesterAddress: area || undefined,
        requesterCity: place.city || undefined,
        requesterPinCode: place.pinCode || undefined,
      })
      onChanged()
      alert('Location shared. They can now see where you need help from.')
    } catch {
      alert(
        'Please allow location access. Your area is needed so they can accept.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="request-result">
      <p className="request-status request-status--pending">
        Request sent — waiting for {profileName.split(' ')[0]} to accept
      </p>
      {!hasLocation && (
        <p className="hint hint--blue" style={{ margin: '0.35rem 0' }}>
          Share your location so they can decide whether to accept.
        </p>
      )}
      <button
        type="button"
        className="btn btn--primary btn--small"
        disabled={busy}
        onClick={() => void shareLocation()}
      >
        {busy
          ? 'Getting location…'
          : hasLocation
            ? 'Update my location'
            : 'Share my location'}
      </button>
    </div>
  )
}

function RequestForm({
  profile,
  skillId,
  note,
  quotaTick,
  setNote,
  onCancel,
  onSent,
  onQuotaChange,
}: {
  profile: SkillProfile
  skillId: string
  note: string
  quotaTick: number
  setNote: (v: string) => void
  onCancel: () => void
  onSent: () => void
  onQuotaChange: () => void
}) {
  const [paying, setPaying] = useState(false)
  void quotaTick

  const session = getSession()
  const sender = getSenderIdentity()
  const name = (session?.name || sender?.name || '').trim()
  const phone = (session?.phone || sender?.phone || '').trim()
  const gender: Gender = sender?.gender || 'male'

  const quota = getDailyRequestQuota(phone)
  const atLimit = phone.length > 0 && quota.remaining <= 0
  const payConfig = getPaymentConfig()

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name || !phone) {
      alert('Please log in so we can send the request with your account details.')
      return
    }
    saveSenderIdentity({ name, phone, gender })
    enterAsRole({ name, phone }, 'giver')

    let place: Awaited<ReturnType<typeof pickAddressFromCurrentLocation>> | null =
      null
    try {
      place = await pickAddressFromCurrentLocation()
    } catch {
      const coords = await captureCoordinates()
      if (!coords) {
        alert(
          'Please allow location access. Your area is needed so they can decide whether to accept your request.',
        )
        return
      }
      place = {
        address: '',
        city: '',
        pinCode: '',
        latitude: coords.latitude,
        longitude: coords.longitude,
      }
    }

    if (!place.city && !place.address && !place.locality) {
      alert(
        'Could not detect your area. Please enable location and try again — it is required for accepting requests.',
      )
      return
    }

    const areaLabel = place.locality || place.address || undefined

    const result = createJobRequest({
      profileId: profile.id,
      skillId,
      hireType: profile.availability[0] || 'job',
      requesterName: name,
      requesterPhone: phone,
      requesterGender: gender,
      note: note.trim(),
      requesterLatitude: place.latitude,
      requesterLongitude: place.longitude,
      requesterAddress: areaLabel,
      requesterCity: place.city || undefined,
      requesterPinCode: place.pinCode || undefined,
    })
    if (!result.ok) {
      if (result.reason === 'limit') {
        alert(
          `You have used all ${result.limit} requests for today (${FREE_REQUESTS_PER_DAY} free` +
            (quota.paidExtra ? ` + ${quota.paidExtra} paid` : '') +
            `). Pay ₹${EXTRA_PACK_PRICE_INR} for ${PAID_REQUESTS_PER_PACK} more, or try again tomorrow.`,
        )
      } else {
        alert('Could not send the request. Please try again.')
      }
      return
    }
    onSent()
  }

  async function payForMore() {
    if (!phone) {
      alert('Please log in first.')
      return
    }
    setPaying(true)
    try {
      const result = await buyExtraRequestPack({
        phone,
        name,
      })
      if (!result.ok) {
        if (result.reason !== 'cancelled') alert(result.message)
        return
      }
      onQuotaChange()
      alert(
        `Payment successful. You got ${PAID_REQUESTS_PER_PACK} more requests for today.`,
      )
    } finally {
      setPaying(false)
    }
  }

  return (
    <form className="request-form" onSubmit={submit}>
      <p className="request-form__lead">
        Sent as <strong>{name || 'you'}</strong>
        {phone ? ` · ${phone}` : ''}. Your current location is shared (area /
        city) so they can decide whether to accept. Phone stays private until
        they accept. You get{' '}
        <strong>{FREE_REQUESTS_PER_DAY} free requests per day</strong>
        {quota.paidExtra > 0 ? (
          <>
            {' '}
            + <strong>{quota.paidExtra} paid</strong>
          </>
        ) : null}
        {phone ? ` — ${quota.remaining} of ${quota.limit} left today` : ''}.
      </p>
      {atLimit && (
        <div className="paywall-box">
          <p className="request-status request-status--declined">
            Daily limit reached ({quota.used}/{quota.limit}). Pay ₹
            {EXTRA_PACK_PRICE_INR} for {PAID_REQUESTS_PER_PACK} more requests
            today.
          </p>
          <button
            type="button"
            className="btn btn--primary btn--small"
            disabled={paying}
            onClick={() => void payForMore()}
          >
            {paying
              ? 'Opening payment…'
              : `Pay ₹${EXTRA_PACK_PRICE_INR} · +${PAID_REQUESTS_PER_PACK} requests`}
          </button>
          <p className="paywall-box__hint">
            {payConfig.mode === 'demo'
              ? 'Demo mode — no real charge until you add a Razorpay key in .env'
              : 'Secure checkout via Razorpay'}
          </p>
        </div>
      )}
      <label>
        Note
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="When do you need help?"
        />
      </label>
      <div className="request-form__actions">
        <button
          type="submit"
          className="btn btn--primary btn--small"
          disabled={atLimit}
        >
          Send request
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--small"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export function FindHelp() {
  const params = useParams()
  const skillId = typeof params.skillId === 'string' ? params.skillId : undefined
  const skill = skillId ? getSkillById(skillId) : undefined
  const [searchInput, setSearchInput] = useState('')
  const [queryPin, setQueryPin] = useState('')
  const [queryCity, setQueryCity] = useState('')
  const [searchMode, setSearchMode] = useState<
    'all' | 'exact' | 'nearby' | 'city'
  >('all')
  const [origin, setOrigin] = useState<
    { latitude: number; longitude: number } | undefined
  >(undefined)
  const [nearbyBusy, setNearbyBusy] = useState(false)
  const [searched, setSearched] = useState(true)
  const [sort, setSort] = useState<ProfileSort>('cost-asc')
  const [tick, setTick] = useState(0)

  const results = useMemo(() => {
    if (!skill || !searched) return [] as SkillProfile[]
    let list: SkillProfile[]
    if (searchMode === 'nearby') {
      list = searchNearbyProfiles(skill.id, queryPin, origin)
    } else if (searchMode === 'city') {
      list = searchByCity(skill.id, queryCity)
    } else {
      list = searchByPin(skill.id, queryPin)
    }
    return sortProfiles(list, sort)
    // tick refreshes request status on cards
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill, queryPin, queryCity, searchMode, origin, searched, sort, tick])

  if (!skillId) {
    return (
      <div className="page">
        <Header />
        <section className="section section--top">
          <h1>Find help near you</h1>
          <p className="section__lead">
            Browse skill profiles, then sort by cost or experience.
          </p>
          <SkillGrid mode="find" />
        </section>
      </div>
    )
  }

  if (!skill) {
    return (
      <div className="page">
        <Header />
        <section className="section section--top">
          <h1>Skill not found</h1>
          <Link href="/find" className="btn btn--primary">
            See all skills
          </Link>
        </section>
      </div>
    )
  }

  function runExactSearch(pinRaw: string) {
    const pin = pinRaw.trim().replace(/\D/g, '').slice(0, 6)
    if (pin && !/^\d{6}$/.test(pin)) {
      alert('Enter a full 6-digit pin code, or leave it blank to see everyone.')
      return
    }
    setOrigin(undefined)
    setQueryCity('')
    setQueryPin(pin)
    setSearchMode(pin ? 'exact' : 'all')
    setSort((s) => (s === 'nearest' ? 'cost-asc' : s))
    setSearched(true)
  }

  function runCitySearch(cityRaw: string) {
    const city = cityRaw.trim()
    if (!city) {
      alert('Enter a city name to search.')
      return
    }
    setOrigin(undefined)
    setQueryPin('')
    setQueryCity(city)
    setSearchMode('city')
    setSort((s) => (s === 'nearest' ? 'cost-asc' : s))
    setSearched(true)
  }

  function onSearch(e: FormEvent) {
    e.preventDefault()
    const raw = searchInput.trim()
    if (!raw) {
      runExactSearch('')
      return
    }
    const digits = raw.replace(/\D/g, '')
    // 6-digit pin (or mostly digits) → pin search; otherwise city
    if (/^\d{6}$/.test(digits) && digits === raw.replace(/\s/g, '')) {
      runExactSearch(raw)
      return
    }
    if (/^\d+$/.test(raw.replace(/\s/g, ''))) {
      runExactSearch(raw)
      return
    }
    runCitySearch(raw)
  }

  async function onNearby() {
    if (nearbyBusy) return
    setNearbyBusy(true)
    try {
      let pin = searchInput.trim().replace(/\D/g, '').slice(0, 6)
      let nextOrigin: { latitude: number; longitude: number } | undefined

      try {
        const place = await pickAddressFromCurrentLocation()
        nextOrigin = {
          latitude: place.latitude,
          longitude: place.longitude,
        }
        if (place.pinCode && /^\d{6}$/.test(place.pinCode)) {
          pin = place.pinCode
          setSearchInput(place.pinCode)
        }
      } catch {
        const coords = await captureCoordinates()
        if (coords) nextOrigin = coords
      }

      if (!nextOrigin && (!pin || !/^\d{6}$/.test(pin))) {
        alert(
          'Allow location access, or enter a 6-digit pin code, to search nearby.',
        )
        return
      }

      setOrigin(nextOrigin)
      setQueryCity('')
      setQueryPin(pin)
      setSearchMode('nearby')
      setSort('nearest')
      setSearched(true)
    } finally {
      setNearbyBusy(false)
    }
  }

  return (
    <div className="page">
      <Header />
      <section className="section section--top browse-page">
        <div className="form-intro">
          <span className="form-intro__icon" style={{ background: skill.color }}>
            <SkillGlyph skillId={skill.id} size={44} />
          </span>
          <div>
            <p className="eyebrow">Browse profiles</p>
            <h1>{skill.name}</h1>
            <p className="section__lead">{skill.description}</p>
          </div>
        </div>

        <form className="search-bar" onSubmit={onSearch} noValidate>
          <input
            className="search-bar__input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Pin code or city"
            autoComplete="off"
            aria-label="Pin code or city"
          />
          <div className="search-bar__actions">
            <button
              type="submit"
              className="search-icon-btn"
              title="Search by PIN / City"
              aria-label="Search by PIN / City"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M16.5 16.5L21 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Search by PIN / City
            </button>
            <button
              type="button"
              className="search-icon-btn"
              title="Search Nearby"
              aria-label="Search Nearby"
              onClick={() => void onNearby()}
              disabled={nearbyBusy}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 21s-6.5-5.2-6.5-10a6.5 6.5 0 1 1 13 0c0 4.8-6.5 10-6.5 10z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="11" r="2.25" stroke="currentColor" strokeWidth="2" />
              </svg>
              Search Nearby
            </button>
            <label className="search-bar__field search-bar__field--sort">
              <span className="sr-only">Sort profiles</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as ProfileSort)}
                aria-label="Sort profiles"
              >
                {searchMode === 'nearby' && (
                  <option value="nearest">Nearest first</option>
                )}
                <option value="cost-asc">Cost — low to high</option>
                <option value="cost-desc">Cost — high to low</option>
                <option value="exp-desc">Experience — most first</option>
                <option value="exp-asc">Experience — least first</option>
                <option value="newest">Newest listings</option>
              </select>
            </label>
          </div>
        </form>

        <p className="hint hint--blue browse-page__hint">
          Enter pin or city, then Enter / search — or Nearby for closest.
        </p>

        {searched && (
          <div className="results">
            <h2>
              {results.length === 0
                ? 'No profiles yet'
                : `${results.length} ${results.length === 1 ? 'profile' : 'profiles'}`}
            </h2>
            {searchMode === 'nearby' && results.length > 0 && (
              <p className="hint results__scope">
                Showing nearest {skill.name.toLowerCase()} profiles
                {queryPin ? ` near ${queryPin}` : ''}
              </p>
            )}
            {searchMode === 'exact' && queryPin && results.length > 0 && (
              <p className="hint results__scope">
                Showing profiles for pin {queryPin}
              </p>
            )}
            {searchMode === 'city' && queryCity && results.length > 0 && (
              <p className="hint results__scope">
                Showing profiles in {queryCity}
              </p>
            )}
            {searchMode === 'all' && results.length > 0 && (
              <p className="hint results__scope">
                Showing all {skill.name.toLowerCase()} profiles
              </p>
            )}
            {results.length === 0 ? (
              <p>
                No one listed for this skill
                {searchMode === 'city' && queryCity
                  ? ` in ${queryCity}`
                  : queryPin
                    ? ' near that pin'
                    : ''}{' '}
                yet.{' '}
                <Link href={`/offer/${skill.id}`}>Offer this skill</Link> yourself.
              </p>
            ) : (
              <ul className="profile-list account-skills-list">
                {results.map((p) => (
                  <li key={p.id} className="profile-card">
                    <div className="profile-card__top">
                      <strong>
                        {p.name}
                        {p.gender ? (
                          <span className="gender-tag">
                            {' '}
                            · {genderLabels[p.gender]}
                          </span>
                        ) : null}
                      </strong>
                      <span className="pin-badge">{p.pinCode}</span>
                    </div>
                    <p className="profile-card__meta">
                      {p.city} · {p.address}
                    </p>
                    {(p.education || p.experience) && (
                      <p className="profile-card__edu">
                        {[p.education, p.experience].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {formatRates(p) && (
                      <p className="profile-card__rate">{formatRates(p)}</p>
                    )}
                    <RequestAction
                      profile={p}
                      skillId={skill.id}
                      onChanged={() => setTick((n) => n + 1)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <Link href="/find" className="back-link">
          ← Choose another skill
        </Link>
      </section>
    </div>
  )
}

