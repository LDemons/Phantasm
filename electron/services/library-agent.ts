import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import { isSupportedAudio, parseTrack } from './metadata-parser'
import type { SQLiteStore } from './sqlite-store'

type ScanProgress = {
  total: number
  processed: number
  current: string
}

type ProgressCallback = (progress: ScanProgress) => void

const BATCH_SIZE = 50

export class LibraryAgent {
  constructor(private db: SQLiteStore) {}

  async scan(
    folderPath: string,
    onProgress: ProgressCallback
  ): Promise<{ added: number; updated: number; skipped: number }> {
    const files = collectAudioFiles(folderPath)
    const total = files.length
    let processed = 0
    let added = 0
    let updated = 0
    let skipped = 0

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE)

      for (const filePath of batch) {
        onProgress({ total, processed, current: filePath })

        const existing = this.db.getTrackByPath(filePath)
        const stat = statSync(filePath)
        const mtime = Math.floor(stat.mtimeMs)

        if (existing && existing.mtime === mtime) {
          skipped++
          processed++
          continue
        }

        try {
          const parsed = await parseTrack(filePath)
          this.db.upsertTrack(parsed)
          existing ? updated++ : added++
        } catch {
          skipped++
        }

        processed++
      }

      await yieldToEventLoop()
    }

    onProgress({ total, processed: total, current: '' })
    return { added, updated, skipped }
  }
}

function collectAudioFiles(dir: string): string[] {
  const results: string[] = []

  function walk(currentDir: string) {
    let entries: import('fs').Dirent[]
    try {
      entries = readdirSync(currentDir, { withFileTypes: true }) as import('fs').Dirent[]
    } catch {
      return
    }

    for (const entry of entries) {
      if ((entry.name as string).startsWith('.')) continue
      const fullPath = join(currentDir, entry.name as string)

      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile() && isSupportedAudio(fullPath)) {
        results.push(fullPath)
      }
    }
  }

  walk(dir)
  return results
}

function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve))
}
