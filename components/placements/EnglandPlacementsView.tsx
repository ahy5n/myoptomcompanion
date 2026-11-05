'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { fmtDayLong } from '@/lib/dates'
import { km } from '@/lib/geo'
import type { EnglandPlace, EnglandPlacements } from '@/lib/placementsEngland'
import type { PlacementProgress, PlacementStatus } from '@/lib/store'
import { useApp, useData } from '../AppProvider'
import { BackLink } from '../bits'
import { ChevronDown, ExternalIcon } from '../icons'
import { PlacementsMap } from './PlacementsMap'

const STATUSES: { key: PlacementStatus; label: string; pill: string }[] = [
  { key: 'not-contacted', label: 'Not contacted', pill: 'bg-bg text-muted' },
  { key: 'emailed', label: 'Emailed', pill: 'bg-accent-soft text-accent-strong' },
  { key: 'interview', label: 'Interview', pill: 'bg-warn-soft text-warn-ink' },
  { key: 'confirmed', label: 'Confirmed', pill: 'bg-good-soft text-good-ink' },
]
const EMPTY: PlacementProgress = { status: 'not-contacted', interviewDate: null, interviewTime: null }
const NEARBY_KM = 30
const CITY_KEY = 'oc:placements-city'

const HOW_TO = [
  'Say you’re an optometry student, which year you’re in, when you’re free and what you’d like to see (for example a glaucoma clinic, cataract pre-assessment or low vision).',
  'NHS trusts usually route requests through a work experience or volunteering team. Contact that team and ask them to pass your request to the eye department. Expect paperwork (DBS, occupational health, confidentiality).',
  'Surgical and community clinics (SpaMedica, Newmedica, Optegra) employ optometrists for pre- and post-op checks. Call and ask for the clinic or practice manager, then follow up by email.',
  'Ask your university’s placement team too; many clinics already have links with local optometry schools.',
]

