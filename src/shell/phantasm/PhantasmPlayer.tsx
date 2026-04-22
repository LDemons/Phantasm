import { useState, useEffect, useRef, useMemo, useLayoutEffect, Fragment } from 'react'
import { drawScene, pickScene, type SceneType } from './sceneUtils'
import { SPOTIFY_ALBUMS, SPOTIFY_PLAYLISTS } from './mockData'
import { useLibraryStore } from '../../store/library.store'
import { usePlayerStore, type Track as StoreTrack } from '../../store/player.store'
import { useAudio, useAudioControls } from '../../hooks/useAudio'
import './PhantasmPlayer.css'

type Source = 'local' | 'spotify'

type PAlbum = {
  id: string
  title: string
  artist: string
  year: number | null
  scene: SceneType
  trackIds: string[]
}

type PTrack = {
  id: string
  title: string
  artist: string
  dur: string
  durSec: number
  album: PAlbum
  storeTrack?: StoreTrack
}

type PPlaylist = { id: string; name: string; icon: string; trackIds: string[] }

type PData = { albums: PAlbum[]; allTracks: PTrack[]; playlists: PPlaylist[] }

const fmtDur = (sec: number) => {
  const s = Math.max(0, Math.floor(sec))
  return `${~~(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function useSpotifyData(): PData {
  return useMemo(() => {
    const albums: PAlbum[] = SPOTIFY_ALBUMS.map((a) => ({
      id: `s:${a.id}`,
      title: a.title,
      artist: a.artist,
      year: a.year,
      scene: a.scene,
      trackIds: a.tracks.map((t) => `s:${t.id}`),
    }))
    const allTracks: PTrack[] = SPOTIFY_ALBUMS.flatMap((a) => {
      const album = albums.find((x) => x.id === `s:${a.id}`)!
      return a.tracks.map((t) => ({
        id: `s:${t.id}`,
        title: t.title,
        artist: a.artist,
        dur: t.dur,
        durSec: t.durSec,
        album,
      }))
    })
    const playlists: PPlaylist[] = SPOTIFY_PLAYLISTS.map((p) => ({
      id: `s:p${p.id}`,
      name: p.name,
      icon: p.icon,
      trackIds: p.tracks.map((id) => `s:${id}`),
    }))
    return { albums, allTracks, playlists }
  }, [])
}

function useLocalData(): PData {
  const tracks = useLibraryStore((s) => s.tracks)
  return useMemo(() => {
    const albumMap = new Map<string, PAlbum>()
    const allTracks: PTrack[] = []

    for (const t of tracks) {
      const albumKey = `${t.album_artist || t.artist}::${t.album}`
      let album = albumMap.get(albumKey)
      if (!album) {
        album = {
          id: `l:${albumKey}`,
          title: t.album || 'Unknown Album',
          artist: t.album_artist || t.artist || 'Unknown',
          year: t.year,
          scene: pickScene(albumKey),
          trackIds: [],
        }
        albumMap.set(albumKey, album)
      }
      const tid = `l:${t.id}`
      album.trackIds.push(tid)
      allTracks.push({
        id: tid,
        title: t.title || 'Untitled',
        artist: t.artist || album.artist,
        dur: fmtDur(t.duration),
        durSec: Math.max(1, Math.floor(t.duration)),
        album,
        storeTrack: t,
      })
    }

    return { albums: [...albumMap.values()], allTracks, playlists: [] }
  }, [tracks])
}

function CgiBg() {
  const orbs: { cls: string; w: number; h: number; l?: string; r?: string; t: string; o: number; d: number }[] = [
    { cls: 'ph-orb-m', w: 54, h: 54, l: '11%', t: '18%', o: 0.72, d: 0 },
    { cls: 'ph-orb-c', w: 33, h: 33, r: '12%', t: '9%', o: 0.62, d: 1 },
    { cls: 'ph-orb-m', w: 76, h: 76, r: '5%', t: '28%', o: 0.48, d: 2 },
    { cls: 'ph-orb-g', w: 27, h: 27, l: '32%', t: '42%', o: 0.58, d: 0.5 },
    { cls: 'ph-orb-c', w: 46, h: 46, l: '4%', t: '50%', o: 0.36, d: 3 },
    { cls: 'ph-orb-g', w: 40, h: 40, l: '57%', t: '12%', o: 0.52, d: 1.5 },
  ]
  return (
    <div className="ph-cgi-bg">
      <div className="ph-cgi-sky" />
      <div className="ph-cgi-horizon" />
      <div className="ph-cgi-floor" />
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={`ph-orb ${orb.cls}`}
          style={{
            width: orb.w,
            height: orb.h,
            left: orb.l,
            right: orb.r,
            top: orb.t,
            opacity: orb.o,
            animation: `ph-orbFloat ${5 + i}s ease-in-out infinite ${orb.d}s`,
          }}
        />
      ))}
    </div>
  )
}

function ArtCanvas({ scene, isPlaying, isGlitching }: { scene: SceneType; isPlaying: boolean; isGlitching: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (ref.current) drawScene(ref.current, scene)
  }, [scene])
  return (
    <div className={`ph-art-wrap ${isGlitching ? 'glitching' : ''}`}>
      {isPlaying && <div className="ph-art-ring" />}
      <canvas ref={ref} className="ph-art-canvas" width={40} height={40} style={{ width: 220, height: 220 }} />
    </div>
  )
}

function MiniThumb({ scene }: { scene: SceneType }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (ref.current) drawScene(ref.current, scene)
  }, [scene])
  return <canvas ref={ref} className="ph-ac-thumb" width={40} height={40} />
}

function PBar({ progress, onSeek }: { progress: number; onSeek: (p: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const click = (e: React.MouseEvent) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    onSeek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)))
  }
  return (
    <div ref={ref} className="ph-pbar" onClick={click}>
      <div className="ph-pfill" style={{ width: `${progress * 100}%` }} />
      <div className="ph-pthumb" style={{ left: `${progress * 100}%` }} />
    </div>
  )
}

function TrackItem({
  track, num, isCur, onSelect, indent,
}: { track: PTrack; num: number; isCur: boolean; onSelect: () => void; indent?: boolean }) {
  return (
    <div
      className={`ph-ti ${isCur ? 'cur' : ''}`}
      style={indent ? { paddingLeft: 22 } : undefined}
      onClick={onSelect}
    >
      <span className="ph-ti-num">{isCur ? '▶' : String(num).padStart(2, '0')}</span>
      <div className="ph-ti-info">
        <div className="ph-ti-title">{track.title}</div>
        <div className="ph-ti-artist">{track.artist}</div>
      </div>
      <span className="ph-ti-dur">{track.dur}</span>
    </div>
  )
}

type View = 'library' | 'albums' | 'playlists' | 'search'

export default function PhantasmPlayer() {
  // Initialize audio engine (singleton)
  useAudio()
  const audio = useAudioControls()

  // Player store (shared with audio engine)
  const setStoreQueue = usePlayerStore((s) => s.setQueue)
  const playerState = usePlayerStore((s) => s.state)
  const playerVolume = usePlayerStore((s) => s.volume)
  const storePosition = usePlayerStore((s) => s.position)
  const setStoreVolume = usePlayerStore((s) => s.setVolume)

  // Library bootstrap
  const loadLibrary = useLibraryStore((s) => s.loadLibrary)
  const scanFolder = useLibraryStore((s) => s.scanFolder)
  const scanning = useLibraryStore((s) => s.scanning)
  const scanProgress = useLibraryStore((s) => s.scanProgress)
  useEffect(() => { loadLibrary() }, [loadLibrary])

  const [source, setSource] = useState<Source>('local')
  const localData = useLocalData()
  const spotifyData = useSpotifyData()
  const data = source === 'local' ? localData : spotifyData

  const [curId, setCurId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0) // 0..1, used for spotify mock + display
  const [view, setView] = useState<View>('library')
  const [selAlbum, setSelAlbum] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off')
  const [glitch, setGlitch] = useState(false)
  const [showTweaks, setShowTweaks] = useState(false)
  const [cfg, setCfg] = useState({ scanlines: true, glitchFreq: 'low' as 'low' | 'medium' | 'high', colorScheme: 'purple' as 'green' | 'purple' | 'red' })
  const [clock, setClock] = useState('')
  const [btmMsg, setBtmMsg] = useState('SYSTEM NOMINAL')

  // Pick a default current track once data exists
  useEffect(() => {
    if (!curId && data.allTracks.length > 0) setCurId(data.allTracks[0].id)
    if (curId && !data.allTracks.find((t) => t.id === curId)) {
      setCurId(data.allTracks[0]?.id ?? null)
    }
  }, [data, curId])

  const curTrack = data.allTracks.find((t) => t.id === curId) ?? null
  const isLocal = source === 'local'

  // For Spotify mock mode we keep our own playing flag
  const [spotifyPlaying, setSpotifyPlaying] = useState(false)
  const effectivePlaying = isLocal ? playerState === 'playing' : spotifyPlaying

  // Real progress for local tracks comes from store; for spotify we tick locally
  const displayProgress = isLocal && curTrack ? Math.min(1, storePosition / curTrack.durSec) : progress

  // Spotify fake ticker
  const progRef = useRef(progress)
  progRef.current = progress
  useEffect(() => {
    if (isLocal || !spotifyPlaying || !curTrack) return
    const iv = window.setInterval(() => {
      const np = progRef.current + 1 / curTrack.durSec
      if (np >= 1) {
        // advance
        const idx = queueIds.indexOf(curTrack.id)
        const nxt = queueIds[(idx + 1) % queueIds.length]
        if (nxt) {
          setCurId(nxt)
          setProgress(0)
        } else {
          setSpotifyPlaying(false)
        }
      } else setProgress(np)
    }, 1000)
    return () => window.clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocal, spotifyPlaying, curTrack?.id])

  // Glitch
  useEffect(() => {
    const freq = { low: 18000, medium: 7000, high: 2500 }[cfg.glitchFreq]
    const msgs = ['CORRUPTED SECTOR DETECTED', 'NULL REFERENCE AT 0x000000', 'GHOST IN THE MACHINE', 'DO NOT TURN AROUND', 'IT KNOWS YOU ARE HERE', 'MEMORY LEAK: SOUL.DLL', 'ERROR: REALITY FRAGMENTED']
    const iv = window.setInterval(() => {
      if (Math.random() < 0.45) {
        setGlitch(true)
        setBtmMsg(msgs[~~(Math.random() * msgs.length)])
        window.setTimeout(() => { setGlitch(false); setBtmMsg('SYSTEM NOMINAL') }, 250 + Math.random() * 350)
      }
    }, freq)
    return () => window.clearInterval(iv)
  }, [cfg.glitchFreq])

  // Clock
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setClock(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`)
    }
    tick()
    const iv = window.setInterval(tick, 1000)
    return () => window.clearInterval(iv)
  }, [])

  // Color scheme
  const rootRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const schemes: Record<string, [string, string, string, string]> = {
      green: ['#39ff14', '#1c7a08', 'rgba(57,255,20,.12)', '#dd22ff'],
      purple: ['#cc44ff', '#6a1a9a', 'rgba(200,68,255,.12)', '#39ff14'],
      red: ['#ff2244', '#880018', 'rgba(255,34,68,.12)', '#dd22ff'],
    }
    const [g, gd, gg, mag] = schemes[cfg.colorScheme] ?? schemes.purple
    el.style.setProperty('--ph-green', g)
    el.style.setProperty('--ph-gdim', gd)
    el.style.setProperty('--ph-gglow', gg)
    el.style.setProperty('--ph-mag', mag)
  }, [cfg.colorScheme])

  // Queue (album-first ordering)
  const queueIds = useMemo(() => {
    if (!curTrack) return data.allTracks.map((t) => t.id)
    if (shuffle) {
      const ids = data.allTracks.map((t) => t.id)
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[ids[i], ids[j]] = [ids[j], ids[i]]
      }
      return ids
    }
    const album = curTrack.album
    return [
      ...album.trackIds,
      ...data.allTracks.filter((t) => t.album.id !== album.id).map((t) => t.id),
    ]
  }, [shuffle, curTrack, data.allTracks])

  const queue = useMemo(
    () => queueIds.map((id) => data.allTracks.find((t) => t.id === id)).filter((x): x is PTrack => !!x),
    [queueIds, data.allTracks]
  )

  // Sync local queue to player store whenever it changes (so audio engine + nextTrack work)
  useEffect(() => {
    if (!isLocal) return
    const storeTracks = queue.map((q) => q.storeTrack).filter((x): x is StoreTrack => !!x)
    const idx = curTrack?.storeTrack ? storeTracks.findIndex((t) => t.id === curTrack.storeTrack!.id) : 0
    if (storeTracks.length > 0) setStoreQueue(storeTracks, Math.max(0, idx))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocal, curTrack?.id, queueIds.join(',')])

  const handleSelect = (id: string) => {
    setCurId(id)
    setProgress(0)
    if (isLocal) {
      const t = data.allTracks.find((x) => x.id === id)
      if (t?.storeTrack) {
        // pushing the store-track triggers useAudio to load + play
        usePlayerStore.getState().setTrack(t.storeTrack)
        audio.play()
      }
    } else {
      setSpotifyPlaying(true)
    }
  }

  const handlePlayPause = () => {
    if (!curTrack) return
    if (isLocal) {
      if (playerState === 'playing') audio.pause()
      else {
        if (!curTrack.storeTrack) return
        if (usePlayerStore.getState().track?.id !== curTrack.storeTrack.id) {
          usePlayerStore.getState().setTrack(curTrack.storeTrack)
        }
        audio.play()
      }
    } else {
      setSpotifyPlaying((p) => !p)
    }
  }

  const handlePrev = () => {
    if (displayProgress > 0.05) {
      if (isLocal && curTrack) audio.seek(0)
      else setProgress(0)
      return
    }
    if (!curTrack) return
    const idx = queueIds.indexOf(curTrack.id)
    const prv = queueIds[(idx - 1 + queueIds.length) % queueIds.length]
    if (prv) handleSelect(prv)
  }

  const handleNext = () => {
    if (!curTrack) return
    const idx = queueIds.indexOf(curTrack.id)
    const nxt = queueIds[(idx + 1) % queueIds.length]
    if (nxt) handleSelect(nxt)
  }

  const handleSeek = (p: number) => {
    if (!curTrack) return
    if (isLocal) audio.seek(p * curTrack.durSec)
    else setProgress(p)
  }

  const handleScan = async () => {
    const folder = window.prompt('Folder path to scan (absolute):')
    if (folder) await scanFolder(folder)
  }

  const handleSwitchSource = (s: Source) => {
    if (s === source) return
    if (isLocal) audio.pause()
    else setSpotifyPlaying(false)
    setSource(s)
    setCurId(null)
    setProgress(0)
  }

  const filteredTracks = useMemo(() => {
    if (view !== 'search' || !query) return data.allTracks
    const q = query.toLowerCase()
    return data.allTracks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.album.title.toLowerCase().includes(q)
    )
  }, [view, query, data.allTracks])

  const statusMsg = 'WARNING: ANOMALOUS AUDIO DETECTED // DO NOT LISTEN ALONE // TRACK 7 HAS BEEN REMOVED FOR YOUR SAFETY // PLAYBACK COUNT: ??? // SYSTEM INTEGRITY: COMPROMISED // ALL SONGS ARE REAL // YOU HAVE BEEN LISTENING FOR TOO LONG'

  const elapsed = curTrack ? fmtDur(displayProgress * curTrack.durSec) : '0:00'
  const totalDur = curTrack?.dur ?? '0:00'

  const isEmpty = data.allTracks.length === 0

  return (
    <div ref={rootRef} className={`phantasm-root ph-flicker ${cfg.scanlines ? '' : 'scanlines-off'}`}>
      <div className="ph-scan-move" />

      <div className="ph-topbar">
        <span className="ph-topbar-winicon">▣</span>
        <span className="ph-topbar-logo">PHANTASM</span>
        <span className="ph-topbar-sep">//</span>
        <div className="ph-source-toggle">
          <button className={`ph-src-btn ${source === 'local' ? 'on' : ''}`} onClick={() => handleSwitchSource('local')}>LOCAL</button>
          <button className={`ph-src-btn ${source === 'spotify' ? 'on' : ''}`} onClick={() => handleSwitchSource('spotify')}>SPOTIFY</button>
          {source === 'local' && (
            <button className="ph-src-btn scan" onClick={handleScan} disabled={scanning}>
              {scanning ? `SCAN ${scanProgress?.processed ?? 0}/${scanProgress?.total ?? 0}` : '+ SCAN'}
            </button>
          )}
        </div>
        <span className="ph-topbar-sep">|</span>
        <span className="ph-topbar-stat">SYS:{glitch ? '⚠ UNSTABLE' : 'NOMINAL'}</span>
        <span className="ph-topbar-sep">|</span>
        <span className="ph-topbar-stat">MEM:666/∞</span>
        <span className="ph-topbar-sep">|</span>
        <div className="ph-topbar-scroll">
          <span className="ph-topbar-msg">{statusMsg}</span>
        </div>
        <span className="ph-topbar-time">{clock}</span>
        <div className="ph-win-btns">
          <div className="ph-win-btn" onClick={() => window.phantasm?.window.minimize()}>−</div>
          <div className="ph-win-btn" onClick={() => window.phantasm?.window.maximize()}>□</div>
          <div className="ph-win-btn ph-win-close" onClick={() => setShowTweaks((s) => !s)}>✕</div>
        </div>
      </div>

      <div className="ph-main-row">
        {/* LEFT SIDEBAR */}
        <div className="ph-sl">
          <div className="ph-logo">
            PHANTASM
            <div className="ph-logo-sub">v2.0.0.1 // SOURCE: {source.toUpperCase()}</div>
          </div>
          <nav className="ph-snav">
            {(['library', 'albums', 'playlists'] as View[]).map((v) => (
              <button key={v} className={view === v ? 'active' : ''} onClick={() => { setView(v); setQuery('') }}>
                {`▸ ${v.toUpperCase()}`}
              </button>
            ))}
          </nav>
          <div className="ph-search-wrap">
            <input
              className="ph-search-inp"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setView(e.target.value ? 'search' : 'library') }}
              placeholder="SEARCH_QUERY.EXE"
            />
          </div>
          <div className="ph-sc">
            {scanning ? (
              <div className="ph-scan-prog">
                SCANNING…
                <div className="pf"><div style={{ width: `${scanProgress?.total ? (scanProgress.processed / scanProgress.total) * 100 : 0}%` }} /></div>
                {scanProgress?.processed ?? 0} / {scanProgress?.total ?? 0}
                <br />
                {scanProgress?.current?.split(/[\\/]/).slice(-1)[0] ?? ''}
              </div>
            ) : isEmpty ? (
              source === 'local' ? (
                <div className="ph-empty-cta">
                  <div className="ph-empty-cta-msg">NO TRACKS INDEXED.<br />POINT ME AT A FOLDER.</div>
                  <button onClick={handleScan}>+ SCAN FOLDER</button>
                </div>
              ) : (
                <div className="ph-empty-msg">SPOTIFY NOT CONNECTED.<br />MOCK CATALOG LOADED.</div>
              )
            ) : view === 'library' ? (
              <>
                <div className="ph-sec-hdr">ALL TRACKS — {data.allTracks.length} ENTRIES</div>
                {data.allTracks.map((t, i) => (
                  <TrackItem key={t.id} track={t} num={i + 1} isCur={t.id === curId} onSelect={() => handleSelect(t.id)} />
                ))}
              </>
            ) : view === 'albums' ? (
              <>
                <div className="ph-sec-hdr">ALBUMS — {data.albums.length} FOUND</div>
                {data.albums.map((album) => (
                  <Fragment key={album.id}>
                    <div
                      className={`ph-ac ${selAlbum === album.id ? 'sel' : ''}`}
                      onClick={() => setSelAlbum(selAlbum === album.id ? null : album.id)}
                    >
                      <MiniThumb scene={album.scene} />
                      <div className="ph-ac-info">
                        <div className="ph-ac-title">{album.title}</div>
                        <div className="ph-ac-artist">{album.artist}{album.year ? ` · ${album.year}` : ''}</div>
                      </div>
                      <span className="ph-ac-chevron">{selAlbum === album.id ? '▲' : '▼'}</span>
                    </div>
                    {selAlbum === album.id && album.trackIds.map((tid, i) => {
                      const t = data.allTracks.find((x) => x.id === tid)
                      return t ? <TrackItem key={tid} track={t} num={i + 1} isCur={tid === curId} onSelect={() => handleSelect(tid)} indent /> : null
                    })}
                  </Fragment>
                ))}
              </>
            ) : view === 'playlists' ? (
              data.playlists.length === 0 ? (
                <div className="ph-empty-msg">NO PLAYLISTS YET.</div>
              ) : (
                <>
                  <div className="ph-sec-hdr">PLAYLISTS</div>
                  {data.playlists.map((pl) => (
                    <Fragment key={pl.id}>
                      <div className="ph-pl-item" onClick={() => setSelAlbum(selAlbum === pl.id ? null : pl.id)}>
                        <span className="ph-pl-icon">{pl.icon}</span>
                        <span className="ph-pl-name">{pl.name}</span>
                        <span className="ph-pl-count">{pl.trackIds.length} TRK</span>
                      </div>
                      {selAlbum === pl.id && pl.trackIds.map((tid, i) => {
                        const t = data.allTracks.find((x) => x.id === tid)
                        return t ? <TrackItem key={tid} track={t} num={i + 1} isCur={tid === curId} onSelect={() => handleSelect(tid)} indent /> : null
                      })}
                    </Fragment>
                  ))}
                </>
              )
            ) : (
              <>
                <div className="ph-sec-hdr">{filteredTracks.length} RESULTS FOR "{query.toUpperCase()}"</div>
                {filteredTracks.length === 0
                  ? <div className="ph-empty-msg">NO RESULTS FOUND.<br />IT WAS NEVER HERE.</div>
                  : filteredTracks.map((t, i) => (
                    <TrackItem key={t.id} track={t} num={i + 1} isCur={t.id === curId} onSelect={() => handleSelect(t.id)} />
                  ))}
              </>
            )}
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className={`ph-cp ${glitch ? 'glitching' : ''}`}>
          <CgiBg />
          <div className="ph-cp-content">
            {curTrack ? (
              <>
                <ArtCanvas scene={curTrack.album.scene} isPlaying={effectivePlaying} isGlitching={glitch} />
                <div className="ph-now-title">{curTrack.title}</div>
                <div className="ph-now-artist">{curTrack.artist}</div>
                <div className="ph-now-album">{curTrack.album.title}{curTrack.album.year ? ` · ${curTrack.album.year}` : ''}</div>
                <div className="ph-time-row">
                  <span className="ph-tlabel">{elapsed}</span>
                  <PBar progress={displayProgress} onSeek={handleSeek} />
                  <span className="ph-tlabel">{totalDur}</span>
                </div>
                <div className="ph-controls">
                  <button className={`ph-cb sm ${shuffle ? 'on' : ''}`} onClick={() => setShuffle((s) => !s)}>SHFL</button>
                  <button className="ph-cb" onClick={handlePrev}>◀◀</button>
                  <button className="ph-cb play" onClick={handlePlayPause}>{effectivePlaying ? '■■' : '▶'}</button>
                  <button className="ph-cb" onClick={handleNext}>▶▶</button>
                  <button className={`ph-cb sm ${repeat !== 'off' ? 'on' : ''}`} onClick={() => setRepeat((r) => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')}>{repeat === 'one' ? 'RP1' : 'RPT'}</button>
                </div>
                <div className="ph-vol-row">
                  <span className="ph-vlabel">VOL</span>
                  <input type="range" min="0" max="1" step="0.01" value={playerVolume} onChange={(e) => setStoreVolume(parseFloat(e.target.value))} />
                  <span className="ph-vlabel">{Math.round(playerVolume * 100)}</span>
                </div>
              </>
            ) : (
              <div style={{ fontFamily: 'Press Start 2P', fontSize: 8, color: 'var(--ph-tdim)', textAlign: 'center', lineHeight: 2 }}>
                NO SIGNAL.<br />SELECT A TRACK FROM THE LEFT.
              </div>
            )}
          </div>
        </div>

        {/* QUEUE */}
        <div className="ph-sr">
          <div className="ph-qhdr">NEXT IN QUEUE</div>
          <div className="ph-ql">
            {(() => {
              if (!curTrack) return null
              const ci = queue.findIndex((t) => t.id === curTrack.id)
              const visible = [...queue.slice(ci), ...queue.slice(0, ci)].slice(0, 30)
              return visible.map((t, i) => (
                <div key={`${t.id}-${i}`} className={`ph-qi ${t.id === curId && i === 0 ? 'cur' : ''}`} onClick={() => handleSelect(t.id)}>
                  <span className="ph-qn">{String(i + 1).padStart(2, '0')}</span>
                  <div className="ph-qi-info">
                    <div className="ph-qt">{t.title}</div>
                    <div className="ph-qa">{t.artist}</div>
                  </div>
                  <span className="ph-qd">{t.dur}</span>
                </div>
              ))
            })()}
          </div>
        </div>
      </div>

      <div className="ph-btmbar">
        <span className="ph-btm-msg">{btmMsg}</span>
        <span className="ph-btm-cursor">█</span>
      </div>

      {showTweaks && (
        <div className="ph-tweaks">
          <div className="ph-tweaks-title">// TWEAKS</div>
          <div className="ph-tw-row">
            <span className="ph-tw-lbl">SCANLINES</span>
            <div className="ph-tw-opts">
              {[true, false].map((v) => (
                <button key={String(v)} className={`ph-twbtn ${cfg.scanlines === v ? 'on' : ''}`} onClick={() => setCfg((p) => ({ ...p, scanlines: v }))}>
                  {v ? 'ON' : 'OFF'}
                </button>
              ))}
            </div>
          </div>
          <div className="ph-tw-row">
            <span className="ph-tw-lbl">GLITCH</span>
            <div className="ph-tw-opts">
              {(['low', 'medium', 'high'] as const).map((v) => (
                <button key={v} className={`ph-twbtn ${cfg.glitchFreq === v ? 'on' : ''}`} onClick={() => setCfg((p) => ({ ...p, glitchFreq: v }))}>
                  {v[0].toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="ph-tw-row">
            <span className="ph-tw-lbl">COLOR</span>
            <div className="ph-tw-opts">
              {(['green', 'purple', 'red'] as const).map((v) => (
                <button key={v} className={`ph-twbtn ${cfg.colorScheme === v ? 'on' : ''}`} onClick={() => setCfg((p) => ({ ...p, colorScheme: v }))}>
                  {v.slice(0, 3).toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

