import { useEffect, useState } from 'react'

// chokidar pode normalizar separadores diferente do path.join do Node no Windows —
// compara sempre com barra normal pra não perder o evento por causa disso.
const normalize = (p: string): string => p.replace(/\\/g, '/')

/** Incrementa a cada vez que `path` é regravado em disco — use como dependência/key pra recarregar. */
export function useFileWatch(path: string | undefined): number {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!path) return
    const normalizedPath = normalize(path)

    const unsubscribe = window.sdd.onFileChanged((changedPath) => {
      if (normalize(changedPath) === normalizedPath) setVersion((v) => v + 1)
    })

    return unsubscribe
  }, [path])

  return version
}
