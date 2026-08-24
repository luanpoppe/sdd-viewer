import { useCallback, useEffect, useState } from 'react'
import type { Workspace } from '@shared/types'

export function useWorkspaces(): {
  workspaces: Workspace[]
  addWorkspace: () => Promise<void>
  removeWorkspace: (id: string) => Promise<void>
} {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])

  useEffect(() => {
    window.sdd.listWorkspaces().then(setWorkspaces)
  }, [])

  const addWorkspace = useCallback(async () => {
    const workspace = await window.sdd.addWorkspace()
    if (!workspace) return
    setWorkspaces((current) => [...current, workspace])
  }, [])

  const removeWorkspace = useCallback(async (id: string) => {
    await window.sdd.removeWorkspace(id)
    setWorkspaces((current) => current.filter((w) => w.id !== id))
  }, [])

  return { workspaces, addWorkspace, removeWorkspace }
}
