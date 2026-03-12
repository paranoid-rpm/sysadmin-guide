import { Link } from 'react-router-dom'
import './Home.css'

const SECTIONS = [
  { to: '/commands',   label: 'Шпаргалка команд',    desc: '120 команд: Linux, Git, Nginx, SSL, awk/sed.',            stat: '120' },
  { to: '/glossary',   label: 'Глоссарий',           desc: '64 термина: Linux, сети, безопасность и DevOps.',         stat: '64' },
  { to: '/ports',      label: 'Справочник портов',   desc: '60 портов с описанием и оценкой риска.',                  stat: '60' },
  { to: '/quiz',       label: 'Тест знаний',         desc: '30 вопросов: 3 уровня, 9 категорий.',                     stat: '30' },
  { to: '/incident',   label: 'Инциденты',           desc: '9 сценариев: OOM, inode, Kubernetes, репликация PG.',     stat: '9' },
  { to: '/cron',       label: 'Cron',                desc: 'Конструктор cron‑выражений с подсказками.',              stat: '' },
  { to: '/network',    label: 'Сеть',                desc: 'Готовые схемы и конструктор сетевой топологии.',         stat: '' },
  { to: '/checklist',  label: 'Чек‑листы',           desc: 'Пошаговые чек‑листы для типовых задач.',                  stat: '' },
  { to: '/theory',     label: 'Теория',              desc: 'Базовая теория: сети, Linux и безопасность.',             stat: '' },
  { to: '/tools',      label: 'Инструменты',         desc: '22 утилиты по категориям с командами и ссылками.',        stat: '' },
  { to: '/skills',     label: 'Навыки',              desc: 'Junior / Middle / Senior‑матрица компетенций.',           stat: '' },
  { to: '/drag-stack', label: 'Стек',                desc: 'Конструктор стека сервиса: выбери компоненты и порядок.', stat: '' },
]

export default function Home() {
  return (
    <div className="home">
      <div className="home-hero">
        <div className="hero-tag">SYSADMIN GUIDE</div>
        <h1 className="hero-title">Путь системного<br/><span>администратора</span></h1>
        <p className="hero-desc">
          Интерактивный справочник по профессии.
          Теория, симуляторы, квизы и инструменты — всё в одном месте.
        </p>
        <div className="hero-btns">
          <Link to="/commands" className="btn btn-primary">Шпаргалка команд</Link>
          <Link to="/quiz" className="btn btn-outline">Пройти тест</Link>
        </div>
      </div>

      <div className="home-stats">
        <div className="home-stat"><span className="stat-num">120</span><span className="stat-label">команд</span></div>
        <div className="home-stat"><span className="stat-num">64</span><span className="stat-label">термина</span></div>
        <div className="home-stat"><span className="stat-num">60</span><span className="stat-label">портов</span></div>
        <div className="home-stat"><span className="stat-num">30</span><span className="stat-label">вопросов</span></div>
        <div className="home-stat"><span className="stat-num">9</span><span className="stat-label">инцидентов</span></div>
        <div className="home-stat"><span className="stat-num">12</span><span className="stat-label">разделов</span></div>
      </div>

      <div className="section-header">
        <div className="section-line"/>
        <span>Разделы</span>
        <div className="section-line"/>
      </div>

      <div className="grid-3">
        {SECTIONS.map(f => (
          <Link to={f.to} key={f.to} className="feature-card card">
            <div className="feature-top">
              <div className="feature-label">{f.label}</div>
              {f.stat && <div className="feature-stat">{f.stat}</div>}
            </div>
            <div className="feature-desc">{f.desc}</div>
            <div className="feature-arrow">→</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
