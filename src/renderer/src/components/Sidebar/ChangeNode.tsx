import { useState } from 'react'
import type { ArtifactRef, ChangeSummary } from '@shared/types'
import { ArtifactRow } from './ArtifactRow'

export function ChangeNode({
  change,
  selectedArtifact,
  onSelectArtifact
}: {
  change: ChangeSummary
  selectedArtifact: ArtifactRef | null
  onSelectArtifact: (artifact: ArtifactRef) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const isSelected = (artifact: ArtifactRef): boolean =>
    selectedArtifact !== null &&
    (selectedArtifact.mdPath ?? selectedArtifact.htmlPath) === (artifact.mdPath ?? artifact.htmlPath)

  return (
    <li className="change-node">
      <div className="change-header" onClick={() => setExpanded((e) => !e)}>
        <span className="change-caret">{expanded ? '▾' : '▸'}</span>
        <span className="change-title">{change.title}</span>
        <span className="change-state">{change.state}</span>
      </div>

      {expanded && (
        <ul className="artifact-list">
          {change.kind === 'feature' ? (
            <FeatureArtifacts change={change} isSelected={isSelected} onSelectArtifact={onSelectArtifact} />
          ) : (
            <BugfixArtifacts change={change} isSelected={isSelected} onSelectArtifact={onSelectArtifact} />
          )}
          {change.flowArtifact && (
            <ArtifactRow
              artifact={change.flowArtifact}
              isSelected={isSelected(change.flowArtifact)}
              onSelect={onSelectArtifact}
            />
          )}
        </ul>
      )}
    </li>
  )
}

function FeatureArtifacts({
  change,
  isSelected,
  onSelectArtifact
}: {
  change: ChangeSummary
  isSelected: (artifact: ArtifactRef) => boolean
  onSelectArtifact: (artifact: ArtifactRef) => void
}) {
  return (
    <>
      {change.planArtifact && (
        <ArtifactRow
          artifact={change.planArtifact}
          isSelected={isSelected(change.planArtifact)}
          onSelect={onSelectArtifact}
        />
      )}
      {change.features?.map((feature) => (
        <li key={feature.slug} className="feature-group">
          <span className="feature-title">{feature.title}</span>
          <ul>
            {feature.artifacts.map((artifact) => (
              <ArtifactRow
                key={artifact.label}
                artifact={artifact}
                isSelected={isSelected(artifact)}
                onSelect={onSelectArtifact}
              />
            ))}
          </ul>
        </li>
      ))}
    </>
  )
}

function BugfixArtifacts({
  change,
  isSelected,
  onSelectArtifact
}: {
  change: ChangeSummary
  isSelected: (artifact: ArtifactRef) => boolean
  onSelectArtifact: (artifact: ArtifactRef) => void
}) {
  return (
    <>
      {change.diagnosisArtifact && (
        <ArtifactRow
          artifact={change.diagnosisArtifact}
          isSelected={isSelected(change.diagnosisArtifact)}
          onSelect={onSelectArtifact}
        />
      )}
      {change.solutionsArtifact && (
        <ArtifactRow
          artifact={change.solutionsArtifact}
          isSelected={isSelected(change.solutionsArtifact)}
          onSelect={onSelectArtifact}
        />
      )}
      {change.tasksArtifact && (
        <ArtifactRow
          artifact={change.tasksArtifact}
          isSelected={isSelected(change.tasksArtifact)}
          onSelect={onSelectArtifact}
        />
      )}
    </>
  )
}
