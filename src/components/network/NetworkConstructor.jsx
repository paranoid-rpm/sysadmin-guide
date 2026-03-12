import { useState, useRef, useCallback } from 'react'
import './NetworkConstructor.css'

const DEVICE_TYPES = [
  { type: 'router',   label: 'Роутер',   emoji: '📡' },
  { type: 'switch',   label: 'Свитч',    emoji: '🔀' },
  { type: 'server',   label: 'Сервер',   emoji: '🖥' },
  { type: 'pc',       label: 'ПК',        emoji: '💻' },
  { type: 'laptop',   label: 'Ноутбук',   emoji: '📱' },
  { type: 'firewall', label: 'Файрвол',   emoji: '🔥' },
  { type: 'cloud',    label: 'Облако',    emoji: '☁️' },
  { type: 'printer',  label: 'Принтер',   emoji: '🖨' },
]

const CABLE_TYPES = [
  { type: 'ethernet', label: 'Ethernet', color: '#38bdf8' },
  { type: 'wifi',     label: 'Wi-Fi',    color: '#4ade80' },
  { type: 'fiber',    label: 'Оптика',   color: '#fbbf24' },
  { type: 'vpn',      label: 'VPN',      color: '#a78bfa' },
]

const TYPE_COLORS = {
  router: '#38bdf8', switch: '#818cf8', server: '#4ade80',
  pc: '#94a3b8', laptop: '#94a3b8', firewall: '#f87171',
  cloud: '#64748b', printer: '#94a3b8',
}

const TYPE_EMOJIS = { router:'📡', switch:'🔀', server:'🖥', pc:'💻', laptop:'📱', firewall:'🔥', cloud:'☁️', printer:'🖨' }

let nextId = 1

