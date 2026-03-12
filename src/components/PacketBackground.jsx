import { useEffect, useRef } from 'react'
import './PacketBackground.css'

export default function PacketBackground() {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let W, H

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Grid nodes
    const COLS = 10, ROWS = 6
    const nodes = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        nodes.push({
          x: (c / (COLS - 1)) * W,
          y: (r / (ROWS - 1)) * H,
        })
      }
    }

    // Edges between adjacent nodes
    const edges = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c
        if (c + 1 < COLS) edges.push([i, r * COLS + c + 1])
        if (r + 1 < ROWS) edges.push([i, (r + 1) * COLS + c])
      }
    }

    // Packets
    const packets = []
    const PACKET_COUNT = 28

    const spawnPacket = () => {
      const edgeIdx = Math.floor(Math.random() * edges.length)
      const [a, b] = edges[edgeIdx]
      const reverse = Math.random() > 0.5
      const from = reverse ? b : a
      const to = reverse ? a : b
      packets.push({
        from, to,
        t: 0,
        speed: 0.004 + Math.random() * 0.006,
        color: Math.random() > 0.3 ? '#00aaff' : '#00e676',
        size: 2.5 + Math.random() * 2,
        trail: [],
        hops: Math.floor(2 + Math.random() * 4),
        currentHop: 0,
        path: [],
      })
    }

    // Build multi-hop path
    const buildPath = (p) => {
      const path = [p.from]
      let cur = p.from
      for (let i = 0; i < p.hops; i++) {
        const neighbors = edges
          .filter(e => e[0] === cur || e[1] === cur)
          .map(e => e[0] === cur ? e[1] : e[0])
          .filter(n => n !== path[path.length - 2])
        if (!neighbors.length) break
        cur = neighbors[Math.floor(Math.random() * neighbors.length)]
        path.push(cur)
      }
      return path
    }

    for (let i = 0; i < PACKET_COUNT; i++) {
      const edgeIdx = Math.floor(Math.random() * edges.length)
      const [a, b] = edges[edgeIdx]
      const p = {
        from: a, to: b, t: Math.random(),
        speed: 0.003 + Math.random() * 0.007,
        color: Math.random() > 0.3 ? '#00aaff' : '#00e676',
        size: 2 + Math.random() * 2.5,
        trail: [],
        path: null,
        pathIdx: 0,
      }
      p.path = buildPath(p)
      p.pathIdx = Math.floor(Math.random() * (p.path.length - 1))
      packets.push(p)
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // Recalc node positions on resize
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          nodes[r * COLS + c].x = (c / (COLS - 1)) * W
          nodes[r * COLS + c].y = (r / (ROWS - 1)) * H
        }
      }

      // Draw edges
      ctx.strokeStyle = 'rgba(0,170,255,0.06)'
      ctx.lineWidth = 0.8
      edges.forEach(([a, b]) => {
        ctx.beginPath()
        ctx.moveTo(nodes[a].x, nodes[a].y)
        ctx.lineTo(nodes[b].x, nodes[b].y)
        ctx.stroke()
      })

      // Draw nodes
      nodes.forEach(n => {
        ctx.beginPath()
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,170,255,0.18)'
        ctx.fill()
      })

      // Update & draw packets
      packets.forEach(p => {
        if (!p.path || p.path.length < 2) return
        p.t += p.speed
        if (p.t >= 1) {
          p.t = 0
          p.pathIdx++
          if (p.pathIdx >= p.path.length - 1) {
            // Rebuild path
            p.path = buildPath(p)
            p.pathIdx = 0
          }
        }
        const fromNode = nodes[p.path[p.pathIdx]]
        const toNode = nodes[p.path[p.pathIdx + 1]]
        if (!fromNode || !toNode) return

        const x = fromNode.x + (toNode.x - fromNode.x) * p.t
        const y = fromNode.y + (toNode.y - fromNode.y) * p.t

        // Trail
        p.trail.push({ x, y })
        if (p.trail.length > 12) p.trail.shift()

        p.trail.forEach((pt, i) => {
          const alpha = (i / p.trail.length) * 0.5
          const r = p.size * (i / p.trail.length) * 0.8
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2)
          ctx.fillStyle = p.color === '#00aaff'
            ? `rgba(0,170,255,${alpha})`
            : `rgba(0,230,118,${alpha})`
          ctx.fill()
        })

        // Packet square (data packet style)
        const s = p.size
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(Math.PI / 4)
        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.85
        ctx.fillRect(-s, -s, s * 2, s * 2)
        ctx.globalAlpha = 1
        ctx.restore()

        // Glow
        ctx.beginPath()
        ctx.arc(x, y, p.size * 2.5, 0, Math.PI * 2)
        const grd = ctx.createRadialGradient(x, y, 0, x, y, p.size * 2.5)
        grd.addColorStop(0, p.color === '#00aaff' ? 'rgba(0,170,255,0.3)' : 'rgba(0,230,118,0.3)')
        grd.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grd
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
