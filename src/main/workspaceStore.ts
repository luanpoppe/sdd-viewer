import { randomUUID } from 'crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import type { Workspace } from '@shared/types'

export class WorkspaceStore {
  private readonly filePath: string
  private workspaces: Workspace[]

  constructor(userDataPath: string) {
    this.filePath = join(userDataPath, 'workspaces.json')
    this.workspaces = this.load()
  }

  list(): Workspace[] {
    return this.workspaces
  }

  add(path: string): Workspace {
    const existing = this.workspaces.find((w) => w.path === path)
    if (existing) return existing

    const workspace: Workspace = { id: randomUUID(), name: this.deriveName(path), path }
    this.workspaces.push(workspace)
    this.save()
    return workspace
  }

  remove(id: string): void {
    this.workspaces = this.workspaces.filter((w) => w.id !== id)
    this.save()
  }

  private deriveName(path: string): string {
    const normalized = path.replace(/[/\\]+$/, '')
    const segments = normalized.split(/[/\\]/)
    return segments[segments.length - 1] || normalized
  }

  private load(): Workspace[] {
    if (!existsSync(this.filePath)) return []
    try {
      const raw = readFileSync(this.filePath, 'utf-8')
      return JSON.parse(raw) as Workspace[]
    } catch {
      return []
    }
  }

  private save(): void {
    mkdirSync(dirname(this.filePath), { recursive: true })
    writeFileSync(this.filePath, JSON.stringify(this.workspaces, null, 2), 'utf-8')
  }
}
