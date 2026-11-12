import type { BlockMeta } from '@/lib/types'

/** "Why" and "Exceptions and limits" notes under a rule. */
export function BlockNotes({ meta, print = false }: { meta: Pick<BlockMeta, 'why' | 'limits'>; print?: boolean }) {
  if (!meta.why && !meta.limits) return null
  return (
    <div className={`mt-2 space-y-1.5 ${print ? 'text-[9.5pt]' : 'text-[15px]'} leading-relaxed`}>
      {meta.why && (
        <p className={print ? '' : 'rounded-xl bg-accent-soft/60 px-3 py-2'}>
          <span className="font-semibold">Why: </span>
          {meta.why}
        </p>
      )}
      {meta.limits && (
        <p className={print ? '' : 'rounded-xl bg-warn-soft px-3 py-2 text-warn-ink'}>
          <span className="font-semibold">Exceptions and limits: </span>
          {meta.limits}
        </p>
      )}
    </div>
  )
}
