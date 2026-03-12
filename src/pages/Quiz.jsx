import { useState } from 'react'
import './Quiz.css'

const QUESTIONS = [
  // --- Linux ---
  { id:1,  cat:'Linux',        diff:'Начало',    q:'Какая команда показывает использование дискового пространства по директориям?',           options:['df -h','du -sh *','lsblk','fdisk -l'],                                                                                   correct:1, explain:'du (disk usage) считает занятое место. -s — сумма по аргументу, -h — human-readable. df показывает занятость смонтированных ФС целиком.' },
  { id:2,  cat:'Linux',        diff:'Начало',    q:'Что означает chmod 755 file.sh?',                                                           options:['Только владелец читает/пишет','Владелец: rwx, группа: r-x, остальные: r-x','Все пользователи — полный доступ','Файл становится скрытым'], correct:1, explain:'7=rwx, 5=r-x. Первая цифра — владелец, вторая — группа, третья — остальные.' },
  { id:3,  cat:'Linux',        diff:'Начало',    q:'Что означает символ & в конце команды Linux?',                                              options:['Перенаправление в файл','Запуск в фоновом режиме','Конкатенация команд','Запуск с правами root'],                             correct:1, explain:'& отправляет процесс в background. jobs — список фоновых, fg — возврат на передний план.' },
  { id:4,  cat:'Linux',        diff:'Средний',   q:'Что такое inode в Linux?',                                                                  options:['Имя файла на диске','Метаданные файла без имени','Тип файловой системы','Блок обмена между процессами'],                       correct:1, explain:'inode хранит метаданные: размер, владелец, права, адреса блоков. Имя файла — в записи директории.' },
  { id:5,  cat:'Linux',        diff:'Средний',   q:'Какой сигнал нельзя перехватить или проигнорировать?',                                      options:['SIGTERM','SIGINT','SIGKILL','SIGHUP'],                                                                                        correct:2, explain:'SIGKILL (9) безусловно завершает процесс на уровне ядра. Процесс не может его перехватить или обработать.' },
  { id:6,  cat:'Linux',        diff:'Сложный',   q:'Что произойдёт при выполнении `kill -HUP 1`?',                                              options:['Перезагрузка системы','systemd перечитает конфигурацию','Все процессы получат SIGHUP','Ядро паникует'],                        correct:1, explain:'PID 1 — systemd. SIGHUP для systemd означает reload: перечитать конфигурацию юнитов без перезапуска.' },
  // --- Сети ---
  { id:7,  cat:'Сети',         diff:'Начало',    q:'Сколько хостов можно разместить в подсети /26?',                                            options:['30','62','126','254'],                                                                                                        correct:1, explain:'/26 — 6 бит под хосты. 2^6=64, минус сеть и broadcast = 62 хоста.' },
  { id:8,  cat:'Сети',         diff:'Начало',    q:'На каком порту работает HTTPS по умолчанию?',                                               options:['80','8080','443','8443'],                                                                                                     correct:2, explain:'HTTP — 80, HTTPS (HTTP over TLS) — 443. Стандартизировано IANA.' },
  { id:9,  cat:'Сети',         diff:'Средний',   q:'Какой протокол используется для разрешения IP-адреса в MAC-адрес?',                         options:['DNS','DHCP','ARP','ICMP'],                                                                                                    correct:2, explain:'ARP (Address Resolution Protocol) работает на L2. Отправляет широковещательный запрос, получает MAC-адрес.' },
  { id:10, cat:'Сети',         diff:'Средний',   q:'Что такое MTU и какое стандартное значение для Ethernet?',                                  options:['Maximum Transfer Unit, 9000 байт','Maximum Transmission Unit, 1500 байт','Media Transfer Unit, 1024 байт','Minimum Transmission Unit, 576 байт'], correct:1, explain:'MTU — максимальный размер пакета. Ethernet: 1500 байт. Jumbo frames: 9000 байт (только в локальных сетях).' },
  { id:11, cat:'Сети',         diff:'Сложный',   q:'Что происходит при несовпадении MTU на двух узлах без Path MTU Discovery?',                 options:['Соединение не устанавливается','Пакеты фрагментируются или отбрасываются','Автоматически согласовывается меньший MTU','Данные передаются по UDP'], correct:1, explain:'При DF-бите (Do not Fragment) пакеты отбрасываются и отправитель получает ICMP Type 3 Code 4. Без DF — фрагментация.' },
  // --- Nginx ---
  { id:12, cat:'Nginx',        diff:'Начало',    q:'Что делает директива proxy_pass в конфиге Nginx?',                                          options:['Включает Basic Auth','Перенаправляет запрос на upstream-сервер','Кэширует статику','Устанавливает таймаут'],                  correct:1, explain:'proxy_pass передаёт запрос backend-серверу. Nginx выступает обратным прокси.' },
  { id:13, cat:'Nginx',        diff:'Средний',   q:'Как в Nginx задать rate limiting для location?',                                            options:['limit_conn_zone','limit_req_zone + limit_req','proxy_limit_rate','worker_rlimit_nofile'],                                    correct:1, explain:'limit_req_zone задаёт зону и скорость (rate), limit_req применяет ограничение к location. Алгоритм: leaky bucket.' },
  { id:14, cat:'Nginx',        diff:'Сложный',   q:'Что означает параметр burst=10 nodelay в директиве limit_req?',                             options:['Разрешить 10 RPS','Пропустить до 10 лишних запросов без задержки','Отложить первые 10 запросов','Ограничить 10 воркеров'], correct:1, explain:'burst — очередь сверх rate. nodelay — обработать сразу без задержки, но счётчик всё равно расходуется.' },
  // --- Безопасность ---
  { id:15, cat:'Безопасность', diff:'Начало',    q:'Какой инструмент блокирует брутфорс-атаки на SSH через анализ логов?',                     options:['nmap','tcpdump','fail2ban','lynis'],                                                                                          correct:2, explain:'fail2ban читает логи, при N неуспешных попытках добавляет правило DROP в iptables/nftables.' },
  { id:16, cat:'Безопасность', diff:'Средний',   q:'Что такое SUID-бит и почему он опасен?',                                                    options:['Скрывает файл от ls','Файл запускается с правами владельца','Разрешает запись всем','Блокирует выполнение'],                  correct:1, explain:'SUID: исполняемый файл работает с правами владельца (обычно root). Уязвимый SUID-бинарь — вектор LPE (local privilege escalation).' },
  { id:17, cat:'Безопасность', diff:'Сложный',   q:'Чем mTLS отличается от обычного TLS?',                                                      options:['Использует симметричное шифрование','Клиент тоже предъявляет сертификат','Работает без CA','Применяется только в HTTP/2'],  correct:1, explain:'В mTLS оба участника проходят проверку сертификата. Основа zero-trust и service mesh (Istio, Linkerd).' },
  // --- Docker ---
  { id:18, cat:'Docker',       diff:'Начало',    q:'Что делает команда docker exec -it container bash?',                                         options:['Запускает новый контейнер','Копирует файлы из контейнера','Открывает shell внутри работающего контейнера','Перезапускает контейнер'], correct:2, explain:'-i держит stdin открытым, -t создаёт псевдотерминал. exec выполняет команду в уже запущенном контейнере.' },
  { id:19, cat:'Docker',       diff:'Средний',   q:'В чём разница между CMD и ENTRYPOINT в Dockerfile?',                                        options:['CMD нельзя переопределить','ENTRYPOINT — основной процесс, CMD — аргументы по умолчанию','CMD запускается при сборке','ENTRYPOINT игнорируется в compose'], correct:1, explain:'ENTRYPOINT определяет исполняемый файл контейнера. CMD задаёт аргументы, которые можно переопределить при docker run.' },
  { id:20, cat:'Docker',       diff:'Сложный',   q:'Что такое multi-stage build в Docker и зачем он нужен?',                                    options:['Запуск нескольких контейнеров','Сборка в несколько FROM-стадий для минимизации размера образа','Параллельная сборка слоёв','Кэширование базовых образов'], correct:1, explain:'Каждая стадия FROM изолирована. Финальный образ копирует только нужные артефакты, не включая компилятор, зависимости сборки и т.д.' },
  // --- Systemd ---
  { id:21, cat:'Systemd',      diff:'Начало',    q:'Какая команда показывает логи службы nginx за последние 50 строк?',                         options:['cat /var/log/nginx.log','journalctl -u nginx -n 50','systemctl logs nginx --tail 50','tail -50 /etc/nginx/nginx.log'],        correct:1, explain:'journalctl -u задаёт юнит, -n — количество строк. -f добавляет follow-режим (как tail -f).' },
  { id:22, cat:'Systemd',      diff:'Средний',   q:'Что делает параметр Restart=on-failure в юните systemd?',                                   options:['Перезапускает при любом выходе','Перезапускает только при ненулевом коде выхода','Игнорирует сбои','Перезапускает раз в минуту'], correct:1, explain:'on-failure — перезапуск при exit code != 0 или по сигналу. on-always — перезапуск всегда, в т.ч. при успешном выходе.' },
  // --- Базы данных ---
  { id:23, cat:'Базы данных',  diff:'Начало',    q:'Что делает команда pg_dump в PostgreSQL?',                                                  options:['Показывает активные запросы','Сжимает индексы','Создаёт резервную копию базы','Удаляет дубликаты'],                          correct:2, explain:'pg_dump делает логический дамп в SQL или кастомном формате. Восстановление — pg_restore или psql.' },
  { id:24, cat:'Базы данных',  diff:'Средний',   q:'Что такое VACUUM в PostgreSQL?',                                                            options:['Перестройка индексов','Очистка устаревших версий строк (MVCC)','Сжатие таблицы на диске','Удаление пустых страниц WAL'],     correct:1, explain:'MVCC оставляет мёртвые строки после UPDATE/DELETE. VACUUM их убирает. VACUUM FULL перестраивает таблицу полностью, блокируя записи.' },
  { id:25, cat:'Базы данных',  diff:'Сложный',   q:'Как обнаружить replication lag в PostgreSQL?',                                              options:['SHOW max_wal_size','SELECT * FROM pg_stat_replication','EXPLAIN ANALYZE','pg_dump --check'],                                  correct:1, explain:'pg_stat_replication показывает состояние standby-серверов и поля sent_lsn, write_lsn, replay_lsn для расчёта лага.' },
  // --- Мониторинг ---
  { id:26, cat:'Мониторинг',   diff:'Начало',    q:'Что такое observability?',                                                                  options:['Мониторинг CPU и RAM','Metrics + Logs + Traces — три столпа наблюдаемости','Система алертов в Grafana','Dashboard в Kibana'], correct:1, explain:'Observability = метрики (Prometheus), логи (Loki/ELK), трейсы (Jaeger/Tempo). Позволяет понять причину сбоя, а не только факт.' },
  { id:27, cat:'Мониторинг',   diff:'Средний',   q:'Почему высокая cardinality опасна для Prometheus?',                                          options:['Замедляет сбор метрик по сети','Создаёт огромное количество временных рядов и перегружает TSDB','Вызывает конфликты меток','Блокирует Alertmanager'], correct:1, explain:'Каждая уникальная комбинация labels — отдельный временной ряд. user_id или request_id в метках создаёт миллионы рядов.' },
  // --- Kubernetes ---
  { id:28, cat:'Kubernetes',   diff:'Средний',   q:'Что такое liveness probe в Kubernetes?',                                                    options:['Проверка готовности к трафику','Проверка жизнеспособности контейнера с перезапуском при сбое','Мониторинг ресурсов пода','Тест сетевой доступности'], correct:1, explain:'liveness probe — периодическая проверка. При неудаче kubelet перезапускает контейнер. readiness probe — проверяет готовность к трафику без перезапуска.' },
  { id:29, cat:'Kubernetes',   diff:'Сложный',   q:'Чем Deployment отличается от StatefulSet?',                                                 options:['StatefulSet не поддерживает rolling update','Deployment даёт стабильные имена и тома, StatefulSet — нет','StatefulSet даёт стабильные сетевые идентификаторы и тома, Deployment — нет','Нет разницы, только название'], correct:2, explain:'StatefulSet обеспечивает: стабильные DNS-имена (pod-0, pod-1), постоянные тома per-pod, упорядоченное развёртывание. Нужен для БД, Kafka, Zookeeper.' },
  { id:30, cat:'Kubernetes',   diff:'Сложный',   q:'Что такое PodDisruptionBudget?',                                                            options:['Лимит CPU/RAM для пода','Гарантия минимального числа доступных подов при добровольных нарушениях','Политика сетевого доступа','Ограничение на число рестартов'], correct:1, explain:'PDB защищает сервис при drain, rolling update, обслуживании нод. minAvailable или maxUnavailable определяют допустимый урон.' },
]

