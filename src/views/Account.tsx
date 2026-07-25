'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'
import { GenderTabs } from '../components/GenderTabs'
import { Header } from '../components/Header'
import { BrandLogo } from '../components/BrandLogo'
import { SkillGlyph } from '../components/SkillGlyph'
import { getSkillById } from '../data/skills'
import { useSession } from '../hooks/useSession'
import {
  availabilityLabels,
  formatRates,
  getMyProfiles,
  loginWithPhoneAsync,
  registerWithPhoneAsync,
  type Gender,
  type UserRole,
} from '../lib/storage'

type AuthTab = 'login' | 'signup'

function parseRole(raw: string | null): UserRole | null {
  if (raw === 'seeker' || raw === 'giver') return raw
  return null
}

export function Account() {
  const session = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleFromUrl = parseRole(searchParams.get('role'))
  const tabFromUrl = searchParams.get('tab') === 'signup' ? 'signup' : 'login'

  const [authTab, setAuthTab] = useState<AuthTab>(tabFromUrl)
  const [role, setRole] = useState<UserRole | null>(roleFromUrl)
  const [authStep, setAuthStep] = useState<'choose' | 'form'>('choose')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const myProfiles = session ? getMyProfiles() : []

  useEffect(() => {
    if (roleFromUrl) setRole(roleFromUrl)
  }, [roleFromUrl])

  useEffect(() => {
    setAuthTab(tabFromUrl)
  }, [tabFromUrl])

  useEffect(() => {
    // Only show the login/signup form after Continue (step=form).
    // Links like ?role=seeker&tab=login used to skip the welcome + pictures.
    if (searchParams.get('step') === 'form' && (roleFromUrl || role)) {
      setAuthStep('form')
    } else {
      setAuthStep('choose')
    }
  }, [searchParams, roleFromUrl, role])

  function replaceParams(nextParams: URLSearchParams) {
    const query = nextParams.toString()
    router.replace(query ? `/account?${query}` : '/account')
  }

  function setTab(next: AuthTab) {
    setAuthTab(next)
    setError('')
    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.set('tab', next)
    if (role) nextParams.set('role', role)
    else if (roleFromUrl) nextParams.set('role', roleFromUrl)
    replaceParams(nextParams)
  }

  async function onLogin(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!role) {
      setError('Please choose one option above.')
      return
    }
    if (phone.replace(/\D/g, '').length !== 10) {
      setError('Enter a valid 10-digit mobile number.')
      return
    }
    setBusy(true)
    try {
      const result = await loginWithPhoneAsync(phone, role)
      if (!result.ok) {
        setError(result.message)
        return
      }
      setPhone('')
      router.push(role === 'seeker' ? '/offer' : '/find')
    } finally {
      setBusy(false)
    }
  }

  async function onSignup(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!role) {
      setError('Please choose who you are first.')
      setAuthStep('choose')
      return
    }
    if (!gender) {
      setError('Please select Male or Female.')
      return
    }
    setBusy(true)
    try {
      const result = await registerWithPhoneAsync({
        name,
        phone,
        gender,
        role,
      })
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.push(role === 'seeker' ? '/offer' : '/find')
    } finally {
      setBusy(false)
    }
  }

  function chooseRole(next: UserRole) {
    setRole(next)
    setError('')
    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.set('role', next)
    nextParams.delete('step')
    nextParams.set('tab', authTab)
    replaceParams(nextParams)
  }

  function goToForm(tab: AuthTab) {
    if (!role) {
      setError('Please choose one option above.')
      return
    }
    setError('')
    setAuthTab(tab)
    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.set('tab', tab)
    nextParams.set('role', role)
    nextParams.set('step', 'form')
    replaceParams(nextParams)
    setAuthStep('form')
  }

  function goBackToChoose() {
    setError('')
    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.delete('step')
    replaceParams(nextParams)
    setAuthStep('choose')
  }

  if (!session) {
    return (
      <div className="page page--auth">
        {authStep === 'form' && <Header />}
        <section className={`auth-card${authStep === 'choose' ? ' auth-card--welcome' : ''}`}>
          {authStep === 'choose' ? (
            <>
              <div className="auth-welcome__top">
                <div className="auth-logo" aria-hidden="true">
                  <BrandLogo size={56} />
                </div>
                <h1 className="auth-welcome__title">
                  Welcome to{' '}
                  <span className="auth-card__brand">
                    Swayam <em>Nirman</em>
                  </span>
                </h1>
                <p className="auth-welcome__tag">
                  A helping platform for everyone.
                  <br />
                  Share your skills. Get the help you need.
                </p>
              </div>

              <div className="auth-welcome__middle">
                <div className="auth-who">
                  <h2 className="auth-who__title">Who are you?</h2>
                  <p className="auth-who__hint">Please choose one 👇</p>
                </div>

                <div
                  className="auth-pick"
                  role="radiogroup"
                  aria-label="Who are you?"
                >
                <button
                  type="button"
                  role="radio"
                  aria-checked={role === 'seeker'}
                  className={`auth-pick__card auth-pick__card--skill${role === 'seeker' ? ' auth-pick__card--on' : ''}`}
                  onClick={() => chooseRole('seeker')}
                >
                  <img
                    className="auth-pick__avatar"
                    src="/images/auth-skill-avatar.png"
                    alt=""
                    width={64}
                    height={64}
                  />
                  <strong className="auth-pick__name">I have a skill</strong>
                  <span className="auth-pick__desc">
                    I want to help others with my skills
                  </span>
                  <span className="auth-pick__select">
                    <span className="auth-pick__radio" aria-hidden="true">
                      {role === 'seeker' ? '✓' : ''}
                    </span>
                    Select this
                  </span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={role === 'giver'}
                  className={`auth-pick__card auth-pick__card--help${role === 'giver' ? ' auth-pick__card--on' : ''}`}
                  onClick={() => chooseRole('giver')}
                >
                  <img
                    className="auth-pick__avatar"
                    src="/images/auth-help-avatar.png"
                    alt=""
                    width={64}
                    height={64}
                  />
                  <strong className="auth-pick__name">I need help</strong>
                  <span className="auth-pick__desc">
                    I need support or help from someone
                  </span>
                  <span className="auth-pick__select">
                    <span className="auth-pick__radio" aria-hidden="true">
                      {role === 'giver' ? '✓' : ''}
                    </span>
                    Select this
                  </span>
                </button>
                </div>

                {error && authStep === 'choose' && (
                  <p className="request-status request-status--declined auth-choose-error">
                    {error}
                  </p>
                )}
              </div>

              <div className="auth-welcome__bottom">
                <form className="auth-welcome-form" onSubmit={onLogin}>
                <label className="auth-field auth-field--welcome">
                  <span className="auth-field__label">Mobile number</span>
                  <span className="auth-field__box">
                    <svg
                      className="auth-field__icon"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <rect
                        x="7"
                        y="2"
                        width="10"
                        height="20"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M11 18h2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <input
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                      }
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile"
                      required
                      autoComplete="tel"
                    />
                  </span>
                </label>

                <button
                  type="submit"
                  className={`auth-continue${!role ? ' auth-continue--muted' : ''}`}
                  disabled={busy}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M11 5L6 9H3v6h3l5 4V5z"
                      fill="currentColor"
                    />
                    <path
                      d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>{busy ? 'Logging in…' : 'Continue to Login'}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </form>

              <p className="auth-form__foot">
                New here?{' '}
                <button
                  type="button"
                  className="text-link-btn"
                  onClick={() => goToForm('signup')}
                >
                  Create an account
                </button>
              </p>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                className="auth-back"
                onClick={goBackToChoose}
              >
                ← Back
              </button>

              <h1 className="auth-signup__title">Create an account</h1>
              <p className="auth-signup__lead">
                As{' '}
                <strong>
                  {role === 'seeker' ? 'I have a skill' : 'I need help'}
                </strong>
              </p>

              <form className="auth-form auth-form--signup" onSubmit={onSignup}>
                <label className="auth-field">
                  <span className="auth-field__label">Full name</span>
                  <span className="auth-field__box">
                    <svg
                      className="auth-field__icon"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
                      <path
                        d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Your full name"
                      autoComplete="name"
                    />
                  </span>
                </label>
                <div className="auth-form__gender">
                  <GenderTabs value={gender} onChange={setGender} />
                </div>
                <label className="auth-field">
                  <span className="auth-field__label">Mobile number</span>
                  <span className="auth-field__box">
                    <svg
                      className="auth-field__icon"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <rect
                        x="7"
                        y="2"
                        width="10"
                        height="20"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M11 18h2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <input
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                      }
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile"
                      required
                      autoComplete="tel"
                    />
                  </span>
                </label>
                {error && (
                  <p className="request-status request-status--declined">{error}</p>
                )}
                <button type="submit" className="auth-form__submit" disabled={busy}>
                  {busy ? 'Creating account…' : 'SIGN UP'}
                </button>
                <p className="auth-form__foot">
                  Already have account?{' '}
                  <button
                    type="button"
                    className="text-link-btn"
                    onClick={goBackToChoose}
                  >
                    Log in
                  </button>
                </p>
              </form>
            </>
          )}
        </section>
      </div>
    )
  }

  return (
    <div className="page">
      <Header />
      <section className="section section--top account-page">
        <div className="account-head">
          <div className="account-head__actions">
            {session.activeRole === 'seeker' ? (
              <Link className="btn btn--soft" href="/offer">
                Add skill
              </Link>
            ) : (
              <Link className="btn btn--soft" href="/find">
                Find help
              </Link>
            )}
          </div>
        </div>

        {session.activeRole === 'seeker' && (
          <>
            <div className="results">
              <h2>
                {myProfiles.length === 0
                  ? 'No skills listed yet'
                  : `Your skills (${myProfiles.length})`}
              </h2>
              {myProfiles.length === 0 ? (
                <p>
                  Add a skill to earn — tap <Link href="/offer">Add skill</Link>.
                </p>
              ) : (
                <ul className="profile-list account-skills-list">
                  {myProfiles.map((p) => {
                    const skill = getSkillById(p.skillId)
                    return (
                      <li key={p.id} className="profile-card">
                        <div className="profile-card__top">
                          <div className="account-skill">
                            {skill && (
                              <span
                                className="account-skill__icon"
                                style={{ background: skill.color }}
                              >
                                <SkillGlyph skillId={skill.id} size={31} />
                              </span>
                            )}
                            <strong>{skill?.name || p.skillId}</strong>
                          </div>
                          <span className="pin-badge">{p.pinCode}</span>
                        </div>
                        <p className="profile-card__meta">
                          {p.city} · {p.address}
                        </p>
                        {(p.education || p.experience) && (
                          <p className="profile-card__edu">
                            {[p.education, p.experience]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        )}
                        {formatRates(p) && (
                          <p className="profile-card__rate">{formatRates(p)}</p>
                        )}
                        <div className="chip-row chip-row--readonly">
                          {p.availability.map((a) => (
                            <span key={a} className="chip chip--tag">
                              {availabilityLabels[a]}
                              {p.rates[a] ? ` · ${p.rates[a]}` : ''}
                            </span>
                          ))}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </>
        )}

        {session.activeRole === 'giver' && (
          <div className="results">
            <h2>I need help — tools</h2>
            <p className="section__lead">
              Search for skills near you and track requests you sent.
            </p>
            <div className="account-head__actions">
              <Link className="btn btn--soft" href="/find">
                Find help
              </Link>
              <Link className="btn btn--ghost" href="/my-requests">
                My requests
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
