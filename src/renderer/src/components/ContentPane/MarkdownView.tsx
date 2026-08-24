import { useEffect, useState } from 'react'
import MarkdownIt from 'markdown-it'
import { useFileWatch } from '../../hooks/useFileWatch'

const md = new MarkdownIt({ html: false, linkify: true })

export function MarkdownView({ path }: { path: string }) {
  const [content, setContent] = useState('')
  const version = useFileWatch(path)

  useEffect(() => {
    let cancelled = false
    window.sdd.readFile(path).then((text) => {
      if (!cancelled) setContent(text)
    })
    return () => {
      cancelled = true
    }
  }, [path, version])

  return (
    <div className="markdown-view" dangerouslySetInnerHTML={{ __html: md.render(content) }} />
  )
}
