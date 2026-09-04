const MS_PER_SECOND = 1000
const MS_PER_MINUTE = 60 * MS_PER_SECOND
const MS_PER_HOUR = 60 * MS_PER_MINUTE

export class TimelineFormat {
  /** `2026-09-03T20:38:23.727Z` → `03/09 17:38` (hora local). */
  static stamp(iso?: string): string {
    if (!iso) return '—'
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return iso

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${month} ${hours}:${minutes}`
  }

  /**
   * Duração do chunk. Só existe porque o banco guarda hora — o `.sdd.yaml` tem
   * apenas a data, então essa informação não vinha de lugar nenhum antes.
   */
  static duration(startedAt?: string, finishedAt?: string): string | null {
    if (!startedAt || !finishedAt) return null

    const elapsed = new Date(finishedAt).getTime() - new Date(startedAt).getTime()
    if (Number.isNaN(elapsed) || elapsed < 0) return null

    if (elapsed < MS_PER_MINUTE) return `${Math.round(elapsed / MS_PER_SECOND)}s`
    if (elapsed < MS_PER_HOUR) return `${Math.round(elapsed / MS_PER_MINUTE)}min`

    const hours = Math.floor(elapsed / MS_PER_HOUR)
    const minutes = Math.round((elapsed % MS_PER_HOUR) / MS_PER_MINUTE)
    return `${hours}h${String(minutes).padStart(2, '0')}`
  }

  static lineDelta(added?: number, removed?: number): string | null {
    const parts: string[] = []
    if (added) parts.push(`+${added}`)
    if (removed) parts.push(`-${removed}`)
    return parts.length ? parts.join(' ') : null
  }
}
