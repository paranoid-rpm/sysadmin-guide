import { useState } from 'react'
import './Tools.css'

const CATEGORIES = [
  { id: 'all',         label: 'Все' },
  { id: 'monitoring',  label: 'Мониторинг' },
  { id: 'network',     label: 'Сеть' },
  { id: 'security',    label: 'Безопасность' },
  { id: 'automation',  label: 'Автоматизация' },
  { id: 'containers',  label: 'Контейнеры' },
  { id: 'database',    label: 'Базы данных' },
  { id: 'storage',     label: 'Хранилище' },
]

const TOOLS = [
  // Мониторинг
  { id: 1, name: 'Prometheus', cat: 'monitoring', icon: '', color: '#ff6b35',
    desc: 'Система мониторинга и алертинга с time‑series базой данных.',
    tags: ['метрики', 'alerting', 'TSDB'],
    install: 'docker run -p 9090:9090 prom/prometheus',
    docs: 'https://prometheus.io/docs/',
    use: 'Сбор метрик с exporters (node_exporter, blackbox_exporter). Pull‑модель.' },
  { id: 2, name: 'Grafana', cat: 'monitoring', icon: '', color: '#f46800',
    desc: 'Визуализация метрик, логов и трейсов. Поддерживает множество источников данных.',
    tags: ['дашборды', 'визуализация', 'алерты'],
    install: 'docker run -p 3000:3000 grafana/grafana',
    docs: 'https://grafana.com/docs/',
    use: 'Подключается к Prometheus, Loki, ClickHouse, PostgreSQL и другим источникам.' },
  { id: 3, name: 'Zabbix', cat: 'monitoring', icon: '', color: '#d40000',
    desc: 'Enterprise‑мониторинг инфраструктуры: агенты, SNMP, IPMI.',
    tags: ['агенты', 'SNMP', 'enterprise'],
    install: 'apt install zabbix-server-mysql zabbix-agent',
    docs: 'https://www.zabbix.com/documentation/',
    use: 'Подходит для мониторинга сетевого оборудования и серверов.' },
  { id: 4, name: 'Netdata', cat: 'monitoring', icon: '', color: '#00ab44',
    desc: 'Real‑time мониторинг с минимальной конфигурацией. Более 2000 метрик из коробки.',
    tags: ['real-time', 'лёгкий', 'агент'],
    install: 'bash <(curl -Ss https://my-netdata.io/kickstart.sh)',
    docs: 'https://learn.netdata.cloud/',
    use: 'Быстрый старт для диагностики узких мест.' },
  { id: 5, name: 'Loki', cat: 'monitoring', icon: '', color: '#ff9900',
    desc: 'Горизонтально масштабируемая система агрегации логов от Grafana Labs.',
    tags: ['логи', 'Grafana', 'Promtail'],
    install: 'docker run -p 3100:3100 grafana/loki',
    docs: 'https://grafana.com/docs/loki/',
    use: 'Пара к Prometheus: Promtail собирает логи, Loki хранит и отдаёт.' },
  // Сеть
  { id: 6, name: 'Wireshark', cat: 'network', icon: '', color: '#1a74c0',
    desc: 'Анализатор сетевых пакетов. Есть GUI и CLI (tshark).',
    tags: ['перехват', 'анализ', 'pcap'],
    install: 'apt install wireshark',
    docs: 'https://www.wireshark.org/docs/',
    use: 'Захват трафика, анализ протоколов, отладка сетевых проблем.' },
  { id: 7, name: 'nmap', cat: 'network', icon: '', color: '#00b4d8',
    desc: 'Сетевой сканер. Обнаруживает хосты, открытые порты, определяет ОС.',
    tags: ['сканер', 'порты', 'OS detection'],
    install: 'apt install nmap',
    docs: 'https://nmap.org/docs.html',
    use: 'nmap -sV -O 192.168.1.0/24 — сканирование подсети.' },
  { id: 8, name: 'iperf3', cat: 'network', icon: '', color: '#0077b6',
    desc: 'Тест пропускной способности сети между двумя хостами.',
    tags: ['bandwidth', 'тест', 'TCP/UDP'],
    install: 'apt install iperf3',
    docs: 'https://iperf.fr/iperf-doc.php',
    use: 'Сервер: iperf3 -s. Клиент: iperf3 -c server_ip.' },
  { id: 9, name: 'WireGuard', cat: 'network', icon: '', color: '#88171a',
    desc: 'Современный быстрый VPN‑протокол, встроенный в ядро Linux.',
    tags: ['VPN', 'быстрый', 'ядро'],
    install: 'apt install wireguard',
    docs: 'https://www.wireguard.com/',
    use: 'Значительно проще и быстрее OpenVPN. Рекомендуется для новых VPN‑деплоев.' },
  // Безопасность
  { id: 10, name: 'fail2ban', cat: 'security', icon: '', color: '#e63946',
    desc: 'Блокирует IP при подозрительной активности на основе лог‑файлов.',
    tags: ['bruteforce', 'SSH', 'iptables'],
    install: 'apt install fail2ban',
    docs: 'https://www.fail2ban.org/wiki/',
    use: 'Автоматически блокирует IP после нескольких неудачных попыток входа.' },
  { id: 11, name: 'Lynis', cat: 'security', icon: '', color: '#f4a261',
    desc: 'Аудит безопасности и рекомендации по hardening для Linux.',
    tags: ['аудит', 'hardening', 'CIS'],
    install: 'apt install lynis',
    docs: 'https://cisofy.com/documentation/',
    use: 'lynis audit system — полный аудит с рекомендациями.' },
  { id: 12, name: 'ClamAV', cat: 'security', icon: '', color: '#e76f51',
    desc: 'Антивирусный движок с открытым исходным кодом для Linux.',
    tags: ['антивирус', 'сканер', 'daemon'],
    install: 'apt install clamav clamav-daemon',
    docs: 'https://docs.clamav.net/',
    use: 'clamscan -r /home — рекурсивное сканирование файлов.' },
  // Автоматизация
  { id: 13, name: 'Ansible', cat: 'automation', icon: '', color: '#e00',
    desc: 'Agentless‑подход и инфраструктура как код. Playbook пишутся на YAML.',
    tags: ['IaC', 'agentless', 'YAML'],
    install: 'pip install ansible',
    docs: 'https://docs.ansible.com/',
    use: 'ansible-playbook site.yml -i inventory — запуск плейбука.' },
  { id: 14, name: 'Terraform', cat: 'automation', icon: '', color: '#7b42bc',
    desc: 'Провижининг облачной инфраструктуры декларативным способом.',
    tags: ['IaC', 'cloud', 'plan/apply'],
    install: 'apt install terraform',
    docs: 'https://developer.hashicorp.com/terraform/docs',
    use: 'terraform init → plan → apply → destroy.' },
  { id: 15, name: 'Jenkins', cat: 'automation', icon: '', color: '#d33833',
    desc: 'CI/CD‑сервер с большой экосистемой плагинов.',
    tags: ['CI/CD', 'pipelines', 'плагины'],
    install: 'docker run -p 8080:8080 jenkins/jenkins:lts',
    docs: 'https://www.jenkins.io/doc/',
    use: 'Pipeline as Code через Jenkinsfile.' },
  // Контейнеры
  { id: 16, name: 'Docker', cat: 'containers', icon: '', color: '#2496ed',
    desc: 'Платформа контейнеризации. Основной инструмент в DevOps‑стеке.',
    tags: ['контейнеры', 'образы', 'Compose'],
    install: 'curl -fsSL https://get.docker.com | sh',
    docs: 'https://docs.docker.com/',
    use: 'docker compose up -d — запуск стека из docker-compose.yml.' },
  { id: 17, name: 'Kubernetes', cat: 'containers', icon: '', color: '#326ce5',
    desc: 'Оркестрация контейнеров в масштабе. Де‑факто стандарт.',
    tags: ['оркестрация', 'Pods', 'Services'],
    install: 'curl -LO https://dl.k8s.io/release/stable.txt',
    docs: 'https://kubernetes.io/docs/',
    use: 'kubectl get pods -A — посмотреть все поды во всех пространствах имён.' },
  { id: 18, name: 'Helm', cat: 'containers', icon: '', color: '#0f1689',
    desc: 'Пакетный менеджер для Kubernetes. Шаблонизация манифестов.',
    tags: ['K8s', 'charts', 'release'],
    install: 'curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash',
    docs: 'https://helm.sh/docs/',
    use: 'helm install my-release bitnami/nginx.' },
  // БД
  { id: 19, name: 'pgBadger', cat: 'database', icon: '', color: '#336791',
    desc: 'Анализатор логов PostgreSQL. Генерирует HTML‑отчёты.',
    tags: ['PostgreSQL', 'slow queries', 'отчёты'],
    install: 'apt install pgbadger',
    docs: 'https://github.com/darold/pgbadger',
    use: 'pgbadger /var/log/postgresql/*.log -o report.html.' },
  { id: 20, name: 'Redis Insight', cat: 'database', icon: '', color: '#dc382d',
    desc: 'Графический интерфейс для Redis: просмотр данных, профилирование запросов.',
    tags: ['Redis', 'GUI', 'профилирование'],
    install: 'docker run -p 8001:8001 redis/redisinsight',
    docs: 'https://docs.redis.com/latest/ri/',
    use: 'Веб‑интерфейс на порту 8001.' },
  // Хранилище
  { id: 21, name: 'MinIO', cat: 'storage', icon: '', color: '#c72f2f',
    desc: 'S3‑совместимое объектное хранилище. Self‑hosted альтернатива AWS S3.',
    tags: ['S3', 'объектное', 'self-hosted'],
    install: 'docker run -p 9000:9000 minio/minio server /data',
    docs: 'https://min.io/docs/',
    use: 'Совместим с AWS SDK и AWS CLI.' },
  { id: 22, name: 'Restic', cat: 'storage', icon: '', color: '#4a90d9',
    desc: 'Быстрый инкрементальный бэкап с шифрованием и дедупликацией.',
    tags: ['бэкап', 'шифрование', 'дедупликация'],
    install: 'apt install restic',
    docs: 'https://restic.readthedocs.io/',
    use: 'restic -r /backup backup /data — бэкап с дедупликацией.' },
]

