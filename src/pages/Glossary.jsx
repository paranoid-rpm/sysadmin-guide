import { useState } from 'react'
import './Glossary.css'

const TERMS = [
  // ОС
  { term: 'Kernel', cat: 'Linux', desc: 'Ядро — центральный компонент Linux, управляющий оборудованием, памятью и процессами.', example: 'uname -r' },
  { term: 'PID', cat: 'Linux', desc: 'Process ID — уникальный идентификатор процесса в Linux. PID 1 — всегда systemd.', example: 'ps aux' },
  { term: 'inode', cat: 'Linux', desc: 'Метаданные файла: размер, владелец, время изменения, адреса блоков. Имя файла — в директории.', example: 'ls -li' },
  { term: 'Swap', cat: 'Linux', desc: 'Область на диске, используемая как расширение RAM. При злоупотреблении тормозит производительность.', example: 'swapon --show' },
  { term: 'cgroups', cat: 'Linux', desc: 'Control Groups — механизм ядра для ограничения CPU, RAM, I/O групп процессов. Основа Docker и systemd.', example: 'cat /sys/fs/cgroup/memory/memory.limit_in_bytes' },
  { term: 'Namespace', cat: 'Linux', desc: 'Изоляция ресурсов процесса (PID, NET, MNT, UTS, IPC, USER). Основа контейнеризации.', example: 'lsns' },
  { term: 'systemd', cat: 'Linux', desc: 'Init-система и диспетчер сервисов. PID 1 в большинстве модерных дистрибутивов.', example: 'systemctl status' },
  { term: 'OOM Killer', cat: 'Linux', desc: 'Out-Of-Memory Killer — ядро убивает процессы при нехватке RAM. Смотреть dmesg при сбоях.', example: 'dmesg | grep -i oom' },
  // Сети
  { term: 'CIDR', cat: 'Сети', desc: 'Classless Inter-Domain Routing. Запись подсети в формате 192.168.1.0/24, где /24 — длина маски.', example: 'ip route show' },
  { term: 'BGP', cat: 'Сети', desc: 'Border Gateway Protocol — протокол маршрутизации между автономными системами (AS). Основа интернета.', example: 'birdc show route' },
  { term: 'NAT', cat: 'Сети', desc: 'Network Address Translation — перевод приватных IP-адресов в публичные. Использует iptables/nftables.', example: 'iptables -t nat -L' },
  { term: 'MTU', cat: 'Сети', desc: 'Maximum Transmission Unit — максимальный размер пакета. Стандарт Ethernet — 1500 байт.', example: 'ip link show eth0' },
  { term: 'VLAN', cat: 'Сети', desc: 'Virtual LAN — логическое разделение сети на L2. Теги 802.1Q. Изоляция трафика внутри одного коммутатора.', example: 'ip link add link eth0 name eth0.10 type vlan id 10' },
  { term: 'ARP', cat: 'Сети', desc: 'Address Resolution Protocol — преобразование IP в MAC-адрес на L2. Атака: ARP spoofing.', example: 'arp -n' },
  { term: 'TTL', cat: 'Сети', desc: 'Time To Live — число хопов IP-пакета. При TTL=0 пакет утилизируется. Также DNS-кэш записей.', example: 'ping -c1 ya.ru | grep ttl' },
  // Безопасность
  { term: 'CVE', cat: 'Безопасность', desc: 'Common Vulnerabilities and Exposures — единая база уязвимостей. Формат: CVE-2024-XXXX.', example: 'https://nvd.nist.gov/' },
  { term: 'RBAC', cat: 'Безопасность', desc: 'Role-Based Access Control — управление доступом через роли. Используется в Kubernetes, PostgreSQL, Vault.', example: 'kubectl get rolebinding' },
  { term: 'mTLS', cat: 'Безопасность', desc: 'Mutual TLS — двусторонняя аутентификация. И клиент, и сервер предъявляют сертификаты. Основа service mesh.', example: 'openssl verify -CAfile ca.crt client.crt' },
  { term: 'Zero Trust', cat: 'Безопасность', desc: 'Модель безопасности: никому не доверяй по умолчанию. Проверяй каждый запрос и пользователя.', example: '' },
  { term: 'SUID', cat: 'Безопасность', desc: 'Set User ID — файл запускается с правами владельца. При неправильной настройке — вектор привилегий.', example: 'find / -perm -4000 -type f 2>/dev/null' },
  // DevOps / Контейнеры
  { term: 'IaC', cat: 'DevOps', desc: 'Infrastructure as Code — управление инфраструктурой через код. Инструменты: Terraform, Ansible, Pulumi.', example: 'terraform plan' },
  { term: 'GitOps', cat: 'DevOps', desc: 'Практика, где Git-репозиторий является единственным источником истины. Инструменты: ArgoCD, Flux.', example: 'argocd app sync my-app' },
  { term: 'SLO', cat: 'DevOps', desc: 'Service Level Objective — целевой показатель надёжности. Например: доступность 99.9% за 30 дней.', example: '' },
  { term: 'Error Budget', cat: 'DevOps', desc: 'SRE-концепция: допустимое количество ошибок/даунтаймов до нарушения SLO. Есть бюджет — можно релизить.', example: '' },
  { term: 'Immutable Infrastructure', cat: 'DevOps', desc: 'Серверы не меняются — заменяются. Обновление — это пересоздание с новым образом.', example: '' },
  { term: 'Blue-Green Deploy', cat: 'DevOps', desc: 'Два идентичных окружения: одно активное, второе в ожидании. Переключение мгновенное.', example: '' },
  // БД
  { term: 'ACID', cat: 'Базы данных', desc: 'Atomicity, Consistency, Isolation, Durability — свойства транзакций в реляционных БД.', example: 'BEGIN; ... COMMIT;' },
  { term: 'WAL', cat: 'Базы данных', desc: 'Write-Ahead Log — журнал в PostgreSQL. Изменения сначала пишутся в WAL, потом на диск. Основа репликации.', example: 'pg_waldump' },
  { term: 'Vacuum', cat: 'Базы данных', desc: 'Очистка устаревших версий строк в PostgreSQL (MVCC). VACUUM FULL перестраивает таблицу, блокируя записи.', example: 'VACUUM ANALYZE mytable;' },
  { term: 'Replication Lag', cat: 'Базы данных', desc: 'Задержка реплики относительно примара. Опасно в системах с чтением с реплики.', example: 'SELECT * FROM pg_stat_replication;' },
  // Мониторинг
  { term: 'Observability', cat: 'Мониторинг', desc: 'Metrics + Logs + Traces. Три столпа наблюдаемости. Инструменты: Prometheus, Loki, Jaeger.', example: '' },
  { term: 'Cardinality', cat: 'Мониторинг', desc: 'Количество уникальных значений метрики. Высокая cardinality (user_id в labels) убивает Prometheus.', example: '' },
  { term: 'Tracing', cat: 'Мониторинг', desc: 'Distributed tracing — отслеживание пути запроса через микросервисы. Span, Trace ID. Инструменты: Jaeger, Tempo.', example: '' },
]

