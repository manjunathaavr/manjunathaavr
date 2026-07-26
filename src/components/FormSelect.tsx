'use client'

import { useEffect, useId, useRef, useState } from 'react'

type Props = {
  id?: string
  value: string
  onChange: (value: string) => void
  options: readonly string[]
  placeholder?: string
  className?: string
}

export function FormSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className,
}: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div
      ref={rootRef}
      className={`form-select${open ? ' form-select--open' : ''}${className ? ` ${className}` : ''}`}
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
        <ul id={listId} className="form-select__menu" role="listbox">
          <li
            role="option"
            aria-selected={!value}
            className={`form-select__option form-select__option--placeholder${!value ? ' form-select__option--on' : ''}`}
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
          >
            {placeholder}
          </li>
          {options.map((option) => (
            <li
              key={option}
              role="option"
              aria-selected={value === option}
              className={`form-select__option${value === option ? ' form-select__option--on' : ''}`}
              onClick={() => {
                onChange(option)
                setOpen(false)
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