export default function Tools() {
  const [cat, setCat] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = TOOLS.filter(t =>
    (cat === 'all' || t.cat === cat) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) ||
     t.desc.toLowerCase().includes(search.toLowerCase()) ||
     t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
  )

  if (selected) {
    const tool = TOOLS.find(t => t.id === selected)
    return (
      <div>
        <button className="tool-back" onClick={() => setSelected(null)}>← Назад</button>
        <div className="tool-detail">
          <div className="tool-detail-head">
            <div>
              <h1 className="page-title" style={{ marginBottom: 6 }}>{tool.name}</h1>
              <div className="tool-detail-tags">
                {tool.tags.map(tag => (
                  <span key={tag} className="tool-tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
          <p className="tool-detail-desc">{tool.desc}</p>

          <div className="tool-detail-block">
            <div className="tool-block-label">Установка</div>
            <div className="tool-code-block">
              <span className="tcode-prompt">$</span>
              <code>{tool.install}</code>
            </div>
          </div>

          <div className="tool-detail-block">
            <div className="tool-block-label">Применение</div>
            <p className="tool-use-text">{tool.use}</p>
          </div>

          <a href={tool.docs} target="_blank" rel="noreferrer" className="tool-docs-link">
            Официальная документация →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">Инструменты <span className="accent">системного администратора</span></h1>
      <p className="page-subtitle">22 инструмента с описанием, командами установки и ссылками на документацию.</p>

      <div className="tools-controls">
        <input
          className="tools-search"
          placeholder="Поиск по названию или тегу..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="tools-cats">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              className={`tools-cat-btn ${cat === c.id ? 'active' : ''}`}
              onClick={() => setCat(c.id)}
            >{c.label}</button>
          ))}
        </div>
      </div>

      <div className="tools-count">{filtered.length} инструментов</div>

      <div className="tools-grid">
        {filtered.map(tool => (
          <div key={tool.id} className="tool-card" onClick={() => setSelected(tool.id)}>
            <div className="tool-card-head">
              <span className="tool-card-name" style={{ color: tool.color }}>{tool.name}</span>
            </div>
            <p className="tool-card-desc">{tool.desc}</p>
            <div className="tool-card-tags">
              {tool.tags.map(tag => (
                <span key={tag} className="tool-tag">{tag}</span>
              ))}
            </div>
            <div className="tool-card-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  )
}
