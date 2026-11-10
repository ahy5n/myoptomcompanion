import { Suspense } from 'react'
import { StationPractice } from '@/components/practical/StationPractice'
import { getChecklists } from '@/lib/content'

export const metadata = { title: 'Practical stations' }

export default function PracticalPage() {
  return (
    <Suspense>
      <StationPractice stations={getChecklists()} />
    </Suspense>
  )
}
