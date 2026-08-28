import { useState } from 'react'
import type { ArtifactRef, FeatureSpec } from '@shared/types'
import { ArtifactRow } from './ArtifactRow'

export function FeatureNode({
  feature,
  isSelected,
  onSelectArtifact
}: {
  feature: FeatureSpec
  isSelected: (artifact: ArtifactRef) => boolean
  onSelectArtifact: (artifact: ArtifactRef) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hasArtifacts = feature.artifacts.length > 0

  return (
    <li className="feature-node">
      <div className="feature-header" onClick={() => setExpanded((e) => !e)}>
        <span className="change-caret">{expanded ? '▾' : '▸'}</span>
        <span className="feature-title">{feature.title}</span>
        <span className="change-state">{feature.status}</span>
      </div>

      {expanded && (
        <ul className="artifact-list">
          {hasArtifacts ? (
            feature.artifacts.map((artifact) => (
              <ArtifactRow
                key={artifact.label}
                artifact={artifact}
                isSelected={isSelected(artifact)}
                onSelect={onSelectArtifact}
              />
            ))
          ) : (
            <li className="feature-empty">sem artefatos ainda</li>
          )}
        </ul>
      )}
    </li>
  )
}