export default function NetworkConstructor() {
  const [devices, setDevices] = useState([])
  const [links, setLinks] = useState([])
  const [connecting, setConnecting] = useState(null) // id устройства от которого тянем
  const [cableType, setCableType] = useState('ethernet')
  const [dragging, setDragging] = useState(null)
  const [dragOffset, setDragOffset] = useState({x:0,y:0})
  const [selected, setSelected] = useState(null)
  const [validation, setValidation] = useState(null)
  const svgRef = useRef()

  const addDevice = (type) => {
    const id = `dev_${nextId++}`
    setDevices(prev => [...prev, {
      id, type,
      label: DEVICE_TYPES.find(d=>d.type===type)?.label || type,
      x: 80 + Math.random() * 400,
      y: 80 + Math.random() * 200,
    }])
  }

  const getSVGCoords = useCallback((e) => {
    const svg = svgRef.current
    if (!svg) return {x:0,y:0}
    const rect = svg.getBoundingClientRect()
    const scaleX = 700 / rect.width
    const scaleY = 420 / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  const onDeviceMouseDown = (e, id) => {
    e.stopPropagation()
    if (connecting) {
      if (connecting !== id) {
        const exists = links.find(l => (l.from===connecting&&l.to===id)||(l.from===id&&l.to===connecting))
        if (!exists) setLinks(prev => [...prev, { id:`link_${nextId++}`, from: connecting, to: id, type: cableType }])
      }
      setConnecting(null)
      return
    }
    setSelected(id)
    const dev = devices.find(d=>d.id===id)
    const coords = getSVGCoords(e)
    setDragging(id)
    setDragOffset({ x: coords.x - dev.x, y: coords.y - dev.y })
    setValidation(null)
  }

  const onSVGMouseMove = (e) => {
    if (!dragging) return
    const coords = getSVGCoords(e)
    setDevices(prev => prev.map(d => d.id === dragging
      ? { ...d, x: Math.max(0, Math.min(652, coords.x - dragOffset.x)), y: Math.max(0, Math.min(372, coords.y - dragOffset.y)) }
      : d
    ))
  }

  const onSVGMouseUp = () => { setDragging(null) }

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
      if (!connectedIds.has(d.id)) issues.push(`"${d.label}" не подключён ни к чему`)
    })
    const pcs = devices.filter(d => ['pc','laptop'].includes(d.type))
    pcs.forEach(pc => {
      const pcLinks = links.filter(l => l.from===pc.id||l.to===pc.id)
      const connectedTypes = pcLinks.map(l => {
        const otherId = l.from===pc.id ? l.to : l.from
        return devices.find(d=>d.id===otherId)?.type
      })
      if (connectedTypes.includes('router') && !connectedTypes.includes('switch')) {
        issues.push(`"${pc.label}" подключён напрямую к роутеру — рекомендуется использовать свитч`)
      }
    })
    const routers = devices.filter(d=>d.type==='router')
    if (routers.length === 0 && devices.length > 1) issues.push('В сети нет роутера — устройства не смогут выйти в интернет')
    setValidation(issues.length === 0 ? { ok: true, msg: '✅ Сеть выглядит правильно!' } : { ok: false, issues })
  }

  const getCenter = (id) => {
    const d = devices.find(d=>d.id===id)
    return d ? {x: d.x+24, y: d.y+24} : {x:0,y:0}
  }

  const LINK_COLORS = { ethernet:'#38bdf8', wifi:'#4ade80', fiber:'#fbbf24', vpn:'#a78bfa' }
  const LINK_DASH = { ethernet:'none', wifi:'6 3', fiber:'none', vpn:'8 4' }

  return (
    <div className="constructor">
      <div className="constructor-toolbar">
        <div className="toolbar-section">
          <div className="toolbar-label">Устройства:</div>
          <div className="toolbar-devices">
            {DEVICE_TYPES.map(d => (
              <button key={d.type} className="toolbar-btn" onClick={() => addDevice(d.type)} title={d.label}>
                <span>{d.emoji}</span>
                <span>{d.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="toolbar-section">
          <div className="toolbar-label">Тип кабеля:</div>
          <div className="toolbar-cables">
            {CABLE_TYPES.map(c => (
              <button
                key={c.type}
                className={`cable-btn${cableType===c.type?' active':''}`}
                style={{'--cc': c.color}}
                onClick={() => setCableType(c.type)}
              >{c.label}</button>
            ))}
          </div>
        </div>
        <div className="toolbar-section toolbar-actions">
          <button
            className={`btn ${connecting ? 'btn-primary' : 'btn-outline'}`}
            style={{fontSize:'0.85rem',padding:'7px 14px'}}
            onClick={() => setConnecting(connecting ? null : (selected || null))}
            title="Выбери устройство и нажми 'Соединить'"
          >
            {connecting ? '❌ Отмена' : '🔗 Соединить'}
          </button>
          <button className="btn btn-outline" style={{fontSize:'0.85rem',padding:'7px 14px'}} onClick={deleteSelected} disabled={!selected}>
            🗑 Удалить
          </button>
          <button className="btn btn-outline" style={{fontSize:'0.85rem',padding:'7px 14px'}} onClick={validate} disabled={devices.length===0}>
            ✅ Проверить сеть
          </button>
          <button className="btn btn-outline" style={{fontSize:'0.85rem',padding:'7px 14px',borderColor:'var(--red)',color:'var(--red)'}} onClick={clearAll}>
            🗑 Очистить
          </button>
        </div>
      </div>

      {connecting && (
        <div className="connect-hint">
          🔗 Режим соединения: нажми на первое устройство, затем на второе. Кабель: <b>{CABLE_TYPES.find(c=>c.type===cableType)?.label}</b>
        </div>
      )}

      {validation && (
        <div className={`validation-result ${validation.ok ? 'ok' : 'fail'}`}>
          {validation.ok ? validation.msg : (
            <><b>⚠️ Найдены проблемы:</b><ul>{validation.issues.map((i,idx)=><li key={idx}>{i}</li>)}</ul></>
          )}
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
          {/* Сетка */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.5"/>
            </pattern>
          </defs>
          <rect width="700" height="420" fill="url(#grid)" />

          {/* Линии */}
          {links.map(link => {
            const a = getCenter(link.from)
            const b = getCenter(link.to)
            const color = LINK_COLORS[link.type] || '#38bdf8'
            const dash = LINK_DASH[link.type]
            return (
              <line key={link.id}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={color} strokeWidth="2"
                strokeDasharray={dash === 'none' ? undefined : dash}
                opacity="0.8"
              />
            )
          })}

          {/* Устройства */}
          {devices.map(dev => {
            const color = TYPE_COLORS[dev.type] || '#94a3b8'
            const emoji = TYPE_EMOJIS[dev.type] || '💻'
            const isSelected = selected === dev.id
            const isConnectSource = connecting === dev.id
            return (
              <g
                key={dev.id}
                transform={`translate(${dev.x},${dev.y})`}
                onMouseDown={(e) => onDeviceMouseDown(e, dev.id)}
                style={{cursor: connecting ? 'crosshair' : 'grab'}}
              >
                {isSelected && <circle cx="24" cy="24" r="32" fill={color} opacity="0.15" />}
                {isConnectSource && <circle cx="24" cy="24" r="32" stroke={color} strokeWidth="2" fill="none" strokeDasharray="4 2" />}
                <rect x="2" y="2" width="44" height="44" rx="10"
                  fill="var(--bg3)"
                  stroke={isSelected ? color : 'var(--border)'}
                  strokeWidth={isSelected ? 2 : 1}
                />
                <text x="24" y="30" textAnchor="middle" fontSize="22">{emoji}</text>
                <text x="24" y="60" textAnchor="middle" fontSize="10" fill="var(--text)" fontWeight="600">
                  {dev.label}
                </text>
              </g>
            )
          })}

          {devices.length === 0 && (
            <text x="350" y="200" textAnchor="middle" fontSize="14" fill="var(--text2)" fontFamily="var(--font)">
              Добавьте устройства из панели сверху
            </text>
          )}
        </svg>
      </div>

      <div className="constructor-help">
        <span>💡 <b>Как пользоваться:</b> добавь устройства → нажми "Соединить" → кликни по двум устройствам → проверь сеть</span>
      </div>
    </div>
  )
}
