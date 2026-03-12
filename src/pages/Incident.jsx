import { useState } from 'react'
import './Incident.css'

const INCIDENTS = [
  {
    id: 'disk-full',
    severity: 'critical',
    title: 'Диск заполнен на 100%',
    icon: '💾',
    symptoms: ['Сервисы не стартуют', 'Ошибки записи в логи', 'SSH подключение работает, но команды не выполняются'],
    steps: [
      { title: 'Найти что занимает место', cmd: 'df -h && du -sh /* 2>/dev/null | sort -rh | head -20', desc: 'df покажет общую картину, du — самые тяжёлые директории' },
      { title: 'Проверить логи', cmd: 'du -sh /var/log/* | sort -rh | head -10', desc: 'Логи — частая причина переполнения' },
      { title: 'Ротировать логи принудительно', cmd: 'logrotate -f /etc/logrotate.conf', desc: 'Или удалить старые: find /var/log -name "*.gz" -mtime +30 -delete' },
      { title: 'Найти большие файлы', cmd: 'find / -type f -size +100M 2>/dev/null | sort -k5 -rn', desc: 'Ищем файлы крупнее 100 МБ' },
      { title: 'Очистить Docker мусор', cmd: 'docker system prune -af --volumes', desc: 'Удаляет остановленные контейнеры, неиспользуемые образы и тома' },
      { title: 'Очистить apt кэш', cmd: 'apt clean && apt autoremove -y', desc: '' },
      { title: 'Проверить снова', cmd: 'df -h', desc: 'Убедиться что место освободилось' },
    ],
    prevention: 'Настроить мониторинг диска (алерт при 80%). Настроить logrotate. Регулярно запускать docker system prune.'
  },
  {
    id: 'high-load',
    severity: 'high',
    title: 'Высокая нагрузка (Load Average)',
    icon: '🔥',
    symptoms: ['LA выше числа CPU', 'Система отвечает медленно', 'SSH подключается долго или не подключается'],
    steps: [
      { title: 'Посмотреть load average', cmd: 'uptime', desc: 'Числа: 1 мин / 5 мин / 15 мин. Норма ≤ количества CPU' },
      { title: 'Найти виновника', cmd: 'top -bn1 | head -20', desc: 'Смотри колонки CPU% и %MEM' },
      { title: 'Проверить состояние процессов', cmd: 'ps aux --sort=-%cpu | head -15', desc: 'D-state процессы = ждут I/O (проблема с диском?)' },
      { title: 'Проверить I/O', cmd: 'iostat -x 1 5', desc: 'Смотри %util и await. Если >90% — проблема с диском' },
      { title: 'Проверить память', cmd: 'free -h && vmstat 1 5', desc: 'Если swap активно используется — нехватка RAM' },
      { title: 'Завершить проблемный процесс', cmd: 'kill -15 <PID>  # мягко\nkill -9 <PID>   # жёстко', desc: 'Сначала -15 (SIGTERM), потом -9 (SIGKILL) если не помогло' },
      { title: 'Проверить cron', cmd: 'crontab -l && cat /etc/cron.d/*', desc: 'Возможно запустился тяжёлый плановый процесс' },
    ],
    prevention: 'Мониторинг CPU/LA. Настроить алерты. Оптимизировать тяжёлые запросы к БД. Ограничивать ресурсы контейнеров (cpu_limit).'
  },
  {
    id: 'no-network',
    severity: 'high',
    title: 'Нет сетевого соединения',
    icon: '🔌',
    symptoms: ['Сервис недоступен снаружи', 'ping до шлюза не проходит', 'DNS не резолвится'],
    steps: [
      { title: 'Проверить интерфейсы', cmd: 'ip addr show && ip link show', desc: 'Интерфейс должен быть UP и иметь IP' },
      { title: 'Проверить маршруты', cmd: 'ip route show', desc: 'Должен быть default route через шлюз' },
      { title: 'Пинг шлюза', cmd: 'ping -c 4 $(ip route | grep default | awk \'{print $3}\')', desc: 'Если шлюз не отвечает — проблема на уровне L2/L3' },
      { title: 'Проверить DNS', cmd: 'cat /etc/resolv.conf && dig google.com', desc: '' },
      { title: 'Проверить firewall', cmd: 'iptables -L -n -v && ufw status', desc: 'Возможно заблокированы нужные порты' },
      { title: 'Перезапустить сетевой сервис', cmd: 'systemctl restart networking\n# или\nnmcli networking off && nmcli networking on', desc: '' },
      { title: 'Проверить физический уровень', cmd: 'ethtool eth0 | grep -i link', desc: 'Link detected: yes — кабель подключён' },
    ],
    prevention: 'Мониторинг доступности с внешнего хоста. Документировать сетевую схему. Хранить backup конфигов.'
  },
  {
    id: 'nginx-502',
    severity: 'medium',
    title: 'Nginx 502 Bad Gateway',
    icon: '⚡',
    symptoms: ['Браузер показывает 502', 'Nginx работает, но backend недоступен', 'Ошибки в /var/log/nginx/error.log'],
    steps: [
      { title: 'Смотреть логи Nginx', cmd: 'tail -50 /var/log/nginx/error.log', desc: 'Ищем строки с upstream' },
      { title: 'Проверить работу upstream', cmd: 'curl -I http://localhost:8080', desc: 'Проверить что backend отвечает напрямую' },
      { title: 'Проверить процесс backend', cmd: 'systemctl status myapp\n# или для Docker:\ndocker compose ps', desc: '' },
      { title: 'Проверить порт', cmd: 'ss -tlnp | grep 8080', desc: 'Backend должен слушать нужный порт' },
      { title: 'Смотреть логи приложения', cmd: 'journalctl -u myapp -n 100 --no-pager', desc: 'Ищем исключения и ошибки старта' },
      { title: 'Перезапустить backend', cmd: 'systemctl restart myapp', desc: 'Иногда помогает, но нужно разобраться с причиной' },
      { title: 'Проверить конфиг Nginx', cmd: 'nginx -t && systemctl reload nginx', desc: 'После исправления конфига' },
    ],
    prevention: 'Настроить health checks. Мониторинг 5xx ошибок. Настроить автозапуск сервисов.'
  },
  {
    id: 'ssh-denied',
    severity: 'medium',
    title: 'SSH: доступ запрещён',
    icon: '🔐',
    symptoms: ['Permission denied (publickey)', 'Connection refused', 'Connection timed out'],
    steps: [
      { title: 'Проверить доступность порта', cmd: 'nc -zv server_ip 22', desc: 'Timeout = firewall или сервис не запущен' },
      { title: 'Verbose подключение', cmd: 'ssh -vvv user@server', desc: 'Покажет где именно происходит отказ' },
      { title: 'Проверить права на ключ', cmd: 'chmod 600 ~/.ssh/id_rsa\nchmod 700 ~/.ssh/', desc: 'SSH откажет если права слишком широкие' },
      { title: 'Проверить authorized_keys', cmd: 'cat ~/.ssh/authorized_keys', desc: 'Публичный ключ должен быть здесь' },
      { title: 'Проверить fail2ban', cmd: 'fail2ban-client status sshd', desc: 'Возможно ваш IP заблокирован' },
      { title: 'Снять бан в fail2ban', cmd: 'fail2ban-client set sshd unbanip <IP>', desc: '' },
      { title: 'Проверить логи SSH', cmd: 'journalctl -u sshd -n 50', desc: 'Детальная информация о причине отказа' },
    ],
    prevention: 'Использовать только ключи, не пароли. Настроить разрешённые IP (AllowUsers, Match Address). Мониторинг /var/log/auth.log.'
  },
]

