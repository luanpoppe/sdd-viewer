export const LOCAL_FILE_SCHEME = 'sdd-file'

export function toLocalFileUrl(absolutePath: string): string {
  const forwardSlashPath = absolutePath.replace(/\\/g, '/')
  return `${LOCAL_FILE_SCHEME}://${encodeURI(forwardSlashPath)}`
}
