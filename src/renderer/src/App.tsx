import { useState } from 'react'
import type { ArtifactRef } from '@shared/types'
import { useWorkspaces } from './hooks/useWorkspaces'
import { useProjectTree } from './hooks/useProjectTree'
import { ProjectList } from './components/Sidebar/ProjectList'
import { ChangeTree } from './components/Sidebar/ChangeTree'
import { ContentPane, type SelectedArtifact } from './components/ContentPane/ContentPane'

export function App() {
  const { workspaces, addWorkspace, removeWorkspace } = useWorkspaces()
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null)
  const [selected, setSelected] = useState<SelectedArtifact | null>(null)

  const tree = useProjectTree(selectedWorkspaceId)

  const handleSelectWorkspace = (id: string): void => {
    setSelectedWorkspaceId(id)
    setSelected(null)
  }

  const handleSelectArtifact = (artifact: ArtifactRef): void => {
    const defaultVariant = artifact.htmlPath ? 'html' : 'md'
    setSelected({ ref: artifact, variant: defaultVariant })
  }

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
            selectedArtifact={selected?.ref ?? null}
            onSelectArtifact={handleSelectArtifact}
          />
        )}
      </aside>

      <main className="main">
        <ContentPane
          selected={selected}
          onVariantChange={(variant) => setSelected((s) => (s ? { ...s, variant } : s))}
        />
      </main>
    </div>
  )
}
