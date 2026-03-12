import { useState } from 'react'
import TopologyView from '../components/network/TopologyView'
import NetworkConstructor from '../components/network/NetworkConstructor'
import './Network.css'

const TOPOLOGIES = [
  {
    id: 'home',
    label: '🏠 Домашняя сеть',
    desc: 'Роутер, ПК, ноутбук, смартфон, TV',
    devices: [
      { id: 'router', type: 'router', label: 'Роутер', x: 340, y: 80,
        info: { title: 'Домашний роутер', desc: 'Распределяет IP-адреса через DHCP, пробрасывает трафик между локальной сетью и интернетом.', cmds: ['ipconfig /all', 'ping 192.168.1.1', 'tracert 8.8.8.8'] } },
      { id: 'pc', type: 'pc', label: 'ПК', x: 120, y: 260,
        info: { title: 'Стационарный ПК', desc: 'Подключён по Ethernet-кабелю (RJ-45). Получает IP автоматически от роутера.', cmds: ['ipconfig', 'ping 8.8.8.8', 'nslookup google.com'] } },
      { id: 'laptop', type: 'laptop', label: 'Ноутбук', x: 280, y: 270,
        info: { title: 'Ноутбук', desc: 'Подключается по Wi-Fi (802.11ac/ax). Может работать и по кабелю.', cmds: ['netsh wlan show interfaces', 'ipconfig /release', 'ipconfig /renew'] } },
      { id: 'phone', type: 'phone', label: 'Смартфон', x: 440, y: 270,
        info: { title: 'Смартфон', desc: 'Подключается по Wi-Fi. Получает IP от роутера.', cmds: [] } },
      { id: 'tv', type: 'tv', label: 'Smart TV', x: 580, y: 260,
        info: { title: 'Smart TV', desc: 'Подключается по Wi-Fi или Ethernet. Использует облако и локальную сеть.', cmds: [] } },
    ],
    links: [
      { from: 'router', to: 'pc', type: 'ethernet', info: 'Ethernet (RJ-45) — надёжное проводное соединение. Скорость до 1 Гбит/с.' },
      { from: 'router', to: 'laptop', type: 'wifi', info: 'Wi-Fi 802.11ac — беспроводное соединение до 1.3 Гбит/с.' },
      { from: 'router', to: 'phone', type: 'wifi', info: 'Wi-Fi — беспроводное соединение.' },
      { from: 'router', to: 'tv', type: 'ethernet', info: 'Ethernet — стабильное соединение для потокового видео.' },
    ]
  },
  {
    id: 'office',
    label: '🏢 Офис 20 человек',
    desc: 'Роутер, свитч, ПК, сервер, принтер',
    devices: [
      { id: 'router', type: 'router', label: 'Роутер', x: 340, y: 40,
        info: { title: 'Офисный роутер', desc: 'Обеспечивает выход в интернет, NAT, фильтрацию. Обычно находится на границе сети.', cmds: ['show ip route', 'show interfaces', 'ping 8.8.8.8'] } },
      { id: 'switch', type: 'switch', label: 'Свитч', x: 340, y: 160,
        info: { title: 'Управляемый свитч', desc: 'Коммутирует трафик между устройствами внутри сети. Поддерживает VLAN, работает на 2 уровне OSI.', cmds: ['show mac address-table', 'show vlan brief', 'show spanning-tree'] } },
      { id: 'server', type: 'server', label: 'Сервер', x: 120, y: 280,
        info: { title: 'Файловый сервер', desc: 'Хранит файлы, базы данных, работает AD/DNS/DHCP. Обычно Windows Server или Linux.', cmds: ['net user', 'systemctl status', 'df -h', 'top'] } },
      { id: 'pc1', type: 'pc', label: 'Рабочие ПК', x: 300, y: 290,
        info: { title: 'Рабочие места', desc: '10-20 ПК подключены к свитчу. Входят в домен через Active Directory.', cmds: ['ipconfig /all', 'net use', 'gpupdate /force'] } },
      { id: 'printer', type: 'printer', label: 'Принтер', x: 500, y: 280,
        info: { title: 'Сетевой принтер', desc: 'Подключён к свитчу, доступен всем устройствам в сети. Настраивается через IP.', cmds: ['ping [printer_ip]'] } },
    ],
    links: [
      { from: 'router', to: 'switch', type: 'ethernet', info: 'Ethernet — уплинк роутер-свитч.' },
      { from: 'switch', to: 'server', type: 'ethernet', info: 'Ethernet 1 Гбит/с — сервер имеет приоритетный доступ.' },
      { from: 'switch', to: 'pc1', type: 'ethernet', info: 'Ethernet 100 Мбит/с — стандартное офисное подключение.' },
      { from: 'switch', to: 'printer', type: 'ethernet', info: 'Ethernet — принтер доступен всем в сети.' },
    ]
  },
  {
    id: 'datacenter',
    label: '🖥 Серверная комната',
    desc: 'Файрвол, коммутатор, несколько серверов',
    devices: [
      { id: 'internet', type: 'cloud', label: 'Интернет', x: 340, y: 30,
        info: { title: 'Интернет / ISP', desc: 'Подключение от провайдера. Обычно оптика или дедикированный канал.', cmds: [] } },
      { id: 'firewall', type: 'firewall', label: 'Файрвол', x: 340, y: 130,
        info: { title: 'Файрвол (Firewall)', desc: 'Фильтрует входящий/исходящий трафик по правилам. Защищает серверы от внешних атак.', cmds: ['show access-lists', 'iptables -L', 'ufw status'] } },
      { id: 'core_switch', type: 'switch', label: 'Корн. комм.', x: 340, y: 230,
        info: { title: 'Корневой коммутатор', desc: '10 Гбит/с, центральное звено сети. Объединяет все серверы и выход наружу.', cmds: ['show cdp neighbors', 'show interfaces trunk', 'show etherchannel'] } },
      { id: 'srv1', type: 'server', label: 'Веб-сервер', x: 140, y: 340,
        info: { title: 'Веб-сервер', desc: 'nginx/Apache. Обрабатывает HTTP/HTTPS запросы. Часто за ним находится балансировщик.', cmds: ['systemctl status nginx', 'tail -f /var/log/nginx/access.log', 'ss -tlnp'] } },
      { id: 'srv2', type: 'server', label: 'DB-сервер', x: 340, y: 340,
        info: { title: 'Сервер БД', desc: 'PostgreSQL / MySQL. Хранит данные приложений. Доступ только из внутренней сети.', cmds: ['psql -U postgres', 'mysqladmin status', 'df -h'] } },
      { id: 'srv3', type: 'server', label: 'Бэкап', x: 540, y: 340,
        info: { title: 'Бэкап-сервер', desc: 'Хранит резервные копии данных. Изолирован от основной сети для безопасности.', cmds: ['rsync -avz', 'tar -czf backup.tar.gz', 'crontab -l'] } },
    ],
    links: [
      { from: 'internet', to: 'firewall', type: 'fiber', info: 'Оптоволоконный канал — высокая пропускная способность и надёжность.' },
      { from: 'firewall', to: 'core_switch', type: 'ethernet', info: 'Ethernet 10 Гбит/с — магистральный канал.' },
      { from: 'core_switch', to: 'srv1', type: 'ethernet', info: 'Ethernet 10 Гбит/с.' },
      { from: 'core_switch', to: 'srv2', type: 'ethernet', info: 'Ethernet 10 Гбит/с.' },
      { from: 'core_switch', to: 'srv3', type: 'ethernet', info: 'Ethernet 1 Гбит/с — бэкап не нуждается в высокой полосе.' },
    ]
  },
  {
    id: 'vpn',
    label: '🌐 Два офиса (VPN)',
    desc: 'Связь двух офисов через VPN-туннель',
    devices: [
      { id: 'office1_r', type: 'router', label: 'Роутер-1', x: 120, y: 80,
        info: { title: 'Роутер офиса 1', desc: 'Обеспечивает VPN-туннель до второго офиса. Трафик между офисами шифруется.', cmds: ['show crypto ipsec sa', 'show vpn-sessiondb', 'ping 10.2.0.1'] } },
      { id: 'office1_sw', type: 'switch', label: 'Свитч-1', x: 120, y: 210,
        info: { title: 'Свитч офиса 1', desc: 'Объединяет устройства первого офиса. Сеть: 10.1.0.0/24.', cmds: ['show mac address-table'] } },
      { id: 'office1_pc', type: 'pc', label: 'ПК офис 1', x: 120, y: 330,
        info: { title: 'ПК офиса 1', desc: 'IP: 10.1.0.x. Видит ПК второго офиса как будто они в одной сети.', cmds: ['ping 10.2.0.10', 'tracert 10.2.0.10'] } },
      { id: 'internet', type: 'cloud', label: 'Интернет', x: 340, y: 130,
        info: { title: 'Интернет', desc: 'Публичный канал. Трафик между офисами проходит через него зашифрованным (IPSec).', cmds: [] } },
      { id: 'office2_r', type: 'router', label: 'Роутер-2', x: 560, y: 80,
        info: { title: 'Роутер офиса 2', desc: 'Вторая точка VPN-туннеля. Сеть: 10.2.0.0/24.', cmds: ['show crypto ipsec sa', 'show ip route', 'ping 10.1.0.1'] } },
      { id: 'office2_sw', type: 'switch', label: 'Свитч-2', x: 560, y: 210,
        info: { title: 'Свитч офиса 2', desc: 'Объединяет устройства второго офиса. Сеть: 10.2.0.0/24.', cmds: [] } },
      { id: 'office2_pc', type: 'pc', label: 'ПК офис 2', x: 560, y: 330,
        info: { title: 'ПК офиса 2', desc: 'IP: 10.2.0.x. Доступен из первого офиса через VPN.', cmds: ['ping 10.1.0.10', 'tracert 10.1.0.10'] } },
    ],
    links: [
      { from: 'office1_r', to: 'office1_sw', type: 'ethernet', info: 'Ethernet — локальная сеть офиса 1.' },
      { from: 'office1_sw', to: 'office1_pc', type: 'ethernet', info: 'Ethernet — рабочее место.' },
      { from: 'office1_r', to: 'internet', type: 'ethernet', info: 'Публичный IP офиса 1.' },
      { from: 'office2_r', to: 'internet', type: 'ethernet', info: 'Публичный IP офиса 2.' },
      { from: 'office2_r', to: 'office2_sw', type: 'ethernet', info: 'Ethernet — локальная сеть офиса 2.' },
      { from: 'office2_sw', to: 'office2_pc', type: 'ethernet', info: 'Ethernet.' },
      { from: 'office1_r', to: 'office2_r', type: 'vpn', info: 'VPN-туннель (IPSec) — зашифрованное соединение между офисами через интернет.' },
    ]
  },
  {
    id: 'broken',
    label: '⚠️ Найди проблему',
    desc: 'Топология с неисправным звеном — найди где обрыв',
    broken: true,
    hint: 'Подсказка: ПК не может добраться до сервера. Кабель между свитчом и сервером повреждён.',
    devices: [
      { id: 'router', type: 'router', label: 'Роутер', x: 340, y: 50, info: { title: 'Роутер', desc: 'Работает нормально.', cmds: [] } },
      { id: 'switch', type: 'switch', label: 'Свитч', x: 340, y: 180, info: { title: 'Свитч', desc: 'Работает нормально.', cmds: [] } },
      { id: 'server', type: 'server', label: 'Сервер', x: 180, y: 320, broken: true, info: { title: 'Сервер (проблема!)', desc: 'Соединение со свитчем оборвано! Порт не отвечает, пинг от ПК не проходит.', cmds: ['ping [server_ip]', 'show interfaces', 'cable test'] } },
      { id: 'pc', type: 'pc', label: 'ПК', x: 500, y: 320, info: { title: 'ПК', desc: 'Не может достучаться до сервера.', cmds: ['ping [server_ip]', 'tracert [server_ip]'] } },
    ],
    links: [
      { from: 'router', to: 'switch', type: 'ethernet', info: 'Ethernet — работает.' },
      { from: 'switch', to: 'server', type: 'broken', info: '❗ Кабель повреждён / порт неисправен! Нужно заменить патч-корд или проверить порт на свитче.' },
      { from: 'switch', to: 'pc', type: 'ethernet', info: 'Ethernet — работает.' },
    ]
  },
]

