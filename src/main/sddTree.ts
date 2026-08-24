import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import yaml from 'js-yaml'
import type { ArtifactRef, ChangeSummary, FeatureSpec, ProjectTree, ReviewSummary } from '@shared/types'

type RawFeature = {
  slug: string
  title: string
  status?: string
}

type RawSddYaml = {
  id: string
  title: string
  kind?: 'bugfix'
  state: string
  updated: string
  features?: RawFeature[]
}

type RawReviewYaml = {
  topic: string
  slug: string
  state: string
  updated: string
}

export class SddTreeParser {
  static parseProject(workspaceId: string, name: string, projectPath: string): ProjectTree {
    const sddPath = join(projectPath, '.sdd')
    const contextIndexPath = join(sddPath, 'context', 'index.md')

    const activeChanges = SddTreeParser.parseChangesDir(join(sddPath, 'changes'), false)
    const archivedChanges = SddTreeParser.parseChangesDir(join(sddPath, 'archive'), true)

    return {
      workspaceId,
      name,
      path: projectPath,
      changes: [...activeChanges, ...archivedChanges],
      reviews: SddTreeParser.parseReviewsDir(join(sddPath, 'reviews')),
      contextIndexPath: existsSync(contextIndexPath) ? contextIndexPath : undefined
    }
  }

  private static parseReviewsDir(dirPath: string): ReviewSummary[] {
    if (!existsSync(dirPath)) return []

    return readdirSync(dirPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => SddTreeParser.parseReview(join(dirPath, entry.name)))
      .filter((review): review is ReviewSummary => review !== null)
  }

  private static parseReview(reviewDir: string): ReviewSummary | null {
    const yamlPath = join(reviewDir, '.sdd.yaml')
    if (!existsSync(yamlPath)) return null

    const raw = yaml.load(readFileSync(yamlPath, 'utf-8')) as RawReviewYaml

    return {
      slug: raw.slug,
      topic: raw.topic,
      state: raw.state,
      updated: raw.updated,
      walkthroughArtifact: SddTreeParser.findArtifact(reviewDir, 'walkthrough')
    }
  }

  private static parseChangesDir(dirPath: string, archived: boolean): ChangeSummary[] {
    if (!existsSync(dirPath)) return []

    return readdirSync(dirPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => SddTreeParser.parseChange(join(dirPath, entry.name), archived))
      .filter((change): change is ChangeSummary => change !== null)
  }

  private static parseChange(changeDir: string, archived: boolean): ChangeSummary | null {
    const yamlPath = join(changeDir, '.sdd.yaml')
    if (!existsSync(yamlPath)) return null

    const raw = yaml.load(readFileSync(yamlPath, 'utf-8')) as RawSddYaml
    const isBugfix = raw.kind === 'bugfix'

    const base: ChangeSummary = {
      id: raw.id,
      title: raw.title,
      kind: isBugfix ? 'bugfix' : 'feature',
      state: raw.state,
      updated: raw.updated,
      archived,
      tasksArtifact: SddTreeParser.findArtifact(changeDir, 'tasks'),
      flowArtifact: SddTreeParser.findArtifact(changeDir, 'flow')
    }

    return isBugfix
      ? SddTreeParser.enrichBugfixChange(base, changeDir)
      : SddTreeParser.enrichFeatureChange(base, changeDir, raw.features ?? [])
  }

  private static enrichBugfixChange(base: ChangeSummary, changeDir: string): ChangeSummary {
    return {
      ...base,
      diagnosisArtifact: SddTreeParser.findArtifact(changeDir, 'diagnosis'),
      solutionsArtifact: SddTreeParser.findArtifact(changeDir, 'solutions')
    }
  }

  private static enrichFeatureChange(
    base: ChangeSummary,
    changeDir: string,
    rawFeatures: RawFeature[]
  ): ChangeSummary {
    const specsDir = join(changeDir, 'specs')

    const features: FeatureSpec[] = rawFeatures.map((feature) => {
      const featureDir = join(specsDir, feature.slug)
      const artifacts = [
        SddTreeParser.findArtifact(featureDir, 'spec'),
        SddTreeParser.findArtifact(featureDir, 'tasks')
      ].filter((artifact): artifact is ArtifactRef => artifact !== undefined)

      return { slug: feature.slug, title: feature.title, status: feature.status ?? 'unknown', artifacts }
    })

    return {
      ...base,
      planArtifact: SddTreeParser.findArtifact(changeDir, 'plan'),
      features
    }
  }

  private static findArtifact(dir: string, baseName: string): ArtifactRef | undefined {
    const mdPath = join(dir, `${baseName}.md`)
    const htmlPath = join(dir, `${baseName}.html`)
    const hasMd = existsSync(mdPath)
    const hasHtml = existsSync(htmlPath)

    if (!hasMd && !hasHtml) return undefined

    return {
      label: baseName,
      mdPath: hasMd ? mdPath : undefined,
      htmlPath: hasHtml ? htmlPath : undefined
    }
  }
}
