import { Suspense } from 'react'
import { EnglandPlacementsView } from '@/components/placements/EnglandPlacementsView'
import { getEnglandPlacements } from '@/lib/placementsEngland'

export const metadata = { title: 'Work experience' }

export default function PlacementsPage() {
  return (
    <Suspense>
      <EnglandPlacementsView data={getEnglandPlacements()} />
    </Suspense>
  )
}
