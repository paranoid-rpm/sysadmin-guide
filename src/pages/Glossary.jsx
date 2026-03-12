import { useState } from 'react'
import './Glossary.css'

const TERMS = [
  // Linux
  { term: 'Kernel',            cat: 'Linux',        desc: 'Ядро — центральный компонент Linux, управляющий оборудованием, памятью и процессами.',                                             example: 'uname -r' },
  { term: 'PID',               cat: 'Linux',        desc: 'Process ID — уникальный идентификатор процесса. PID 1 — всегда init/systemd.',                                                       example: 'ps aux' },
  { term: 'inode',             cat: 'Linux',        desc: 'Метаданные файла: размер, владелец, время изменения, адреса блоков. Имя файла хранится в директории, а не в inode.',                 example: 'ls -li' },
  { term: 'Swap',              cat: 'Linux',        desc: 'Область диска, используемая как расширение RAM. При активном использовании резко снижает производительность.',                        example: 'swapon --show' },
  { term: 'cgroups',           cat: 'Linux',        desc: 'Control Groups — ограничение CPU, RAM, I/O групп процессов. Основа Docker и systemd.',                                              example: 'cat /sys/fs/cgroup/memory/memory.limit_in_bytes' },
  { term: 'Namespace',         cat: 'Linux',        desc: 'Изоляция ресурсов процесса (PID, NET, MNT, UTS, IPC, USER). Основа контейнеризации.',                                              example: 'lsns' },
  { term: 'systemd',           cat: 'Linux',        desc: 'Init-система и диспетчер сервисов. PID 1 в большинстве современных дистрибутивов.',                                                  example: 'systemctl status' },
  { term: 'OOM Killer',        cat: 'Linux',        desc: 'Out-Of-Memory Killer — ядро принудительно завершает процессы при исчерпании RAM. Диагностика через dmesg.',                         example: 'dmesg | grep -i oom' },
  { term: 'runlevel',          cat: 'Linux',        desc: 'Уровень выполнения системы (0–6). В systemd заменён на targets: multi-user.target, graphical.target и т.д.',                        example: 'systemctl get-default' },
  { term: 'ulimit',            cat: 'Linux',        desc: 'Ограничение ресурсов для процессов пользователя: число открытых файлов, размер стека, макс. процессы.',                             example: 'ulimit -a' },
  { term: 'epoll',             cat: 'Linux',        desc: 'Механизм ядра для масштабируемого I/O-мультиплексирования. Используется Nginx, Node.js, Redis для обработки тысяч соединений.',     example: '' },
  { term: 'signals',           cat: 'Linux',        desc: 'Сигналы — асинхронные уведомления процессам. SIGTERM — запрос завершения, SIGKILL — принудительное, SIGHUP — reload конфига.',       example: 'kill -l' },
  { term: 'tmpfs',             cat: 'Linux',        desc: 'Файловая система в RAM. /tmp и /run обычно монтируются как tmpfs. Данные исчезают после перезагрузки.',                             example: 'df -t tmpfs' },
  { term: 'LVM',               cat: 'Linux',        desc: 'Logical Volume Manager — гибкое управление разделами поверх физических дисков. Поддерживает снапшоты и resize онлайн.',             example: 'lvdisplay' },
  // Сети
  { term: 'CIDR',              cat: 'Сети',         desc: 'Classless Inter-Domain Routing. Запись подсети вида 192.168.1.0/24, где /24 — длина маски.',                                         example: 'ip route show' },
  { term: 'BGP',               cat: 'Сети',         desc: 'Border Gateway Protocol — протокол маршрутизации между автономными системами (AS). Основа глобального интернета.',                    example: 'birdc show route' },
  { term: 'NAT',               cat: 'Сети',         desc: 'Network Address Translation — перевод приватных IP в публичные. Реализуется через iptables/nftables.',                               example: 'iptables -t nat -L' },
  { term: 'MTU',               cat: 'Сети',         desc: 'Maximum Transmission Unit — максимальный размер пакета. Ethernet: 1500 байт. При несовпадении MTU возникает фрагментация.',          example: 'ip link show eth0' },
  { term: 'VLAN',              cat: 'Сети',         desc: 'Virtual LAN — логическое разделение сети на L2 с тегами 802.1Q. Изоляция трафика внутри одного коммутатора.',                        example: 'ip link add link eth0 name eth0.10 type vlan id 10' },
  { term: 'ARP',               cat: 'Сети',         desc: 'Address Resolution Protocol — разрешение IP в MAC-адрес на L2. Уязвимость: ARP spoofing / ARP poisoning.',                          example: 'arp -n' },
  { term: 'TTL',               cat: 'Сети',         desc: 'Time To Live — число хопов пакета. При TTL=0 пакет отбрасывается. Также: время жизни DNS-записи в кэше.',                           example: 'ping -c1 ya.ru | grep ttl' },
  { term: 'DNS',               cat: 'Сети',         desc: 'Domain Name System — иерархическая система разрешения имён в IP. Типы записей: A, AAAA, CNAME, MX, TXT, NS, PTR.',                   example: 'dig +short ya.ru' },
  { term: 'TCP handshake',     cat: 'Сети',         desc: 'Трёхфазное рукопожатие TCP: SYN → SYN-ACK → ACK. Устанавливает соединение перед передачей данных.',                                  example: 'tcpdump -i eth0 tcp[tcpflags]' },
  { term: 'anycast',           cat: 'Сети',         desc: 'Маршрутизация к ближайшему узлу с одним IP-адресом. Используется Cloudflare, Google DNS (8.8.8.8).',                                 example: '' },
  { term: 'keepalive',         cat: 'Сети',         desc: 'Механизм поддержания соединения TCP/HTTP. Снижает overhead на установку новых соединений.',                                          example: 'ss -tn' },
  // Безопасность
  { term: 'CVE',               cat: 'Безопасность', desc: 'Common Vulnerabilities and Exposures — единая база уязвимостей. Формат: CVE-YYYY-NNNN.',                                             example: 'https://nvd.nist.gov/' },
  { term: 'RBAC',              cat: 'Безопасность', desc: 'Role-Based Access Control — управление доступом через роли. Применяется в Kubernetes, PostgreSQL, Vault.',                           example: 'kubectl get rolebinding' },
  { term: 'mTLS',              cat: 'Безопасность', desc: 'Mutual TLS — двусторонняя аутентификация: и клиент, и сервер предъявляют сертификаты. Основа service mesh (Istio, Linkerd).',       example: 'openssl verify -CAfile ca.crt client.crt' },
  { term: 'Zero Trust',        cat: 'Безопасность', desc: 'Модель безопасности: никому не доверять по умолчанию. Каждый запрос должен проходить аутентификацию и авторизацию.',                 example: '' },
  { term: 'SUID',              cat: 'Безопасность', desc: 'Set User ID — исполняемый файл запускается с правами владельца. Некорректная настройка — вектор повышения привилегий.',             example: 'find / -perm -4000 -type f 2>/dev/null' },
  { term: 'SELinux',           cat: 'Безопасность', desc: 'Security-Enhanced Linux — мандатный контроль доступа (MAC) на уровне ядра. Режимы: enforcing, permissive, disabled.',               example: 'getenforce' },
  { term: 'AppArmor',          cat: 'Безопасность', desc: 'LSM-модуль для профилирования приложений. Применяется в Ubuntu/Debian. Альтернатива SELinux.',                                      example: 'aa-status' },
  { term: 'fail2ban',          cat: 'Безопасность', desc: 'Анализирует логи и блокирует IP при брутфорс-атаках через iptables/nftables.',                                                       example: 'fail2ban-client status sshd' },
  { term: 'audit',             cat: 'Безопасность', desc: 'Linux Audit — подсистема ядра для записи событий безопасности: syscall, открытие файлов, смена привилегий.',                         example: 'ausearch -m USER_LOGIN' },
  // DevOps
  { term: 'IaC',               cat: 'DevOps',       desc: 'Infrastructure as Code — управление инфраструктурой через код. Инструменты: Terraform, Ansible, Pulumi.',                           example: 'terraform plan' },
  { term: 'GitOps',            cat: 'DevOps',       desc: 'Git как единственный источник истины для инфраструктуры. Инструменты: ArgoCD, Flux.',                                               example: 'argocd app sync my-app' },
  { term: 'SLO',               cat: 'DevOps',       desc: 'Service Level Objective — целевой показатель надёжности. Пример: доступность 99.9% за 30 дней.',                                    example: '' },
  { term: 'Error Budget',      cat: 'DevOps',       desc: 'SRE-концепция: допустимый объём ошибок до нарушения SLO. Есть бюджет — можно релизить.',                                           example: '' },
  { term: 'Blue-Green Deploy', cat: 'DevOps',       desc: 'Два идентичных окружения: активное и резервное. Переключение мгновенное, откат — тривиальный.',                                     example: '' },
  { term: 'Canary Release',    cat: 'DevOps',       desc: 'Постепенный вывод новой версии на малый процент трафика. Снижает риск регрессий в продакшене.',                                     example: '' },
  { term: 'CI/CD',             cat: 'DevOps',       desc: 'Continuous Integration / Continuous Delivery. Автоматизация сборки, тестирования и доставки изменений.',                            example: 'gh run list' },
  { term: 'Helm',              cat: 'DevOps',       desc: 'Пакетный менеджер для Kubernetes. Chart — пакет манифестов с шаблонизацией через Go templates.',                                    example: 'helm upgrade --install app ./chart' },
  // Базы данных
  { term: 'ACID',              cat: 'Базы данных',  desc: 'Atomicity, Consistency, Isolation, Durability — свойства транзакций в реляционных БД.',                                            example: 'BEGIN; ... COMMIT;' },
  { term: 'WAL',               cat: 'Базы данных',  desc: 'Write-Ahead Log — журнал PostgreSQL. Изменения пишутся сначала в WAL, потом применяются к данным. Основа репликации и восстановления.', example: 'pg_waldump' },
  { term: 'Vacuum',            cat: 'Базы данных',  desc: 'Очистка устаревших версий строк в PostgreSQL (MVCC). VACUUM FULL перестраивает таблицу с блокировкой записей.',                      example: 'VACUUM ANALYZE mytable;' },
  { term: 'Replication Lag',   cat: 'Базы данных',  desc: 'Задержка реплики относительно primary. Критично при чтении с реплики в системах с высокой записью.',                              example: 'SELECT * FROM pg_stat_replication;' },
  { term: 'MVCC',              cat: 'Базы данных',  desc: 'Multi-Version Concurrency Control — чтение не блокирует запись. Каждая транзакция видит снапшот данных на момент начала.',          example: '' },
  { term: 'connection pool',   cat: 'Базы данных',  desc: 'Пул соединений снижает overhead на установку новых TCP-соединений к БД. Инструменты: PgBouncer, pgpool-II.',                       example: 'psql -h pgbouncer-host' },
  { term: 'index',             cat: 'Базы данных',  desc: 'Структура данных для ускорения запросов. B-tree — по умолчанию. GIN — для JSONB/массивов. BRIN — для монотонных данных.',          example: 'EXPLAIN ANALYZE SELECT ...;' },
  // Мониторинг
  { term: 'Observability',     cat: 'Мониторинг',   desc: 'Metrics + Logs + Traces — три столпа наблюдаемости. Инструменты: Prometheus, Loki, Jaeger/Tempo.',                                 example: '' },
  { term: 'Cardinality',       cat: 'Мониторинг',   desc: 'Количество уникальных значений метки в Prometheus. Высокая cardinality (user_id в labels) перегружает TSDB.',                      example: '' },
  { term: 'Tracing',           cat: 'Мониторинг',   desc: 'Distributed tracing — отслеживание пути запроса через микросервисы. Span, Trace ID. Инструменты: Jaeger, Tempo, Zipkin.',        example: '' },
  { term: 'alert',             cat: 'Мониторинг',   desc: 'Правило Alertmanager: при превышении порога отправляет уведомление в Slack/PagerDuty. Настраивается через PromQL.',               example: '' },
  { term: 'RED method',        cat: 'Мониторинг',   desc: 'Rate, Errors, Duration — базовые метрики для сервисов. Аналог USE для ресурсов: Utilization, Saturation, Errors.',              example: '' },
]

const CATS = ['Все', ...Array.from(new Set(TERMS.map(t => t.cat)))]

export default function Glossary() {
  const [search, setSearch] = useState('')
  const [cat, setCat]       = useState('Все')
  const [open, setOpen]     = useState(null)

  const filtered = TERMS.filter(t =>
    (cat === 'Все' || t.cat === cat) &&
    (t.term.toLowerCase().includes(search.toLowerCase()) ||
     t.desc.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <h1 className="page-title">Глоссарий <span className="accent">терминов</span></h1>
      <p className="page-subtitle">{TERMS.length} терминов — Linux, сети, безопасность, DevOps, базы данных, мониторинг.</p>

      <div className="gl-controls">
        <input
          className="gl-search"
          placeholder="Поиск по термину или описанию..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="gl-cats">
          {CATS.map(c => (
            <button key={c} className={`gl-cat-btn ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div className="gl-count">{filtered.length} / {TERMS.length} терминов</div>

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
