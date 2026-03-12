import { Link } from 'react-router-dom'
import './Home.css'

const features = [
  { to: '/theory',    label: 'Теория',              desc: 'Кто такой сисадмин, направления, день из жизни' },
  { to: '/skills',    label: 'Навыки',              desc: 'Что нужно знать на Junior / Middle / Senior' },
  { to: '/tools',     label: 'Инструменты',           desc: 'Топ утилит по категориям: мониторинг, сеть, бэкап' },
  { to: '/roadmap',   label: 'Роадмап',             desc: 'Карта навыков с советами по обучению' },
  { to: '/quiz',      label: 'Квиз',                desc: 'Подходит ли тебе профессия сисадмина?' },
  { to: '/incident',  label: 'Симулятор инцидентов', desc: 'Реальные ИТ-ситуации — выбирай правильные шаги' },
  { to: '/drag-stack', label: 'Стек сисадмина',      desc: 'Drag & Drop: разложи инструменты по категориям' },
  { to: '/terminal',  label: 'Терминал',            desc: 'Типай реальные команды — видишь ответ сервера' },
  { to: '/checklist', label: 'Чеклист',            desc: 'Готов ли ты к первой работе?' },
  { to: '/network',   label: 'Сетевая топология',     desc: 'Готовые схемы + конструктор сети как в Cisco', featured: true },
]

export default function Home() {
  return (
    <div className="home">
      <div className="home-hero">
        <div className="hero-tag">SYSADMIN GUIDE v1.0</div>
        <h1 className="hero-title">Путь системного<br/><span>администратора</span></h1>
        <p className="hero-desc">
          Интерактивный справочник по профессии. Теория, симуляторы, квизы
          и конструктор сетей — всё в одном месте.
        </p>
        <div className="hero-btns">
          <Link to="/theory" className="btn btn-primary">Начать изучение</Link>
          <Link to="/network" className="btn btn-outline">Сетевая топология</Link>
        </div>
      </div>

      <div className="section-header">
        <div className="section-line"/>
        <span>Разделы</span>
        <div className="section-line"/>
      </div>

      <div className="grid-3">
        {features.map(f => (
          <Link to={f.to} key={f.to} className={`feature-card card${f.featured ? ' featured' : ''}`}>
            <div className="feature-label">{f.label}</div>
            <div className="feature-desc">{f.desc}</div>
            {f.featured && <div className="feature-badge">FEATURED</div>}
          </Link>
        ))}
      </div>
    </div>
  )
}
