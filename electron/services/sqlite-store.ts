import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { mkdirSync } from 'fs'

export type Track = {
  id: number
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
  added_at: number
}

export type Album = {
  id: number
  name: string
  artist: string
  year: number | null
  cover_path: string | null
  track_count: number
}

export type Artist = {
  id: number
  name: string
  track_count: number
}

export class SQLiteStore {
  private db: Database.Database

  constructor() {
    const userDataPath = app.getPath('userData')
    mkdirSync(join(userDataPath, 'data'), { recursive: true })
    const dbPath = join(userDataPath, 'data', 'phantasm.sqlite')
    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('foreign_keys = ON')
    this.migrate()
  }

  private migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tracks (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        path        TEXT    NOT NULL UNIQUE,
        title       TEXT    NOT NULL DEFAULT '',
        artist      TEXT    NOT NULL DEFAULT '',
        album       TEXT    NOT NULL DEFAULT '',
        album_artist TEXT   NOT NULL DEFAULT '',
        year        INTEGER,
        genre       TEXT    NOT NULL DEFAULT '',
        duration    REAL    NOT NULL DEFAULT 0,
        bpm         REAL,
        track_number INTEGER,
        disk_number  INTEGER,
        cover_path  TEXT,
        file_hash   TEXT    NOT NULL DEFAULT '',
        mtime       INTEGER NOT NULL DEFAULT 0,
        added_at    INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS albums (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT    NOT NULL,
        artist      TEXT    NOT NULL DEFAULT '',
        year        INTEGER,
        cover_path  TEXT,
        UNIQUE(name, artist)
      );

      CREATE TABLE IF NOT EXISTS artists (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT    NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS play_history (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        track_id    INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
        played_at   INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS favorites (
        track_id    INTEGER NOT NULL PRIMARY KEY REFERENCES tracks(id) ON DELETE CASCADE,
        added_at    INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS playlists (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT    NOT NULL,
        created_at  INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS playlist_tracks (
        playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
        track_id    INTEGER NOT NULL REFERENCES tracks(id)    ON DELETE CASCADE,
        position    INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY(playlist_id, track_id)
      );

      CREATE TABLE IF NOT EXISTS watched_folders (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        path        TEXT    NOT NULL UNIQUE,
        added_at    INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist);
      CREATE INDEX IF NOT EXISTS idx_tracks_album  ON tracks(album);
      CREATE INDEX IF NOT EXISTS idx_history_track ON play_history(track_id);
      CREATE INDEX IF NOT EXISTS idx_history_time  ON play_history(played_at DESC);
    `)
  }

  upsertTrack(track: Omit<Track, 'id' | 'added_at'>) {
    const stmt = this.db.prepare(`
      INSERT INTO tracks (path, title, artist, album, album_artist, year, genre,
        duration, bpm, track_number, disk_number, cover_path, file_hash, mtime)
      VALUES (@path, @title, @artist, @album, @album_artist, @year, @genre,
        @duration, @bpm, @track_number, @disk_number, @cover_path, @file_hash, @mtime)
      ON CONFLICT(path) DO UPDATE SET
        title        = excluded.title,
        artist       = excluded.artist,
        album        = excluded.album,
        album_artist = excluded.album_artist,
        year         = excluded.year,
        genre        = excluded.genre,
        duration     = excluded.duration,
        bpm          = excluded.bpm,
        track_number = excluded.track_number,
        disk_number  = excluded.disk_number,
        cover_path   = excluded.cover_path,
        file_hash    = excluded.file_hash,
        mtime        = excluded.mtime
    `)
    return stmt.run(track)
  }

  getTrackByPath(path: string): Track | undefined {
    return this.db
      .prepare('SELECT * FROM tracks WHERE path = ?')
      .get(path) as Track | undefined
  }

  getTracks(): Track[] {
    return this.db
      .prepare('SELECT * FROM tracks ORDER BY artist, album, disk_number, track_number, title')
      .all() as Track[]
  }

  getAlbums(): Album[] {
    return this.db
      .prepare(`
        SELECT album AS name, album_artist AS artist, year,
               MIN(cover_path) AS cover_path, COUNT(*) AS track_count
        FROM tracks
        GROUP BY album, album_artist
        ORDER BY album_artist, year, album
      `)
      .all() as Album[]
  }

  getArtists(): Artist[] {
    return this.db
      .prepare(`
        SELECT artist AS name, COUNT(*) AS track_count
        FROM tracks
        GROUP BY artist
        ORDER BY artist
      `)
      .all() as Artist[]
  }

  recordPlay(trackId: number) {
    this.db
      .prepare('INSERT INTO play_history (track_id) VALUES (?)')
      .run(trackId)
  }

  getRecentPlays(limit: number): Track[] {
    return this.db
      .prepare(`
        SELECT t.* FROM tracks t
        INNER JOIN play_history h ON h.track_id = t.id
        ORDER BY h.played_at DESC
        LIMIT ?
      `)
      .all(limit) as Track[]
  }

  toggleFavorite(trackId: number): boolean {
    const existing = this.db
      .prepare('SELECT 1 FROM favorites WHERE track_id = ?')
      .get(trackId)
    if (existing) {
      this.db.prepare('DELETE FROM favorites WHERE track_id = ?').run(trackId)
      return false
    } else {
      this.db.prepare('INSERT INTO favorites (track_id) VALUES (?)').run(trackId)
      return true
    }
  }

  getFavorites(): Track[] {
    return this.db
      .prepare(`
        SELECT t.* FROM tracks t
        INNER JOIN favorites f ON f.track_id = t.id
        ORDER BY f.added_at DESC
      `)
      .all() as Track[]
  }

  close() {
    this.db.close()
  }
}
