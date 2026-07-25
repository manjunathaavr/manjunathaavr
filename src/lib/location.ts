export type PlaceAddress = {
  address: string
  city: string
  /** Neighbourhood / suburb — best for “From Ameerpet, Hyderabad” */
  locality?: string
  pinCode: string
  latitude: number
  longitude: number
}

type GeocodeDraft = {
  road: string
  locality: string
  city: string
  district: string
  state: string
  pinCode: string
}

type PostOfficeRow = {
  Name?: string
  District?: string
  State?: string
  Block?: string
  Region?: string
  BranchType?: string
  DeliveryStatus?: string
  Pincode?: string
}

type PostalPinResponse = Array<{
  Status?: string
  Message?: string
  PostOffice?: PostOfficeRow[] | null
}>

const GPS_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
}

/** Max acceptable GPS error (metres). Above this = network/Wi‑Fi guess, not real GPS. */
const MAX_GPS_ACCURACY_M = 2000

const FETCH_TIMEOUT_MS = 5000

function getCurrentPosition(options: PositionOptions = GPS_OPTIONS): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location is not supported on this device.'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}

function watchForBetterFix(
  initial: GeolocationPosition,
  maxWaitMs = 8000,
): Promise<GeolocationPosition> {
  return new Promise((resolve) => {
    let best = initial
    const started = Date.now()

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (pos.coords.accuracy < best.coords.accuracy) best = pos
        if (
          pos.coords.accuracy <= 500 ||
          Date.now() - started >= maxWaitMs
        ) {
          navigator.geolocation.clearWatch(watchId)
          resolve(best)
        }
      },
      () => {
        navigator.geolocation.clearWatch(watchId)
        resolve(best)
      },
      GPS_OPTIONS,
    )

    window.setTimeout(() => {
      navigator.geolocation.clearWatch(watchId)
      resolve(best)
    }, maxWaitMs)
  })
}

/** Fresh GPS only — never reuse cached/network guesses from another city. */
function watchUntilFix(maxWaitMs = 12000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    let best: GeolocationPosition | null = null

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!best || pos.coords.accuracy < best.coords.accuracy) best = pos
        if (pos.coords.accuracy <= 500) {
          navigator.geolocation.clearWatch(watchId)
          resolve(pos)
        }
      },
      (err) => {
        navigator.geolocation.clearWatch(watchId)
        if (best) resolve(best)
        else reject(err)
      },
      GPS_OPTIONS,
    )

    window.setTimeout(() => {
      navigator.geolocation.clearWatch(watchId)
      if (best) resolve(best)
      else {
        reject(
          new Error(
            'Location request timed out. Move outdoors, turn on GPS, and try again.',
          ),
        )
      }
    }, maxWaitMs)
  })
}

async function getFastPosition(): Promise<GeolocationPosition> {
  let pos: GeolocationPosition
  try {
    pos = await getCurrentPosition()
  } catch (err) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? (err as GeolocationPositionError).code
        : undefined
    if (code === 1) throw err
    pos = await watchUntilFix()
  }

  if (pos.coords.accuracy > MAX_GPS_ACCURACY_M) {
    pos = await watchForBetterFix(pos)
  }

  if (pos.coords.accuracy > MAX_GPS_ACCURACY_M) {
    throw new Error(
      'Could not get a precise GPS fix. On a phone, turn on GPS and try outdoors. Or enter your 6-digit pin code below.',
    )
  }

  return pos
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => window.setTimeout(() => resolve(null), ms)),
  ])
}

function normalizePlaceKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function extractPin(value: string): string {
  return String(value || '')
    .replace(/\D/g, '')
    .slice(0, 6)
}

function placeNamesMatch(a: string, b: string): boolean {
  const left = normalizePlaceKey(a)
  const right = normalizePlaceKey(b)
  if (!left || !right) return false
  return left === right || left.includes(right) || right.includes(left)
}

async function fetchIndiaPost(path: string): Promise<PostalPinResponse | null> {
  const res = await withTimeout(
    fetch(`https://api.postalpincode.in${path}`),
    FETCH_TIMEOUT_MS,
  )
  if (!res || !res.ok) return null
  return (await res.json()) as PostalPinResponse
}

