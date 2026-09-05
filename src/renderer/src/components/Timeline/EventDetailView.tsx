import type { EventDetail, EventDetailValue } from '@shared/types'

/**
 * Renderiza o payload de um evento. É JSON de forma livre — o agente decide as
 * chaves conforme o que está registrando (decisões do grill, achados, causa raiz,
 * links de card) —, então a exibição é genérica: chave vira rótulo, valor vira
 * texto, objeto aninhado indenta.
 *
 * Deliberadamente NÃO é um dump de JSON: quem lê quer a decisão, não a sintaxe.
 */
export function EventDetailView({ detail }: { detail: EventDetail }) {
  return (
    <dl className="event-detail">
      {Object.entries(detail).map(([key, value]) => (
        <DetailEntry key={key} label={key} value={value} />
      ))}
    </dl>
  )
}

function DetailEntry({ label, value }: { label: string; value: EventDetailValue }) {
  const readableLabel = humanize(label)

  if (isNested(value)) {
    return (
      <div className="event-detail-group">
        <dt className="event-detail-key group">{readableLabel}</dt>
        <dd className="event-detail-nested">
          <EventDetailView detail={value} />
        </dd>
      </div>
    )
  }

  return (
    <div className="event-detail-row">
      <dt className="event-detail-key">{readableLabel}</dt>
      <dd className="event-detail-value">{renderScalar(value)}</dd>
    </div>
  )
}

function isNested(value: EventDetailValue): value is EventDetail {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Listas viram bullets; o resto vira texto. `null` aparece como travessão. */
function renderScalar(value: EventDetailValue): React.ReactNode {
  if (Array.isArray(value)) {
    return (
      <ul className="event-detail-list">
        {value.map((item, index) => (
          <li key={index}>{isNested(item) ? <EventDetailView detail={item} /> : renderScalar(item)}</li>
        ))}
      </ul>
    )
  }

  if (value === null) return '—'
  if (typeof value === 'boolean') return value ? 'sim' : 'não'
  return String(value)
}

/** `sintoma_reenquadrado` → `sintoma reenquadrado`. As chaves vêm em snake_case. */
function humanize(key: string): string {
  return key.replace(/_/g, ' ')
}
