import type { Gender } from '../lib/storage'
import { genderLabels } from '../lib/storage'

export function GenderTabs({
  value,
  onChange,
  required = true,
  locked = false,
}: {
  value: Gender | ''
  onChange: (g: Gender) => void
  required?: boolean
  locked?: boolean
}) {
  return (
    <div className="gender-field">
      <span className="gender-field__label">
        Gender {required && <span className="req">*</span>}
      </span>
      <div
        className="gender-tabs"
        role="radiogroup"
        aria-label="Gender"
        aria-required={required}
      >
        {(['male', 'female'] as const).map((g) => {
          const selected = value === g
          return (
            <button
              key={g}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`gender-tab gender-tab--${g}${selected ? ' gender-tab--active' : ''}`}
              disabled={locked}
              onClick={() => onChange(g)}
            >
              <span className="gender-tab__tick" aria-hidden="true">
                {selected ? '✓' : ''}
              </span>
              {genderLabels[g]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