export async function lookupPinDetails(
  pinCode: string,
): Promise<PostOfficeRow[] | null> {
  const pin = extractPin(pinCode)
  if (!/^\d{6}$/.test(pin)) return null

  const data = await fetchIndiaPost(`/pincode/${pin}`)
  const row = data?.[0]
  if (!row || row.Status !== 'Success' || !row.PostOffice?.length) return null
  return row.PostOffice
}

async function lookupPostOfficeByName(
  name: string,
): Promise<{ pinCode: string; office: PostOfficeRow } | null> {
  const query = name.trim()
  if (query.length < 3) return null

  const data = await fetchIndiaPost(`/postoffice/${encodeURIComponent(query)}`)
  const row = data?.[0]
  if (!row || row.Status !== 'Success' || !row.PostOffice?.length) return null

  const office =
    row.PostOffice.find((item) => item.BranchType?.includes('Head Post Office')) ||
    row.PostOffice.find((item) => item.DeliveryStatus === 'Delivery') ||
    row.PostOffice[0]

  const pinCode = extractPin(office.Pincode || '')
  if (!/^\d{6}$/.test(pinCode)) return null
  return { pinCode, office }
}

function pickPrimaryOffice(offices: PostOfficeRow[]): PostOfficeRow {
  return (
    offices.find((item) => item.BranchType?.includes('Head Post Office')) ||
    offices.find((item) => item.DeliveryStatus === 'Delivery') ||
    offices[0]
  )
}

/** India Post pin → city (District). Returns null if not found. */
export async function lookupCityFromPin(
  pinCode: string,
): Promise<{ city: string; area: string } | null> {
  const offices = await lookupPinDetails(pinCode)
  if (!offices?.length) return null

  const office = pickPrimaryOffice(offices)
  const city = office.District || office.Block || office.Region || ''
  const area = office.Name || ''
  if (!city) return null
  return { city, area }
}

type BigDataCloudResponse = {
  city?: string
  locality?: string
  principalSubdivision?: string
  postcode?: string
  localityInfo?: {
    administrative?: Array<{ name?: string; adminLevel?: number }>
  }
}

