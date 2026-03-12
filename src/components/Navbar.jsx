import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import './Navbar.css'

const GROUPS = [
  {
    label: 'Основное',
    links: [
      { to: '/',         label: 'Главная' },
      { to: '/roadmap',  label: 'Роадмап' },
      { to: '/skills',   label: 'Навыки' },
      { to: '/quiz',     label: 'Квиз' },
    ]
  },
  {
    label: 'Знания',
    links: [
      { to: '/theory',   label: 'Теория' },
      { to: '/glossary', label: 'Глоссарий' },
    ]
  },
  {
    label: 'Инструменты',
    links: [
      { to: '/commands', label: 'Команды' },
      { to: '/tools',    label: 'Инструменты' },
      { to: '/ports',    label: 'Порты' },
      { to: '/subnet',   label: 'Подсети' },
      { to: '/regex',    label: 'Regex' },
      { to: '/cron',     label: 'Cron' },
      { to: '/network',  label: 'Сеть' },
    ]
  },
  {
    label: 'Практика',
    links: [
      { to: '/terminal',   label: 'Терминал' },
      { to: '/checklist',  label: 'Чеклист' },
      { to: '/incident',   label: 'Инцидент' },
      { to: '/drag-stack', label: 'Стек' },
    ]
  },
]

export default function Navbar() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const ref = useRef(null)

  useEffect(() => { setOpen(false) }, [location])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (open && ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <nav ref={ref} className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Brand */}
        <NavLink to="/" className="navbar-brand">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <rect x="1" y="7" width="18" height="6" rx="2" stroke="#00aaff" strokeWidth="1.5"/>
            <circle cx="15" cy="10" r="1.2" fill="#00aaff"/>
            <rect x="4" y="1" width="4" height="4" rx="1" stroke="#00aaff" strokeWidth="1.2"/>
            <rect x="12" y="1" width="4" height="4" rx="1" stroke="#00aaff" strokeWidth="1.2"/>
            <rect x="4" y="15" width="4" height="4" rx="1" stroke="#00aaff" strokeWidth="1.2"/>
            <rect x="12" y="15" width="4" height="4" rx="1" stroke="#00aaff" strokeWidth="1.2"/>
            <line x1="6" y1="5" x2="6" y2="7" stroke="#00aaff" strokeWidth="1.2"/>
            <line x1="14" y1="5" x2="14" y2="7" stroke="#00aaff" strokeWidth="1.2"/>
            <line x1="6" y1="13" x2="6" y2="15" stroke="#00aaff" strokeWidth="1.2"/>
            <line x1="14" y1="13" x2="14" y2="15" stroke="#00aaff" strokeWidth="1.2"/>
          </svg>
          <span>SysAdmin Guide</span>
        </NavLink>

        {/* Desktop nav */}
        <div className="navbar-groups">
          {GROUPS.map(g => (
            <div key={g.label} className="nav-group">
              <span className="nav-group-label">{g.label}</span>
              <div className="nav-group-links">
                {g.links.map(l => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === '/'}
                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  >
                    {l.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Burger */}
        <button
          className={`navbar-burger ${open ? 'open' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label="Меню"
        >
          <span/><span/><span/>
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`navbar-mobile ${open ? 'open' : ''}`}>
        {GROUPS.map(g => (
          <div key={g.label} className="mob-group">
            <div className="mob-group-label">{g.label}</div>
            {g.links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => `mob-link${isActive ? ' active' : ''}`}
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
    </nav>
  )
}
