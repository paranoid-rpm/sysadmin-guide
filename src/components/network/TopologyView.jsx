import { useState } from 'react'
import './TopologyView.css'

// Cisco-style SVG icons
const CiscoIcons = {
  router: ({ color = '#00aaff' }) => (
    <svg viewBox="0 0 56 56" width="52" height="52">
      <circle cx="28" cy="28" r="22" fill="none" stroke={color} strokeWidth="2"/>
      <circle cx="28" cy="28" r="8" fill={color} opacity="0.15"/>
      <circle cx="28" cy="28" r="3" fill={color}/>
      <line x1="28" y1="6" x2="28" y2="20" stroke={color} strokeWidth="2"/>
      <line x1="28" y1="36" x2="28" y2="50" stroke={color} strokeWidth="2"/>
      <line x1="6" y1="28" x2="20" y2="28" stroke={color} strokeWidth="2"/>
      <line x1="36" y1="28" x2="50" y2="28" stroke={color} strokeWidth="2"/>
      <circle cx="28" cy="6" r="3" fill={color}/>
      <circle cx="28" cy="50" r="3" fill={color}/>
      <circle cx="6" cy="28" r="3" fill={color}/>
      <circle cx="50" cy="28" r="3" fill={color}/>
    </svg>
  ),
  switch: ({ color = '#818cf8' }) => (
    <svg viewBox="0 0 56 56" width="52" height="52">
      <rect x="4" y="18" width="48" height="20" rx="4" fill="none" stroke={color} strokeWidth="2"/>
      <rect x="9" y="23" width="6" height="10" rx="1" fill={color} opacity="0.7"/>
      <rect x="18" y="23" width="6" height="10" rx="1" fill={color} opacity="0.7"/>
      <rect x="27" y="23" width="6" height="10" rx="1" fill={color} opacity="0.7"/>
      <rect x="36" y="23" width="6" height="10" rx="1" fill={color} opacity="0.7"/>
      <circle cx="47" cy="28" r="3" fill={color}/>
      <line x1="14" y1="18" x2="14" y2="10" stroke={color} strokeWidth="1.5"/>
      <line x1="23" y1="18" x2="23" y2="10" stroke={color} strokeWidth="1.5"/>
      <line x1="32" y1="18" x2="32" y2="10" stroke={color} strokeWidth="1.5"/>
      <line x1="41" y1="18" x2="41" y2="10" stroke={color} strokeWidth="1.5"/>
    </svg>
  ),
  server: ({ color = '#00e676' }) => (
    <svg viewBox="0 0 56 56" width="52" height="52">
      <rect x="10" y="6" width="36" height="44" rx="3" fill="none" stroke={color} strokeWidth="2"/>
      <rect x="14" y="12" width="28" height="7" rx="1.5" fill={color} opacity="0.15"/>
      <rect x="14" y="12" width="28" height="7" rx="1.5" fill="none" stroke={color} strokeWidth="1"/>
      <rect x="14" y="23" width="28" height="7" rx="1.5" fill={color} opacity="0.15"/>
      <rect x="14" y="23" width="28" height="7" rx="1.5" fill="none" stroke={color} strokeWidth="1"/>
      <rect x="14" y="34" width="28" height="7" rx="1.5" fill={color} opacity="0.15"/>
      <rect x="14" y="34" width="28" height="7" rx="1.5" fill="none" stroke={color} strokeWidth="1"/>
      <circle cx="38" cy="15.5" r="2" fill={color}/>
      <circle cx="38" cy="26.5" r="2" fill={color}/>
      <circle cx="38" cy="37.5" r="2" fill="#ffb300"/>
    </svg>
  ),
  pc: ({ color = '#94a3b8' }) => (
    <svg viewBox="0 0 56 56" width="52" height="52">
      <rect x="6" y="8" width="44" height="30" rx="3" fill="none" stroke={color} strokeWidth="2"/>
      <rect x="10" y="12" width="36" height="22" rx="1" fill={color} opacity="0.08"/>
      <line x1="10" y1="12" x2="46" y2="34" stroke={color} strokeWidth="0.5" opacity="0.3"/>
      <rect x="21" y="40" width="14" height="4" rx="1" fill={color} opacity="0.6"/>
      <rect x="16" y="44" width="24" height="3" rx="1" fill={color} opacity="0.4"/>
    </svg>
  ),
  laptop: ({ color = '#94a3b8' }) => (
    <svg viewBox="0 0 56 56" width="52" height="52">
      <rect x="8" y="10" width="40" height="26" rx="3" fill="none" stroke={color} strokeWidth="2"/>
      <rect x="12" y="14" width="32" height="18" rx="1" fill={color} opacity="0.08"/>
      <path d="M4 38 Q28 44 52 38" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <line x1="4" y1="38" x2="52" y2="38" stroke={color} strokeWidth="1" opacity="0.3"/>
    </svg>
  ),
  phone: ({ color = '#fb923c' }) => (
    <svg viewBox="0 0 56 56" width="52" height="52">
      <rect x="16" y="4" width="24" height="48" rx="5" fill="none" stroke={color} strokeWidth="2"/>
      <rect x="20" y="10" width="16" height="26" rx="1" fill={color} opacity="0.08"/>
      <circle cx="28" cy="43" r="2.5" fill={color} opacity="0.7"/>
      <line x1="24" y1="7" x2="32" y2="7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  tv: ({ color = '#a78bfa' }) => (
    <svg viewBox="0 0 56 56" width="52" height="52">
      <rect x="4" y="8" width="48" height="32" rx="3" fill="none" stroke={color} strokeWidth="2"/>
      <rect x="8" y="12" width="40" height="24" rx="1" fill={color} opacity="0.08"/>
      <line x1="20" y1="40" x2="36" y2="40" stroke={color} strokeWidth="2"/>
      <line x1="28" y1="40" x2="22" y2="48" stroke={color} strokeWidth="1.5"/>
      <line x1="28" y1="40" x2="34" y2="48" stroke={color} strokeWidth="1.5"/>
    </svg>
  ),
  printer: ({ color = '#94a3b8' }) => (
    <svg viewBox="0 0 56 56" width="52" height="52">
      <rect x="8" y="18" width="40" height="22" rx="3" fill="none" stroke={color} strokeWidth="2"/>
      <rect x="14" y="8" width="28" height="12" rx="2" fill="none" stroke={color} strokeWidth="1.5"/>
      <rect x="14" y="32" width="28" height="12" rx="1" fill="none" stroke={color} strokeWidth="1.5"/>
      <line x1="18" y1="36" x2="38" y2="36" stroke={color} strokeWidth="1.2" opacity="0.6"/>
      <line x1="18" y1="39" x2="34" y2="39" stroke={color} strokeWidth="1.2" opacity="0.6"/>
      <circle cx="42" cy="26" r="2.5" fill={color}/>
    </svg>
  ),
  firewall: ({ color = '#ff3d57' }) => (
    <svg viewBox="0 0 56 56" width="52" height="52">
      <path d="M28 4 L50 16 L50 32 Q50 48 28 54 Q6 48 6 32 L6 16 Z" fill="none" stroke={color} strokeWidth="2"/>
      <path d="M28 14 L40 20 L40 30 Q40 40 28 44 Q16 40 16 30 L16 20 Z" fill={color} opacity="0.08"/>
      <line x1="28" y1="22" x2="28" y2="34" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="28" cy="38" r="2" fill={color}/>
    </svg>
  ),
  cloud: ({ color = '#64748b' }) => (
    <svg viewBox="0 0 56 56" width="52" height="52">
      <path d="M14 38 Q8 38 8 30 Q8 22 16 22 Q16 14 24 12 Q32 10 36 18 Q44 16 46 24 Q52 24 52 32 Q52 38 46 38 Z" fill="none" stroke={color} strokeWidth="2"/>
      <path d="M14 38 Q8 38 8 30 Q8 22 16 22 Q16 14 24 12 Q32 10 36 18 Q44 16 46 24 Q52 24 52 32 Q52 38 46 38 Z" fill={color} opacity="0.08"/>
    </svg>
  ),
}

