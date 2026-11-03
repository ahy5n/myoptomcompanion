import { SlidesLibrary } from '@/components/slides/SlidesLibrary'
import { getModuleOptions } from '@/lib/moduleOptions'

export const metadata = { title: 'Slides & materials' }

export default function SlidesPage() {
  return <SlidesLibrary modules={getModuleOptions()} />
}
