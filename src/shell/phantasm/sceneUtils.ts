export type SceneType = 'corridor' | 'orb' | 'eye' | 'forest' | 'static'

function _px(ctx: CanvasRenderingContext2D, x: number, y: number, c: string) {
  ctx.fillStyle = c
  ctx.fillRect(x, y, 1, 1)
}

function _drawCorridor(ctx: CanvasRenderingContext2D) {
  for (let y = 0; y < 15; y++) {
    const t = y / 15
    ctx.fillStyle = `rgb(${~~(t * 18)},${~~(t * 15)},${~~(t * 24)})`
    ctx.fillRect(0, y, 40, 1)
  }
  for (let y = 25; y < 40; y++) {
    for (let x = 0; x < 40; x++) {
      const t = (y - 25) / 15
      const ts = Math.max(1, ~~(4 - t * 3))
      const ch = (~~(x / ts) + ~~((y - 25) / 2)) % 2
      const v = ~~(t * 42 + 5)
      _px(ctx, x, y, ch ? `rgb(${v},${v},${v})` : `rgb(${~~(v * 0.55)},${~~(v * 0.55)},${~~(v * 0.65)})`)
    }
  }
  for (let y = 15; y < 25; y++) {
    const t = (y - 15) / 10
    const we = ~~(t * 14)
    for (let x = 0; x < we; x++) {
      const wt = x / Math.max(1, we)
      _px(ctx, x, y, `rgb(${~~(wt * 32)},${~~(wt * 28)},${~~(wt * 42)})`)
    }
    for (let x = 40 - we; x < 40; x++) {
      const wt = (40 - x) / Math.max(1, we)
      _px(ctx, x, y, `rgb(${~~(wt * 32)},${~~(wt * 28)},${~~(wt * 42)})`)
    }
  }
  for (let y = 11; y < 29; y++) {
    for (let x = 15; x < 25; x++) {
      const dx = x - 20
      const dy = y - 20
      const d = Math.sqrt(dx * dx + dy * dy * 0.6)
      if (d < 5.5) {
        const i = Math.max(0, 1 - d / 5.5)
        ctx.fillStyle = `rgba(57,255,20,${i * 0.9})`
        ctx.fillRect(x, y, 1, 1)
      }
    }
  }
  ;[[20, 15], [19, 16], [20, 16], [21, 16], [20, 17], [20, 18], [20, 19], [19, 20], [21, 20]].forEach(
    ([x, y]) => {
      ctx.fillStyle = '#000'
      ctx.fillRect(x, y, 1, 1)
    }
  )
}

function _drawOrb(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#04030a'
  ctx.fillRect(0, 0, 40, 40)
  ;[[3, 3], [8, 7], [14, 2], [27, 4], [35, 8], [37, 13], [31, 31], [5, 29], [11, 36], [22, 34]].forEach(
    ([x, y]) => _px(ctx, x, y, `rgba(255,255,255,${0.3 + Math.random() * 0.5})`)
  )
  for (let y = 8; y < 32; y++) {
    for (let x = 8; x < 32; x++) {
      const dx = x - 20
      const dy = y - 20
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d <= 12) {
        const nx = dx / 12
        const ny = dy / 12
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny))
        const diff = Math.max(0, -nx * 0.5 - ny * 0.7 + nz * 0.5)
        const spec = Math.pow(Math.max(0, nz * 0.8 - nx * 0.3 - ny * 0.5), 10)
        _px(
          ctx,
          x,
          y,
          `rgb(${Math.min(255, ~~(60 + diff * 120 + spec * 180))},${Math.min(
            255,
            ~~(10 + diff * 20 + spec * 160)
          )},${Math.min(255, ~~(100 + diff * 80 + spec * 165))})`
        )
      }
    }
  }
}

