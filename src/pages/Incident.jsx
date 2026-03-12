import { useState } from 'react'
import './Incident.css'

const INCIDENTS = [
  {
    id: 'disk-full',
    severity: 'critical',
    title: 'Диск заполнен на 100%',
    symptoms: ['Сервисы не стартуют', 'Ошибки записи в логи', 'SSH работает, но команды не выполняются'],
    steps: [
      { title: 'Найти что занимает место', cmd: 'df -h && du -sh /* 2>/dev/null | sort -rh | head -20', desc: 'df покажет общую картину, du — самые тяжёлые директории' },
      { title: 'Проверить логи', cmd: 'du -sh /var/log/* | sort -rh | head -10', desc: 'Логи — частая причина переполнения' },
      { title: 'Ротировать логи принудительно', cmd: 'logrotate -f /etc/logrotate.conf', desc: 'Или удалить старые: find /var/log -name "*.gz" -mtime +30 -delete' },
      { title: 'Найти большие файлы', cmd: 'find / -type f -size +100M 2>/dev/null | sort -k5 -rn', desc: 'Ищем файлы крупнее 100 МБ' },
      { title: 'Очистить Docker', cmd: 'docker system prune -af --volumes', desc: 'Удаляет остановленные контейнеры, неиспользуемые образы и тома' },
      { title: 'Очистить apt кэш', cmd: 'apt clean && apt autoremove -y', desc: '' },
      { title: 'Проверить снова', cmd: 'df -h', desc: 'Убедиться что место освободилось' },
    ],
    prevention: 'Настроить мониторинг диска (алерт при 80%). Настроить logrotate. Регулярно запускать docker system prune.'
  },
  {
    id: 'high-load',
    severity: 'high',
    title: 'Высокая нагрузка (Load Average)',
    symptoms: ['LA выше числа CPU', 'Система отвечает медленно', 'SSH подключается долго или не подключается'],
    steps: [
      { title: 'Посмотреть load average', cmd: 'uptime', desc: 'Числа: 1 мин / 5 мин / 15 мин. Норма ≤ количества CPU' },
      { title: 'Найти виновника', cmd: 'top -bn1 | head -20', desc: 'Смотри колонки CPU% и %MEM' },
      { title: 'Проверить состояние процессов', cmd: 'ps aux --sort=-%cpu | head -15', desc: 'D-state процессы = ждут I/O (проблема с диском?)' },
      { title: 'Проверить I/O', cmd: 'iostat -x 1 5', desc: 'Смотри %util и await. Если >90% — проблема с диском' },
      { title: 'Проверить память', cmd: 'free -h && vmstat 1 5', desc: 'Если swap активно используется — нехватка RAM' },
      { title: 'Завершить проблемный процесс', cmd: `kill -15 <PID>  # мягко\nkill -9 <PID>   # жёстко`, desc: 'Сначала -15 (SIGTERM), потом -9 (SIGKILL) если не помогло' },
      { title: 'Проверить cron', cmd: 'crontab -l && cat /etc/cron.d/*', desc: 'Возможно запустился тяжёлый плановый процесс' },
    ],
    prevention: 'Мониторинг CPU/LA. Настроить алерты. Оптимизировать тяжёлые запросы к БД. Ограничивать ресурсы контейнеров (cpu_limit).'
  },
  {
    id: 'no-network',
    severity: 'high',
    title: 'Нет сетевого соединения',
    symptoms: ['Сервис недоступен снаружи', 'ping до шлюза не проходит', 'DNS не резолвится'],
    steps: [
      { title: 'Проверить интерфейсы', cmd: 'ip addr show && ip link show', desc: 'Интерфейс должен быть UP и иметь IP' },
      { title: 'Проверить маршруты', cmd: 'ip route show', desc: 'Должен быть default route через шлюз' },
      { title: 'Пинг шлюза', cmd: `ping -c 4 $(ip route | grep default | awk '{print $3}')`, desc: 'Если шлюз не отвечает — проблема на уровне L2/L3' },
      { title: 'Проверить DNS', cmd: 'cat /etc/resolv.conf && dig google.com', desc: '' },
      { title: 'Проверить firewall', cmd: 'iptables -L -n -v && ufw status', desc: 'Возможно заблокированы нужные порты' },
      { title: 'Перезапустить сеть', cmd: `systemctl restart networking\n# или\nnmcli networking off && nmcli networking on`, desc: '' },
      { title: 'Проверить физический уровень', cmd: 'ethtool eth0 | grep -i link', desc: 'Link detected: yes — кабель подключён' },
    ],
    prevention: 'Мониторинг доступности с внешнего хоста. Документировать сетевую схему. Хранить backup конфигов.'
  },
  {
    id: 'nginx-502',
    severity: 'medium',
    title: 'Nginx 502 Bad Gateway',
    symptoms: ['Браузер показывает 502', 'Nginx работает, но backend недоступен', 'Ошибки в /var/log/nginx/error.log'],
    steps: [
      { title: 'Смотреть логи Nginx', cmd: 'tail -50 /var/log/nginx/error.log', desc: 'Ищем строки с upstream' },
      { title: 'Проверить upstream', cmd: 'curl -I http://localhost:8080', desc: 'Проверить что backend отвечает напрямую' },
      { title: 'Процесс backend', cmd: `systemctl status myapp\n# или для Docker:\ndocker compose ps`, desc: '' },
      { title: 'Проверить порт', cmd: 'ss -tlnp | grep 8080', desc: 'Backend должен слушать нужный порт' },
      { title: 'Логи приложения', cmd: 'journalctl -u myapp -n 100 --no-pager', desc: 'Ищем исключения и ошибки старта' },
      { title: 'Перезапустить backend', cmd: 'systemctl restart myapp', desc: 'Иногда помогает, но нужно разобраться с причиной' },
      { title: 'Проверить конфиг Nginx', cmd: 'nginx -t && systemctl reload nginx', desc: 'После исправления конфига' },
    ],
    prevention: 'Настроить health checks. Мониторинг 5xx ошибок. Настроить автозапуск сервисов.'
  },
  {
    id: 'ssh-denied',
    severity: 'medium',
    title: 'SSH: доступ запрещён',
    symptoms: ['Permission denied (publickey)', 'Connection refused', 'Connection timed out'],
    steps: [
      { title: 'Проверить доступность порта', cmd: 'nc -zv server_ip 22', desc: 'Timeout = firewall или сервис не запущен' },
      { title: 'Verbose подключение', cmd: 'ssh -vvv user@server', desc: 'Покажет где именно происходит отказ' },
      { title: 'Права на ключ', cmd: `chmod 600 ~/.ssh/id_rsa\nchmod 700 ~/.ssh/`, desc: 'SSH откажет если права слишком широкие' },
      { title: 'Проверить authorized_keys', cmd: 'cat ~/.ssh/authorized_keys', desc: 'Публичный ключ должен быть здесь' },
      { title: 'Проверить fail2ban', cmd: 'fail2ban-client status sshd', desc: 'Возможно ваш IP заблокирован' },
      { title: 'Снять бан', cmd: 'fail2ban-client set sshd unbanip <IP>', desc: '' },
      { title: 'Логи SSH', cmd: 'journalctl -u sshd -n 50', desc: 'Детальная информация о причине отказа' },
    ],
    prevention: 'Использовать только ключи, не пароли. Настроить разрешённые IP (AllowUsers, Match Address). Мониторинг /var/log/auth.log.'
  },
  {
    id: 'oom-kill',
    severity: 'critical',
    title: 'OOM Killer убил процесс',
    symptoms: ['Процесс внезапно умер, в логах есть "Out of memory"', 'Сервис перестал отвечать без видимой причины', 'Ошибки в dmesg: "oom-kill-action"'],
    steps: [
      { title: 'Подтвердить OOM', cmd: 'dmesg -T | grep -i "oom\\|killed process\\|out of memory"', desc: 'Убедиться что ядро действительно убило процесс' },
      { title: 'Узнать что убили', cmd: 'journalctl -k | grep -i oom | tail -20', desc: 'journalctl -k = kernel логи' },
      { title: 'Текущее состояние памяти', cmd: 'free -h && cat /proc/meminfo | grep -E "MemTotal|MemAvailable|SwapTotal|SwapFree"', desc: '' },
      { title: 'Топ по потреблению RAM', cmd: 'ps aux --sort=-%mem | head -15', desc: 'Найти процессы пожирающие память' },
      { title: 'Проверить лимиты Docker', cmd: 'docker stats --no-stream', desc: 'Если контейнер без mem_limit — он съест всю RAM хоста' },
      { title: 'Защитить процесс от OOM', cmd: 'echo -17 > /proc/<PID>/oom_adj', desc: 'oom_adj=-17 — процесс никогда не будет убит OOM Killerом' },
      { title: 'Добавить swap если его нет', cmd: 'fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile', desc: 'Временный swap как защитная мера' },
    ],
    prevention: 'Установить mem_limit для контейнеров (docker/k8s). Мониторинг памяти (алерт при 85%). Добавить swap на серверах без запаса RAM.'
  },
  {
    id: 'inode-exhausted',
    severity: 'high',
    title: 'Исчерпаны inode',
    symptoms: ['"No space left on device" при свободном месте на диске', 'Невозможно создать новые файлы', 'df -h показывает свободное место, но файлы не создаются'],
    steps: [
      { title: 'Проверить inode', cmd: 'df -i', desc: '100% в IUse% = inode исчерпаны' },
      { title: 'Найти директорию с множеством файлов', cmd: `for i in /*; do echo $i; find $i -xdev -printf '.' | wc -c; done 2>/dev/null | paste - - | sort -k2 -rn | head`, desc: 'Найти директорию-чемпион по количеству файлов' },
      { title: 'Посчитать файлы в /tmp', cmd: 'find /tmp -maxdepth 1 | wc -l', desc: 'Частая причина — тысячи временных файлов' },
      { title: 'Удалить старые временные файлы', cmd: 'find /tmp -mtime +1 -delete', desc: 'Удалить файлы старше 1 дня' },
      { title: 'Проверить логи Maildir', cmd: 'find /var/spool/mail -type f | wc -l', desc: 'Системная почта может накопить тысячи файлов' },
      { title: 'Очистить Docker', cmd: 'docker system prune -af', desc: 'Множество малых файлов в layers' },
      { title: 'Проверить снова', cmd: 'df -i', desc: '' },
    ],
    prevention: 'Мониторинг inode (df -i). Настроить алерт при IUse% > 80%. Убедиться что /tmp чистится автоматически (systemd-tmpfiles).'
  },
  {
    id: 'replication-lag',
    severity: 'high',
    title: 'PostgreSQL: лаг репликации',
    symptoms: ['Чтение с реплики возвращает устаревшие данные', 'Мониторинг показывает растущий replication lag', 'Приложение жалуется на расхождение данных'],
    steps: [
      { title: 'Измерить лаг на primary', cmd: `psql -c "SELECT client_addr, state, (sent_lsn - replay_lsn) AS lag_bytes FROM pg_stat_replication;"`, desc: 'lag_bytes > 0 — реплика отстаёт' },
      { title: 'Проверить на standby', cmd: `psql -c "SELECT now() - pg_last_xact_replay_timestamp() AS replication_delay;"`, desc: 'Время с последней применённой транзакции' },
      { title: 'Проверить нагрузку реплики', cmd: 'iostat -x 1 5  # на standby', desc: 'Если %util диска > 80% — реплика не успевает применять WAL' },
      { title: 'Долгие транзакции на primary', cmd: `psql -c "SELECT pid, now() - xact_start AS duration, query FROM pg_stat_activity WHERE state = 'active' ORDER BY duration DESC LIMIT 5;"`, desc: 'Долгая транзакция блокирует очистку WAL' },
      { title: 'Проверить max_wal_size', cmd: `psql -c "SHOW max_wal_size; SHOW wal_level; SHOW max_replication_slots;"`, desc: '' },
      { title: 'Проверить WAL receiver', cmd: `psql -c "SELECT * FROM pg_stat_wal_receiver;"  # на standby`, desc: 'Должен быть в состоянии streaming' },
    ],
    prevention: 'Мониторинг replication_delay. Алерт при lag > 30 сек. Ограничивать длину транзакций (idle_in_transaction_timeout). Обеспечить равноценный диск на standby.'
  },
  {
    id: 'k8s-pod-crashloop',
    severity: 'high',
    title: 'Kubernetes: Pod CrashLoopBackOff',
    symptoms: ['Pod постоянно перезапускается', 'kubectl get pods показывает CrashLoopBackOff', 'RESTARTS > 5'],
    steps: [
      { title: 'Увидеть состояние подов', cmd: 'kubectl get pods -n <namespace>', desc: '' },
      { title: 'Описать проблемный под', cmd: 'kubectl describe pod <pod-name> -n <namespace>', desc: 'Смотри Events в конце вывода' },
      { title: 'Логи пода', cmd: `kubectl logs <pod-name> -n <namespace>\nkubectl logs <pod-name> -n <namespace> --previous`, desc: '--previous — логи предыдущего запуска' },
      { title: 'Проверить лимиты ресурсов', cmd: 'kubectl top pod <pod-name> -n <namespace>', desc: 'Нехватка CPU/памяти частая причина' },
      { title: 'События namespace', cmd: 'kubectl get events -n <namespace> --sort-by=.lastTimestamp | tail -20', desc: 'Ошибки монтирования секретов' },
      { title: 'Зайти в контейнер', cmd: 'kubectl exec -it <pod-name> -n <namespace> -- sh', desc: 'Если под успел стартовать, проверить конфиг внутри' },
      { title: 'Смотреть пробы', cmd: `kubectl describe pod <pod-name> | grep -A5 "Liveness\\|Readiness"`, desc: 'Частая причина — неправильная настройка liveness probe' },
    ],
    prevention: 'Настроить адекватные requests/limits. Проверять образ локально перед деплоем. Настроить liveness/readiness probe с readinessDelay.'
  },
]

const SEVERITY = {
  critical: { label: 'Критично', color: '#ff3d57' },
  high:     { label: 'Высокий',  color: '#ffb300' },
  medium:   { label: 'Средний',  color: '#818cf8' },
  low:      { label: 'Низкий',   color: '#00e676' },
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
          <div>
            <div className="inc-severity-tag" style={{ color: sev.color, borderColor: sev.color }}>{sev.label}</div>
            <h1 className="page-title" style={{ marginBottom: 6 }}>{inc.title}</h1>
          </div>
        </div>

        <div className="inc-symptoms">
          <div className="inc-section-label">Симптомы</div>
          {inc.symptoms.map((s, i) => (
            <div key={i} className="inc-symptom">— {s}</div>
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
      <p className="page-subtitle">{INCIDENTS.length} инцидентов — пошаговые инструкции по диагностике и устранению.</p>

      <div className="inc-grid">
        {INCIDENTS.map(inc => {
          const sev = SEVERITY[inc.severity]
          return (
            <div key={inc.id} className="inc-card" onClick={() => setActive(inc.id)}>
              <div className="inc-card-top">
                <span className="inc-badge" style={{ color: sev.color, borderColor: sev.color }}>{sev.label}</span>
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
