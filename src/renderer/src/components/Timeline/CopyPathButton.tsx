import { useEffect, useState } from 'react'

const FEEDBACK_MS = 1400

/**
 * Copia o caminho relativo do arquivo. Os caminhos já vêm relativos à raiz do
 * projeto (é assim que o SDD os registra), então é só repassar — o valor é
 * exatamente o que se cola num `git add`, num editor ou de volta no chat.
 */
export function CopyPathButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), FEEDBACK_MS)
    return () => clearTimeout(timer)
  }, [copied])

  const copy = (event: React.MouseEvent): void => {
    // O cabeçalho do arquivo fica dentro do card clicável do chunk; sem isso, copiar
    // também colapsaria o chunk.
    event.stopPropagation()
    window.sdd.copyText(path).then(() => setCopied(true))
  }

  return (
    <button
      className={`copy-path ${copied ? 'copied' : ''}`}
      onClick={copy}
      title={`Copiar caminho: ${path}`}
    >
      {copied ? 'copiado' : 'copiar'}
    </button>
  )
}