const TYPE_COLORS = {
  router: '#00aaff',
  switch: '#818cf8',
  server: '#00e676',
  pc: '#94a3b8',
  laptop: '#94a3b8',
  phone: '#fb923c',
  tv: '#a78bfa',
  printer: '#94a3b8',
  firewall: '#ff3d57',
  cloud: '#64748b',
}

const LINK_STYLES = {
  ethernet: { stroke: '#00aaff', strokeDasharray: 'none', label: 'Ethernet' },
  wifi:     { stroke: '#00e676', strokeDasharray: '6 3',  label: 'Wi-Fi' },
  fiber:    { stroke: '#ffb300', strokeDasharray: 'none', label: 'Fiber' },
  vpn:      { stroke: '#a78bfa', strokeDasharray: '8 4',  label: 'VPN' },
  broken:   { stroke: '#ff3d57', strokeDasharray: '4 4',  label: 'FAULT' },
}

export default function TopologyView({ topology }) {
  const [popup, setPopup] = useState(null)

  const getCenter = (id) => {
    const d = topology.devices.find(d => d.id === id)
    return d ? { x: d.x + 26, y: d.y + 26 } : { x: 0, y: 0 }
  }

  return (
    <div className="topology-view">
      <div className="topology-header">
        <h2 className="topology-title">{topology.label}</h2>
        <p className="topology-desc">{topology.desc}</p>
        {topology.broken && (
          <div className="topology-hint">
            <span className="hint-label">HINT</span>
            {topology.hint}
          </div>
        )}
      </div>

      <div className="topology-canvas-wrap">
        <div className="canvas-toolbar">
          <div className="canvas-legend">
            {Object.entries(LINK_STYLES).map(([k, v]) => (
              <div key={k} className="legend-item">
                <svg width="24" height="8">
                  <line x1="0" y1="4" x2="24" y2="4"
                    stroke={v.stroke} strokeWidth="2"
                    strokeDasharray={v.strokeDasharray === 'none' ? undefined : v.strokeDasharray}
                  />
                </svg>
                <span>{v.label}</span>
              </div>
            ))}
          </div>
        </div>
        <svg className="topology-svg" viewBox="0 0 700 430" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="topo-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,170,255,0.04)" strokeWidth="0.8"/>
            </pattern>
          </defs>
          <rect width="700" height="430" fill="url(#topo-grid)"/>

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
                  stroke={style.stroke} strokeWidth="1.8"
                  strokeDasharray={style.strokeDasharray === 'none' ? undefined : style.strokeDasharray}
                  opacity="0.7"
                />
                <rect x={mx-22} y={my-9} width={44} height={18} rx={3} fill="#0d1b2e" opacity="0.9"/>
                <rect x={mx-22} y={my-9} width={44} height={18} rx={3} fill="none" stroke={style.stroke} strokeWidth="0.5" opacity="0.5"/>
                <text x={mx} y={my+5} textAnchor="middle" fontSize="9.5" fill={style.stroke} fontFamily="var(--mono)" fontWeight="600" letterSpacing="0.05em">
                  {style.label}
                </text>
              </g>
            )
          })}

          {topology.devices.map(device => {
            const color = device.broken ? '#ff3d57' : (TYPE_COLORS[device.type] || '#94a3b8')
            const Icon = CiscoIcons[device.type] || CiscoIcons.pc
            return (
              <g
                key={device.id}
                className="device-group"
                transform={`translate(${device.x}, ${device.y})`}
                onClick={() => setPopup({ type: 'device', ...device, color })}
              >
                {device.broken && (
                  <circle cx="26" cy="26" r="34" fill="#ff3d57" opacity="0.06"/>
                )}
                <Icon color={color} />
                <text x="26" y="64" textAnchor="middle" fontSize="10" fill="var(--text2)" fontFamily="var(--mono)" fontWeight="600" letterSpacing="0.03em">
                  {device.label}
                </text>
                {device.broken && (
                  <text x="26" y="76" textAnchor="middle" fontSize="8" fill="#ff3d57" fontFamily="var(--mono)" fontWeight="700">FAULT</text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {popup && (
        <div className="topology-popup-overlay" onClick={() => setPopup(null)}>
          <div className="topology-popup" onClick={e => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setPopup(null)}>&#x2715;</button>
            {popup.type === 'device' && (
              <>
                <div className="popup-type-label" style={{color: popup.color}}>{popup.type.toUpperCase()}</div>
                <h3 className="popup-title">{popup.info.title}</h3>
                <p className="popup-desc">{popup.info.desc}</p>
                {popup.info.cmds && popup.info.cmds.length > 0 && (
                  <div className="popup-cmds">
                    <div className="popup-cmds-label">COMMANDS</div>
                    {popup.info.cmds.map((cmd, i) => (
                      <div key={i} className="popup-cmd"><span className="cmd-prompt">$</span> {cmd}</div>
                    ))}
                  </div>
                )}
              </>
            )}
            {popup.type === 'link' && (
              <>
                <div className="popup-type-label" style={{color: popup.style.stroke}}>LINK &mdash; {popup.style.label}</div>
                <p className="popup-desc" style={{marginTop:10}}>{popup.info}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
