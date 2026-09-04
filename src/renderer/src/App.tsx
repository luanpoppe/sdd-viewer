import { useState } from 'react'
import type { ArtifactRef } from '@shared/types'
import { useWorkspaces } from './hooks/useWorkspaces'
import { useProjectTree } from './hooks/useProjectTree'
import { useTimeline } from './hooks/useTimeline'
import { ProjectList } from './components/Sidebar/ProjectList'
import { ChangeTree } from './components/Sidebar/ChangeTree'
import { ContentPane, type SelectedArtifact } from './components/ContentPane/ContentPane'
import { TimelinePane } from './components/Timeline/TimelinePane'

/**
 * O painel principal mostra um artefato (`.md`/`.html` em `.sdd/`) ou a timeline de
 * uma mudança (vinda do banco do SDD). São fontes diferentes, então a seleção é uma
 * união em vez de um artefato opcional.
 */
type Selection =
  | { kind: 'artifact'; artifact: SelectedArtifact }
  | { kind: 'timeline'; changeId: string }

export function App() {
  const { workspaces, addWorkspace, removeWorkspace } = useWorkspaces()
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null)
  const [selection, setSelection] = useState<Selection | null>(null)

  const tree = useProjectTree(selectedWorkspaceId)
  const timeline = useTimeline(selectedWorkspaceId)

  const handleSelectWorkspace = (id: string): void => {
    setSelectedWorkspaceId(id)
    setSelection(null)
  }

  const handleSelectArtifact = (artifact: ArtifactRef): void => {
    const defaultVariant = artifact.htmlPath ? 'html' : 'md'
    setSelection({ kind: 'artifact', artifact: { ref: artifact, variant: defaultVariant } })
  }

  const handleVariantChange = (variant: 'md' | 'html'): void => {
    setSelection((current) => {
      if (current?.kind !== 'artifact') return current
      return { kind: 'artifact', artifact: { ...current.artifact, variant } }
    })
  }

  const selectedArtifact = selection?.kind === 'artifact' ? selection.artifact : null
  const selectedTimelineChangeId = selection?.kind === 'timeline' ? selection.changeId : null

  return (
    <div className="app">
      <aside className="sidebar">
        <ProjectList
          workspaces={workspaces}
          selectedId={selectedWorkspaceId}
          onSelect={handleSelectWorkspace}
          onAdd={addWorkspace}
          onRemove={(id) => {
            removeWorkspace(id)
            if (id === selectedWorkspaceId) setSelectedWorkspaceId(null)
          }}
        />
        {tree && (
          <ChangeTree
            tree={tree}
            selectedArtifact={selectedArtifact?.ref ?? null}
            onSelectArtifact={handleSelectArtifact}
            hasTimeline={timeline.available}
            selectedTimelineChangeId={selectedTimelineChangeId}
            onSelectTimeline={(changeId) => setSelection({ kind: 'timeline', changeId })}
          />
        )}
      </aside>

      <main className="main">
        {selection?.kind === 'timeline' && selectedWorkspaceId ? (
          <TimelinePane
            workspaceId={selectedWorkspaceId}
            change={timeline.changes.find((c) => c.changeId === selection.changeId) ?? null}
          />
        ) : (
          <ContentPane selected={selectedArtifact} onVariantChange={handleVariantChange} />
        )}
      </main>
    </div>
  )
}
