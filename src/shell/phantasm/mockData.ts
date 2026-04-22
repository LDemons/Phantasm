import type { SceneType } from './sceneUtils'

export type MockAlbum = {
  id: number
  title: string
  artist: string
  year: number
  scene: SceneType
  tracks: { id: number; title: string; dur: string; durSec: number }[]
}

export const SPOTIFY_ALBUMS: MockAlbum[] = [
  { id: 1, title: 'The Corridor Has No End', artist: 'The Pale Visitor', year: 2001, scene: 'corridor',
    tracks: [
      { id: 1, title: "Room 7 (The Door Won't Open)", dur: '4:23', durSec: 263 },
      { id: 2, title: 'Something Behind The Mirror', dur: '3:47', durSec: 227 },
      { id: 3, title: 'Yellow Wallpaper Hymn', dur: '5:12', durSec: 312 },
      { id: 4, title: 'Ascending the Wrong Staircase', dur: '6:01', durSec: 361 },
      { id: 5, title: 'The Guest Has Always Been Here', dur: '4:55', durSec: 295 },
    ] },
  { id: 2, title: 'Membrane', artist: 'Corrosive Dreams', year: 2003, scene: 'eye',
    tracks: [
      { id: 6, title: 'Soft Tissue Architecture', dur: '3:33', durSec: 213 },
      { id: 7, title: 'Your Reflection Moved First', dur: '4:11', durSec: 251 },
      { id: 8, title: "Teeth Where There Shouldn't Be", dur: '5:44', durSec: 344 },
      { id: 9, title: 'The Second Skin', dur: '3:22', durSec: 202 },
    ] },
  { id: 3, title: 'Orpheus.exe', artist: 'NULL_PROCESS', year: 2000, scene: 'static',
    tracks: [
      { id: 10, title: 'C:\\WINDOWS\\hell32.dll', dur: '2:58', durSec: 178 },
      { id: 11, title: '404: Soul Not Found', dur: '3:15', durSec: 195 },
      { id: 12, title: 'CORRUPTED_FILE_08.mp3', dur: '4:44', durSec: 284 },
      { id: 13, title: 'The Internet Never Forgets', dur: '3:57', durSec: 237 },
      { id: 14, title: 'You Are Being Watched (screensaver)', dur: '6:06', durSec: 366 },
    ] },
  { id: 4, title: 'Arboreal Remains', artist: 'The Overgrowth', year: 2002, scene: 'forest',
    tracks: [
      { id: 15, title: 'The Trees Have Names Now', dur: '5:05', durSec: 305 },
      { id: 16, title: 'Mushroom Circle Protocol', dur: '4:33', durSec: 273 },
      { id: 17, title: 'Something Watches From the Canopy', dur: '7:12', durSec: 432 },
      { id: 18, title: 'Root System Hymnal', dur: '4:48', durSec: 288 },
    ] },
  { id: 5, title: 'The Brass Sphere', artist: 'Pale Architect', year: 1999, scene: 'orb',
    tracks: [
      { id: 19, title: 'Descent Into the Mechanism', dur: '8:22', durSec: 502 },
      { id: 20, title: 'The Age of the First Library', dur: '5:30', durSec: 330 },
      { id: 21, title: 'Linking Book to Nowhere', dur: '4:07', durSec: 247 },
      { id: 22, title: "Island That Shouldn't Exist", dur: '6:44', durSec: 404 },
    ] },
]

export const SPOTIFY_PLAYLISTS = [
  { id: 1, name: 'DESCENT PROTOCOL', icon: '▼', tracks: [1, 6, 10, 15, 19, 2, 7, 11] },
  { id: 2, name: 'MIDNIGHT STATIC', icon: '■', tracks: [12, 13, 3, 8, 14, 4, 17] },
  { id: 3, name: 'THE LONG CORRIDOR', icon: '►', tracks: [5, 9, 16, 18, 20, 21, 22, 19] },
]
