'use client'

import { useEffect, useRef, useState } from 'react'
import type { EnglandCity, EnglandPlace } from '@/lib/placementsEngland'

// Leaflet, loaded on demand from cdnjs so it only costs anything on this page.
const LEAFLET = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4'

/* eslint-disable @typescript-eslint/no-explicit-any */
type L = any

function loadLeaflet(): Promise<L> {
  const w = window as unknown as { L?: L; __leaflet?: Promise<L> }
  if (w.L) return Promise.resolve(w.L)
  if (w.__leaflet) return w.__leaflet
  w.__leaflet = new Promise((resolve, reject) => {
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = `${LEAFLET}/leaflet.min.css`
    document.head.appendChild(css)
    const s = document.createElement('script')
    s.src = `${LEAFLET}/leaflet.min.js`
    s.onload = () => resolve(w.L)
    s.onerror = () => reject(new Error('map failed to load'))
    document.head.appendChild(s)
  })
  return w.__leaflet
}

/** Whether the page is showing its dark palette, so the map tiles can match. */
function isDark() {
  const mode = document.documentElement.dataset.mode
  return mode === 'dark' || (!mode && matchMedia('(prefers-color-scheme: dark)').matches)
}

const ENGLAND: [[number, number], [number, number]] = [
  [49.9, -5.8],
  [55.85, 1.8],
]

export function PlacementsMap({
  cities,
  places,
  city,
  counts,
  onPickCity,
  onPickPlace,
}: {
  cities: EnglandCity[]
  places: EnglandPlace[]
  city: EnglandCity | null
  /** Places per city, shown on the city dots. */
  counts: Record<string, number>
  onPickCity: (id: string) => void
  onPickPlace: (id: string) => void
}) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L>(null)
  const layer = useRef<L>(null)
  const [failed, setFailed] = useState(false)
  const handlers = useRef({ onPickCity, onPickPlace })
  handlers.current = { onPickCity, onPickPlace }

  // Create the map once.
  useEffect(() => {
    let alive = true
    loadLeaflet()
      .then((Lf) => {
        if (!alive || !el.current || map.current) return
        const m = Lf.map(el.current, { zoomControl: true, scrollWheelZoom: false, attributionControl: true })
        m.fitBounds(ENGLAND)
        // OpenStreetMap's standard tiles; dark themes dim them with a CSS filter (.pm-dark).
        Lf.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(m)
        el.current.classList.toggle('pm-dark', isDark())
        layer.current = Lf.layerGroup().addTo(m)
        map.current = m
        // Wheel-zoom only after a click, so the page still scrolls past the map.
        m.on('click', () => m.scrollWheelZoom.enable())
        m.on('mouseout', () => m.scrollWheelZoom.disable())
        draw()
      })
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
      map.current?.remove()
      map.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function draw() {
    const Lf = (window as unknown as { L?: L }).L
    const m = map.current
    if (!Lf || !m || !layer.current) return
    layer.current.clearLayers()
    if (!city) {
      for (const c of cities) {
        const n = counts[c.id] ?? 0
        const icon = Lf.divIcon({ className: '', html: `<span class="pm-city">${n}</span>`, iconSize: [30, 30], iconAnchor: [15, 15] })
        Lf.marker([c.lat, c.lng], { icon, title: c.name, keyboard: true })
          .bindTooltip(c.name, { direction: 'top', offset: [0, -14] })
          .on('click', () => handlers.current.onPickCity(c.id))
          .addTo(layer.current)
      }
      m.flyToBounds(ENGLAND, { duration: 0.6 })
      return
    }
    const pts: [number, number][] = [[city.lat, city.lng]]
    for (const p of places) {
      const icon = Lf.divIcon({ className: '', html: `<span class="pm-place pm-${p.kind}"></span>`, iconSize: [18, 18], iconAnchor: [9, 9] })
      Lf.marker([p.lat, p.lng], { icon, title: p.name, keyboard: true })
        .bindTooltip(p.name, { direction: 'top', offset: [0, -8] })
        .on('click', () => handlers.current.onPickPlace(p.id))
        .addTo(layer.current)
      pts.push([p.lat, p.lng])
    }
    if (pts.length > 1) m.flyToBounds(Lf.latLngBounds(pts).pad(0.25), { duration: 0.6, maxZoom: 12 })
    else m.flyTo([city.lat, city.lng], 11, { duration: 0.6 })
  }

  // Redraw when the city or its places change.
  useEffect(draw, [city, places, cities, counts]) // eslint-disable-line react-hooks/exhaustive-deps

  if (failed) {
    return <div className="grid h-full place-items-center p-6 text-center text-[14px] text-muted">The map couldn’t load. Pick a city from the list instead.</div>
  }
  return <div ref={el} className="h-full w-full" role="region" aria-label="Map of placement contacts" />
}
