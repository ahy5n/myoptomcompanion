import { TimetableManager } from '@/components/timetable/TimetableManager'
import { getModuleOptions } from '@/lib/moduleOptions'

export const metadata = { title: 'Your timetable' }

export default function TimetablePage() {
  return <TimetableManager modules={getModuleOptions()} />
}
