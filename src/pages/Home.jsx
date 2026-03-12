import { Link } from 'react-router-dom'
import './Home.css'

const features = [
  { to: '/theory', icon: '📖', title: 'Теория', desc: 'Кто такой сисадмин, направления, день из жизни' },
  { to: '/skills', icon: '🎯', title: 'Навыки', desc: 'Что нужно знать на junior / middle / senior' },
  { to: '/tools', icon: '🛠', title: 'Инструменты', desc: 'Топ утилит по категориям: мониторинг, сеть, бэкап' },
  { to: '/roadmap', icon: '🗺', title: 'Роадмап', desc: 'Кликабельная карта навыков с советами' },
  { to: '/quiz', icon: '❓', title: 'Квиз', desc: 'Подходит ли тебе профессия сисадмина?' },
  { to: '/incident', icon: '🚨', title: 'Симулятор инцидентов', desc: 'Разберись с реальными ИТ-ситуациями' },
  { to: '/drag-stack', icon: '🧩', title: 'Собери стек', desc: 'Drag & Drop: разложи инструменты по категориям' },
  { to: '/terminal', icon: '💻', title: 'Терминал', desc: 'Попробуй реальные команды в браузере' },
  { to: '/checklist', icon: '✅', title: 'Чеклист', desc: 'Готов ли ты к первой работе сисадмином?' },
  { to: '/network', icon: '🌐', title: 'Сетевая топология', desc: 'Изучай топологии и строй свою сеть как в Cisco' },
]

export default function Home() {
  return (
    <div className="home">
      <div className="home-hero">
        <div className="hero-terminal">
          <span className="prompt">$ </span>
          <span className="cmd">whoami</span>
          <br />
          <span className="output">sysadmin</span>
        </div>
        <h1 className="hero-title">SysAdmin <span>Guide</span></h1>
        <p className="hero-desc">
          Интерактивный сайт о профессии системного администратора.
          Теория, симуляторы, квизы и конструктор сетей — всё в одном месте.
        </p>
        <div className="hero-btns">
          <Link to="/theory" className="btn btn-primary">Начать изучение →</Link>
          <Link to="/network" className="btn btn-outline">🌐 Открыть топологии</Link>
        </div>
      </div>
      <h2 className="section-title">Что есть на сайте</h2>
      <div className="grid-3">
        {features.map(f => (
          <Link to={f.to} key={f.to} className="feature-card card">
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
