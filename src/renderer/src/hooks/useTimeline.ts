import { useCallback, useEffect, useState } from 'react'
import type { ProjectTimeline } from '@shared/types'

const UNAVAILABLE: ProjectTimeline = { available: false, changes: [] }

/**
 * Timeline do projeto vinda do banco do SDD. `available: false` cobre os dois casos
 * em que não há nada a mostrar — sem banco (o usuário não usa o MCP) e projeto
 * nunca registrado nele — e é o que faz a UI simplesmente não oferecer a aba, em
 * vez de mostrar uma tela vazia.
 */
export function useTimeline(workspaceId: string | null): ProjectTimeline {
  const [timeline, setTimeline] = useState<ProjectTimeline>(UNAVAILABLE)

  const load = useCallback(async (): Promise<ProjectTimeline> => {
    if (!workspaceId) return UNAVAILABLE
    return window.sdd.getTimeline(workspaceId)
  }, [workspaceId])

  useEffect(() => {
    let cancelled = false

    const refresh = (): void => {
      load().then((result) => {
        if (!cancelled) setTimeline(result)
      })
    }

    refresh()
    const unsubscribe = window.sdd.onDbUpdated(refresh)

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [load])

  return timeline
}
