'use client'

import { useEffect, useId, useRef, useState } from 'react'

type Props = {
  id?: string
  value: string
  onChange: (value: string) => void
  options: readonly string[]
  placeholder?: string
}

export function FormSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select…',
}: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className={`form-select${open ? ' form-select--open' : ''}`}
    >
      <button
        type="button"
        id={id}
        className="form-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={value ? undefined : 'form-select__placeholder'}>
          {value || placeholder}
        </span>
        <span className="form-select__chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <ul id={listId} className="form-select__list" role="listbox">
          <li>
            <button
              type="button"
              role="option"
              aria-selected={!value}
              className={`form-select__option${!value ? ' form-select__option--on' : ''}`}
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              {placeholder}
            </button>
          </li>
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={value === option}
                className={`form-select__option${value === option ? ' form-select__option--on' : ''}`}
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