const DIFFS   = ['Все', 'Начало', 'Средний', 'Сложный']
const CATS_Q  = ['Все', ...Array.from(new Set(QUESTIONS.map(q => q.cat)))]

const CAT_COLOR = {
  'Linux':'#00aaff','Сети':'#818cf8','Nginx':'#00e676','Безопасность':'#ff3d57',
  'Docker':'#a78bfa','Systemd':'#ffb300','Базы данных':'#fb923c',
  'Мониторинг':'#00d4ff','Kubernetes':'#34d399',
}

export default function Quiz() {
  const [diff,     setDiff]     = useState('Все')
  const [catF,     setCatF]     = useState('Все')
  const [current,  setCurrent]  = useState(0)
  const [answers,  setAnswers]  = useState({})
  const [revealed, setRevealed] = useState({})
  const [started,  setStarted]  = useState(false)
  const [finished, setFinished] = useState(false)

  const filtered = QUESTIONS.filter(q =>
    (diff  === 'Все' || q.diff === diff) &&
    (catF  === 'Все' || q.cat  === catF)
  )

  const q = filtered[current]

  const choose = (idx) => {
    if (!q || revealed[q.id]) return
    setAnswers(a => ({ ...a, [q.id]: idx }))
    setRevealed(r => ({ ...r, [q.id]: true }))
  }

  const next = () => {
    if (current < filtered.length - 1) setCurrent(c => c + 1)
    else setFinished(true)
  }

  const restart = () => {
    setCurrent(0); setAnswers({}); setRevealed({});
    setFinished(false); setStarted(false)
  }

  const score = filtered.filter(q => answers[q.id] === q.correct).length

  // --- Экран настроек ---
  if (!started) {
    return (
      <div>
        <h1 className="page-title">Тест <span className="accent">знаний</span></h1>
        <p className="page-subtitle">{QUESTIONS.length} вопросов — Linux, сети, Docker, безопасность, Kubernetes.</p>

        <div className="quiz-setup">
          <div className="quiz-setup-group">
            <div className="section-label">Сложность</div>
            <div className="quiz-filter-row">
              {DIFFS.map(d => (
                <button key={d} className={`quiz-filter-btn ${diff === d ? 'active' : ''}`} onClick={() => setDiff(d)}>{d}</button>
              ))}
            </div>
          </div>
          <div className="quiz-setup-group">
            <div className="section-label">Категория</div>
            <div className="quiz-filter-row">
              {CATS_Q.map(c => (
                <button key={c} className={`quiz-filter-btn ${catF === c ? 'active' : ''}`} onClick={() => setCatF(c)}>{c}</button>
              ))}
            </div>
          </div>
          <div className="quiz-setup-info">
            Выбрано вопросов: <strong style={{color:'var(--accent)'}}>{filtered.length}</strong>
          </div>
          <button
            className="btn btn-primary"
            disabled={filtered.length === 0}
            onClick={() => { setCurrent(0); setStarted(true) }}
          >
            Начать тест
          </button>
        </div>
      </div>
    )
  }

  // --- Экран результата ---
  if (finished) {
    const pct = Math.round(score / filtered.length * 100)
    const grade = pct >= 80 ? {label:'Отлично',color:'#00e676'}
                : pct >= 60 ? {label:'Хорошо', color:'#ffb300'}
                :              {label:'Нужно повторить', color:'#ff3d57'}
    return (
      <div>
        <h1 className="page-title">Тест <span className="accent">завершён</span></h1>
        <div className="quiz-result">
          <div className="result-score" style={{color:grade.color}}>{score}/{filtered.length}</div>
          <div className="result-pct"   style={{color:grade.color}}>{pct}%</div>
          <div className="result-grade" style={{color:grade.color}}>{grade.label}</div>
          <div className="result-breakdown">
            {filtered.map(q => (
              <div key={q.id} className={`breakdown-row ${answers[q.id] === q.correct ? 'correct' : 'wrong'}`}>
                <span className="breakdown-icon">{answers[q.id] === q.correct ? 'Верно' : 'Неверно'}</span>
                <span className="breakdown-cat" style={{color:CAT_COLOR[q.cat]||'#00aaff'}}>{q.cat}</span>
                <span className="breakdown-diff">[{q.diff}]</span>
                <span className="breakdown-q">{q.q}</span>
              </div>
            ))}
          </div>
          <button className="quiz-restart-btn" onClick={restart}>Пройти заново</button>
        </div>
      </div>
    )
  }

  // --- Экран вопроса ---
  const chosen     = answers[q.id]
  const isRevealed = revealed[q.id]
  const catColor   = CAT_COLOR[q.cat] || '#00aaff'

  return (
    <div>
      <h1 className="page-title">Тест <span className="accent">знаний</span></h1>
      <p className="page-subtitle">
        {catF !== 'Все' ? catF : 'Все категории'} · {diff !== 'Все' ? diff : 'Любая сложность'}
      </p>

      <div className="quiz-progress">
        <div className="quiz-progress-label">
          <span style={{color:catColor}}>{q.cat}</span>
          <span className="quiz-diff-badge" style={{color:catColor}}>{q.diff}</span>
          <span className="quiz-counter">{current+1} / {filtered.length}</span>
        </div>
        <div className="quiz-progress-bar">
          {filtered.map((_,i) => (
            <div key={i} className={`qpb-seg ${
              i < current ? 'done' : i === current ? 'active' : ''
            } ${answers[filtered[i].id] === filtered[i].correct ? 'correct' : answers[filtered[i].id] !== undefined ? 'wrong' : ''}`} />
          ))}
        </div>
      </div>

      <div className="quiz-card">
        <div className="quiz-q-num" style={{color:catColor}}>Вопрос {current+1}</div>
        <h2 className="quiz-question">{q.q}</h2>

        <div className="quiz-options">
          {q.options.map((opt,i) => {
            let cls = 'quiz-option'
            if (isRevealed) {
              if (i === q.correct)               cls += ' correct'
              else if (i === chosen)             cls += ' wrong'
            } else if (i === chosen)             cls += ' selected'
            return (
              <button key={i} className={cls} onClick={() => choose(i)}>
                <span className="opt-letter">{String.fromCharCode(65+i)}</span>
                <span className="opt-text">{opt}</span>
                {isRevealed && i === q.correct && <span className="opt-icon">Верно</span>}
                {isRevealed && i === chosen && i !== q.correct && <span className="opt-icon">Неверно</span>}
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
              {current < filtered.length - 1 ? 'Следующий вопрос' : 'Посмотреть результат'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
