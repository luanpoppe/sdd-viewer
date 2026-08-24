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
