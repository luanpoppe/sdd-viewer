import { toLocalFileUrl } from '@shared/localFileUrl'
import { useFileWatch } from '../../hooks/useFileWatch'

export function HtmlView({ path }: { path: string }) {
  const version = useFileWatch(path)

  return (
    <iframe
      key={`${path}:${version}`}
      className="html-view"
      src={`${toLocalFileUrl(path)}?v=${version}`}
      title={path}
      sandbox="allow-scripts allow-same-origin"
    />
  )
}
