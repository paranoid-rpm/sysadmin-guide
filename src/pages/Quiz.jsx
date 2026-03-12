import { useState } from 'react'
import './Quiz.css'

const QUESTIONS = [
  {
    id: 1, category: 'Linux',
    q: 'Какая команда показывает использование дискового пространства по директориям?',
    options: ['df -h', 'du -sh *', 'lsblk', 'fdisk -l'],
    correct: 1,
    explain: 'du (disk usage) считает занятое место. Флаг -s даёт сумму по каждому аргументу, -h — human-readable. df показывает занятость смонтированных файловых систем целиком.'
  },
  {
    id: 2, category: 'Linux',
    q: 'Что делает команда chmod 755 file.sh?',
    options: [
      'Только владелец может читать и писать',
      'Владелец: rwx, группа: r-x, остальные: r-x',
      'Все пользователи получают полный доступ',
      'Файл становится скрытым'
    ],
    correct: 1,
    explain: '7 = 4+2+1 (rwx), 5 = 4+1 (r-x). Первая цифра — владелец, вторая — группа, третья — все остальные.'
  },
  {
    id: 3, category: 'Сети',
    q: 'Сколько хостов можно разместить в подсети /26?',
    options: ['30', '62', '126', '254'],
    correct: 1,
    explain: '/26 означает 26 бит под сеть, 6 бит под хосты. 2^6 = 64 адреса, из которых 2 зарезервированы (сеть и broadcast). Итого 62 хоста.'
  },
  {
    id: 4, category: 'Сети',
    q: 'На каком порту работает HTTPS по умолчанию?',
    options: ['80', '8080', '443', '8443'],
    correct: 2,
    explain: 'HTTP — порт 80, HTTPS (HTTP over TLS) — порт 443. Оба стандартизированы IANA.'
  },
  {
    id: 5, category: 'Nginx',
    q: 'Что означает директива proxy_pass в конфиге Nginx?',
    options: [
      'Включает Basic Auth',
      'Перенаправляет запрос на upstream-сервер',
      'Кэширует статические файлы',
      'Устанавливает таймаут соединения'
    ],
    correct: 1,
    explain: 'proxy_pass передаёт запрос на указанный адрес (upstream). Nginx выступает обратным прокси, скрывая backend от клиента.'
  },
  {
    id: 6, category: 'Безопасность',
    q: 'Какой инструмент используется для автоматической блокировки брутфорс-атак на SSH?',
    options: ['nmap', 'tcpdump', 'fail2ban', 'lynis'],
    correct: 2,
    explain: 'fail2ban анализирует лог-файлы и блокирует IP-адреса, с которых были зафиксированы подозрительные попытки входа, добавляя правила в iptables/nftables.'
  },
  {
    id: 7, category: 'Docker',
    q: 'Что делает команда docker exec -it container bash?',
    options: [
      'Запускает новый контейнер',
      'Копирует файлы из контейнера',
      'Открывает интерактивный shell внутри работающего контейнера',
      'Перезапускает контейнер'
    ],
    correct: 2,
    explain: 'docker exec выполняет команду в уже запущенном контейнере. Флаги -i (stdin) и -t (псевдотерминал) вместе дают интерактивный сеанс.'
  },
  {
    id: 8, category: 'Systemd',
    q: 'Какая команда показывает логи службы nginx за последние 50 строк?',
    options: [
      'cat /var/log/nginx.log',
      'journalctl -u nginx -n 50',
      'systemctl logs nginx --tail 50',
      'tail -50 /etc/nginx/nginx.log'
    ],
    correct: 1,
    explain: 'journalctl — инструмент просмотра журнала systemd. -u указывает юнит, -n — количество последних строк. Можно добавить -f для follow-режима.'
  },
  {
    id: 9, category: 'Базы данных',
    q: 'Что делает команда pg_dump в PostgreSQL?',
    options: [
      'Показывает активные запросы',
      'Сжимает индексы базы данных',
      'Создаёт резервную копию базы данных',
      'Удаляет дублированные записи'
    ],
    correct: 2,
    explain: 'pg_dump создаёт логический дамп базы данных в SQL-формате или кастомном формате. Используется вместе с pg_restore для восстановления.'
  },
  {
    id: 10, category: 'Linux',
    q: 'Что означает символ & в конце команды Linux?',
    options: [
      'Перенаправление вывода в файл',
      'Запуск команды в фоновом режиме',
      'Конкатенация двух команд',
      'Запуск с правами root'
    ],
    correct: 1,
    explain: '& отправляет процесс в background. Команда продолжает выполняться, а shell немедленно возвращает управление. jobs показывает фоновые процессы, fg — возвращает их на передний план.'
  },
]

