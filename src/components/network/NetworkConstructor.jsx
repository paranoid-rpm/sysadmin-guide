import { useState, useRef, useCallback } from 'react'
import './NetworkConstructor.css'

const DEVICE_TYPES = [
  { type: 'router',   label: 'Router' },
  { type: 'switch',   label: 'Switch' },
  { type: 'server',   label: 'Server' },
  { type: 'pc',       label: 'PC' },
  { type: 'laptop',   label: 'Laptop' },
  { type: 'firewall', label: 'Firewall' },
  { type: 'cloud',    label: 'Cloud' },
  { type: 'printer',  label: 'Printer' },
]

const CABLE_TYPES = [
  { type: 'ethernet', label: 'Ethernet', color: '#00aaff' },
  { type: 'wifi',     label: 'Wi-Fi',    color: '#00e676' },
  { type: 'fiber',    label: 'Fiber',    color: '#ffb300' },
  { type: 'vpn',      label: 'VPN',      color: '#a78bfa' },
]

const TYPE_COLORS = {
  router: '#00aaff', switch: '#818cf8', server: '#00e676',
  pc: '#94a3b8', laptop: '#94a3b8', firewall: '#ff3d57',
  cloud: '#64748b', printer: '#94a3b8',
}

const DeviceIcon = ({ type, color, size = 36 }) => {
  const c = color
  const icons = {
    router: (
      <svg viewBox="0 0 56 56" width={size} height={size}>
        <circle cx="28" cy="28" r="20" fill="none" stroke={c} strokeWidth="2"/>
        <circle cx="28" cy="28" r="3" fill={c}/>
        <line x1="28" y1="8" x2="28" y2="22" stroke={c} strokeWidth="2"/>
        <line x1="28" y1="34" x2="28" y2="48" stroke={c} strokeWidth="2"/>
        <line x1="8" y1="28" x2="22" y2="28" stroke={c} strokeWidth="2"/>
        <line x1="34" y1="28" x2="48" y2="28" stroke={c} strokeWidth="2"/>
        <circle cx="28" cy="8" r="2.5" fill={c}/>
        <circle cx="28" cy="48" r="2.5" fill={c}/>
        <circle cx="8" cy="28" r="2.5" fill={c}/>
        <circle cx="48" cy="28" r="2.5" fill={c}/>
      </svg>
    ),
    switch: (
      <svg viewBox="0 0 56 56" width={size} height={size}>
        <rect x="4" y="18" width="48" height="20" rx="4" fill="none" stroke={c} strokeWidth="2"/>
        <rect x="9" y="23" width="5" height="10" rx="1" fill={c} opacity="0.7"/>
        <rect x="17" y="23" width="5" height="10" rx="1" fill={c} opacity="0.7"/>
        <rect x="25" y="23" width="5" height="10" rx="1" fill={c} opacity="0.7"/>
        <rect x="33" y="23" width="5" height="10" rx="1" fill={c} opacity="0.7"/>
        <circle cx="46" cy="28" r="3" fill={c}/>
      </svg>
    ),
    server: (
      <svg viewBox="0 0 56 56" width={size} height={size}>
        <rect x="10" y="6" width="36" height="44" rx="3" fill="none" stroke={c} strokeWidth="2"/>
        <rect x="14" y="12" width="28" height="7" rx="1" fill="none" stroke={c} strokeWidth="1"/>
        <rect x="14" y="23" width="28" height="7" rx="1" fill="none" stroke={c} strokeWidth="1"/>
        <rect x="14" y="34" width="28" height="7" rx="1" fill="none" stroke={c} strokeWidth="1"/>
        <circle cx="38" cy="15.5" r="2" fill={c}/>
      </svg>
    ),
    pc: (
      <svg viewBox="0 0 56 56" width={size} height={size}>
        <rect x="6" y="8" width="44" height="30" rx="3" fill="none" stroke={c} strokeWidth="2"/>
        <rect x="21" y="40" width="14" height="4" rx="1" fill={c} opacity="0.5"/>
        <rect x="16" y="44" width="24" height="3" rx="1" fill={c} opacity="0.3"/>
      </svg>
    ),
    laptop: (
      <svg viewBox="0 0 56 56" width={size} height={size}>
        <rect x="8" y="10" width="40" height="26" rx="3" fill="none" stroke={c} strokeWidth="2"/>
        <path d="M4 38 Q28 44 52 38" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    firewall: (
      <svg viewBox="0 0 56 56" width={size} height={size}>
        <path d="M28 4 L50 16 L50 32 Q50 48 28 54 Q6 48 6 32 L6 16 Z" fill="none" stroke={c} strokeWidth="2"/>
        <line x1="28" y1="22" x2="28" y2="34" stroke={c} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="28" cy="38" r="2" fill={c}/>
      </svg>
    ),
    cloud: (
      <svg viewBox="0 0 56 56" width={size} height={size}>
        <path d="M14 38 Q8 38 8 30 Q8 22 16 22 Q16 14 24 12 Q32 10 36 18 Q44 16 46 24 Q52 24 52 32 Q52 38 46 38 Z" fill="none" stroke={c} strokeWidth="2"/>
      </svg>
    ),
    printer: (
      <svg viewBox="0 0 56 56" width={size} height={size}>
        <rect x="8" y="18" width="40" height="22" rx="3" fill="none" stroke={c} strokeWidth="2"/>
        <rect x="14" y="8" width="28" height="12" rx="2" fill="none" stroke={c} strokeWidth="1.5"/>
        <rect x="14" y="32" width="28" height="10" rx="1" fill="none" stroke={c} strokeWidth="1.5"/>
        <circle cx="42" cy="26" r="2" fill={c}/>
      </svg>
    ),
  }
  return icons[type] || icons.pc
}

let nextId = 1

export default function NetworkConstructor() {
  const [devices, setDevices] = useState([])
  const [links, setLinks] = useState([])
  const [connecting, setConnecting] = useState(null)
  const [cableType, setCableType] = useState('ethernet')
  const [dragging, setDragging] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [selected, setSelected] = useState(null)
  const [validation, setValidation] = useState(null)
  const svgRef = useRef()

  const addDevice = (type) => {
    setDevices(prev => [...prev, {
      id: `dev_${nextId++}`,
      type,
      label: DEVICE_TYPES.find(d => d.type === type)?.label || type,
      x: 60 + Math.random() * 460,
      y: 60 + Math.random() * 240,
    }])
  }

  const getSVGCoords = useCallback((e) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (700 / rect.width),
      y: (e.clientY - rect.top) * (420 / rect.height),
    }
  }, [])

  const onDeviceMouseDown = (e, id) => {
    e.stopPropagation()
    if (connecting) {
      if (connecting !== id) {
        const exists = links.find(l => (l.from === connecting && l.to === id) || (l.from === id && l.to === connecting))
        if (!exists) setLinks(prev => [...prev, { id: `link_${nextId++}`, from: connecting, to: id, type: cableType }])
      }
      setConnecting(null)
      return
    }
    setSelected(id)
    const dev = devices.find(d => d.id === id)
    const coords = getSVGCoords(e)
    setDragging(id)
    setDragOffset({ x: coords.x - dev.x, y: coords.y - dev.y })
    setValidation(null)
  }

  const onSVGMouseMove = (e) => {
    if (!dragging) return
    const coords = getSVGCoords(e)
    setDevices(prev => prev.map(d => d.id === dragging
      ? { ...d, x: Math.max(0, Math.min(648, coords.x - dragOffset.x)), y: Math.max(0, Math.min(380, coords.y - dragOffset.y)) }
      : d
    ))
  }

  const onSVGMouseUp = () => setDragging(null)

  const deleteSelected = () => {
    if (!selected) return
    setDevices(prev => prev.filter(d => d.id !== selected))
    setLinks(prev => prev.filter(l => l.from !== selected && l.to !== selected))
    setSelected(null)
  }

  const clearAll = () => { setDevices([]); setLinks([]); setSelected(null); setConnecting(null); setValidation(null) }

  const validate = () => {
    const issues = []
    const connectedIds = new Set(links.flatMap(l => [l.from, l.to]))
    devices.forEach(d => {
      if (!connectedIds.has(d.id)) issues.push(`"${d.label}" not connected`)
    })
    const pcs = devices.filter(d => ['pc', 'laptop'].includes(d.type))
    pcs.forEach(pc => {
      const pcLinks = links.filter(l => l.from === pc.id || l.to === pc.id)
      const connectedTypes = pcLinks.map(l => {
        const otherId = l.from === pc.id ? l.to : l.from
        return devices.find(d => d.id === otherId)?.type
      })
      if (connectedTypes.includes('router') && !connectedTypes.includes('switch'))
        issues.push(`"${pc.label}" directly connected to router — use a switch`)
    })
    if (!devices.some(d => d.type === 'router') && devices.length > 1)
      issues.push('No router found — devices cannot reach the internet')
    setValidation(issues.length === 0 ? { ok: true, msg: 'Network topology looks correct' } : { ok: false, issues })
  }

  const getCenter = (id) => {
    const d = devices.find(d => d.id === id)
    return d ? { x: d.x + 28, y: d.y + 28 } : { x: 0, y: 0 }
  }

  const LINK_COLORS = { ethernet: '#00aaff', wifi: '#00e676', fiber: '#ffb300', vpn: '#a78bfa' }
  const LINK_DASH   = { ethernet: 'none', wifi: '6 3', fiber: 'none', vpn: '8 4' }

  return (
    <div className="constructor">
      <div className="constructor-toolbar">
        <div className="tb-group">
          <div className="tb-label">ADD DEVICE</div>
          <div className="tb-devices">
            {DEVICE_TYPES.map(d => (
              <button key={d.type} className="tb-dev-btn" onClick={() => addDevice(d.type)}>
                <DeviceIcon type={d.type} color={TYPE_COLORS[d.type]} size={22}/>
                <span>{d.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="tb-group">
          <div className="tb-label">CABLE TYPE</div>
          <div className="tb-cables">
            {CABLE_TYPES.map(c => (
              <button
                key={c.type}
                className={`tb-cable-btn${cableType === c.type ? ' active' : ''}`}
                style={{ '--cc': c.color }}
                onClick={() => setCableType(c.type)}
              >
                <span className="cable-dot" style={{ background: c.color }}/>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="tb-group tb-actions">
          <div className="tb-label">ACTIONS</div>
          <div className="tb-btns">
            <button
              className={`btn ${connecting ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              onClick={() => setConnecting(connecting ? null : (selected || 'pending'))}
            >
              {connecting ? 'Cancel' : 'Connect'}
            </button>
            <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={deleteSelected} disabled={!selected}>
              Delete
            </button>
            <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={validate} disabled={devices.length === 0}>
              Validate
            </button>
            <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px', borderColor: 'var(--red)', color: 'var(--red)' }} onClick={clearAll}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {connecting && (
        <div className="connect-hint">
          <span className="hint-dot"/>
          CONNECT MODE &mdash; click first device, then second. Cable: <strong>{cableType.toUpperCase()}</strong>
        </div>
      )}

      {validation && (
        <div className={`validation-result ${validation.ok ? 'ok' : 'fail'}`}>
          {validation.ok
            ? <><span className="val-icon ok">OK</span> {validation.msg}</>
            : <><span className="val-icon fail">WARN</span> <ul>{validation.issues.map((issue, i) => <li key={i}>{issue}</li>)}</ul></>
          }
        </div>
      )}

      <div className="constructor-canvas-wrap">
        <svg
          ref={svgRef}
          className="constructor-svg"
          viewBox="0 0 700 420"
          onMouseMove={onSVGMouseMove}
          onMouseUp={onSVGMouseUp}
        >
          <defs>
            <pattern id="cons-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,170,255,0.05)" strokeWidth="0.8"/>
            </pattern>
          </defs>
          <rect width="700" height="420" fill="url(#cons-grid)"/>

          {links.map(link => {
            const a = getCenter(link.from)
            const b = getCenter(link.to)
            const color = LINK_COLORS[link.type] || '#00aaff'
            const dash = LINK_DASH[link.type]
            return (
              <line key={link.id}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={color} strokeWidth="1.8"
                strokeDasharray={dash === 'none' ? undefined : dash}
                opacity="0.75"
              />
            )
          })}

          {devices.map(dev => {
            const color = TYPE_COLORS[dev.type] || '#94a3b8'
            const isSelected = selected === dev.id
            const isSource = connecting === dev.id
            return (
              <g
                key={dev.id}
                transform={`translate(${dev.x},${dev.y})`}
                onMouseDown={(e) => onDeviceMouseDown(e, dev.id)}
                style={{ cursor: connecting ? 'crosshair' : 'grab' }}
              >
                {isSelected && <rect x="-4" y="-4" width="64" height="64" rx="10" fill={color} opacity="0.08"/>}
                {isSource && <rect x="-4" y="-4" width="64" height="64" rx="10" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 2"/>}
                <rect x="0" y="0" width="56" height="56" rx="8"
                  fill="var(--bg3)"
                  stroke={isSelected ? color : 'var(--border2)'}
                  strokeWidth={isSelected ? '1.5' : '1'}
                />
                <DeviceIcon type={dev.type} color={color} size={36} />
                <text x="28" y="70" textAnchor="middle" fontSize="9.5" fill="var(--text2)" fontFamily="var(--mono)" fontWeight="600" letterSpacing="0.04em">
                  {dev.label}
                </text>
              </g>
            )
          })}

          {devices.length === 0 && (
            <>
              <text x="350" y="195" textAnchor="middle" fontSize="12" fill="var(--text2)" fontFamily="var(--mono)" opacity="0.5">
                ADD DEVICES FROM PANEL ABOVE
              </text>
              <text x="350" y="215" textAnchor="middle" fontSize="10" fill="var(--text2)" fontFamily="var(--mono)" opacity="0.3">
                then connect them with cables
              </text>
            </>
          )}
        </svg>
      </div>

      <div className="constructor-help">
        <span className="help-key">ADD</span> device from panel
        <span className="help-sep">&#x2192;</span>
        <span className="help-key">CONNECT</span> click two devices
        <span className="help-sep">&#x2192;</span>
        <span className="help-key">VALIDATE</span> check topology
      </div>
    </div>
  )
}
