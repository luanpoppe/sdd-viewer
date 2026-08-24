import { net, protocol } from 'electron'
import { pathToFileURL } from 'url'
import { LOCAL_FILE_SCHEME } from '@shared/localFileUrl'

/** Chame ANTES de app.whenReady() — registro de scheme privilegiado é fixo no boot do Chromium. */
export function registerPrivilegedScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: LOCAL_FILE_SCHEME,
      privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true }
    }
  ])
}

/**
 * Serve arquivos locais via `sdd-file://` em vez de `file://`.
 * O renderer roda em http://localhost (dev) ou file:// (prod); Chromium bloqueia
 * iframe apontando pra file:// a partir de uma origem não-file. Um scheme custom
 * contorna essa restrição mantendo a mesma semântica de path/relativo do file://.
 */
export function registerLocalFileProtocolHandler(): void {
  protocol.handle(LOCAL_FILE_SCHEME, async (request) => {
    const url = new URL(request.url)
    const windowsPath = decodeURIComponent(url.pathname).replace(/^\/([A-Za-z]:)/, '$1')
    const response = await net.fetch(pathToFileURL(windowsPath).toString())

    // O SDD regrava esses arquivos com frequência (fast refresh) — nunca deixa o Chromium cachear.
    const headers = new Headers(response.headers)
    headers.set('Cache-Control', 'no-store')
    return new Response(response.body, { status: response.status, headers })
  })
}
