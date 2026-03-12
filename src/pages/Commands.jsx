import { useState } from 'react'
import './Commands.css'

const SECTIONS = [
  {
    id: 'files',
    title: 'Файлы и директории',
    icon: '📁',
    color: '#00aaff',
    commands: [
      { cmd: 'ls -lah', desc: 'Список файлов с размерами и скрытыми' },
      { cmd: 'find /path -name "*.log" -mtime +7', desc: 'Найти .log файлы старше 7 дней' },
      { cmd: 'du -sh /*', desc: 'Размер директорий в корне' },
      { cmd: 'df -hT', desc: 'Использование дисков с типом ФС' },
      { cmd: 'lsof +D /var/log', desc: 'Открытые файлы в директории' },
      { cmd: 'stat file.txt', desc: 'Детальная информация о файле' },
      { cmd: 'rsync -avz src/ user@host:/dst/', desc: 'Синхронизация файлов по SSH' },
      { cmd: 'tar -czf archive.tar.gz /path', desc: 'Создать gz-архив' },
      { cmd: 'tar -xzf archive.tar.gz -C /dst', desc: 'Распаковать gz-архив' },
      { cmd: 'chmod 644 file && chown user:group file', desc: 'Установить права и владельца' },
    ]
  },
  {
    id: 'process',
    title: 'Процессы и ресурсы',
    icon: '⚙️',
    color: '#00e676',
    commands: [
      { cmd: 'ps aux --sort=-%cpu | head -10', desc: 'Топ процессов по CPU' },
      { cmd: 'ps aux --sort=-%mem | head -10', desc: 'Топ процессов по памяти' },
      { cmd: 'kill -15 PID', desc: 'Мягкое завершение процесса' },
      { cmd: 'kill -9 PID', desc: 'Принудительное завершение' },
      { cmd: 'pgrep -u www-data nginx', desc: 'PID процесса по имени и пользователю' },
      { cmd: 'lsof -p PID', desc: 'Открытые файлы процесса' },
      { cmd: 'strace -p PID', desc: 'Системные вызовы процесса' },
      { cmd: 'nice -n 10 command', desc: 'Запустить с пониженным приоритетом' },
      { cmd: 'nohup command &', desc: 'Запустить в фоне, игнорируя SIGHUP' },
      { cmd: 'cat /proc/PID/status', desc: 'Статус и лимиты процесса' },
    ]
  },
  {
    id: 'network',
    title: 'Сеть',
    icon: '🌐',
    color: '#818cf8',
    commands: [
      { cmd: 'ss -tulpn', desc: 'Открытые порты и слушающие сервисы' },
      { cmd: 'ss -s', desc: 'Сводка по соединениям' },
      { cmd: 'ip addr show', desc: 'IP-адреса интерфейсов' },
      { cmd: 'ip route show', desc: 'Таблица маршрутизации' },
      { cmd: 'curl -I https://example.com', desc: 'HTTP-заголовки ответа' },
      { cmd: 'curl -o /dev/null -s -w "%{http_code}" URL', desc: 'Только HTTP статус код' },
      { cmd: 'dig +short example.com', desc: 'Быстрый DNS-запрос' },
      { cmd: 'dig +trace example.com', desc: 'Полный путь DNS-резолвинга' },
      { cmd: 'tcpdump -i eth0 port 80 -n', desc: 'Захват трафика на порту 80' },
      { cmd: 'iptables -L -n -v --line-numbers', desc: 'Правила фаервола с номерами' },
    ]
  },
  {
    id: 'systemd',
    title: 'Systemd',
    icon: '🔧',
    color: '#fb923c',
    commands: [
      { cmd: 'systemctl status nginx', desc: 'Статус сервиса' },
      { cmd: 'systemctl restart nginx', desc: 'Перезапустить сервис' },
      { cmd: 'systemctl reload nginx', desc: 'Перечитать конфиг без остановки' },
      { cmd: 'systemctl enable --now nginx', desc: 'Включить и сразу запустить' },
      { cmd: 'systemctl list-units --failed', desc: 'Упавшие юниты' },
      { cmd: 'journalctl -u nginx -f', desc: 'Логи сервиса в реальном времени' },
      { cmd: 'journalctl -u nginx --since "1h ago"', desc: 'Логи за последний час' },
      { cmd: 'journalctl -p err -b', desc: 'Ошибки с последней загрузки' },
      { cmd: 'systemd-analyze blame', desc: 'Время запуска каждого юнита' },
      { cmd: 'systemctl cat nginx', desc: 'Показать unit-файл сервиса' },
    ]
  },
  {
    id: 'docker',
    title: 'Docker',
    icon: '🐳',
    color: '#2496ed',
    commands: [
      { cmd: 'docker ps -a', desc: 'Все контейнеры включая остановленные' },
      { cmd: 'docker logs -f --tail=100 container', desc: 'Логи контейнера в реальном времени' },
      { cmd: 'docker exec -it container bash', desc: 'Зайти в контейнер' },
      { cmd: 'docker stats --no-stream', desc: 'Потребление ресурсов контейнерами' },
      { cmd: 'docker inspect container | jq .[0].NetworkSettings', desc: 'Сетевые настройки контейнера' },
      { cmd: 'docker compose up -d --build', desc: 'Пересобрать и запустить' },
      { cmd: 'docker compose down -v', desc: 'Остановить и удалить volumes' },
      { cmd: 'docker system prune -af', desc: 'Очистить всё неиспользуемое' },
      { cmd: 'docker image ls --filter dangling=true', desc: 'Висячие образы' },
      { cmd: 'docker network ls', desc: 'Список сетей Docker' },
    ]
  },
  {
    id: 'logs',
    title: 'Логи и дебаг',
    icon: '📜',
    color: '#f4a261',
    commands: [
      { cmd: 'tail -f /var/log/syslog', desc: 'Системный лог в реальном времени' },
      { cmd: 'grep -r "ERROR" /var/log/ --include="*.log"', desc: 'Поиск ошибок в логах' },
      { cmd: 'awk \'NR>=100 && NR<=200\' file.log', desc: 'Строки 100-200 из файла' },
      { cmd: 'zcat /var/log/syslog.*.gz | grep ERROR', desc: 'Поиск в сжатых логах' },
      { cmd: 'dmesg -T | tail -50', desc: 'Последние записи ядра с временем' },
      { cmd: 'last -n 20', desc: 'Последние 20 входов в систему' },
      { cmd: 'lastb | head -20', desc: 'Неудачные попытки входа' },
      { cmd: 'ausearch -m avc -ts recent', desc: 'SELinux запреты за последнее время' },
      { cmd: 'logrotate -d /etc/logrotate.conf', desc: 'Проверить конфиг logrotate' },
      { cmd: 'multitail /var/log/nginx/access.log /var/log/syslog', desc: 'Несколько логов в одном окне' },
    ]
  },
  {
    id: 'postgres',
    title: 'PostgreSQL',
    icon: '🐘',
    color: '#336791',
    commands: [
      { cmd: 'psql -U postgres -c "\\l"', desc: 'Список баз данных' },
      { cmd: 'psql -U postgres -c "SELECT pg_size_pretty(pg_database_size(\'mydb\'));"', desc: 'Размер базы данных' },
      { cmd: 'psql -U postgres -c "SELECT * FROM pg_stat_activity WHERE state=\'active\';"', desc: 'Активные запросы' },
      { cmd: 'psql -U postgres -c "SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 5;"', desc: 'Самые долгие запросы' },
      { cmd: 'pg_dump -Fc mydb > mydb.dump', desc: 'Бэкап в custom format' },
      { cmd: 'pg_restore -d mydb mydb.dump', desc: 'Восстановление из custom format' },
      { cmd: 'vacuumdb -a -z', desc: 'VACUUM ANALYZE всех баз' },
      { cmd: 'psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname=\'mydb\' AND pid<>pg_backend_pid();"', desc: 'Сбросить все соединения к БД' },
      { cmd: 'pg_lsclusters', desc: 'Список кластеров PostgreSQL' },
      { cmd: 'tail -f /var/log/postgresql/postgresql-*.log', desc: 'Логи PostgreSQL в реальном времени' },
    ]
  },
  {
    id: 'security',
    title: 'Безопасность',
    icon: '🛡️',
    color: '#e63946',
    commands: [
      { cmd: 'ss -tulpn | grep LISTEN', desc: 'Все слушающие порты' },
      { cmd: 'find / -perm -4000 -type f 2>/dev/null', desc: 'Файлы с SUID-битом' },
      { cmd: 'find / -perm -2000 -type f 2>/dev/null', desc: 'Файлы с SGID-битом' },
      { cmd: 'awk -F: \'$3 == 0 && $1 != "root"\'  /etc/passwd', desc: 'Пользователи с UID 0 (не root)' },
      { cmd: 'cat /etc/sudoers | grep -v "^#"', desc: 'Активные правила sudo' },
      { cmd: 'fail2ban-client status sshd', desc: 'Статус защиты SSH от brute-force' },
      { cmd: 'lynis audit system', desc: 'Полный аудит безопасности системы' },
      { cmd: 'openssl s_client -connect host:443 2>/dev/null | openssl x509 -noout -dates', desc: 'Срок действия SSL-сертификата' },
      { cmd: 'chage -l username', desc: 'Политика паролей пользователя' },
      { cmd: 'getenforce', desc: 'Статус SELinux' },
    ]
  },
]

