import { NavLink } from 'react-router-dom'
import './Navbar.css'

const links = [
  { to: '/', label: 'Главная' },
  { to: '/theory', label: 'Теория' },
  { to: '/skills', label: 'Навыки' },
  { to: '/tools', label: 'Инструменты' },
  { to: '/roadmap', label: 'Роадмап' },
  { to: '/quiz', label: 'Квиз' },
  { to: '/incident', label: 'Инцидент' },
  { to: '/drag-stack', label: 'Стек' },
  { to: '/terminal', label: 'Терминал' },
  { to: '/checklist', label: 'Чеклист' },
  { to: '/network', label: 'Сеть' },
]

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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
      <div className="navbar-links">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            {l.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
