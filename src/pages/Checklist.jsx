import { useState } from 'react'
import './Checklist.css'

const CHECKLISTS = [
  {
    id: 'new-server',
    title: 'Настройка нового сервера',
    icon: '',
    color: '#00aaff',
    desc: 'Первичная настройка Linux-сервера после установки.',
    items: [
      { id: 'ns1', text: 'Обновить систему', cmd: 'apt update && apt upgrade -y', note: 'Всегда первый шаг.' },
      { id: 'ns2', text: 'Создать не-root пользователя', cmd: 'adduser admin && usermod -aG sudo admin', note: 'Работать под root — плохая практика.' },
      { id: 'ns3', text: 'Настроить SSH-ключи', cmd: 'ssh-copy-id admin@server', note: 'Отключить парольную аутентификацию.' },
      { id: 'ns4', text: 'Изменить порт SSH', cmd: 'nano /etc/ssh/sshd_config  # Port 2222', note: 'Снижает шум брутфорса в логах.' },
      { id: 'ns5', text: 'Запретить вход под root по SSH', cmd: 'PermitRootLogin no  # в sshd_config', note: 'Обязательно после создания sudo-пользователя.' },
      { id: 'ns6', text: 'Настроить firewall (ufw)', cmd: 'ufw allow 2222/tcp && ufw enable', note: 'Открыть только нужные порты.' },
      { id: 'ns7', text: 'Установить fail2ban', cmd: 'apt install fail2ban -y', note: 'Защита от брутфорса.' },
      { id: 'ns8', text: 'Настроить временную зону', cmd: 'timedatectl set-timezone Europe/Moscow', note: 'Важно для логов и cron.' },
      { id: 'ns9', text: 'Включить NTP-синхронизацию', cmd: 'timedatectl set-ntp true', note: '' },
      { id: 'ns10', text: 'Проверить открытые порты', cmd: 'ss -tlnp', note: 'Убедиться, что лишнего нет.' },
    ]
  },
  {
    id: 'nginx-deploy',
    title: 'Деплой Nginx и SSL',
    icon: '',
    color: '#00e676',
    desc: 'Настройка Nginx с HTTPS через Let\'s Encrypt.',
    items: [
      { id: 'ng1', text: 'Установить Nginx', cmd: 'apt install nginx -y && systemctl enable nginx', note: '' },
      { id: 'ng2', text: 'Создать конфиг виртуального хоста', cmd: 'nano /etc/nginx/sites-available/example.com', note: 'Можно взять за основу /etc/nginx/sites-available/default.' },
      { id: 'ng3', text: 'Создать симлинк', cmd: 'ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/', note: '' },
      { id: 'ng4', text: 'Проверить конфиг Nginx', cmd: 'nginx -t', note: 'Перед каждым перезапуском.' },
      { id: 'ng5', text: 'Установить certbot', cmd: 'apt install certbot python3-certbot-nginx -y', note: '' },
      { id: 'ng6', text: 'Получить SSL-сертификат', cmd: 'certbot --nginx -d example.com -d www.example.com', note: 'Нужна DNS-запись, указывающая на сервер.' },
      { id: 'ng7', text: 'Проверить автообновление сертификата', cmd: 'certbot renew --dry-run', note: 'Certbot добавляет cron автоматически.' },
      { id: 'ng8', text: 'Настроить редирект HTTP → HTTPS', cmd: 'return 301 https://$host$request_uri;', note: 'В блоке server для порта 80.' },
      { id: 'ng9', text: 'Добавить заголовки безопасности', cmd: 'add_header Strict-Transport-Security "max-age=31536000";', note: 'HSTS, X-Frame-Options, CSP.' },
      { id: 'ng10', text: 'Перезапустить Nginx', cmd: 'systemctl reload nginx', note: 'reload — без прерывания соединений.' },
    ]
  },
  {
    id: 'docker-app',
    title: 'Деплой Docker‑приложения',
    icon: '',
    color: '#a78bfa',
    desc: 'Запуск приложения в контейнере на сервере.',
    items: [
      { id: 'dk1', text: 'Установить Docker', cmd: 'curl -fsSL https://get.docker.com | sh', note: 'Официальный скрипт установки.' },
      { id: 'dk2', text: 'Добавить пользователя в группу docker', cmd: 'usermod -aG docker $USER', note: 'Требуется выход и повторный вход.' },
      { id: 'dk3', text: 'Проверить установку', cmd: 'docker run hello-world', note: '' },
      { id: 'dk4', text: 'Создать docker-compose.yml', cmd: 'nano docker-compose.yml', note: 'Описать сервисы, тома и сети.' },
      { id: 'dk5', text: 'Запустить стек', cmd: 'docker compose up -d', note: '-d — фоновый режим.' },
      { id: 'dk6', text: 'Проверить статус контейнеров', cmd: 'docker compose ps', note: '' },
      { id: 'dk7', text: 'Посмотреть логи', cmd: 'docker compose logs -f --tail=100', note: '' },
      { id: 'dk8', text: 'Настроить автозапуск', cmd: 'restart: unless-stopped  # в docker-compose.yml', note: '' },
      { id: 'dk9', text: 'Настроить ротацию логов', cmd: 'logging:\n  driver: "json-file"\n  options:\n    max-size: "10m"', note: 'Логи Docker могут занять весь диск.' },
      { id: 'dk10', text: 'Проверить использование ресурсов', cmd: 'docker stats', note: '' },
    ]
  },
  {
    id: 'backup',
    title: 'Резервное копирование',
    icon: '',
    color: '#ffb300',
    desc: 'Стратегия 3‑2‑1: 3 копии, 2 носителя, 1 удалённый.',
    items: [
      { id: 'bk1', text: 'Определить, что бэкапить', cmd: '# /etc, /var/www, /home, дампы БД', note: 'Документировать список.' },
      { id: 'bk2', text: 'Создать дамп PostgreSQL', cmd: 'pg_dump -U postgres dbname > backup.sql', note: 'Или pg_dumpall для всех БД.' },
      { id: 'bk3', text: 'Создать дамп MySQL', cmd: 'mysqldump -u root -p dbname > backup.sql', note: '' },
      { id: 'bk4', text: 'Архивировать конфиги', cmd: 'tar -czf etc-backup.tar.gz /etc/', note: '' },
      { id: 'bk5', text: 'Загрузить бэкап в S3/облако', cmd: 'aws s3 cp backup.tar.gz s3://bucket/backups/', note: 'Или rclone для других облаков.' },
      { id: 'bk6', text: 'Автоматизировать через cron', cmd: '0 3 * * * /opt/scripts/backup.sh', note: 'Запускать ночью, когда нагрузка минимальна.' },
      { id: 'bk7', text: 'Проверить восстановление', cmd: '# Обязательно тестировать restore.', note: 'Бэкап без проверки восстановления — не бэкап.' },
      { id: 'bk8', text: 'Настроить алерты при сбое', cmd: '# Уведомление, если скрипт вернул ненулевой код.', note: '' },
    ]
  },
]

