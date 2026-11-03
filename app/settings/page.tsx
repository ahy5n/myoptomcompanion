import { Settings } from '@/components/settings/Settings'
import { getModules } from '@/lib/content'

export const metadata = { title: 'Settings' }

export default function SettingsPage() {
  return <Settings modules={getModules().map((m) => ({ code: m.code, name: m.name }))} />
}