function copyToClipboard(text, setCopied) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(text)
    setTimeout(() => setCopied(null), 1500)
  })
}

export default function Commands() {
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(null)
  const [active, setActive] = useState('all')

  const filtered = SECTIONS
    .filter(s => active === 'all' || s.id === active)
    .map(s => ({
      ...s,
      commands: s.commands.filter(
        c => c.cmd.toLowerCase().includes(search.toLowerCase()) ||
             c.desc.toLowerCase().includes(search.toLowerCase())
      )
    }))
    .filter(s => s.commands.length > 0)

  const totalCount = filtered.reduce((n, s) => n + s.commands.length, 0)

  return (
    <div>
      <h1 className="page-title">Шпаргалка <span className="accent">команд</span></h1>
      <p className="page-subtitle">80 команд по 8 категориям. Клик на команду — скопировать в буфер.</p>

      <div className="cmd-controls">
        <input
          className="cmd-search"
          placeholder="Поиск по команде или описанию..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="cmd-cats">
          <button
            className={`cmd-cat-btn ${active === 'all' ? 'active' : ''}`}
            onClick={() => setActive('all')}
          >Все</button>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`cmd-cat-btn ${active === s.id ? 'active' : ''}`}
              style={{ '--sc': s.color }}
              onClick={() => setActive(s.id)}
            >
              {s.icon} {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="cmd-count">{totalCount} команд</div>

      <div className="cmd-sections">
        {filtered.map(section => (
          <div key={section.id} className="cmd-section">
            <div className="cmd-section-title" style={{ borderLeftColor: section.color }}>
              {section.icon} {section.title}
            </div>
            <div className="cmd-list">
              {section.commands.map((c, i) => (
                <div
                  key={i}
                  className={`cmd-item ${copied === c.cmd ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(c.cmd, setCopied)}
                >
                  <div className="cmd-line">
                    <span className="cmd-prompt">$</span>
                    <code className="cmd-text">{c.cmd}</code>
                    <span className="cmd-copy-icon">
                      {copied === c.cmd ? '✓' : '⧉'}
                    </span>
                  </div>
                  <div className="cmd-desc">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