export function EnglandPlacementsView({ data }: { data: EnglandPlacements }) {
  const params = useSearchParams()
  const router = useRouter()
  const { placements } = useData()
  const [cityId, setCityId] = useState<string | null>(params.get('city'))
  const [mine, setMine] = useState(false)

  const byId = useMemo(() => new Map(data.places.map((p) => [p.id, p])), [data.places])
  const counts = useMemo(() => Object.fromEntries(data.cities.map((c) => [c.id, c.places.length])), [data.cities])
  const city = data.cities.find((c) => c.id === cityId) ?? null

  // Remember the last city picked on this device.
  useEffect(() => {
    if (cityId) return
    try {
      const saved = localStorage.getItem(CITY_KEY)
      if (saved && data.cities.some((c) => c.id === saved)) setCityId(saved)
    } catch {}
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function pickCity(id: string | null) {
    setCityId(id)
    setMine(false)
    try {
      if (id) localStorage.setItem(CITY_KEY, id)
      else localStorage.removeItem(CITY_KEY)
    } catch {}
    router.replace(id ? `/placements?city=${id}` : '/placements', { scroll: false })
  }

  const progressOf = (id: string) => placements[id] ?? EMPTY
  const tracked = data.places.filter((p) => progressOf(p.id).status !== 'not-contacted')

  // This city's own places, then others within reach.
  const own = city ? city.places.map((id) => byId.get(id)!).filter(Boolean) : []
  const nearby = city
    ? data.places
        .filter((p) => !city.places.includes(p.id) && km(city, p) <= NEARBY_KM)
        .sort((a, b) => km(city, a) - km(city, b))
    : []
  const shown = mine ? tracked : [...own, ...nearby]
  const ownSorted = (list: EnglandPlace[]) => [...list].sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'hospital' ? -1 : 1))

  function scrollToPlace(id: string) {
    document.getElementById(`place-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const regions = useMemo(() => {
    const m = new Map<string, typeof data.cities>()
    for (const c of data.cities) m.set(c.region, [...(m.get(c.region) ?? []), c])
    return [...m.entries()]
  }, [data.cities])

  return (
    <div className="mx-auto max-w-[1180px]">
      <BackLink href="/">Home</BackLink>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[32px] font-semibold">Work experience across England</h1>
          <p className="mt-1 max-w-2xl text-muted">
            Hospital eye departments and NHS surgical eye clinics in every city in England, with how to get in touch. Contact details checked {data.checked} from
            each organisation’s own site. Confirm before you send anything.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="card overflow-hidden lg:sticky lg:top-24 lg:self-start">
          <div className="h-[340px] sm:h-[460px] lg:h-[calc(100dvh-200px)] lg:max-h-[720px]">
            <PlacementsMap
              cities={data.cities}
              places={mine ? tracked : shown}
              city={mine ? null : city}
              counts={counts}
              onPickCity={pickCity}
              onPickPlace={scrollToPlace}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-2.5 text-[12.5px] text-muted">
            {city && !mine ? (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="pm-place pm-hospital" aria-hidden /> Hospital eye department
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="pm-place pm-surgical" aria-hidden /> Surgical or community clinic
                </span>
              </>
            ) : (
              <span>Tap a city to see its contacts. Numbers show how many places are listed there.</span>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <div className="card p-4">
            <label htmlFor="city-pick" className="text-[14px] font-semibold">
              City
            </label>
            <div className="mt-1.5 flex gap-2">
              <select
                id="city-pick"
                className="field"
                value={cityId ?? ''}
                onChange={(e) => pickCity(e.target.value || null)}
              >
                <option value="">Choose a city…</option>
                {regions.map(([region, cs]) => (
                  <optgroup key={region} label={region}>
                    {cs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.places.length})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {city && (
                <button className="btn btn-quiet shrink-0" onClick={() => pickCity(null)}>
                  All
                </button>
              )}
            </div>
            <button
              className={`mt-3 flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-[14px] font-semibold ${
                mine ? 'bg-accent text-on-accent' : 'bg-bg text-ink hover:bg-accent-soft'
              }`}
              onClick={() => setMine((m) => !m)}
              aria-pressed={mine}
            >
              <span>My contacts</span>
              <span>
                {STATUSES.slice(1)
                  .map((s) => `${tracked.filter((p) => progressOf(p.id).status === s.key).length} ${s.label.toLowerCase()}`)
                  .join(' · ')}
              </span>
            </button>
          </div>

          <details className="card mt-4 p-4">
            <summary className="flex items-center justify-between text-[15px] font-semibold">
              How to ask
              <ChevronDown className="size-4 text-muted" />
            </summary>
            <ul className="mt-3 space-y-2 text-[14.5px] text-muted">
              {HOW_TO.map((t) => (
                <li key={t} className="flex gap-2">
                  <span aria-hidden className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-accent" />
                  {t}
                </li>
              ))}
            </ul>
          </details>

          {mine ? (
            <section className="mt-4" aria-label="My contacts">
              {tracked.length === 0 ? (
                <p className="card p-5 text-[15px] text-muted">Nothing tracked yet. Mark a place as emailed and it shows up here, from any city.</p>
              ) : (
                <ul className="space-y-3">
                  {tracked.map((p) => (
                    <PlaceCard key={p.id} place={p} cityLabel />
                  ))}
                </ul>
              )}
            </section>
          ) : !city ? (
            <p className="card mt-4 p-5 text-[15px] text-muted">
              {data.cities.length} cities and {data.places.length} places. Pick a city on the map or from the list.
            </p>
          ) : (
            <section className="mt-4" aria-label={`Contacts in ${city.name}`}>
              <h2 className="text-[22px] font-semibold">{city.name}</h2>
              {city.nearestHospital && (
                <p className="mt-1 text-[14px] text-muted">
                  {city.name} has no hospital eye department of its own. The nearest listed is in {city.nearestHospital.city} (about {city.nearestHospital.km} km).{' '}
                  <button className="font-semibold text-ink underline-offset-4 hover:underline" onClick={() => pickCity(data.cities.find((c) => c.name === city.nearestHospital!.city)?.id ?? null)}>
                    Show {city.nearestHospital.city}
                  </button>
                </p>
              )}
              {own.length > 0 && (
                <ul className="mt-3 space-y-3">
                  {ownSorted(own).map((p) => (
                    <PlaceCard key={p.id} place={p} />
                  ))}
                </ul>
              )}
              {nearby.length > 0 && (
                <>
                  <h3 className="mt-6 text-[15px] font-semibold text-muted">Also within {NEARBY_KM} km</h3>
                  <ul className="mt-2 space-y-3">
                    {nearby.map((p) => (
                      <PlaceCard key={p.id} place={p} distance={Math.round(km(city, p))} cityLabel />
                    ))}
                  </ul>
                </>
              )}
              {own.length === 0 && nearby.length === 0 && <p className="card mt-3 p-5 text-[15px] text-muted">Nothing listed within {NEARBY_KM} km yet.</p>}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function PlaceCard({ place: p, distance, cityLabel = false }: { place: EnglandPlace; distance?: number; cityLabel?: boolean }) {
  const { setPlacement } = useApp()
  const { placements } = useData()
  const prog = placements[p.id] ?? EMPTY
  const status = STATUSES.find((s) => s.key === prog.status)!

  return (
    <li id={`place-${p.id}`} className="card scroll-mt-24 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 text-[12.5px] font-semibold text-muted">
            <span className={`pm-place pm-${p.kind}`} aria-hidden />
            {p.kind === 'hospital' ? 'Hospital eye department' : 'Surgical / community clinic'}
            {cityLabel && <span className="font-normal">· {p.city}</span>}
            {distance !== undefined && <span className="font-normal">· {distance} km away</span>}
          </p>
          <h3 className="mt-1 text-[16.5px] font-semibold leading-snug">{p.name}</h3>
          <p className="text-[13.5px] text-muted">{p.org}</p>
        </div>
        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[12px] font-semibold ${status.pill}`}>{status.label}</span>
      </div>

      <p className="mt-2 text-[14px]">{p.address}</p>
      {p.tip && <p className="mt-2 text-[14px] text-muted">{p.tip}</p>}

      <div className="mt-3 flex flex-wrap gap-2 text-[13.5px]">
        {p.phones.map((ph) => (
          <a key={ph.number} href={`tel:${ph.number.replace(/ext\..*$/i, '').replace(/[^\d+]/g, '')}`} className="rounded-lg bg-bg px-2.5 py-1.5 font-medium hover:bg-accent-soft" title={ph.note}>
            {ph.number}
            {ph.note && <span className="ml-1.5 font-normal text-muted">{ph.note}</span>}
          </a>
        ))}
        {p.emails.map((e) => (
          <a key={e.address} href={`mailto:${e.address}`} className="rounded-lg bg-bg px-2.5 py-1.5 font-medium break-all hover:bg-accent-soft">
            {e.address}
            {e.label && <span className="ml-1.5 font-normal text-muted">{e.label}</span>}
          </a>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13.5px] font-semibold">
        {p.workExperience && (
          <a href={p.workExperience} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent underline-offset-4 hover:underline">
            Work experience page <ExternalIcon className="size-3.5" />
          </a>
        )}
        {p.web && (
          <a href={p.web} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent underline-offset-4 hover:underline">
            Website <ExternalIcon className="size-3.5" />
          </a>
        )}
      </div>

      <div className="mt-3 border-t border-border pt-3">
        <div role="radiogroup" aria-label={`Status for ${p.name}`} className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {STATUSES.map((s) => (
            <button
              key={s.key}
              role="radio"
              aria-checked={prog.status === s.key}
              onClick={() => setPlacement(p.id, { status: s.key })}
              className={`min-h-9 rounded-lg px-2 text-[13px] font-semibold transition-colors ${
                prog.status === s.key ? 'bg-accent text-on-accent' : 'bg-bg text-muted hover:text-ink'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        {prog.status === 'interview' && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13.5px]">
            <label className="flex items-center gap-2">
              Date
              <input
                type="date"
                className="field min-h-9 w-auto py-1 text-[14px]"
                value={prog.interviewDate ?? ''}
                onChange={(e) => setPlacement(p.id, { interviewDate: e.target.value || null })}
              />
            </label>
            <label className="flex items-center gap-2">
              Time
              <input
                type="time"
                className="field min-h-9 w-auto py-1 text-[14px]"
                value={prog.interviewTime ?? ''}
                onChange={(e) => setPlacement(p.id, { interviewTime: e.target.value || null })}
              />
            </label>
            {prog.interviewDate && <span className="text-muted">{fmtDayLong(prog.interviewDate)}</span>}
          </div>
        )}
      </div>
    </li>
  )
}
