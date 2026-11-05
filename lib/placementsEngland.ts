// Work-experience contacts across England (data/placements-england.json):
// hospital eye departments and surgical/community eye clinics, by city.
import fs from 'node:fs'
import path from 'node:path'

export interface EnglandPlace {
  id: string
  city: string
  kind: 'hospital' | 'surgical'
  name: string
  org: string
  address: string
  lat: number
  lng: number
  phones: { number: string; note?: string }[]
  emails: { address: string; label?: string }[]
  web: string | null
  workExperience: string | null
  tip: string | null
}

export interface EnglandCity {
  id: string
  name: string
  region: string
  lat: number
  lng: number
  places: string[]
  /** For cities without their own hospital eye department. */
  nearestHospital?: { id: string; city: string; km: number }
}

export interface EnglandPlacements {
  checked: string
  cities: EnglandCity[]
  places: EnglandPlace[]
}

export function getEnglandPlacements(): EnglandPlacements {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'placements-england.json'), 'utf8')) as EnglandPlacements
}
