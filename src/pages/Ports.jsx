import { useState } from 'react'
import './Ports.css'

const PORTS = [
  // Сеть/Инфра
  { port: 20,    proto: 'TCP',     name: 'FTP Data',        cat: 'Сеть',        risk: 'medium',   desc: 'Передача данных FTP (пассивный режим)' },
  { port: 21,    proto: 'TCP',     name: 'FTP Control',     cat: 'Сеть',        risk: 'high',     desc: 'Управление FTP. Не шифруется — предпочесть SFTP' },
  { port: 22,    proto: 'TCP',     name: 'SSH',             cat: 'Сеть',        risk: 'low',      desc: 'Безопасный удалённый доступ. Сменить порт по умолчанию' },
  { port: 23,    proto: 'TCP',     name: 'Telnet',          cat: 'Сеть',        risk: 'critical', desc: 'Небезопасный терминал. Никогда не использовать в продакшене' },
  { port: 25,    proto: 'TCP',     name: 'SMTP',            cat: 'Почта',       risk: 'medium',   desc: 'Отправка почты. Часто блокируется провайдерами' },
  { port: 53,    proto: 'TCP/UDP', name: 'DNS',             cat: 'Сеть',        risk: 'low',      desc: 'Разрешение доменных имён. UDP для запросов, TCP для зонных передач' },
  { port: 67,    proto: 'UDP',     name: 'DHCP Server',     cat: 'Сеть',        risk: 'low',      desc: 'Выдача IP-адресов клиентам' },
  { port: 68,    proto: 'UDP',     name: 'DHCP Client',     cat: 'Сеть',        risk: 'low',      desc: 'Получение IP-адреса от DHCP-сервера' },
  { port: 80,    proto: 'TCP',     name: 'HTTP',            cat: 'Веб',         risk: 'medium',   desc: 'Нешифрованный веб-трафик. Перенаправлять на 443' },
  { port: 110,   proto: 'TCP',     name: 'POP3',            cat: 'Почта',       risk: 'medium',   desc: 'Получение почты. Устарел, предпочесть IMAP' },
  { port: 123,   proto: 'UDP',     name: 'NTP',             cat: 'Сеть',        risk: 'low',      desc: 'Синхронизация времени. Критично для Kerberos и TLS' },
  { port: 143,   proto: 'TCP',     name: 'IMAP',            cat: 'Почта',       risk: 'medium',   desc: 'Протокол доступа к почте' },
  { port: 161,   proto: 'UDP',     name: 'SNMP',            cat: 'Мониторинг',  risk: 'medium',   desc: 'Мониторинг сетевых устройств. V1/V2 небезопасны' },
  { port: 443,   proto: 'TCP',     name: 'HTTPS',           cat: 'Веб',         risk: 'low',      desc: 'Зашифрованный веб-трафик (TLS)' },
  { port: 465,   proto: 'TCP',     name: 'SMTPS',           cat: 'Почта',       risk: 'low',      desc: 'SMTP через TLS (устаревший). Лучше 587+STARTTLS' },
  { port: 514,   proto: 'UDP',     name: 'Syslog',          cat: 'Логи',        risk: 'medium',   desc: 'Передача syslog-сообщений. UDP — без гарантий доставки' },
  { port: 587,   proto: 'TCP',     name: 'SMTP/TLS',        cat: 'Почта',       risk: 'low',      desc: 'Отправка почты с STARTTLS (рекомендованный)' },
  { port: 636,   proto: 'TCP',     name: 'LDAPS',           cat: 'Каталог',     risk: 'low',      desc: 'LDAP через TLS для аутентификации' },
  { port: 853,   proto: 'TCP',     name: 'DNS-over-TLS',    cat: 'Сеть',        risk: 'low',      desc: 'Зашифрованные DNS-запросы (DoT)' },
  { port: 993,   proto: 'TCP',     name: 'IMAPS',           cat: 'Почта',       risk: 'low',      desc: 'IMAP через TLS' },
  { port: 995,   proto: 'TCP',     name: 'POP3S',           cat: 'Почта',       risk: 'low',      desc: 'POP3 через TLS' },
  // Базы данных
  { port: 1433,  proto: 'TCP',     name: 'MSSQL',           cat: 'БД',          risk: 'high',     desc: 'Microsoft SQL Server. Закрыть снаружи' },
  { port: 1521,  proto: 'TCP',     name: 'Oracle DB',       cat: 'БД',          risk: 'high',     desc: 'Oracle Database. Не выставлять в интернет' },
  { port: 3306,  proto: 'TCP',     name: 'MySQL',           cat: 'БД',          risk: 'high',     desc: 'MySQL/MariaDB. Только локальный или VPN-доступ' },
  { port: 5432,  proto: 'TCP',     name: 'PostgreSQL',      cat: 'БД',          risk: 'high',     desc: 'PostgreSQL. Ограничить pg_hba.conf' },
  { port: 6379,  proto: 'TCP',     name: 'Redis',           cat: 'БД',          risk: 'critical', desc: 'Redis без аутентификации. Только localhost или VPN!' },
  { port: 6380,  proto: 'TCP',     name: 'Redis TLS',       cat: 'БД',          risk: 'low',      desc: 'Redis с TLS (Redis 6+). Рекомендуется вместо 6379 на проде' },
  { port: 26379, proto: 'TCP',     name: 'Redis Sentinel',  cat: 'БД',          risk: 'medium',   desc: 'Redis Sentinel — мониторинг и автофейловер' },
  { port: 27017, proto: 'TCP',     name: 'MongoDB',         cat: 'БД',          risk: 'high',     desc: 'MongoDB. Включить аутентификацию' },
  { port: 9200,  proto: 'TCP',     name: 'Elasticsearch',   cat: 'БД',          risk: 'critical', desc: 'Elasticsearch REST API. Никогда не выставлять в интернет' },
  { port: 9300,  proto: 'TCP',     name: 'Elasticsearch cluster', cat: 'БД',   risk: 'high',     desc: 'Elasticsearch межузловое взаимодействие. Только внутренняя сеть' },
  // Очереди
  { port: 2181,  proto: 'TCP',     name: 'ZooKeeper',       cat: 'Очереди',     risk: 'medium',   desc: 'Apache ZooKeeper (координация Kafka и др.)' },
  { port: 4369,  proto: 'TCP',     name: 'EPMD',            cat: 'Очереди',     risk: 'medium',   desc: 'Erlang Port Mapper (RabbitMQ). Закрыть снаружи' },
  { port: 5672,  proto: 'TCP',     name: 'RabbitMQ',        cat: 'Очереди',     risk: 'medium',   desc: 'RabbitMQ AMQP. Только внутренняя сеть' },
  { port: 9092,  proto: 'TCP',     name: 'Kafka',           cat: 'Очереди',     risk: 'medium',   desc: 'Apache Kafka broker. Настроить SASL/TLS' },
  { port: 9093,  proto: 'TCP',     name: 'Kafka TLS',       cat: 'Очереди',     risk: 'low',      desc: 'Kafka broker с TLS/SASL. Рекомендован для продакшена' },
  { port: 15672, proto: 'TCP',     name: 'RabbitMQ UI',     cat: 'Очереди',     risk: 'medium',   desc: 'RabbitMQ management UI. За reverse proxy' },
  // Контейнеры / Оркестрация
  { port: 2375,  proto: 'TCP',     name: 'Docker (HTTP)',   cat: 'Контейнеры',  risk: 'critical', desc: 'Docker daemon без TLS. Критическая уязвимость!' },
  { port: 2376,  proto: 'TCP',     name: 'Docker (TLS)',    cat: 'Контейнеры',  risk: 'medium',   desc: 'Docker daemon с TLS. Всё равно закрыть снаружи' },
  { port: 2379,  proto: 'TCP',     name: 'etcd client',     cat: 'Контейнеры',  risk: 'high',     desc: 'etcd клиентский API (Kubernetes). Только внутри кластера' },
  { port: 2380,  proto: 'TCP',     name: 'etcd peer',       cat: 'Контейнеры',  risk: 'high',     desc: 'etcd межузловой трафик. Только между нодами control plane' },
  { port: 5000,  proto: 'TCP',     name: 'Docker Registry', cat: 'Контейнеры',  risk: 'medium',   desc: 'Приватный Docker Registry' },
  { port: 6443,  proto: 'TCP',     name: 'Kubernetes API',  cat: 'Контейнеры',  risk: 'medium',   desc: 'Kubernetes API Server (kube-apiserver)' },
  { port: 10250, proto: 'TCP',     name: 'kubelet',         cat: 'Контейнеры',  risk: 'high',     desc: 'kubelet API. Закрыть снаружи, разрешить только control plane' },
  // Мониторинг
  { port: 3000,  proto: 'TCP',     name: 'Grafana',         cat: 'Мониторинг',  risk: 'medium',   desc: 'Grafana веб-интерфейс. Поставить за reverse proxy' },
  { port: 5601,  proto: 'TCP',     name: 'Kibana',          cat: 'Мониторинг',  risk: 'medium',   desc: 'Kibana веб-интерфейс. За reverse proxy с аутентификацией' },
  { port: 9090,  proto: 'TCP',     name: 'Prometheus',      cat: 'Мониторинг',  risk: 'medium',   desc: 'Prometheus веб-интерфейс и API. За reverse proxy' },
  { port: 9093,  proto: 'TCP',     name: 'Alertmanager',    cat: 'Мониторинг',  risk: 'medium',   desc: 'Alertmanager API и UI. Только внутренняя сеть' },
  { port: 9095,  proto: 'TCP',     name: 'Alertmanager cluster', cat: 'Мониторинг', risk: 'medium', desc: 'Alertmanager кластерная репликация' },
  { port: 9100,  proto: 'TCP',     name: 'Node Exporter',   cat: 'Мониторинг',  risk: 'medium',   desc: 'Prometheus node_exporter. Только внутренняя сеть' },
  { port: 3100,  proto: 'TCP',     name: 'Loki',            cat: 'Мониторинг',  risk: 'medium',   desc: 'Grafana Loki HTTP API для push логов и запросов' },
  { port: 9411,  proto: 'TCP',     name: 'Zipkin / Jaeger', cat: 'Мониторинг',  risk: 'medium',   desc: 'Zipkin-совместимый API для трейсинга (Jaeger, Tempo)' },
  { port: 14268, proto: 'TCP',     name: 'Jaeger collector',cat: 'Мониторинг',  risk: 'medium',   desc: 'Jaeger collector HTTP API. Только внутренняя сеть' },
  { port: 16686, proto: 'TCP',     name: 'Jaeger UI',       cat: 'Мониторинг',  risk: 'medium',   desc: 'Jaeger веб-интерфейс. За reverse proxy' },
  // Consul / Vault
  { port: 8200,  proto: 'TCP',     name: 'Vault',           cat: 'Безопасность',risk: 'medium',   desc: 'HashiCorp Vault API. TLS обязателен. Только внутренняя сеть' },
  { port: 8201,  proto: 'TCP',     name: 'Vault cluster',   cat: 'Безопасность',risk: 'medium',   desc: 'Vault межузловой трафик (HA режим)' },
  { port: 8300,  proto: 'TCP',     name: 'Consul RPC',      cat: 'Инфра',       risk: 'medium',   desc: 'Consul сервер RPC. Только внутренняя сеть' },
  { port: 8301,  proto: 'TCP/UDP', name: 'Consul LAN',      cat: 'Инфра',       risk: 'medium',   desc: 'Consul gossip LAN (между агентами)' },
  { port: 8302,  proto: 'TCP/UDP', name: 'Consul WAN',      cat: 'Инфра',       risk: 'medium',   desc: 'Consul gossip WAN (между датацентрами)' },
  { port: 8500,  proto: 'TCP',     name: 'Consul UI/API',   cat: 'Инфра',       risk: 'medium',   desc: 'Consul HTTP API и веб-интерфейс. За reverse proxy' },
  // Веб
  { port: 8080,  proto: 'TCP',     name: 'HTTP Alt',        cat: 'Веб',         risk: 'medium',   desc: 'Альтернативный HTTP. Jenkins, Tomcat и др.' },
  { port: 8443,  proto: 'TCP',     name: 'HTTPS Alt',       cat: 'Веб',         risk: 'low',      desc: 'Альтернативный HTTPS для приложений' },
]

