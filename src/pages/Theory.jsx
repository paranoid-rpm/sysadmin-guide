import { useState } from 'react'
import './Theory.css'

const ARTICLES = [
  {
    id: 'osi',
    cat: 'Сети',
    title: 'Модель OSI: 7 уровней',
    icon: '🌐',
    color: '#818cf8',
    short: 'Эталонная модель взаимодействия открытых систем. Разбивает сетевое взаимодействие на 7 уровней.',
    content: [
      { h: 'Что такое OSI', p: 'OSI (Open Systems Interconnection) — концептуальная модель, описывающая как данные проходят от приложения одного компьютера до приложения другого через сеть. Каждый уровень отвечает за свою часть работы и предоставляет услуги вышестоящему.' },
      { h: 'Уровни снизу вверх', table: [
        { num: '1', name: 'Физический', en: 'Physical', desc: 'Биты по кабелю. Стандарты: Ethernet, USB, Wi-Fi (физика)' },
        { num: '2', name: 'Канальный', en: 'Data Link', desc: 'MAC-адреса, фреймы. Протоколы: Ethernet, Wi-Fi, PPP' },
        { num: '3', name: 'Сетевой', en: 'Network', desc: 'IP-адреса, маршрутизация. Протоколы: IP, ICMP, ARP' },
        { num: '4', name: 'Транспортный', en: 'Transport', desc: 'Надёжная доставка. Протоколы: TCP, UDP' },
        { num: '5', name: 'Сеансовый', en: 'Session', desc: 'Управление сессиями. Протоколы: NetBIOS, RPC' },
        { num: '6', name: 'Представления', en: 'Presentation', desc: 'Кодирование, шифрование, сжатие. TLS/SSL' },
        { num: '7', name: 'Прикладной', en: 'Application', desc: 'HTTP, FTP, DNS, SMTP, SSH' },
      ]},
      { h: 'Практическое применение', p: 'При диагностике сети нужно двигаться снизу вверх: сначала проверить физическое соединение (L1), затем ARP (L2), пинг (L3), порт (L4) и только потом приложение (L7). Это экономит время.' },
    ]
  },
  {
    id: 'tcp-handshake',
    cat: 'Сети',
    title: 'TCP Three-Way Handshake',
    icon: '🤝',
    color: '#00aaff',
    short: 'Процесс установки TCP-соединения из трёх шагов: SYN → SYN-ACK → ACK.',
    content: [
      { h: 'Зачем нужен handshake', p: 'TCP — протокол с установкой соединения. Перед передачей данных клиент и сервер договариваются о параметрах: начальных sequence numbers, window size и других. Это обеспечивает надёжную доставку.' },
      { h: 'Три шага', list: [
        'SYN: клиент отправляет пакет с флагом SYN и случайным ISN (Initial Sequence Number)',
        'SYN-ACK: сервер подтверждает (ACK = ISN+1) и отправляет свой SYN со своим ISN',
        'ACK: клиент подтверждает ISN сервера (ACK = ISN_сервера+1). Соединение установлено',
      ]},
      { h: 'Закрытие соединения', p: 'Закрытие — 4-шаговый процесс (Four-Way Handshake): FIN → ACK → FIN → ACK. Каждая сторона закрывает своё направление независимо. Состояние TIME_WAIT длится 2*MSL (~60 сек) для перехвата запоздавших пакетов.' },
      { h: 'Диагностика', p: 'ss -tan показывает состояния соединений: ESTABLISHED, TIME_WAIT, CLOSE_WAIT. Большое количество TIME_WAIT — нормально при высоком трафике. CLOSE_WAIT — утечка: приложение не закрывает соединения.' },
    ]
  },
  {
    id: 'dns',
    cat: 'Сети',
    title: 'Как работает DNS',
    icon: '🔍',
    color: '#00e676',
    short: 'Система доменных имён: рекурсивное разрешение от корневых серверов до авторитативных.',
    content: [
      { h: 'Иерархия DNS', p: 'DNS — это распределённая иерархическая база данных. Корень (.) → TLD (.ru, .com) → домен второго уровня (example.com) → поддомен (www.example.com). Каждый уровень обслуживается своими серверами.' },
      { h: 'Путь запроса', list: [
        'Браузер проверяет локальный кэш',
        'Запрос к резолверу провайдера (или 8.8.8.8)',
        'Резолвер спрашивает корневой сервер: кто знает .com?',
        'Корневой возвращает адрес TLD-сервера для .com',
        'TLD-сервер возвращает адрес NS-серверов example.com',
        'Авторитативный сервер example.com возвращает A-запись',
        'Резолвер кэширует ответ (TTL) и возвращает клиенту',
      ]},
      { h: 'Типы записей', table: [
        { num: 'A', name: 'IPv4-адрес', en: 'Address', desc: 'example.com → 93.184.216.34' },
        { num: 'AAAA', name: 'IPv6-адрес', en: 'Quad-A', desc: 'example.com → 2606:2800::' },
        { num: 'CNAME', name: 'Алиас', en: 'Canonical Name', desc: 'www → example.com' },
        { num: 'MX', name: 'Почта', en: 'Mail Exchange', desc: 'Сервер входящей почты' },
        { num: 'TXT', name: 'Текст', en: 'Text', desc: 'SPF, DKIM, верификация' },
        { num: 'NS', name: 'Сервер имён', en: 'Name Server', desc: 'Делегирование зоны' },
      ]},
      { h: 'Диагностика', p: 'dig example.com A — запрос A-записи. dig +trace example.com — полный путь рекурсивного разрешения. dig @8.8.8.8 example.com — запрос к конкретному резолверу.' },
    ]
  },
  {
    id: 'linux-boot',
    cat: 'Linux',
    title: 'Загрузка Linux',
    icon: '🚀',
    color: '#ffb300',
    short: 'От нажатия кнопки до login-приглашения: BIOS → Bootloader → Kernel → Init.',
    content: [
      { h: 'Этапы загрузки', list: [
        'POST: BIOS/UEFI проверяет оборудование',
        'Bootloader: GRUB2 загружается из MBR/ESP, показывает меню',
        'Kernel: распаковывается bzImage, инициализирует оборудование',
        'initramfs: временная файловая система в RAM для монтирования root',
        'PID 1: systemd (или другой init) становится первым процессом',
        'Targets: systemd запускает цели (multi-user.target, graphical.target)',
        'Login: Getty запускает приглашение входа',
      ]},
      { h: 'Systemd targets', p: 'Targets заменили runlevels из SysV init. rescue.target (~runlevel 1) — однопользовательский режим для восстановления. multi-user.target (~runlevel 3) — полноценная система без GUI. graphical.target (~runlevel 5) — с X11/Wayland.' },
      { h: 'Диагностика загрузки', p: 'systemd-analyze blame — какие юниты тормозят загрузку. systemd-analyze plot > boot.svg — SVG-диаграмма. journalctl -b -1 — логи предыдущей загрузки (полезно после краша).' },
    ]
  },
  {
    id: 'processes',
    cat: 'Linux',
    title: 'Процессы Linux',
    icon: '⚙️',
    color: '#fb923c',
    short: 'Жизненный цикл процессов, состояния, сигналы и управление ресурсами.',
    content: [
      { h: 'Состояния процесса', table: [
        { num: 'R', name: 'Running', en: 'Выполняется', desc: 'Занимает CPU прямо сейчас' },
        { num: 'S', name: 'Sleeping', en: 'Ждёт', desc: 'Interruptible sleep: ждёт I/O или события' },
        { num: 'D', name: 'Disk Wait', en: 'D-состояние', desc: 'Uninterruptible: ждёт I/O. Kill не поможет' },
        { num: 'Z', name: 'Zombie', en: 'Зомби', desc: 'Завершился, но родитель не вызвал wait()' },
        { num: 'T', name: 'Stopped', en: 'Остановлен', desc: 'SIGSTOP или отладчик' },
      ]},
      { h: 'Основные сигналы', list: [
        'SIGTERM (15) — мягкое завершение. Процесс может перехватить и завершиться корректно',
        'SIGKILL (9) — принудительное уничтожение. Не перехватывается',
        'SIGHUP (1) — перечитать конфиг (nginx -s reload)',
        'SIGSTOP (19) — приостановить. SIGCONT (18) — продолжить',
      ]},
      { h: 'Управление ресурсами', p: 'nice (-20..+19): приоритет CPU. renice -n 10 -p PID — снизить приоритет. ulimit ограничивает ресурсы сессии. cgroups (через systemd) — лимиты CPU, RAM, I/O для групп процессов.' },
    ]
  },
  {
    id: 'ssl-tls',
    cat: 'Безопасность',
    title: 'TLS Handshake',
    icon: '🔐',
    color: '#a78bfa',
    short: 'Как TLS устанавливает зашифрованное соединение: обмен сертификатами и ключами.',
    content: [
      { h: 'TLS 1.3 Handshake', list: [
        'ClientHello: клиент отправляет поддерживаемые cipher suites и key_share',
        'ServerHello + Certificate: сервер выбирает алгоритм, отправляет сертификат',
        'Клиент проверяет сертификат по цепочке доверия до корневого CA',
        'Оба вычисляют общий ключ (ECDHE). Далее всё шифруется симметрично',
        'Finished: оба подтверждают корректность handshake. Данные пошли',
      ]},
      { h: 'Сертификаты', p: 'X.509 сертификат содержит публичный ключ, имя владельца (CN/SAN), срок действия и подпись CA. Браузер доверяет сертификату, если цепочка ведёт к корневому CA из доверенного хранилища (Mozilla NSS, Windows Root Store).' },
      { h: 'Диагностика', p: 'openssl s_client -connect example.com:443 — посмотреть цепочку сертификатов. openssl x509 -in cert.pem -text -noout — содержимое сертификата. certbot certificates — статус сертификатов Let\'s Encrypt.' },
    ]
  },
]

