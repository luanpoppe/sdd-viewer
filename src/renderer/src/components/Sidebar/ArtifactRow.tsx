import type { ArtifactRef } from '@shared/types'

export function ArtifactRow({
  artifact,
  isSelected,
  onSelect
}: {
  artifact: ArtifactRef
  isSelected: boolean
  onSelect: (artifact: ArtifactRef) => void
}) {
  return (
    <li className={`artifact-row ${isSelected ? 'active' : ''}`} onClick={() => onSelect(artifact)}>
      {artifact.label}
    </li>
  )
}
