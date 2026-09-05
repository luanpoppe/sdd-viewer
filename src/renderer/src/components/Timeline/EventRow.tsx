import { useState } from 'react'
import type { TimelineEvent } from '@shared/types'
import { EventDetailView } from './EventDetailView'
import { TimelineFormat } from './format'

export function EventRow({ event }: { event: TimelineEvent }) {
  const [open, setOpen] = useState(false)
  const hasDetail = event.detail !== undefined

  return (
    <li className={`event-row ${hasDetail ? 'expandable' : ''}`}>
      <div className="event-head" onClick={hasDetail ? () => setOpen((o) => !o) : undefined}>
        <span className="event-caret">{hasDetail ? (open ? '▾' : '▸') : ''}</span>
        <span className="event-stamp">{TimelineFormat.stamp(event.at)}</span>
        <span className="event-kind">{event.kind}</span>
        <span className="event-summary">{event.summary}</span>
      </div>

      {open && event.detail && <EventDetailView detail={event.detail} />}
    </li>
  )
}
