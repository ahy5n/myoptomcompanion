import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ModuleQuizSection } from '@/components/practice/ModuleQuizSection'
import { getModule, getModules, getModuleTopics } from '@/lib/content'

export const dynamicParams = false

export function generateStaticParams() {
  return getModules()
    .filter((m) => m.hasContent)
    .map((m) => ({ code: m.code }))
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params
  return { title: `${code} quiz` }
}

/** A module's Quiz section: every topic's quiz in rounds, kept apart from the reading pages. */
export default async function ModuleQuiz({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const m = getModule(code)
  if (!m || !m.hasContent) notFound()
  const all = getModuleTopics(code)
  const mixedCount = all.reduce((n, t) => n + t.mcq.length + t.cases.length, 0)
  const topics = all
    .map((t) => ({ id: t.id, title: t.title, count: Math.min(t.mcq.length + t.cases.length, 50) }))
    .filter((t) => t.count > 0)
  return <ModuleQuizSection code={m.code} name={m.name} topics={topics} mixedCount={mixedCount} />
}
