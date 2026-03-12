import { useState } from 'react'
import './Roadmap.css'

const STAGES = [
  {
    id: 1,
    title: 'Основы операционных систем',
    icon: '',
    color: '#00aaff',
    desc: 'Понимание принципов работы Linux и Windows.',
    topics: [
      { id: 't1', label: 'Linux: файловая система (FHS)', done: false },
      { id: 't2', label: 'Процессы и управление ими (ps, kill, nice)', done: false },
      { id: 't3', label: 'Права доступа (chmod, chown, ACL)', done: false },
      { id: 't4', label: 'Пользователи и группы', done: false },
      { id: 't5', label: 'Пакетные менеджеры (apt, yum, dnf)', done: false },
      { id: 't6', label: 'systemd: юниты и journalctl', done: false },
    ]
  },
  {
    id: 2,
    title: 'Сети',
    icon: '',
    color: '#818cf8',
    desc: 'Сетевые протоколы, адресация и диагностика.',
    topics: [
      { id: 'n1', label: 'Модель OSI / TCP/IP', done: false },
      { id: 'n2', label: 'IP‑адресация, маски, CIDR', done: false },
      { id: 'n3', label: 'DNS, DHCP, NTP', done: false },
      { id: 'n4', label: 'Инструменты: ping, traceroute, ss, tcpdump', done: false },
      { id: 'n5', label: 'Firewall: iptables / nftables / ufw', done: false },
      { id: 'n6', label: 'VPN: OpenVPN и WireGuard', done: false },
    ]
  },
  {
    id: 3,
    title: 'Веб‑серверы',
    icon: '',
    color: '#00e676',
    desc: 'Настройка и администрирование веб‑серверов.',
    topics: [
      { id: 'w1', label: 'Nginx: virtual hosts, SSL, proxy_pass', done: false },
      { id: 'w2', label: 'Apache: .htaccess и mod_rewrite', done: false },
      { id: 'w3', label: 'SSL/TLS: Let\'s Encrypt и certbot', done: false },
      { id: 'w4', label: 'HTTP/2, gzip и кэширование', done: false },
      { id: 'w5', label: 'Балансировка нагрузки', done: false },
    ]
  },
  {
    id: 4,
    title: 'Базы данных',
    icon: '',
    color: '#ffb300',
    desc: 'Администрирование популярных СУБД.',
    topics: [
      { id: 'd1', label: 'PostgreSQL: установка, роли и бэкап', done: false },
      { id: 'd2', label: 'MySQL / MariaDB: репликация', done: false },
      { id: 'd3', label: 'Redis: кэш и сессии', done: false },
      { id: 'd4', label: 'Мониторинг запросов и EXPLAIN', done: false },
    ]
  },
  {
    id: 5,
    title: 'Автоматизация',
    icon: '',
    color: '#fb923c',
    desc: 'Infrastructure as Code и конфигурационное управление.',
    topics: [
      { id: 'a1', label: 'Bash‑скриптинг: циклы, функции и cron', done: false },
      { id: 'a2', label: 'Ansible: playbook, роли и vault', done: false },
      { id: 'a3', label: 'Terraform: основы IaC', done: false },
      { id: 'a4', label: 'Git: базовые операции', done: false },
      { id: 'a5', label: 'CI/CD: GitLab CI или GitHub Actions', done: false },
    ]
  },
  {
    id: 6,
    title: 'Контейнеры',
    icon: '',
    color: '#a78bfa',
    desc: 'Docker и оркестрация контейнеров.',
    topics: [
      { id: 'c1', label: 'Docker: образы, контейнеры и Dockerfile', done: false },
      { id: 'c2', label: 'Docker Compose: многосервисные приложения', done: false },
      { id: 'c3', label: 'Kubernetes: Pod, Deployment и Service', done: false },
      { id: 'c4', label: 'Helm: charts и релизы', done: false },
      { id: 'c5', label: 'Container registry и безопасность образов', done: false },
    ]
  },
  {
    id: 7,
    title: 'Мониторинг',
    icon: '',
    color: '#ff3d57',
    desc: 'Наблюдаемость, логи и алерты.',
    topics: [
      { id: 'm1', label: 'Prometheus и Grafana', done: false },
      { id: 'm2', label: 'Zabbix: агенты и триггеры', done: false },
      { id: 'm3', label: 'ELK‑стек: Elasticsearch, Logstash, Kibana', done: false },
      { id: 'm4', label: 'Алертинг: PagerDuty и Alertmanager', done: false },
      { id: 'm5', label: 'Трейсинг: Jaeger и Zipkin', done: false },
    ]
  },
  {
    id: 8,
    title: 'Безопасность',
    icon: '',
    color: '#64748b',
    desc: 'Hardening и защита инфраструктуры.',
    topics: [
      { id: 's1', label: 'SSH: ключи, 2FA и fail2ban', done: false },
      { id: 's2', label: 'SELinux и AppArmor', done: false },
      { id: 's3', label: 'Аудит: auditd и логи безопасности', done: false },
      { id: 's4', label: 'Сканеры: nmap, Lynis и OpenVAS', done: false },
      { id: 's5', label: 'Бэкапы: стратегия 3‑2‑1', done: false },
    ]
  },
]

