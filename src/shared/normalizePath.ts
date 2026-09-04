const WINDOWS_SEPARATOR = /\\/g
const DRIVE_LETTER = /^([A-Za-z]):/
const TRAILING_SLASHES = /(.)\/+$/

/**
 * Forma canônica de um caminho de projeto: barras pra frente e letra de drive em
 * minúsculo.
 *
 * Precisa casar exatamente com a normalização do servidor MCP do SDD
 * (`mcp/project.js` no repo do plugin), porque é por esse caminho que o banco
 * identifica um projeto. Sem isso, `C:\repos\x` no viewer não encontra o
 * `c:/repos/x` gravado pelo MCP.
 */
export function normalizeProjectPath(rawPath: string): string {
  const forwardSlashes = rawPath.replace(WINDOWS_SEPARATOR, '/')
  const loweredDrive = forwardSlashes.replace(DRIVE_LETTER, (_match, drive: string) =>
    `${drive.toLowerCase()}:`
  )
  return loweredDrive.replace(TRAILING_SLASHES, '$1')
}
