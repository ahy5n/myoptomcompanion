import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ModuleView } from '@/components/module/ModuleView'
import { getModule, getModules, getPracticeItems, getVerifyNote } from '@/lib/content'

export const dynamicParams = false

export function generateStaticParams() {
  return getModules().map((m) => ({ code: m.code }))
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params
  const m = getModule(code)
  return { title: m ? `${m.code} · ${m.name}` : 'Module' }
}

export default async function ModulePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const m = getModule(code)
  if (!m) notFound()
  const colours = Object.fromEntries(getModules().map((x) => [x.code, x.colour]))
  return (
    <ModuleView
      module={m}
      colours={colours}
      verifyNote={getVerifyNote(m.code)}
      questionCount={getPracticeItems(m.code).filter((i) => i.kind === 'mcq').length}
    />
  )
}