const CATS = ['Все', 'Сети', 'Linux', 'Безопасность']

export default function Theory() {
  const [cat, setCat] = useState('Все')
  const [open, setOpen] = useState(null)

  const filtered = ARTICLES.filter(a => cat === 'Все' || a.cat === cat)
  const article = open ? ARTICLES.find(a => a.id === open) : null

  if (article) {
    return (
      <div>
        <button className="theory-back" onClick={() => setOpen(null)}>← Все статьи</button>
        <div className="theory-article">
          <div className="theory-art-meta">
            <span className="theory-art-cat" style={{ color: article.color }}>{article.cat}</span>
          </div>
          <h1 className="theory-art-title">
            {article.icon} {article.title}
          </h1>
          <p className="theory-art-lead">{article.short}</p>
          <div className="theory-art-body">
            {article.content.map((block, i) => (
              <div key={i} className="theory-block">
                <h2 className="theory-block-h">{block.h}</h2>
                {block.p && <p className="theory-block-p">{block.p}</p>}
                {block.list && (
                  <ul className="theory-block-list">
                    {block.list.map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                )}
                {block.table && (
                  <div className="theory-table-wrap">
                    <table className="theory-table">
                      <thead>
                        <tr>
                          <th>#</th><th>Уровень</th><th>Название</th><th>Описание</th>
                        </tr>
                      </thead>
                      <tbody>
                        {block.table.map((row, j) => (
                          <tr key={j}>
                            <td className="mono">{row.num}</td>
                            <td style={{ color: article.color }}>{row.name}</td>
                            <td className="mono grey">{row.en}</td>
                            <td>{row.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">Теория <span className="accent">и концепции</span></h1>
      <p className="page-subtitle">Глубокое объяснение ключевых концепций: протоколы, ядро, безопасность.</p>

      <div className="theory-cats">
        {CATS.map(c => (
          <button
            key={c}
            className={`theory-cat-btn ${cat === c ? 'active' : ''}`}
            onClick={() => setCat(c)}
          >{c}</button>
        ))}
      </div>

      <div className="theory-grid">
        {filtered.map(article => (
          <div key={article.id} className="theory-card" onClick={() => setOpen(article.id)}>
            <div className="theory-card-head">
              <span className="theory-card-icon">{article.icon}</span>
              <span className="theory-card-cat" style={{ color: article.color }}>{article.cat}</span>
            </div>
            <h3 className="theory-card-title">{article.title}</h3>
            <p className="theory-card-desc">{article.short}</p>
            <div className="theory-card-arrow">Читать →</div>
          </div>
        ))}
      </div>
    </div>
  )
}