export default function Roadmap() {
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('roadmap') || '{}') }
    catch { return {} }
  })
  const [open, setOpen] = useState(null)

  const toggle = (id) => {
    const next = { ...progress, [id]: !progress[id] }
    setProgress(next)
    localStorage.setItem('roadmap', JSON.stringify(next))
  }

  const totalTopics = STAGES.reduce((s, st) => s + st.topics.length, 0)
  const doneCount = STAGES.reduce((s, st) => s + st.topics.filter(t => progress[t.id]).length, 0)
  const pct = Math.round((doneCount / totalTopics) * 100)

  const stageProgress = (stage) => {
    const done = stage.topics.filter(t => progress[t.id]).length
    return { done, total: stage.topics.length, pct: Math.round(done / stage.topics.length * 100) }
  }

  return (
    <div>
      <h1 className="page-title">Дорожная <span className="accent">карта</span></h1>
      <p className="page-subtitle">Отмечай пройденные темы — прогресс сохраняется в браузере.</p>

      <div className="roadmap-overall">
        <div className="overall-label">
          <span>Общий прогресс</span>
          <span className="overall-pct">{pct}%</span>
        </div>
        <div className="overall-bar">
          <div className="overall-fill" style={{ width: `${pct}%` }}/>
        </div>
        <div className="overall-counts">{doneCount} / {totalTopics} тем пройдено</div>
      </div>

      <div className="roadmap-grid">
        {STAGES.map((stage, idx) => {
          const sp = stageProgress(stage)
          const isOpen = open === stage.id
          return (
            <div
              key={stage.id}
              className={`roadmap-card ${isOpen ? 'open' : ''}`}
              style={{ '--stage-color': stage.color }}
            >
              <div className="roadmap-card-head" onClick={() => setOpen(isOpen ? null : stage.id)}>
                <div className="stage-num">{String(idx + 1).padStart(2, '0')}</div>
                <div className="stage-info">
                  <div className="stage-title">{stage.title}</div>
                  <div className="stage-desc">{stage.desc}</div>
                </div>
                <div className="stage-right">
                  <div className="stage-pct">{sp.pct}%</div>
                  <div className="stage-mini-bar">
                    <div className="stage-mini-fill" style={{ width: `${sp.pct}%` }}/>
                  </div>
                  <div className="stage-counts">{sp.done}/{sp.total}</div>
                  <span className={`stage-arrow ${isOpen ? 'up' : ''}`}>▼</span>
                </div>
              </div>
              {isOpen && (
                <div className="roadmap-topics">
                  {stage.topics.map(topic => (
                    <label key={topic.id} className={`topic-row ${progress[topic.id] ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={!!progress[topic.id]}
                        onChange={() => toggle(topic.id)}
                      />
                      <span className="topic-check">{progress[topic.id] ? '✓' : ''}</span>
                      <span className="topic-label">{topic.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
