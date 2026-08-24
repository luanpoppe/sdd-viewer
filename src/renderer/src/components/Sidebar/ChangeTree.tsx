import type { ArtifactRef, ProjectTree } from '@shared/types'
import { ChangeNode } from './ChangeNode'
import { ReviewNode } from './ReviewNode'

export function ChangeTree({
  tree,
  selectedArtifact,
  onSelectArtifact
}: {
  tree: ProjectTree
  selectedArtifact: ArtifactRef | null
  onSelectArtifact: (artifact: ArtifactRef) => void
}) {
  const active = tree.changes.filter((c) => !c.archived)
  const archived = tree.changes.filter((c) => c.archived)

  return (
    <div className="change-tree">
      <div className="change-section-title">Ativas ({active.length})</div>
      <ul>
        {active.map((change) => (
          <ChangeNode
            key={change.id}
            change={change}
            selectedArtifact={selectedArtifact}
            onSelectArtifact={onSelectArtifact}
          />
        ))}
      </ul>

      <div className="change-section-title">Arquivadas ({archived.length})</div>
      <ul>
        {archived.map((change) => (
          <ChangeNode
            key={change.id}
            change={change}
            selectedArtifact={selectedArtifact}
            onSelectArtifact={onSelectArtifact}
          />
        ))}
      </ul>

      {tree.reviews.length > 0 && (
        <>
          <div className="change-section-title">Reviews ({tree.reviews.length})</div>
          <ul>
            {tree.reviews.map((review) => (
              <ReviewNode
                key={review.slug}
                review={review}
                selectedArtifact={selectedArtifact}
                onSelectArtifact={onSelectArtifact}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