const CATS = ['Все', ...Array.from(new Set(TERMS.map(t => t.cat)))]

export default function Glossary() {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('Все')
  const [open, setOpen] = useState(null)

  const filtered = TERMS.filter(t =>
    (cat === 'Все' || t.cat === cat) &&
    (t.term.toLowerCase().includes(search.toLowerCase()) ||
     t.desc.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <h1 className="page-title">Глоссарий <span className="accent">терминов</span></h1>
      <p className="page-subtitle">{TERMS.length} терминов с описаниями и примерами.</p>

      <div className="gl-controls">
        <input
          className="gl-search"
          placeholder="Поиск термина..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="gl-cats">
          {CATS.map(c => (
            <button
              key={c}
              className={`gl-cat-btn ${cat === c ? 'active' : ''}`}
              onClick={() => setCat(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      <div className="gl-count">{filtered.length} терминов</div>

      <div className="gl-grid">
        {filtered.map(t => (
          <div
            key={t.term}
            className={`gl-card ${open === t.term ? 'open' : ''}`}
            onClick={() => setOpen(open === t.term ? null : t.term)}
          >
            <div className="gl-card-head">
              <span className="gl-term">{t.term}</span>
              <span className="gl-cat-badge">{t.cat}</span>
              <span className="gl-arrow">{open === t.term ? '∧' : '∨'}</span>
            </div>
            {open === t.term && (
              <div className="gl-card-body">
                <p className="gl-desc">{t.desc}</p>
                {t.example && (
                  <div className="gl-example">
                    <span className="gl-ex-prompt">$</span>
                    <code>{t.example}</code>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