export default function Checklist() {
  const [active, setActive] = useState('new-server')
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem('checklist') || '{}') } catch { return {} }
  })

  const toggle = (id) => {
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    localStorage.setItem('checklist', JSON.stringify(next))
  }

  const cl = CHECKLISTS.find(c => c.id === active)
  const done = cl.items.filter(i => checked[i.id]).length
  const pct = Math.round(done / cl.items.length * 100)

  return (
    <div>
      <h1 className="page-title">Чек‑листы <span className="accent">администратора</span></h1>
      <p className="page-subtitle">Пошаговые инструкции для типовых задач. Прогресс сохраняется в браузере.</p>

      <div className="cl-tabs">
        {CHECKLISTS.map(c => (
          <button
            key={c.id}
            className={`cl-tab ${active === c.id ? 'active' : ''}`}
            style={{ '--tab-color': c.color }}
            onClick={() => setActive(c.id)}
          >
            <span className="cl-tab-title">{c.title}</span>
          </button>
        ))}
      </div>

      <div className="cl-header">
        <div>
          <h2 className="cl-title" style={{ color: cl.color }}>{cl.title}</h2>
          <p className="cl-desc">{cl.desc}</p>
        </div>
        <div className="cl-progress-wrap">
          <div className="cl-pct" style={{ color: cl.color }}>{pct}%</div>
          <div className="cl-bar"><div className="cl-bar-fill" style={{ width: `${pct}%`, background: cl.color }}/></div>
          <div className="cl-counts">{done}/{cl.items.length}</div>
        </div>
      </div>

      <div className="cl-list">
        {cl.items.map((item, idx) => (
          <div key={item.id} className={`cl-item ${checked[item.id] ? 'done' : ''}`} onClick={() => toggle(item.id)}>
            <div className="cl-item-left">
              <div className="cl-num" style={{ color: cl.color }}>{String(idx + 1).padStart(2, '0')}</div>
              <div className="cl-check" style={{ '--cc': cl.color }}>{checked[item.id] ? '✓' : ''}</div>
            </div>
            <div className="cl-item-body">
              <div className="cl-item-title">{item.text}</div>
              {item.cmd && (
                <div className="cl-cmd">
                  <span className="cl-cmd-prompt">$</span>
                  <code>{item.cmd}</code>
                </div>
              )}
              {item.note && <div className="cl-note">{item.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
