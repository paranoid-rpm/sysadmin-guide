import { NavLink } from 'react-router-dom'
import './Navbar.css'

const links = [
  { to: '/', label: '🏠 Главная' },
  { to: '/theory', label: '📖 Теория' },
  { to: '/skills', label: '🎯 Навыки' },
  { to: '/tools', label: '🛠 Инструменты' },
  { to: '/roadmap', label: '🗺 Роадмап' },
  { to: '/quiz', label: '❓ Квиз' },
  { to: '/incident', label: '🚨 Инцидент' },
  { to: '/drag-stack', label: '🧩 Стек' },
  { to: '/terminal', label: '💻 Терминал' },
  { to: '/checklist', label: '✅ Чеклист' },
  { to: '/network', label: '🌐 Сеть' },
]

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">$ SysAdmin Guide</div>
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
