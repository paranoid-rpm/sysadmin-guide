import { useState } from 'react'
import './TopologyView.css'

const ICONS = {
  router: ({ color }) => (
    <svg viewBox="0 0 48 48" width="48" height="48">
      <rect x="4" y="16" width="40" height="20" rx="6" fill={color} />
      <circle cx="14" cy="26" r="3" fill="#fff" opacity="0.8"/>
      <circle cx="24" cy="26" r="3" fill="#fff" opacity="0.8"/>
      <circle cx="34" cy="26" r="3" fill="#fff" opacity="0.8"/>
      <rect x="10" y="8" width="4" height="8" rx="2" fill={color}/>
      <rect x="22" y="6" width="4" height="10" rx="2" fill={color}/>
      <rect x="34" y="8" width="4" height="8" rx="2" fill={color}/>
    </svg>
  ),
  switch: ({ color }) => (
    <svg viewBox="0 0 48 48" width="48" height="48">
      <rect x="2" y="14" width="44" height="20" rx="5" fill={color} />
      <rect x="8" y="20" width="5" height="8" rx="2" fill="#fff" opacity="0.7"/>
      <rect x="16" y="20" width="5" height="8" rx="2" fill="#fff" opacity="0.7"/>
      <rect x="24" y="20" width="5" height="8" rx="2" fill="#fff" opacity="0.7"/>
      <rect x="32" y="20" width="5" height="8" rx="2" fill="#fff" opacity="0.7"/>
    </svg>
  ),
  server: ({ color }) => (
    <svg viewBox="0 0 48 48" width="48" height="48">
      <rect x="8" y="4" width="32" height="40" rx="4" fill={color}/>
      <rect x="12" y="10" width="24" height="6" rx="2" fill="#fff" opacity="0.6"/>
      <rect x="12" y="20" width="24" height="6" rx="2" fill="#fff" opacity="0.6"/>
      <rect x="12" y="30" width="24" height="6" rx="2" fill="#fff" opacity="0.6"/>
      <circle cx="34" cy="13" r="2" fill="#4ade80"/>
      <circle cx="34" cy="23" r="2" fill="#4ade80"/>
      <circle cx="34" cy="33" r="2" fill="#fbbf24"/>
    </svg>
  ),
  pc: ({ color }) => (
    <svg viewBox="0 0 48 48" width="48" height="48">
      <rect x="4" y="6" width="40" height="28" rx="3" fill={color}/>
      <rect x="8" y="10" width="32" height="20" rx="2" fill="#0f172a" opacity="0.5"/>
      <rect x="18" y="36" width="12" height="4" rx="1" fill={color}/>
      <rect x="12" y="40" width="24" height="3" rx="1" fill={color}/>
    </svg>
  ),
  laptop: ({ color }) => (
    <svg viewBox="0 0 48 48" width="48" height="48">
      <rect x="6" y="8" width="36" height="24" rx="3" fill={color}/>
      <rect x="10" y="12" width="28" height="16" rx="1" fill="#0f172a" opacity="0.5"/>
      <path d="M2 34 Q24 40 46 34" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  phone: ({ color }) => (
    <svg viewBox="0 0 48 48" width="48" height="48">
      <rect x="13" y="4" width="22" height="40" rx="5" fill={color}/>
      <rect x="17" y="10" width="14" height="22" rx="2" fill="#0f172a" opacity="0.5"/>
      <circle cx="24" cy="38" r="2.5" fill="#fff" opacity="0.6"/>
    </svg>
  ),
  tv: ({ color }) => (
    <svg viewBox="0 0 48 48" width="48" height="48">
      <rect x="2" y="6" width="44" height="30" rx="4" fill={color}/>
      <rect x="6" y="10" width="36" height="22" rx="2" fill="#0f172a" opacity="0.5"/>
      <rect x="18" y="38" width="12" height="4" rx="2" fill={color}/>
      <rect x="14" y="42" width="20" height="3" rx="1" fill={color}/>
    </svg>
  ),
  printer: ({ color }) => (
    <svg viewBox="0 0 48 48" width="48" height="48">
      <rect x="6" y="16" width="36" height="20" rx="4" fill={color}/>
      <rect x="10" y="8" width="28" height="10" rx="2" fill={color} opacity="0.7"/>
      <rect x="12" y="28" width="24" height="3" rx="1" fill="#fff" opacity="0.5"/>
      <rect x="14" y="34" width="20" height="6" rx="1" fill="#fff" opacity="0.3"/>
    </svg>
  ),
  firewall: ({ color }) => (
    <svg viewBox="0 0 48 48" width="48" height="48">
      <path d="M24 4 L44 14 L44 28 Q44 40 24 46 Q4 40 4 28 L4 14 Z" fill={color}/>
      <path d="M24 12 L36 18 L36 28 Q36 36 24 40 Q12 36 12 28 L12 18 Z" fill="#0f172a" opacity="0.3"/>
      <rect x="21" y="20" width="6" height="10" rx="2" fill="#fff" opacity="0.7"/>
    </svg>
  ),
  cloud: ({ color }) => (
    <svg viewBox="0 0 48 48" width="48" height="48">
      <ellipse cx="24" cy="28" rx="18" ry="10" fill={color}/>
      <circle cx="16" cy="26" r="8" fill={color}/>
      <circle cx="30" cy="24" r="10" fill={color}/>
      <circle cx="22" cy="20" r="8" fill={color}/>
    </svg>
  ),
}

const TYPE_COLORS = {
  router: '#38bdf8',
  switch: '#818cf8',
  server: '#4ade80',
  pc: '#94a3b8',
  laptop: '#94a3b8',
  phone: '#fb923c',
  tv: '#a78bfa',
  printer: '#94a3b8',
  firewall: '#f87171',
  cloud: '#64748b',
}

const LINK_STYLES = {
  ethernet: { stroke: '#38bdf8', strokeDasharray: 'none', label: 'Ethernet' },
  wifi:     { stroke: '#4ade80', strokeDasharray: '6 3', label: 'Wi-Fi' },
  fiber:    { stroke: '#fbbf24', strokeDasharray: 'none', label: 'Оптика' },
  vpn:      { stroke: '#a78bfa', strokeDasharray: '8 4', label: 'VPN' },
  broken:   { stroke: '#f87171', strokeDasharray: '4 4', label: '⚠ Обрыв' },
}

export default function TopologyView({ topology }) {
  const [popup, setPopup] = useState(null)

  const getCenter = (id) => {
    const d = topology.devices.find(d => d.id === id)
    return d ? { x: d.x + 24, y: d.y + 24 } : { x: 0, y: 0 }
  }

  return (
    <div className="topology-view">
      <div className="topology-header">
        <h2 className="topology-title">{topology.label}</h2>
        <p className="topology-desc">{topology.desc}</p>
        {topology.broken && (
          <div className="topology-hint">
            💡 {topology.hint}
          </div>
        )}
      </div>

      <div className="topology-canvas-wrap">
        <svg className="topology-svg" viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet">
          {/* Links */}
          {topology.links.map((link, i) => {
            const a = getCenter(link.from)
            const b = getCenter(link.to)
            const style = LINK_STYLES[link.type] || LINK_STYLES.ethernet
            const mx = (a.x + b.x) / 2
            const my = (a.y + b.y) / 2
            return (
              <g key={i} className="link-group" onClick={() => setPopup({ type: 'link', ...link, style })}>
                <line
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={style.stroke}
                  strokeWidth="2.5"
                  strokeDasharray={style.strokeDasharray === 'none' ? undefined : style.strokeDasharray}
                  opacity="0.8"
                />
                <rect x={mx-28} y={my-10} width={56} height={20} rx={4} fill="var(--bg2)" opacity="0.85"/>
                <text x={mx} y={my+5} textAnchor="middle" fontSize="11" fill={style.stroke} fontFamily="var(--mono)">
                  {style.label}
                </text>
              </g>
            )
          })}
          {/* Devices */}
          {topology.devices.map(device => {
            const color = device.broken ? '#f87171' : (TYPE_COLORS[device.type] || '#94a3b8')
            const Icon = ICONS[device.type] || ICONS.pc
            return (
              <g
                key={device.id}
                className="device-group"
                transform={`translate(${device.x}, ${device.y})`}
                onClick={() => setPopup({ type: 'device', ...device, color })}
              >
                {device.broken && (
                  <circle cx="24" cy="24" r="30" fill="#f87171" opacity="0.15"/>
                )}
                <Icon color={color} />
                <text
                  x="24"
                  y="60"
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--text)"
                  fontFamily="var(--font)"
                  fontWeight="600"
                >
                  {device.label.split('\n').map((line, i) => (
                    <tspan key={i} x="24" dy={i === 0 ? 0 : 13}>{line}</tspan>
                  ))}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Popup */}
      {popup && (
        <div className="topology-popup-overlay" onClick={() => setPopup(null)}>
          <div className="topology-popup" onClick={e => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setPopup(null)}>×</button>
            {popup.type === 'device' && (
              <>
                <div className="popup-icon">
                  {ICONS[popup.deviceType] ? null : null}
                </div>
                <h3 className="popup-title" style={{color: popup.color}}>{popup.info.title}</h3>
                <p className="popup-desc">{popup.info.desc}</p>
                {popup.info.cmds && popup.info.cmds.length > 0 && (
                  <div className="popup-cmds">
                    <div className="popup-cmds-label">💻 Полезные команды:</div>
                    {popup.info.cmds.map((cmd, i) => (
                      <div key={i} className="popup-cmd">{cmd}</div>
                    ))}
                  </div>
                )}
              </>
            )}
            {popup.type === 'link' && (
              <>
                <h3 className="popup-title" style={{color: popup.style.stroke}}>🔗 {popup.style.label}</h3>
                <p className="popup-desc">{popup.info}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