function _drawEye(ctx: CanvasRenderingContext2D) {
  for (let y = 0; y < 40; y++)
    for (let x = 0; x < 40; x++) {
      const n = ~~(Math.random() * 3)
      _px(ctx, x, y, `rgb(${15 + n},${2 + n},${2 + n})`)
    }
  for (let y = 0; y < 40; y++)
    for (let x = 0; x < 40; x++) {
      const nx = (x - 20) / 17
      const ny = (y - 20) / 11
      if (nx * nx + ny * ny <= 1) _px(ctx, x, y, `rgb(${215 + ~~(Math.random() * 10)},208,198)`)
    }
  for (let y = 0; y < 40; y++)
    for (let x = 0; x < 40; x++) {
      const dx = x - 20
      const dy = y - 20
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d <= 8) {
        const a = Math.atan2(dy, dx)
        const s = Math.sin(a * 16) * 0.5 + 0.5
        _px(ctx, x, y, `rgb(${~~(110 + s * 65)},${~~(55 + s * 20)},8)`)
      }
    }
  for (let y = 0; y < 40; y++)
    for (let x = 0; x < 40; x++) {
      const dx = x - 20
      const dy = y - 20
      const sw = Math.abs(dy) < 9 ? 2 * (1 - Math.abs(dy) / 9) : 0
      if (Math.abs(dy) < 9 && Math.abs(dx) < sw) {
        ctx.fillStyle = '#000'
        ctx.fillRect(x, y, 1, 1)
      }
    }
  ;[[22, 9, 30, 13], [17, 10, 9, 14], [20, 31, 26, 36], [20, 31, 14, 35]].forEach(
    ([x1, y1, x2, y2]) => {
      ctx.strokeStyle = 'rgba(200,40,40,.55)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
  )
  ctx.fillStyle = 'rgba(255,255,255,.9)'
  ctx.fillRect(14, 14, 2, 2)
}

function _drawForest(ctx: CanvasRenderingContext2D) {
  for (let y = 0; y < 23; y++) {
    const t = y / 23
    ctx.fillStyle = `rgb(${~~(5 + t * 10)},0,${~~(15 + t * 15)})`
    ctx.fillRect(0, y, 40, 1)
  }
  ctx.fillStyle = 'rgb(2,3,1)'
  ctx.fillRect(0, 23, 40, 17)
  for (let y = 28; y < 32; y++)
    for (let x = 0; x < 40; x++)
      if (Math.random() < 0.55) {
        ctx.fillStyle = 'rgba(160,175,195,.1)'
        ctx.fillRect(x, y, 1, 1)
      }
  for (let y = 3; y < 9; y++)
    for (let x = 28; x < 35; x++)
      if ((x - 31) * (x - 31) + (y - 6) * (y - 6) < 8.5)
        _px(ctx, x, y, `rgb(${195 + ~~(Math.random() * 15)},190,162)`)
  ;[1, 7, 12, 18, 24, 29, 34].forEach((tx, i) => {
    const tw = [3, 2, 4, 2, 3, 2, 3][i]
    const th = [23, 21, 26, 20, 24, 20, 22][i]
    for (let y = 40 - th; y < 40; y++)
      for (let x = tx; x < tx + tw; x++)
        if (x >= 0 && x < 40) {
          ctx.fillStyle = `rgb(${~~(Math.random() * 2)},${~~(Math.random() * 2)},${1 + ~~(Math.random() * 2)})`
          ctx.fillRect(x, y, 1, 1)
        }
  })
}

function _drawStatic(ctx: CanvasRenderingContext2D) {
  for (let y = 0; y < 40; y++)
    for (let x = 0; x < 40; x++) {
      const v = ~~(Math.random() * 48)
      _px(ctx, x, y, `rgb(${v},${v + ~~(Math.random() * 7)},${v - 1})`)
    }
  for (let y = 8; y < 32; y++)
    for (let x = 10; x < 30; x++) {
      const nx = (x - 20) / 9
      const ny = (y - 20) / 11
      if (nx * nx + ny * ny <= 1) {
        const v = 32 + ~~(Math.random() * 38)
        _px(ctx, x, y, `rgb(${v},${v + 4},${v - 2})`)
      }
    }
  ;[[13, 15, 4, 3], [23, 15, 4, 3]].forEach(([ex, ey, ew, eh]) => {
    ctx.fillStyle = '#000'
    ctx.fillRect(ex, ey, ew, eh)
  })
  ctx.fillStyle = '#000'
  ctx.fillRect(15, 26, 10, 2)
  for (let y = 0; y < 40; y += 2) {
    ctx.fillStyle = 'rgba(0,0,0,.2)'
    ctx.fillRect(0, y, 40, 1)
  }
}

export function drawScene(canvas: HTMLCanvasElement, type: SceneType) {
  canvas.width = 40
  canvas.height = 40
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#04030a'
  ctx.fillRect(0, 0, 40, 40)
  if (type === 'corridor') _drawCorridor(ctx)
  else if (type === 'orb') _drawOrb(ctx)
  else if (type === 'eye') _drawEye(ctx)
  else if (type === 'forest') _drawForest(ctx)
  else if (type === 'static') _drawStatic(ctx)
}

const SCENES: SceneType[] = ['corridor', 'orb', 'eye', 'forest', 'static']
export function pickScene(seed: string): SceneType {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return SCENES[Math.abs(h) % SCENES.length]
}
