import { useState, useMemo } from 'react'
import './Subnet.css'

function ipToNum(ip) {
  return ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct), 0) >>> 0
}

function numToIp(n) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
}

function isValidIp(ip) {
  const parts = ip.split('.')
  if (parts.length !== 4) return false
  return parts.every(p => /^\d+$/.test(p) && +p >= 0 && +p <= 255)
}

const CIDR_EXAMPLES = [
  '192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/12',
  '192.168.0.0/16', '10.10.10.0/28', '203.0.113.0/26',
]

export default function Subnet() {
  const [input, setInput] = useState('192.168.1.0/24')

  const result = useMemo(() => {
    const parts = input.trim().split('/')
    if (parts.length !== 2) return null
    const [ipStr, cidrStr] = parts
    if (!isValidIp(ipStr)) return null
    const cidr = parseInt(cidrStr)
    if (isNaN(cidr) || cidr < 0 || cidr > 32) return null

    const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0
    const ip = ipToNum(ipStr)
    const network = (ip & mask) >>> 0
    const broadcast = (network | (~mask >>> 0)) >>> 0
    const firstHost = cidr <= 30 ? network + 1 : network
    const lastHost = cidr <= 30 ? broadcast - 1 : broadcast
    const hosts = cidr <= 30 ? Math.pow(2, 32 - cidr) - 2 : (cidr === 31 ? 2 : 1)
    const total = Math.pow(2, 32 - cidr)

    // Subnet class
    const firstOctet = (ip >>> 24) & 255
    let cls = 'C'
    if (firstOctet < 128) cls = 'A'
    else if (firstOctet < 192) cls = 'B'
    else if (firstOctet < 224) cls = 'C'
    else cls = 'D/E'

    // Private check
    const isPrivate = (
      (firstOctet === 10) ||
      (firstOctet === 172 && ((ip >>> 16) & 255) >= 16 && ((ip >>> 16) & 255) <= 31) ||
      (firstOctet === 192 && ((ip >>> 16) & 255) === 168)
    )

    // Binary representation
    const toBin = n => (n >>> 0).toString(2).padStart(32, '0').match(/.{8}/g).join('.')

    // Split into 2 subnets
    const sub1 = cidr < 32 ? `${numToIp(network)}/${cidr + 1}` : null
    const sub2 = cidr < 32 ? `${numToIp(network + Math.pow(2, 32 - cidr - 1))}/${cidr + 1}` : null

    return {
      ip: numToIp(ip),
      cidr,
      mask: numToIp(mask),
      wildcardMask: numToIp(~mask >>> 0),
      network: numToIp(network),
      broadcast: numToIp(broadcast),
      firstHost: numToIp(firstHost),
      lastHost: numToIp(lastHost),
      hosts,
      total,
      cls,
      isPrivate,
      ipBin: toBin(ip),
      maskBin: toBin(mask),
      networkBin: toBin(network),
      sub1, sub2,
    }
  }, [input])

  const rows = result ? [
    { label: 'IP-адрес', value: result.ip, mono: true },
    { label: 'CIDR', value: `/${result.cidr}`, mono: true },
    { label: 'Маска', value: result.mask, mono: true },
    { label: 'Wildcard', value: result.wildcardMask, mono: true },
    { label: 'Адрес сети', value: result.network, color: '#00aaff', mono: true },
    { label: 'Broadcast', value: result.broadcast, color: '#ff9900', mono: true },
    { label: 'Первый хост', value: result.firstHost, color: '#00e676', mono: true },
    { label: 'Последний хост', value: result.lastHost, color: '#00e676', mono: true },
    { label: 'Хостов (usable)', value: result.hosts.toLocaleString(), color: '#00e676' },
    { label: 'Всего адресов', value: result.total.toLocaleString() },
    { label: 'Класс', value: result.cls },
    { label: 'Тип', value: result.isPrivate ? 'Приватный (RFC 1918)' : 'Публичный', color: result.isPrivate ? '#818cf8' : '#00aaff' },
  ] : []

  return (
    <div>
      <h1 className="page-title">Калькулятор <span className="accent">подсетей</span></h1>
      <p className="page-subtitle">Введи IP/CIDR и получи полный расчёт подсети.</p>

      <div className="sn-input-row">
        <input
          className="sn-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="192.168.1.0/24"
          spellCheck={false}
        />
        {!result && input.trim() && <span className="sn-error">Неверный формат</span>}
      </div>

      <div className="sn-examples">
        {CIDR_EXAMPLES.map(ex => (
          <button
            key={ex}
            className={`sn-ex-btn ${input === ex ? 'active' : ''}`}
            onClick={() => setInput(ex)}
          >{ex}</button>
        ))}
      </div>

      {result && (
        <div className="sn-layout">
          <div className="sn-table-wrap">
            <table className="sn-table">
              <tbody>
                {rows.map(row => (
                  <tr key={row.label}>
                    <td className="sn-td-label">{row.label}</td>
                    <td className="sn-td-val" style={row.color ? { color: row.color } : {}}>
                      {row.mono ? <code>{row.value}</code> : row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sn-right">
            <div className="sn-bin-block">
              <div className="sn-bin-label">Бинарное представление</div>
              {[['IP', result.ipBin], ['Mask', result.maskBin], ['Net', result.networkBin]].map(([l, b]) => (
                <div key={l} className="sn-bin-row">
                  <span className="sn-bin-name">{l}</span>
                  <code className="sn-bin-val">
                    {b.split('').map((bit, i) => {
                      const octetPos = i % 9
                      if (octetPos === 8) return <span key={i} className="sn-bin-dot">.</span>
                      const netBit = Math.floor(i / 9) * 8 + (i % 9)
                      return <span key={i} className={netBit < result.cidr ? 'sn-net-bit' : 'sn-host-bit'}>{bit}</span>
                    })}
                  </code>
                </div>
              ))}
              <div className="sn-bin-legend">
                <span className="sn-net-bit">0</span> — сетевая часть
                <span className="sn-host-bit" style={{marginLeft:12}}>0</span> — хостовая часть
              </div>
            </div>

            {result.sub1 && (
              <div className="sn-split-block">
                <div className="sn-bin-label">Разбить на 2 подсети</div>
                <button className="sn-split-btn" onClick={() => setInput(result.sub1)}>{result.sub1}</button>
                <button className="sn-split-btn" onClick={() => setInput(result.sub2)}>{result.sub2}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