const CATEGORY_COLORS = {
  'Linux':        '#00aaff',
  'Сети':         '#818cf8',
  'Nginx':        '#00e676',
  'Безопасность': '#ff3d57',
  'Docker':       '#a78bfa',
  'Systemd':      '#ffb300',
  'Базы данных':  '#fb923c',
}

export default function Quiz() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [revealed, setRevealed] = useState({})
  const [finished, setFinished] = useState(false)

  const q = QUESTIONS[current]
  const chosen = answers[q.id]
  const isRevealed = revealed[q.id]
  const catColor = CATEGORY_COLORS[q.category] || '#00aaff'

  const choose = (idx) => {
    if (isRevealed) return
    setAnswers(a => ({ ...a, [q.id]: idx }))
    setRevealed(r => ({ ...r, [q.id]: true }))
  }

  const next = () => {
    if (current < QUESTIONS.length - 1) setCurrent(c => c + 1)
    else setFinished(true)
  }

  const restart = () => {
    setCurrent(0); setAnswers({}); setRevealed({}); setFinished(false)
  }

  const score = QUESTIONS.filter(q => answers[q.id] === q.correct).length

  if (finished) {
    const pct = Math.round(score / QUESTIONS.length * 100)
    const grade = pct >= 80 ? { label: 'Отлично!', color: '#00e676' }
                : pct >= 60 ? { label: 'Хорошо', color: '#ffb300' }
                :              { label: 'Нужно повторить', color: '#ff3d57' }
    return (
      <div>
        <h1 className="page-title">Тест <span className="accent">завершён</span></h1>
        <div className="quiz-result">
          <div className="result-score" style={{ color: grade.color }}>
            {score}/{QUESTIONS.length}
          </div>
          <div className="result-pct" style={{ color: grade.color }}>{pct}%</div>
          <div className="result-grade" style={{ color: grade.color }}>{grade.label}</div>
          <div className="result-breakdown">
            {QUESTIONS.map(q => (
              <div key={q.id} className={`breakdown-row ${answers[q.id] === q.correct ? 'correct' : 'wrong'}`}>
                <span className="breakdown-icon">{answers[q.id] === q.correct ? '✓' : '✗'}</span>
                <span className="breakdown-cat" style={{ color: CATEGORY_COLORS[q.category] }}>{q.category}</span>
                <span className="breakdown-q">{q.q}</span>
              </div>
            ))}
          </div>
          <button className="quiz-restart-btn" onClick={restart}>Пройти заново</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">Тест <span className="accent">знаний</span></h1>
      <p className="page-subtitle">10 вопросов по Linux, сетям, Docker и безопасности.</p>

      <div className="quiz-progress">
        <div className="quiz-progress-label">
          <span style={{ color: catColor }}>{q.category}</span>
          <span className="quiz-counter">{current + 1} / {QUESTIONS.length}</span>
        </div>
        <div className="quiz-progress-bar">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`qpb-seg ${
                i < current ? 'done' :
                i === current ? 'active' : ''
              } ${answers[QUESTIONS[i].id] === QUESTIONS[i].correct ? 'correct' : answers[QUESTIONS[i].id] !== undefined ? 'wrong' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="quiz-card">
        <div className="quiz-q-num" style={{ color: catColor }}>Вопрос {current + 1}</div>
        <h2 className="quiz-question">{q.q}</h2>

        <div className="quiz-options">
          {q.options.map((opt, i) => {
            let cls = 'quiz-option'
            if (isRevealed) {
              if (i === q.correct) cls += ' correct'
              else if (i === chosen) cls += ' wrong'
            } else if (i === chosen) {
              cls += ' selected'
            }
            return (
              <button key={i} className={cls} onClick={() => choose(i)}>
                <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                <span className="opt-text">{opt}</span>
                {isRevealed && i === q.correct && <span className="opt-icon">✓</span>}
                {isRevealed && i === chosen && i !== q.correct && <span className="opt-icon">✗</span>}
              </button>
            )
          })}
        </div>

        {isRevealed && (
          <div className="quiz-explain">
            <span className="explain-label">Пояснение</span>
            <p>{q.explain}</p>
          </div>
        )}

        <div className="quiz-actions">
          {isRevealed && (
            <button className="quiz-next-btn" onClick={next}>
              {current < QUESTIONS.length - 1 ? 'Следующий вопрос →' : 'Посмотреть результат'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
