import { useState } from 'react'
import type { ChunkFileEntry, CodeHighlight } from '@shared/types'
import { CopyPathButton } from './CopyPathButton'
import { TimelineFormat } from './format'

export function FileEntry({ file }: { file: ChunkFileEntry }) {
  const delta = TimelineFormat.lineDelta(file.linesAdded, file.linesRemoved)
  const hasDepth = Boolean(file.detail) || file.highlights.length > 0

  return (
    <li className="chunk-file">
      <div className="chunk-file-head">
        <code>{file.path}</code>
        <CopyPathButton path={file.path} />
        {file.operation && <span className="chunk-file-op">{file.operation}</span>}
        {delta && <span className="chunk-file-delta">{delta}</span>}
        {file.isTest && <span className="chunk-file-test">teste</span>}
      </div>

      {file.does && <SummaryLine label="Faz" text={file.does} />}
      {file.connects && <SummaryLine label="Conecta" text={file.connects} />}
      {file.reviewNote && <SummaryLine label="Revisar" text={file.reviewNote} review />}

      {hasDepth && <FileDepth file={file} />}
    </li>
  )
}

function SummaryLine({
  label,
  text,
  review = false
}: {
  label: string
  text: string
  review?: boolean
}) {
  return (
    <div className={`chunk-file-line ${review ? 'review' : ''}`}>
      <span className="chunk-file-label">{label}</span> {text}
    </div>
  )
}

/**
 * A explicação longa e os trechos de código vêm fechados: as três linhas acima são o
 * resumo que se lê correndo a lista, e abrir isso é a decisão de estudar aquele
 * arquivo a fundo.
 */
function FileDepth({ file }: { file: ChunkFileEntry }) {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button className="file-depth-toggle" onClick={() => setOpen(true)}>
        ▸ Entender melhor
        {file.highlights.length > 0 && ` (${file.highlights.length} trechos de código)`}
      </button>
    )
  }

  return (
    <div className="file-depth">
      <button className="file-depth-toggle open" onClick={() => setOpen(false)}>
        ▾ Recolher
      </button>
      {file.detail && <p className="file-detail">{file.detail}</p>}
      {file.highlights.map((highlight, index) => (
        <Highlight key={index} highlight={highlight} />
      ))}
    </div>
  )
}

function Highlight({ highlight }: { highlight: CodeHighlight }) {
  return (
    <section className="highlight">
      <div className="highlight-head">
        {highlight.label && <span className="highlight-label">{highlight.label}</span>}
        {highlight.lines && <span className="highlight-lines">linhas {highlight.lines}</span>}
        {highlight.language && <span className="highlight-lang">{highlight.language}</span>}
      </div>
      <pre className="highlight-code">
        <code>{highlight.snippet}</code>
      </pre>
      {highlight.explanation && <p className="highlight-explanation">{highlight.explanation}</p>}
    </section>
  )
}
