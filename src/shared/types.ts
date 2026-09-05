export type ChangeKind = 'feature' | 'bugfix'

export type ArtifactRef = {
  label: string
  mdPath?: string
  htmlPath?: string
}

export type FeatureSpec = {
  slug: string
  title: string
  status: string
  artifacts: ArtifactRef[] // spec + tasks dessa feature
}

export type ChangeSummary = {
  id: string
  title: string
  kind: ChangeKind
  state: string
  updated: string
  archived: boolean
  planArtifact?: ArtifactRef // kind=feature
  features?: FeatureSpec[] // kind=feature
  diagnosisArtifact?: ArtifactRef // kind=bugfix
  solutionsArtifact?: ArtifactRef // kind=bugfix
  tasksArtifact?: ArtifactRef // ambos
  flowArtifact?: ArtifactRef // ambos, se existir
}

export type ReviewSummary = {
  slug: string
  topic: string
  state: string // planning | walking | paused | done
  updated: string
  walkthroughArtifact?: ArtifactRef
}

export type ProjectTree = {
  workspaceId: string
  name: string
  path: string
  changes: ChangeSummary[]
  reviews: ReviewSummary[]
  contextIndexPath?: string
}

export type Workspace = {
  id: string
  name: string
  path: string
}

export type OpenArtifact = {
  kind: 'md' | 'html'
  path: string
  label: string
}

// --- Histórico vindo do banco do SDD (~/.sdd/sdd.db), gravado pelo MCP local ---
// Opcional por natureza: quem não usa o MCP não tem banco, e o viewer funciona
// igual. Por isso `available` em vez de uma lista vazia ambígua.

/** Trecho de código que vale ser lido num arquivo, com a explicação dele. */
export type CodeHighlight = {
  label?: string
  lines?: string
  language?: string
  snippet: string
  explanation?: string
}

export type ChunkFileEntry = {
  path: string
  operation?: string
  linesAdded?: number
  linesRemoved?: number
  does?: string
  connects?: string
  reviewNote?: string
  /** Explicação longa, sem o limite de 1-2 frases do plano de revisão no chat. */
  detail?: string
  highlights: CodeHighlight[]
  reviewOrder: number
  isTest: boolean
}

export type TimelineChunk = {
  chunkId: string
  featureSlug?: string
  title?: string
  status?: string
  wave?: number
  startedAt?: string
  finishedAt?: string
  summary?: string
  reasoning?: string
  fileCount: number
}

export type TimelineEvent = {
  at: string
  kind: string
  actor?: string
  summary: string
  chunkId?: string
  /**
   * Payload estruturado do evento, como o agente gravou — forma livre e aninhada
   * (decisões do grill, achados, links). Já vem parseado do JSON do banco.
   */
  detail?: EventDetail
}

/** Valor de payload de evento: escalar, lista ou objeto aninhado. */
export type EventDetail = { [key: string]: EventDetailValue }

export type EventDetailValue = string | number | boolean | null | EventDetailValue[] | EventDetail

export type ChangeTimeline = {
  changeId: string
  chunks: TimelineChunk[]
  events: TimelineEvent[]
}

export type ProjectTimeline = {
  available: boolean // false = banco ausente ou projeto nunca registrado nele
  changes: ChangeTimeline[]
}