const CATS  = ['Все', ...Array.from(new Set(PORTS.map(p => p.cat)))]
const RISKS = [
  { id: 'critical', label: 'Критично', color: '#ff3d57' },
  { id: 'high',     label: 'Высокий',  color: '#ff9900' },
  { id: 'medium',   label: 'Средний',  color: '#ffb300' },
  { id: 'low',      label: 'Низкий',   color: '#00e676' },
]

export default function Ports() {
  const [search,     setSearch]     = useState('')
  const [cat,        setCat]        = useState('Все')
  const [riskFilter, setRiskFilter] = useState('all')
  const [selected,   setSelected]   = useState(null)

  const filtered = PORTS.filter(p =>
    (cat        === 'Все' || p.cat  === cat) &&
    (riskFilter === 'all' || p.risk === riskFilter) &&
    (
      String(p.port).includes(search) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.desc.toLowerCase().includes(search.toLowerCase())
    )
  )

  const riskInfo = r => RISKS.find(x => x.id === r) || RISKS[2]

  return (
    <div>
      <h1 className="page-title">Справочник <span className="accent">портов</span></h1>
      <p className="page-subtitle">{PORTS.length} портов с описанием и оценкой риска. Клик на строку — детали.</p>

      <div className="ports-controls">
        <input
          className="ports-search"
          placeholder="Порт, название или описание..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="ports-filters">
          <div className="ports-filter-group">
            {CATS.map(c => (
              <button key={c} className={`ports-btn ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <div className="ports-filter-group">
            <button className={`ports-btn ${riskFilter === 'all' ? 'active' : ''}`} onClick={() => setRiskFilter('all')}>Все риски</button>
            {RISKS.map(r => (
              <button
                key={r.id}
                className={`ports-btn risk-btn ${riskFilter === r.id ? 'active' : ''}`}
                style={{ '--rc': r.color }}
                onClick={() => setRiskFilter(r.id)}
              >{r.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="ports-count">{filtered.length} / {PORTS.length} портов</div>

      <div className="ports-table-wrap">
        <table className="ports-table">
          <thead>
            <tr>
              <th>Порт</th>
              <th>Протокол</th>
              <th>Сервис</th>
              <th>Категория</th>
              <th>Риск</th>
              <th>Описание</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const ri = riskInfo(p.risk)
              return (
                <tr
                  key={p.port + p.name}
                  className={`ports-row ${selected === p.port + p.name ? 'sel' : ''}`}
                  onClick={() => setSelected(selected === p.port + p.name ? null : p.port + p.name)}
                >
                  <td><code className="port-num">{p.port}</code></td>
                  <td><span className="port-proto">{p.proto}</span></td>
                  <td className="port-name">{p.name}</td>
                  <td><span className="port-cat">{p.cat}</span></td>
                  <td><span className="port-risk" style={{ '--rc': ri.color }}>{ri.label}</span></td>
                  <td className="port-desc">{p.desc}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
