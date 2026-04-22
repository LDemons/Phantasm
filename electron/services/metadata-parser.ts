import { parseFile } from 'music-metadata'
import { createHash } from 'crypto'
import { createReadStream, statSync, mkdirSync, writeFileSync } from 'fs'
import { join, basename, extname } from 'path'
import { app } from 'electron'

export type ParsedTrack = {
  path: string
  title: string
  artist: string
  album: string
  album_artist: string
  year: number | null
  genre: string
  duration: number
  bpm: number | null
  track_number: number | null
  disk_number: number | null
  cover_path: string | null
  file_hash: string
  mtime: number
}

const SUPPORTED_EXTENSIONS = new Set([
  '.mp3', '.flac', '.m4a', '.aac', '.ogg', '.wav', '.aiff', '.aif',
])

export function isSupportedAudio(filePath: string): boolean {
  return SUPPORTED_EXTENSIONS.has(extname(filePath).toLowerCase())
}

export async function parseTrack(filePath: string): Promise<ParsedTrack> {
  const stat = statSync(filePath)
  const hash = hashFile(filePath)
  let metadata

  try {
    metadata = await parseFile(filePath, { duration: true, skipCovers: false })
  } catch {
    return buildFallback(filePath, stat.mtimeMs, hash)
  }

  const { common, format } = metadata
  const coverPath = await extractCover(filePath, common.picture)

  return {
    path: filePath,
    title: common.title || basename(filePath, extname(filePath)),
    artist: common.artist || common.albumartist || 'Unknown Artist',
    album: common.album || 'Unknown Album',
    album_artist: common.albumartist || common.artist || 'Unknown Artist',
    year: common.year ?? null,
    genre: common.genre?.[0] ?? '',
    duration: format.duration ?? 0,
    bpm: common.bpm ?? null,
    track_number: common.track?.no ?? null,
    disk_number: common.disk?.no ?? null,
    cover_path: coverPath,
    file_hash: hash,
    mtime: Math.floor(stat.mtimeMs),
  }
}

function hashFile(filePath: string): string {
  const stat = statSync(filePath)
  return createHash('md5')
    .update(`${filePath}:${stat.size}:${stat.mtimeMs}`)
    .digest('hex')
}

async function extractCover(
  trackPath: string,
  pictures: { data: Uint8Array; format: string }[] | undefined
): Promise<string | null> {
  if (!pictures || pictures.length === 0) return null

  const coversDir = join(app.getPath('userData'), 'covers')
  mkdirSync(coversDir, { recursive: true })

  const pic = pictures[0]
  const ext = pic.format.replace('image/', '') || 'jpg'
  const hash = createHash('md5').update(pic.data).digest('hex')
  const coverPath = join(coversDir, `${hash}.${ext}`)

  try {
    statSync(coverPath)
  } catch {
    writeFileSync(coverPath, pic.data)
  }

  return coverPath
}

function buildFallback(
  filePath: string,
  mtime: number,
  hash: string
): ParsedTrack {
  return {
    path: filePath,
    title: basename(filePath, extname(filePath)),
    artist: 'Unknown Artist',
    album: 'Unknown Album',
    album_artist: 'Unknown Artist',
    year: null,
    genre: '',
    duration: 0,
    bpm: null,
    track_number: null,
    disk_number: null,
    cover_path: null,
    file_hash: hash,
    mtime: Math.floor(mtime),
  }
}
