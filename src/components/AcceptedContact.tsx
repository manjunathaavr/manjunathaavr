import { formatCoords, mapsUrl } from '../lib/location'

export function AcceptedContact({
  phone,
  latitude,
  longitude,
  lead = 'Accepted — you can call now',
}: {
  phone: string
  latitude?: number
  longitude?: number
  lead?: string
}) {
  const hasMap =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)

  return (
    <div className="request-result">
      <p className="request-result__ok">{lead}</p>
      <div className="accepted-contact">
        <a
          className="btn btn--primary btn--small"
          href={`tel:${phone.replace(/\s/g, '')}`}
        >
          Call {phone}
        </a>
        {hasMap && (
          <a
            className="btn btn--ghost btn--small"
            href={mapsUrl(latitude, longitude)}
            target="_blank"
            rel="noopener noreferrer"
            title={formatCoords(latitude, longitude)}
          >
            Open map
          </a>
        )}
      </div>
      {hasMap && (
        <p className="accepted-contact__coords">
          Location: {formatCoords(latitude, longitude)}
        </p>
      )}
    </div>
  )
}
