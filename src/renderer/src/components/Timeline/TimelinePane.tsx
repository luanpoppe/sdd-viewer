import type { ChangeTimeline } from '@shared/types'
import { ChunkCard } from './ChunkCard'
import { EventRow } from './EventRow'

export function TimelinePane({
  workspaceId,
  change
}: {
  workspaceId: string
  change: ChangeTimeline | null
}) {
  if (!change) {
    return (
      <div className="content-pane empty">
        Nada registrado no banco do SDD para esta mudança ainda.
      </div>
    )
  }

  return (
    <div className="content-pane">
      <div className="content-pane-header">
        <span className="content-pane-title">Timeline — {change.changeId}</span>
        <span className="timeline-count">{change.chunks.length} chunks</span>
      </div>

      <div className="content-pane-body timeline-body">
        {change.chunks.length > 0 ? (
          <ol className="chunk-list">
            {change.chunks.map((chunk) => (
              <ChunkCard
                key={chunk.chunkId}
                workspaceId={workspaceId}
                changeId={change.changeId}
                chunk={chunk}
              />
            ))}
          </ol>
        ) : (
          <p className="timeline-empty-chunks">
            Nenhum chunk implementado ainda — esta mudança está antes da fase de código.
          </p>
        )}

        {change.events.length > 0 && <EventLog change={change} />}
      </div>
    </div>
  )
}

/**
 * Eventos ficam abaixo dos chunks, não intercalados: são decisões e desvios (modo
 * sequencial/paralelo, onda planejada, divergência do auto-sync, commit, decisões de
 * grill) e servem pra entender *por que* a implementação saiu assim, não pra revisar
 * código. Os que trazem payload abrem no clique.
 */
function EventLog({ change }: { change: ChangeTimeline }) {
  return (
    <section className="event-log">
      <h3>Decisões e desvios</h3>
      <ul>
        {change.events.map((event, index) => (
          <EventRow key={`${event.at}-${index}`} event={event} />
        ))}
      </ul>
    </section>
  )
}
