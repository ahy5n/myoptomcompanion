'use client'

import { useModuleName } from './AppProvider'

/** A subject's name for server-rendered pages, honouring the student's rename. */
export function ModuleName({ code, name }: { code: string; name: string }) {
  return <>{useModuleName()(code, name)}</>
}
