'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Header } from '../components/Header'
import { SkillGlyph } from '../components/SkillGlyph'
import { SkillGrid } from '../components/SkillGrid'
import { getEducationOptions } from '../data/educationBySkill'
import { getSkillById } from '../data/skills'
import { useSession } from '../hooks/useSession'
import {
  captureCoordinates,
  locationErrorMessage,
  lookupCityFromPin,
  pickAddressFromCurrentLocation,
} from '../lib/location'
import {
  availabilityLabels,
  experienceOptions,
  getMyProfiles,
  getSenderIdentity,
  hasMySkillListing,
  hireOptions,
  saveProfile,
  subscribeSession,
  type AvailabilityType,
  type Gender,
  type SkillRates,
} from '../lib/storage'

export function OfferSkill() {
  const params = useParams()
  const skillId = typeof params.skillId === 'string' ? params.skillId : undefined
  const skill = skillId ? getSkillById(skillId) : undefined
  const eduOptions = useMemo(() => getEducationOptions(skillId), [skillId])
  const session = useSession()
  const [saved, setSaved] = useState(false)
  const [availability, setAvailability] = useState<AvailabilityType[]>(['job'])
  const [rates, setRates] = useState<SkillRates>({ job: '' })
  const [name, setName] = useState(session?.name || '')
  const [gender, setGender] = useState<Gender | ''>('')
  const [phone, setPhone] = useState(session?.phone || '')
  const [education, setEducation] = useState('')
  const [experience, setExperience] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [pinCode, setPinCode] = useState('')
  const [latitude, setLatitude] = useState<number | undefined>()
  const [longitude, setLongitude] = useState<number | undefined>()
  const [locating, setLocating] = useState(false)
  const [locationHint, setLocationHint] = useState('')
  const [pinLooking, setPinLooking] = useState(false)
  const [locationTouched, setLocationTouched] = useState(false)
  const [profileTick, setProfileTick] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const onRefresh = () => setProfileTick((n) => n + 1)
    const unsubSession = subscribeSession(onRefresh)
    window.addEventListener('sk-profiles-changed', onRefresh)
    return () => {
      unsubSession()
      window.removeEventListener('sk-profiles-changed', onRefresh)
    }
  }, [])

  const alreadyListed = useMemo(
    () =>
      Boolean(
        session && skill && hasMySkillListing(skill.id, session.phone),
      ),
    [session?.phone, skill?.id, profileTick],
  )

  useEffect(() => {
    if (!session || locationTouched) return
    setName(session.name)
    setPhone(session.phone)
    const existing = getMyProfiles()[0]
    const sender = getSenderIdentity()
    const knownGender = existing?.gender || sender?.gender
    if (knownGender) setGender(knownGender)
    // Reuse saved address only until user picks location or edits fields
    if (existing) {
      setAddress(existing.address || '')
      setCity(existing.city || '')
      setPinCode(existing.pinCode || '')
      setLatitude(existing.latitude)
      setLongitude(existing.longitude)
    }
  }, [session, locationTouched])

  // Reset skill-specific fields when the skill changes
  useEffect(() => {
    setEducation('')
    setExperience('')
    setAvailability(['job'])
    setRates({ job: '' })
  }, [skillId])

  async function fillCityFromPin(pin: string) {
    if (!/^\d{6}$/.test(pin)) return
    setPinLooking(true)
    try {
      const found = await lookupCityFromPin(pin)
      if (found?.city) {
        setCity(found.city)
        if (found.area) {
          setAddress(`${found.area}, ${found.city}`)
        }
        setLocationHint(
          found.area
            ? `City set from pin code (${found.area}, ${found.city}).`
            : `City set from pin code (${found.city}).`,
        )
      } else {
        setLocationHint('Pin code not found. Please enter city manually.')
      }
    } catch {
      setLocationHint('Could not look up pin code. Enter city manually.')
    } finally {
      setPinLooking(false)
    }
  }

  if (!skillId) {
    return (
      <div className="page">
        <Header />
        <section className="section section--top">
          <h1>{session ? 'Add another skill' : 'Offer your skill'}</h1>
          {!session && (
            <p className="section__lead">
              Choose the picture that matches what you can do.
            </p>
          )}
          <SkillGrid mode="offer" />
          {session && (
            <Link href="/account" className="back-link">
              ← My skills
            </Link>
          )}
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
          <Link href="/offer" className="btn btn--primary">
            See all skills
          </Link>
        </section>
      </div>
    )
  }

  function toggleAvailability(type: AvailabilityType) {
    setAvailability((prev) => {
      if (prev.includes(type)) {
        setRates((r) => {
          const next = { ...r }
          delete next[type]
          return next
        })
        return prev.filter((t) => t !== type)
      }
      setRates((r) => ({ ...r, [type]: r[type] || '' }))
      return [...prev, type]
    })
  }

  function setRate(type: AvailabilityType, value: string) {
    setRates((prev) => ({ ...prev, [type]: value }))
    if (value.trim() && !availability.includes(type)) {
      setAvailability((prev) => [...prev, type])
    }
  }

  async function useCurrentLocation() {
    setLocationTouched(true)
    setLocating(true)
    setLocationHint('Getting fresh GPS location…')
    setAddress('')
    setCity('')
    setPinCode('')
    setLatitude(undefined)
    setLongitude(undefined)
    try {
      const place = await pickAddressFromCurrentLocation()
      setAddress(place.address)
      setCity(place.city)
      setPinCode(place.pinCode)
      setLatitude(place.latitude)
      setLongitude(place.longitude)

      if (place.pinCode && place.city) {
        setLocationHint(
          place.locality
            ? `Location set: ${place.locality}, ${place.city} (${place.pinCode}). You can edit if needed.`
            : `Location set from India Post pin ${place.pinCode}. You can edit if needed.`,
        )
      } else if (place.pinCode) {
        await fillCityFromPin(place.pinCode)
      } else if (place.address) {
        setLocationHint(
          'Address saved from GPS. Please confirm city and enter the 6-digit pin code.',
        )
      } else {
        setLocationHint('Could not read street address. Please type it manually.')
      }
    } catch (err) {
      setLocationHint(locationErrorMessage(err))
    } finally {
      setLocating(false)
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (alreadyListed) {
      alert('You already listed this skill. Choose another from Add skill.')
      return
    }

    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()
    const trimmedAddress = address.trim()
    const trimmedCity = city.trim()
    const pin = pinCode.trim()

    if (!trimmedName) {
      alert('Please enter your full name.')
      return
    }
    if (!education.trim()) {
      alert('Please select your education.')
      return
    }
    if (!experience.trim()) {
      alert('Please select your experience.')
      return
    }
    if (!trimmedPhone.replace(/\D/g, '').match(/^\d{10}$/)) {
      alert('Please enter a valid 10-digit mobile number.')
      return
    }
    if (!trimmedAddress) {
      alert('Please enter your address (street or landmark).')
      return
    }
    if (!trimmedCity) {
      alert('Please enter your city.')
      return
    }
    if (!/^\d{6}$/.test(pin)) {
      alert('Please enter a valid 6-digit pin code.')
      return
    }
    if (availability.length === 0) {
      alert('Please select at least one hire option.')
      return
    }

    const cleanRates: SkillRates = {}
    for (const type of availability) {
      const amount = (rates[type] || '').trim()
      if (!amount) {
        alert(`Please enter amount for ${availabilityLabels[type]}.`)
        return
      }
      cleanRates[type] = amount
    }

    setSaving(true)
    try {
      const resolvedGender: Gender =
        gender ||
        getMyProfiles()[0]?.gender ||
        getSenderIdentity()?.gender ||
        'male'

      // GPS is optional when city + pin are entered manually.
      let lat = latitude
      let lng = longitude
      if (lat == null || lng == null) {
        const coords = await Promise.race([
          captureCoordinates(),
          new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 6000)),
        ])
        if (coords) {
          lat = coords.latitude
          lng = coords.longitude
          setLatitude(lat)
          setLongitude(lng)
        }
      }

      await saveProfile({
        skillId: skill!.id,
        name: trimmedName,
        gender: resolvedGender,
        education: education.trim(),
        experience: experience.trim(),
        phone: trimmedPhone,
        address: trimmedAddress,
        city: trimmedCity,
        pinCode: pin,
        latitude: lat,
        longitude: lng,
        availability,
        rates: cleanRates,
        about: String(
          (e.currentTarget.elements.namedItem('about') as HTMLTextAreaElement)
            ?.value || '',
        ).trim(),
      })

      setSaved(true)
    } catch {
      alert('Could not save your skill. Check your internet and try again.')
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="page">
        <Header />
        <section className="section section--top success-panel">
          <div
            className="success-panel__icon"
            style={{ background: skill.color }}
          >
            <SkillGlyph skillId={skill.id} size={64} />
          </div>
          <h1>You are listed!</h1>
          <p>
            Your <strong>{skill.name}</strong> profile is ready. You can add more
            skills anytime from your account.
          </p>
          <div className="hero__actions">
            <Link className="btn btn--primary" href="/offer">
              Add another skill
            </Link>
            <Link className="btn btn--ghost" href="/account">
              My skills
            </Link>
          </div>
        </section>
      </div>
    )
  }

  if (alreadyListed) {
    return (
      <div className="page">
        <Header />
        <section className="section section--top form-section">
          <h1>Already listed</h1>
          <p className="section__lead">
            You already offer <strong>{skill.name}</strong>. Pick a different
            skill to add.
          </p>
          <Link className="btn btn--primary" href="/offer">
            Add skill
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="page">
      <Header />
      <section className="section section--top offer-page">
        <h1 className="offer-page__title">
          {session ? 'Add skill' : 'Offer skill'}
        </h1>
        <p className="offer-page__lead">
          Fill a few details so people nearby can find you for this skill.
        </p>

        <div className="offer-skill-card">
          <span
            className="offer-skill-card__icon"
            style={{ background: skill.color }}
          >
            <SkillGlyph skillId={skill.id} size={40} />
          </span>
          <div className="offer-skill-card__text">
            <strong>{skill.name}</strong>
            <small>{skill.shortLabel}</small>
            <p>{skill.description}</p>
          </div>
        </div>

        <form className="profile-form offer-form" onSubmit={onSubmit} noValidate>
          <label>
            Full name <span className="req">*</span>
            <input
              name="name"
              required
              autoComplete="name"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={Boolean(session)}
              className={session ? 'input--locked' : undefined}
            />
          </label>

          <label htmlFor="offer-education">
            Education <span className="req">*</span>
            <select
              id="offer-education"
              name="education"
              required
              value={education}
              onChange={(e) => setEducation(e.target.value)}
            >
              <option value="">Select education</option>
              {eduOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="offer-experience">
            Experience in this skill <span className="req">*</span>
            <select
              id="offer-experience"
              name="experience"
              required
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            >
              <option value="">Select experience</option>
              {experienceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Phone <span className="req">*</span>
            <input
              name="phone"
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder="Mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              readOnly={Boolean(session)}
              className={session ? 'input--locked' : undefined}
            />
          </label>

          <div className="field-block">
            <div className="field-block__head">
              <span>
                Address <span className="req">*</span>
              </span>
              <button
                type="button"
                className="location-btn"
                onClick={useCurrentLocation}
                disabled={locating}
              >
                {locating ? 'Finding…' : 'Use current location'}
              </button>
            </div>
            <input
              name="address"
              required
              autoComplete="street-address"
              placeholder="Street, landmark, locality"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {locationHint && <p className="field-hint">{locationHint}</p>}
          </div>

          <div className="form-row">
            <label>
              City <span className="req">*</span>
              <input
                name="city"
                required
                placeholder={pinLooking ? 'Looking up…' : 'City'}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </label>
            <label>
              Pin code <span className="req">*</span>
              <input
                name="pinCode"
                required
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="6 digits"
                title="Enter 6-digit pin code"
                value={pinCode}
                onChange={(e) => {
                  const next = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setLocationTouched(true)
                  setPinCode(next)
                  if (next.length === 6) {
                    void fillCityFromPin(next)
                  }
                }}
              />
            </label>
          </div>

          <fieldset className="offer-form__hire">
            <legend>
              Hire as <span className="req">*</span>
            </legend>
            <div className="hire-grid" role="group" aria-label="Hire options">
              {hireOptions.map((type) => {
                const selected = availability.includes(type)
                return (
                  <div
                    key={type}
                    className={`hire-option${selected ? ' hire-option--on' : ''}`}
                  >
                    <button
                      type="button"
                      className="hire-option__tab"
                      aria-pressed={selected}
                      onClick={() => toggleAvailability(type)}
                    >
                      {availabilityLabels[type]}
                    </button>
                    <input
                      className="hire-option__amount"
                      type="text"
                      inputMode="decimal"
                      placeholder="₹"
                      aria-label={`${availabilityLabels[type]} amount`}
                      value={rates[type] || ''}
                      onChange={(e) => setRate(type, e.target.value)}
                      onFocus={() => {
                        if (!availability.includes(type)) {
                          setAvailability((prev) => [...prev, type])
                        }
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </fieldset>

          <label>
            About you
            <textarea
              name="about"
              rows={3}
              placeholder="When are you free? What can you help with?"
            />
          </label>

          <button
            type="submit"
            className="btn btn--primary btn--block offer-form__submit"
            disabled={saving}
          >
            {saving ? 'Saving…' : session ? 'Save this skill' : 'Save my profile'}
          </button>
          <Link href="/offer" className="back-link">
            ← Choose another skill
          </Link>
        </form>
      </section>
    </div>
  )
}