export default function Network() {
  const [mode, setMode] = useState('topologies')
  const [selectedTopology, setSelectedTopology] = useState(null)

  return (
    <div>
      <h1 className="page-title">🌐 Сетевая топология</h1>
      <p className="page-subtitle">5 готовых топологий + конструктор сети как в Cisco</p>

      <div className="net-tabs">
        <button className={`net-tab${mode==='topologies'?' active':''}`} onClick={()=>{setMode('topologies');setSelectedTopology(null)}}>
          📖 Готовые топологии
        </button>
        <button className={`net-tab${mode==='constructor'?' active':''}`} onClick={()=>{setMode('constructor');setSelectedTopology(null)}}>
          🛠 Конструктор
        </button>
      </div>

      {mode === 'topologies' && !selectedTopology && (
        <div className="topology-list">
          {TOPOLOGIES.map(t => (
            <div key={t.id} className="topology-card card" onClick={() => setSelectedTopology(t)}>
              <div className="topology-card-label">{t.label}</div>
              <div className="topology-card-desc">{t.desc}</div>
              {t.broken && <span className="badge" style={{background:'var(--red)',color:'#fff',marginTop:8}}>⚠️ Найди проблему</span>}
            </div>
          ))}
        </div>
      )}

      {mode === 'topologies' && selectedTopology && (
        <div>
          <button className="btn btn-outline" style={{marginBottom:16}} onClick={()=>setSelectedTopology(null)}>
            ← Назад к списку
          </button>
          <TopologyView topology={selectedTopology} />
        </div>
      )}

      {mode === 'constructor' && <NetworkConstructor />}
    </div>
  )
}
