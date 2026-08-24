import type { Workspace } from '@shared/types'

export function ProjectList({
  workspaces,
  selectedId,
  onSelect,
  onAdd,
  onRemove
}: {
  workspaces: Workspace[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
}) {
  return (
    <div className="project-list">
      <div className="project-list-header">
        <span>Projetos</span>
        <button onClick={onAdd} title="Adicionar projeto">
          +
        </button>
      </div>
      <ul>
        {workspaces.map((workspace) => (
          <li
            key={workspace.id}
            className={workspace.id === selectedId ? 'active' : ''}
            onClick={() => onSelect(workspace.id)}
          >
            <span className="project-name" title={workspace.path}>
              {workspace.name}
            </span>
            <button
              className="remove-btn"
              title="Remover"
              onClick={(event) => {
                event.stopPropagation()
                onRemove(workspace.id)
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