const SEVERITY = {
  critical: { label: 'Критично', color: '#ff3d57' },
  high:     { label: 'Высокий', color: '#ffb300' },
  medium:   { label: 'Средний', color: '#818cf8' },
  low:      { label: 'Низкий',  color: '#00e676' },
}

export default function Incident() {
  const [active, setActive] = useState(null)
  const [expanded, setExpanded] = useState({})

  const toggleStep = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  if (active) {
    const inc = INCIDENTS.find(i => i.id === active)
    const sev = SEVERITY[inc.severity]
    return (
      <div>
        <button className="inc-back" onClick={() => setActive(null)}>← Назад</button>
        <div className="inc-detail-header">
          <div className="inc-detail-icon">{inc.icon}</div>
          <div>
            <div className="inc-severity-tag" style={{ color: sev.color, borderColor: sev.color }}>
              {sev.label}
            </div>
            <h1 className="page-title" style={{ marginBottom: 6 }}>{inc.title}</h1>
          </div>
        </div>

        <div className="inc-symptoms">
          <div className="inc-section-label">Симптомы</div>
          {inc.symptoms.map((s, i) => (
            <div key={i} className="inc-symptom">⚠ {s}</div>
          ))}
        </div>

        <div className="inc-section-label" style={{ marginBottom: 12 }}>Шаги устранения</div>
        <div className="inc-steps">
          {inc.steps.map((step, i) => (
            <div key={i} className="inc-step" onClick={() => toggleStep(i)}>
              <div className="inc-step-head">
                <div className="inc-step-num" style={{ color: sev.color }}>{String(i + 1).padStart(2, '0')}</div>
                <div className="inc-step-title">{step.title}</div>
                <span className={`inc-step-arrow ${expanded[i] ? 'up' : ''}`}>▼</span>
              </div>
              {expanded[i] && (
                <div className="inc-step-body">
                  <div className="inc-cmd">
                    <span className="inc-cmd-prompt">$</span>
                    <code>{step.cmd}</code>
                  </div>
                  {step.desc && <p className="inc-step-desc">{step.desc}</p>}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="inc-prevention">
          <div className="inc-section-label">Профилактика</div>
          <p>{inc.prevention}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">Решение <span className="accent">инцидентов</span></h1>
      <p className="page-subtitle">Пошаговые инструкции по диагностике и устранению типовых проблем.</p>

      <div className="inc-grid">
        {INCIDENTS.map(inc => {
          const sev = SEVERITY[inc.severity]
          return (
            <div key={inc.id} className="inc-card" onClick={() => setActive(inc.id)}>
              <div className="inc-card-top">
                <span className="inc-card-icon">{inc.icon}</span>
                <span className="inc-badge" style={{ color: sev.color, borderColor: sev.color }}>
                  {sev.label}
                </span>
              </div>
              <h3 className="inc-card-title">{inc.title}</h3>
              <div className="inc-card-symptoms">
                {inc.symptoms.slice(0, 2).map((s, i) => (
                  <div key={i} className="inc-card-symptom">{s}</div>
                ))}
              </div>
              <div className="inc-card-footer">
                <span>{inc.steps.length} шагов</span>
                <span className="inc-card-arrow">→</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
