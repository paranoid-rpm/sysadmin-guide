import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './Navbar.css'

const LINKS = [
  { to: '/', label: 'Главная', group: 'Основное' },
  { to: '/roadmap', label: 'Роадмап', group: 'Основное' },
  { to: '/skills', label: 'Навыки', group: 'Основное' },
  { to: '/quiz', label: 'Квиз', group: 'Основное' },
  { to: '/theory', label: 'Теория', group: 'Знания' },
  { to: '/glossary', label: 'Глоссарий', group: 'Знания' },
  { to: '/commands', label: 'Команды', group: 'Инструменты' },
  { to: '/tools', label: 'Инструменты', group: 'Инструменты' },
  { to: '/ports', label: 'Порты', group: 'Инструменты' },
  { to: '/subnet', label: 'Подсети', group: 'Инструменты' },
  { to: '/regex', label: 'Regex', group: 'Инструменты' },
  { to: '/cron', label: 'Cron', group: 'Инструменты' },
  { to: '/network', label: 'Сеть', group: 'Инструменты' },
  { to: '/terminal', label: 'Терминал', group: 'Практика' },
  { to: '/checklist', label: 'Чеклист', group: 'Практика' },
  { to: '/incident', label: 'Инцидент', group: 'Практика' },
  { to: '/drag-stack', label: 'Стек', group: 'Практика' },
]

const GROUPS = ['Основное', 'Знания', 'Инструменты', 'Практика']

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="navbar">
      <div className="navbar-top">
        <div className="navbar-brand">
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
          SysAdmin Guide
        </div>
        <button
          className={`navbar-burger ${open ? 'active' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label="Меню"
        >
          <span/><span/><span/>
        </button>
      </div>
      <div className={`navbar-links ${open ? 'mob-open' : ''}`}>
        {GROUPS.map(group => (
          <div key={group} className="nav-group">
            <div className="nav-group-label">{group}</div>
            {LINKS.filter(l => l.group === group).map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                onClick={() => setOpen(false)}
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
