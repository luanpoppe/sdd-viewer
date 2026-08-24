import { useEffect, useState } from 'react'
import type { ProjectTree } from '@shared/types'

export function useProjectTree(workspaceId: string | null): ProjectTree | null {
  const [tree, setTree] = useState<ProjectTree | null>(null)

  useEffect(() => {
    if (!workspaceId) {
      setTree(null)
      return
    }

    let cancelled = false
    window.sdd.getTree(workspaceId).then((result) => {
      if (!cancelled) setTree(result)
    })

    const unsubscribe = window.sdd.onTreeUpdated((updated) => {
      if (updated.workspaceId === workspaceId) setTree(updated)
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [workspaceId])

  return tree
}
