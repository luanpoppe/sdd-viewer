import type { ArtifactRef, ReviewSummary } from '@shared/types'
import { ArtifactRow } from './ArtifactRow'

export function ReviewNode({
  review,
  selectedArtifact,
  onSelectArtifact
}: {
  review: ReviewSummary
  selectedArtifact: ArtifactRef | null
  onSelectArtifact: (artifact: ArtifactRef) => void
}) {
  if (!review.walkthroughArtifact) return null

  const isSelected =
    selectedArtifact !== null &&
    (selectedArtifact.mdPath ?? selectedArtifact.htmlPath) ===
      (review.walkthroughArtifact.mdPath ?? review.walkthroughArtifact.htmlPath)

  return (
    <li className="change-node">
      <div className="change-header">
        <span className="change-title">{review.topic}</span>
        <span className="change-state">{review.state}</span>
      </div>
      <ul className="artifact-list">
        <ArtifactRow artifact={review.walkthroughArtifact} isSelected={isSelected} onSelect={onSelectArtifact} />
      </ul>
    </li>
  )
}
