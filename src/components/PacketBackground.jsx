import { useEffect, useRef } from 'react'
import './PacketBackground.css'

const COLS = 14
const ROWS = 8
const PACKET_COUNT = 40

export default function PacketBackground() {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let W = 0, H = 0

    // --- Nodes (recomputed on resize) ---
    const nodes = Array.from({ length: COLS * ROWS }, () => ({ x: 0, y: 0 }))

    const computeNodes = () => {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const n = nodes[r * COLS + c]
          n.x = (c / (COLS - 1)) * W
          n.y = (r / (ROWS - 1)) * H
        }
      }
    }

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
      computeNodes()
    }
    resize()
    window.addEventListener('resize', resize)

    // --- Edges ---
    const edges = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c
        if (c + 1 < COLS) edges.push([i, r * COLS + c + 1])
        if (r + 1 < ROWS) edges.push([i, (r + 1) * COLS + c])
        // diagonal (sparse)
        if (c + 1 < COLS && r + 1 < ROWS && (r + c) % 3 === 0)
          edges.push([i, (r + 1) * COLS + c + 1])
      }
    }

    // --- Path builder ---
    const buildPath = (startNode) => {
      const hops = 3 + Math.floor(Math.random() * 5)
      const path = [startNode]
      let cur = startNode
      for (let i = 0; i < hops; i++) {
        const neighbors = edges
          .filter(e => e[0] === cur || e[1] === cur)
          .map(e => e[0] === cur ? e[1] : e[0])
          .filter(n => n !== path[path.length - 2])
        if (!neighbors.length) break
        cur = neighbors[Math.floor(Math.random() * neighbors.length)]
        path.push(cur)
      }
      return path.length > 1 ? path : null
    }

    // --- Packets ---
    const mkPacket = () => {
      const start = Math.floor(Math.random() * nodes.length)
      const path = buildPath(start)
      if (!path) return null
      const blue = Math.random() > 0.25
      return {
        path,
        pathIdx: 0,
        t: Math.random(),
        speed: 0.0025 + Math.random() * 0.005,
        color: blue ? '#00aaff' : '#00e676',
        rgba: blue ? [0, 170, 255] : [0, 230, 118],
        size: 1.8 + Math.random() * 2,
        trail: [],
      }
    }

    const packets = []
    while (packets.length < PACKET_COUNT) {
      const p = mkPacket()
      if (p) packets.push(p)
    }

    // --- Draw loop ---
    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // Grid edges
      ctx.lineWidth = 0.6
      edges.forEach(([a, b]) => {
        const na = nodes[a], nb = nodes[b]
        // fade diagonal edges more
        const diag = na.x !== nb.x && na.y !== nb.y
        ctx.strokeStyle = diag ? 'rgba(0,170,255,0.03)' : 'rgba(0,170,255,0.055)'
        ctx.beginPath()
        ctx.moveTo(na.x, na.y)
        ctx.lineTo(nb.x, nb.y)
        ctx.stroke()
      })

      // Grid nodes
      nodes.forEach(n => {
        ctx.beginPath()
        ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,170,255,0.14)'
        ctx.fill()
      })

      // Packets
      packets.forEach((p, pi) => {
        if (!p.path || p.path.length < 2) return

        p.t += p.speed
        if (p.t >= 1) {
          p.t -= 1
          p.pathIdx++
          if (p.pathIdx >= p.path.length - 1) {
            const np = mkPacket()
            if (np) packets[pi] = np
            return
          }
        }

        const a = nodes[p.path[p.pathIdx]]
        const b = nodes[p.path[p.pathIdx + 1]]
        if (!a || !b) return

        const x = a.x + (b.x - a.x) * p.t
        const y = a.y + (b.y - a.y) * p.t

        // Trail
        p.trail.push({ x, y })
        if (p.trail.length > 14) p.trail.shift()

        const [r, g, bl] = p.rgba
        p.trail.forEach((pt, i) => {
          const frac = i / p.trail.length
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, p.size * frac * 0.7, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r},${g},${bl},${frac * 0.45})`
          ctx.fill()
        })

        // Packet body (rotated square)
        const s = p.size
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(Math.PI / 4)
        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.9
        ctx.fillRect(-s, -s, s * 2, s * 2)
        ctx.restore()
        ctx.globalAlpha = 1

        // Glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, p.size * 3)
        glow.addColorStop(0, `rgba(${r},${g},${bl},0.28)`)
        glow.addColorStop(1, `rgba(${r},${g},${bl},0)`)
        ctx.beginPath()
        ctx.arc(x, y, p.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="packet-bg" />
}