async function reverseGeocodeBigDataCloud(
  lat: number,
  lon: number,
): Promise<GeocodeDraft | null> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(String(lat))}&longitude=${encodeURIComponent(String(lon))}&localityLanguage=en`
  const res = await withTimeout(fetch(url), FETCH_TIMEOUT_MS)
  if (!res || !res.ok) return null

  const data = (await res.json()) as BigDataCloudResponse
  if (!data.city && !data.locality && !data.postcode) return null

  const district =
    data.localityInfo?.administrative?.find((item) => item.adminLevel === 5)?.name ||
    data.localityInfo?.administrative?.find((item) => item.adminLevel === 6)?.name ||
    data.city ||
    ''

  return {
    road: '',
    locality: data.locality || data.city || '',
    city: data.city || district,
    district,
    state: data.principalSubdivision || '',
    pinCode: extractPin(data.postcode || ''),
  }
}

async function reverseGeocodeNominatim(
  lat: number,
  lon: number,
): Promise<GeocodeDraft | null> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lon))
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('zoom', '18')
  url.searchParams.set('countrycodes', 'in')
  url.searchParams.set('accept-language', 'en')

  const res = await withTimeout(
    fetch(url.toString(), { headers: { Accept: 'application/json' } }),
    FETCH_TIMEOUT_MS,
  )
  if (!res || !res.ok) return null

  const data = (await res.json()) as {
    display_name?: string
    address?: Record<string, string>
  }
  const a = data.address || {}

  const locality = a.neighbourhood || a.suburb || a.locality || a.quarter || ''
  const city = a.city || a.town || a.village || a.municipality || ''
  const district = a.state_district || a.county || city || ''

  return {
    road: [a.house_number, a.road || a.pedestrian || a.residential || a.footway]
      .filter(Boolean)
      .join(' '),
    locality: locality || city,
    city: city || district,
    district,
    state: a.state || '',
    pinCode: extractPin(a.postcode || ''),
  }
}

async function collectGeocodeDraft(lat: number, lon: number): Promise<GeocodeDraft | null> {
  const [primary, secondary] = await Promise.all([
    reverseGeocodeBigDataCloud(lat, lon),
    withTimeout(reverseGeocodeNominatim(lat, lon), 3500),
  ])

  if (primary && secondary) {
    return {
      ...primary,
      road: secondary.road || primary.road,
      pinCode: primary.pinCode || secondary.pinCode,
      locality: primary.locality || secondary.locality,
      city: primary.city || secondary.city,
      district: primary.district || secondary.district,
      state: primary.state || secondary.state,
    }
  }

  return primary || secondary
}

async function resolveIndianPlace(
  draft: GeocodeDraft,
): Promise<{ pinCode: string; city: string; area: string; road: string } | null> {
  const districtHint = draft.district || draft.city
  const placeNames = uniquePlaceNames([draft.locality, draft.city, draft.district])

  const matches = await Promise.all(
    placeNames.slice(0, 4).map((name) => lookupPostOfficeByName(name)),
  )
  const match = matches.find(Boolean)
  if (match) {
    const district = match.office.District || match.office.Block || districtHint
    return {
      pinCode: match.pinCode,
      city: district,
      area: match.office.Name || placeNames[0] || '',
      road: draft.road,
    }
  }

  const pin = extractPin(draft.pinCode)
  if (!/^\d{6}$/.test(pin)) return null

  const offices = await lookupPinDetails(pin)
  if (!offices?.length) return null

  const office = pickPrimaryOffice(offices)
  return {
    pinCode: pin,
    city: office.District || office.Block || districtHint,
    area: office.Name || draft.locality || draft.city,
    road: draft.road,
  }
}

function uniquePlaceNames(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    const trimmed = value.trim()
    const key = normalizePlaceKey(trimmed)
    if (trimmed.length >= 3 && key && !seen.has(key)) {
      seen.add(key)
      out.push(trimmed)
    }
  }
  return out
}

function buildAddress(parts: {
  road: string
  area: string
  city: string
  state: string
  latitude: number
  longitude: number
}): string {
  const segments = [parts.road, parts.area, parts.city, parts.state].filter(Boolean)
  if (segments.length > 0) return segments.join(', ')
  return formatCoords(parts.latitude, parts.longitude)
}

export async function lookupAddressAt(
  latitude: number,
  longitude: number,
): Promise<PlaceAddress> {
  const draft = await collectGeocodeDraft(latitude, longitude)
  if (!draft) {
    throw new Error('Could not look up this location. Try again or enter address manually.')
  }

  const resolved = await resolveIndianPlace(draft)
  if (resolved) {
    return {
      address: buildAddress({
        road: resolved.road,
        area: resolved.area,
        city: resolved.city,
        state: draft.state,
        latitude,
        longitude,
      }),
      city: resolved.city,
      locality: resolved.area || undefined,
      pinCode: resolved.pinCode,
      latitude,
      longitude,
    }
  }

  return {
    address: buildAddress({
      road: draft.road,
      area: draft.locality,
      city: draft.city || draft.district,
      state: draft.state,
      latitude,
      longitude,
    }),
    city: draft.city || draft.district,
    locality: draft.locality || undefined,
    pinCode: draft.pinCode,
    latitude,
    longitude,
  }
}

export async function pickAddressFromCurrentLocation(): Promise<PlaceAddress> {
  const pos = await getFastPosition()
  return lookupAddressAt(pos.coords.latitude, pos.coords.longitude)
}

/** Capture coordinates only (no address lookup). */
export async function captureCoordinates(): Promise<{
  latitude: number
  longitude: number
} | null> {
  try {
    const pos = await getFastPosition()
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    }
  } catch {
    return null
  }
}

/** Great-circle distance in km (for nearby profile sorting). */
export function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function mapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`
}

export function formatCoords(latitude: number, longitude: number): string {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
}

export function locationErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as GeolocationPositionError).code
    if (code === 1) return 'Please allow location access to fill your address.'
    if (code === 2)
      return 'Location unavailable. Check GPS / network and try again.'
    if (code === 3)
      return 'Location request timed out. Move outdoors, turn on GPS, and try again.'
  }
  if (err instanceof Error && err.message) return err.message
  return 'Could not get your current location.'
}
