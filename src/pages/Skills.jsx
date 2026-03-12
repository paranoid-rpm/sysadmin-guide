import { useState } from 'react'
import './Skills.css'

const LEVELS = [
  {
    id: 'junior',
    label: 'Junior',
    color: '#00e676',
    icon: '',
    exp: '0–1 год',
    desc: 'Базовые навыки администрирования Linux‑систем.',
    sections: [
      {
        title: 'Операционные системы',
        skills: [
          { name: 'Файловая система Linux (FHS)', must: true },
          { name: 'Управление пакетами (apt/yum)', must: true },
          { name: 'Права доступа: chmod, chown', must: true },
          { name: 'Пользователи и группы', must: true },
          { name: 'Базовые команды shell', must: true },
          { name: 'systemd: start/stop/enable', must: true },
          { name: 'cron: планирование задач', must: false },
          { name: 'Переменные окружения', must: false },
        ]
      },
      {
        title: 'Сети',
        skills: [
          { name: 'Модель OSI / TCP/IP', must: true },
          { name: 'IP‑адресация, маски подсетей', must: true },
          { name: 'DNS: A, CNAME, MX‑записи', must: true },
          { name: 'ping, traceroute, nslookup', must: true },
          { name: 'Основы HTTP/HTTPS', must: true },
          { name: 'SSH: подключение и ключи', must: true },
        ]
      },
      {
        title: 'Инструменты',
        skills: [
          { name: 'Git: базовые операции', must: true },
          { name: 'Docker: запуск контейнеров', must: true },
          { name: 'Nginx: базовая конфигурация', must: false },
          { name: 'Bash‑скрипты: if, for, функции', must: false },
        ]
      },
    ]
  },
  {
    id: 'middle',
    label: 'Middle',
    color: '#00aaff',
    icon: '',
    exp: '1–3 года',
    desc: 'Уверенное администрирование и автоматизация.',
    sections: [
      {
        title: 'Операционные системы',
        skills: [
          { name: 'systemd: unit‑файлы, journalctl, timer', must: true },
          { name: 'Управление дисками: LVM, RAID', must: true },
          { name: 'Performance tuning: sysctl', must: true },
          { name: 'SELinux / AppArmor', must: true },
          { name: 'Ядро Linux: параметры и модули', must: false },
          { name: 'Namespaces и cgroups', must: false },
        ]
      },
      {
        title: 'Сети',
        skills: [
          { name: 'Firewall: iptables / nftables', must: true },
          { name: 'VPN: OpenVPN / WireGuard', must: true },
          { name: 'Балансировка нагрузки', must: true },
          { name: 'tcpdump и Wireshark', must: true },
          { name: 'BGP и OSPF — основы', must: false },
          { name: 'IPv6', must: false },
        ]
      },
      {
        title: 'Автоматизация',
        skills: [
          { name: 'Ansible: playbook и роли', must: true },
          { name: 'CI/CD: GitLab CI или GitHub Actions', must: true },
          { name: 'Docker Compose', must: true },
          { name: 'Terraform — основы', must: true },
          { name: 'Скрипты на Python для автоматизации', must: false },
        ]
      },
      {
        title: 'Базы данных',
        skills: [
          { name: 'PostgreSQL: администрирование', must: true },
          { name: 'MySQL / MariaDB: репликация', must: true },
          { name: 'Redis: настройка и мониторинг', must: false },
          { name: 'Бэкап и восстановление БД', must: true },
        ]
      },
    ]
  },
  {
    id: 'senior',
    label: 'Senior',
    color: '#a78bfa',
    icon: '',
    exp: '3+ лет',
    desc: 'Архитектура, надёжность и масштабирование.',
    sections: [
      {
        title: 'Инфраструктура',
        skills: [
          { name: 'Kubernetes: архитектура и эксплуатация', must: true },
          { name: 'Service Mesh: Istio или Linkerd', must: true },
          { name: 'Infrastructure as Code (Terraform)', must: true },
          { name: 'GitOps: ArgoCD или Flux', must: true },
          { name: 'Chaos Engineering', must: false },
        ]
      },
      {
        title: 'Надёжность (SRE)',
        skills: [
          { name: 'SLI/SLO/SLA: определение и контроль', must: true },
          { name: 'Capacity planning', must: true },
          { name: 'Incident management и post‑mortem', must: true },
          { name: 'Observability: метрики, логи, трейсы', must: true },
          { name: 'Disaster Recovery‑планирование', must: true },
        ]
      },
      {
        title: 'Безопасность',
        skills: [
          { name: 'Zero Trust‑архитектура', must: true },
          { name: 'Vulnerability management', must: true },
          { name: 'PKI: CA, сертификаты, mTLS', must: true },
          { name: 'SIEM: анализ событий', must: false },
          { name: 'Penetration testing — основы', must: false },
        ]
      },
      {
        title: 'Облако',
        skills: [
          { name: 'AWS / GCP / Azure: ключевые сервисы', must: true },
          { name: 'Multi‑cloud‑стратегии', must: false },
          { name: 'FinOps: оптимизация затрат', must: false },
          { name: 'Serverless‑архитектуры', must: false },
        ]
      },
    ]
  },
]

export default function Skills() {
  const [active, setActive] = useState('junior')
  const [showOptional, setShowOptional] = useState(true)

  const level = LEVELS.find(l => l.id === active)
  const allSkills = level.sections.flatMap(s => s.skills)
  const mustCount = allSkills.filter(s => s.must).length
  const total = showOptional ? allSkills.length : mustCount

  return (
    <div>
      <h1 className="page-title">Карта <span className="accent">навыков</span></h1>
      <p className="page-subtitle">Что нужно знать на каждом уровне карьеры системного администратора.</p>

      <div className="skills-levels">
        {LEVELS.map(l => (
          <button
            key={l.id}
            className={`skills-level-btn ${active === l.id ? 'active' : ''}`}
            style={{ '--lc': l.color }}
            onClick={() => setActive(l.id)}
          >
            <span className="slb-label">{l.label}</span>
            <span className="slb-exp">{l.exp}</span>
          </button>
        ))}
      </div>

      <div className="skills-header">
        <div>
          <h2 className="skills-level-title" style={{ color: level.color }}>
            {level.label}
          </h2>
          <p className="skills-level-desc">{level.desc}</p>
        </div>
        <label className="skills-toggle">
          <input type="checkbox" checked={showOptional} onChange={e => setShowOptional(e.target.checked)} />
          <span className="toggle-track"><span className="toggle-thumb"/></span>
          <span className="toggle-label">Показывать необязательные</span>
        </label>
      </div>

      <div className="skills-sections">
        {level.sections.map(section => {
          const visible = showOptional ? section.skills : section.skills.filter(s => s.must)
          if (!visible.length) return null
          return (
            <div key={section.title} className="skills-section">
              <div className="skills-section-title">{section.title}</div>
              <div className="skills-list">
                {visible.map((skill, i) => (
                  <div key={i} className={`skill-item ${skill.must ? 'must' : 'optional'}`} style={{ '--lc': level.color }}>
                    <span className="skill-dot"/>
                    <span className="skill-name">{skill.name}</span>
                    {skill.must
                      ? <span className="skill-tag must-tag">Обязательно</span>
                      : <span className="skill-tag opt-tag">Плюс</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
