import type { ArtifactRef } from '@shared/types'
import { MarkdownView } from './MarkdownView'
import { HtmlView } from './HtmlView'

export type SelectedArtifact = {
  ref: ArtifactRef
  variant: 'md' | 'html'
}

export function ContentPane({
  selected,
  onVariantChange
}: {
  selected: SelectedArtifact | null
  onVariantChange: (variant: 'md' | 'html') => void
}) {
  if (!selected) {
    return <div className="content-pane empty">Selecione um artefato na barra lateral.</div>
  }

  const { ref, variant } = selected
  const activePath = variant === 'html' ? ref.htmlPath : ref.mdPath
  const canToggle = ref.mdPath && ref.htmlPath

  return (
    <div className="content-pane">
      <div className="content-pane-header">
        <span className="content-pane-title">{ref.label}</span>
        {canToggle && (
          <div className="variant-toggle">
            <button className={variant === 'md' ? 'active' : ''} onClick={() => onVariantChange('md')}>
              md
            </button>
            <button className={variant === 'html' ? 'active' : ''} onClick={() => onVariantChange('html')}>
              html
            </button>
          </div>
        )}
      </div>
      <div className="content-pane-body">
        {activePath ? (
          variant === 'html' ? (
            <HtmlView path={activePath} />
          ) : (
            <MarkdownView path={activePath} />
          )
        ) : (
          <div className="empty">Sem versão {variant} pra este artefato.</div>
        )}
      </div>
    </div>
  )
}
