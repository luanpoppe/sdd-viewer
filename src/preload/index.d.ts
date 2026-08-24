import type { SddApi } from './index'

declare global {
  interface Window {
    sdd: SddApi
  }
}
