import { useState, useEffect } from 'react'
import './Cron.css'

const PRESETS = [
  { label: 'Каждую минуту',        expr: '* * * * *' },
  { label: 'Каждые 5 минут',       expr: '*/5 * * * *' },
  { label: 'Каждые 15 минут',      expr: '*/15 * * * *' },
  { label: 'Каждый час',           expr: '0 * * * *' },
  { label: 'Каждый день в 2:00',   expr: '0 2 * * *' },
  { label: 'Каждый день в 0:00',   expr: '0 0 * * *' },
  { label: 'По будням в 9:00',     expr: '0 9 * * 1-5' },
  { label: 'По воскресеньям',      expr: '0 0 * * 0' },
  { label: 'Каждый месяц 1‑го',    expr: '0 0 1 * *' },
  { label: 'Каждый квартал',       expr: '0 0 1 1,4,7,10 *' },
  { label: 'Раз в год (1 января)', expr: '0 0 1 1 *' },
  { label: 'При перезагрузке',     expr: '@reboot' },
]

function parseField(val, min, max) {
  if (val === '*') return { type: 'any', values: [] }
  if (val.startsWith('*/')) {
    const step = parseInt(val.slice(2))
    return { type: 'step', step, values: [] }
  }
  if (val.includes(',')) {
    const values = val.split(',').map(Number)
    return { type: 'list', values }
  }
  if (val.includes('-')) {
    const [a, b] = val.split('-').map(Number)
    return { type: 'range', from: a, to: b, values: [] }
  }
  const n = parseInt(val)
  if (!isNaN(n)) return { type: 'exact', values: [n] }
  return { type: 'any', values: [] }
}

function describeField(parsed, unit) {
  switch (parsed.type) {
    case 'any': return `каждые ${unit}`
    case 'step': return `каждые ${parsed.step} ${unit}`
    case 'list': return `${unit}: ${parsed.values.join(', ')}`
    case 'range': return `${unit} с ${parsed.from} по ${parsed.to}`
    case 'exact': return `${unit}: ${parsed.values[0]}`
    default: return unit
  }
}

function getNextRuns(expr, count = 5) {
  if (expr.startsWith('@')) return ['(зависит от системы)']
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return []
  const [minF, hourF, domF, monF, dowF] = parts

  const results = []
  const now = new Date()
  const d = new Date(now)
  d.setSeconds(0, 0)
  d.setMinutes(d.getMinutes() + 1)

  const matchField = (field, val) => {
    if (field === '*') return true
    if (field.startsWith('*/')) {
      const step = parseInt(field.slice(2))
      return val % step === 0
    }
    if (field.includes(',')) return field.split(',').map(Number).includes(val)
    if (field.includes('-')) {
      const [a, b] = field.split('-').map(Number)
      return val >= a && val <= b
    }
    return parseInt(field) === val
  }

  let iterations = 0
  while (results.length < count && iterations < 50000) {
    iterations++
    const min = d.getMinutes()
    const hr = d.getHours()
    const dom = d.getDate()
    const mon = d.getMonth() + 1
    const dow = d.getDay()

    if (matchField(monF, mon) && matchField(domF, dom) && matchField(dowF, dow) && matchField(hourF, hr) && matchField(minF, min)) {
      results.push(new Date(d))
    }
    d.setMinutes(d.getMinutes() + 1)
  }
  return results.map(r => r.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }))
}

export default function Cron() {
  const [expr, setExpr] = useState('0 2 * * *')
  const [copied, setCopied] = useState(false)
  const [cmd, setCmd] = useState('/usr/bin/backup.sh')

  const isReboot = expr.trim().startsWith('@')
  const parts = expr.trim().split(/\s+/)
  const valid = isReboot || parts.length === 5

  const [minF, hourF, domF, monF, dowF] = valid && !isReboot ? parts : ['*','*','*','*','*']

  const descriptions = valid && !isReboot ? [
    describeField(parseField(minF, 0, 59), 'минуты'),
    describeField(parseField(hourF, 0, 23), 'часы'),
    describeField(parseField(domF, 1, 31), 'дни месяца'),
    describeField(parseField(monF, 1, 12), 'месяцы'),
    describeField(parseField(dowF, 0, 6), 'дни недели'),
  ] : []

  const nextRuns = valid ? getNextRuns(expr) : []

  const fullCron = `${expr}\t${cmd}`

  const copyExpr = () => {
    navigator.clipboard.writeText(fullCron)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div>
      <h1 className="page-title">Конструктор <span className="accent">cron</span></h1>
      <p className="page-subtitle">Составь cron‑выражение и посмотри ближайшие запуски.</p>

      <div className="cron-layout">
        <div className="cron-left">
          <div className="cron-field-row">
            <div className="cron-label">Выражение</div>
            <input
              className="cron-input"
              value={expr}
              onChange={e => setExpr(e.target.value)}
              spellCheck={false}
            />
          </div>

          {!isReboot && valid && (
            <div className="cron-fields">
              {['мин', 'час', 'д.мес', 'мес', 'д.нед'].map((label, i) => (
                <div key={i} className="cron-field-badge">
                  <div className="cfb-label">{label}</div>
                  <div className="cfb-val">{parts[i]}</div>
                </div>
              ))}
            </div>
          )}

          {valid && !isReboot && (
            <div className="cron-desc">
              {descriptions.map((d, i) => (
                <div key={i} className="cron-desc-item">
                  <span className="cdi-bullet">•</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          )}

          <div className="cron-field-row" style={{ marginTop: 20 }}>
            <div className="cron-label">Команда</div>
            <input
              className="cron-input"
              value={cmd}
              onChange={e => setCmd(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="cron-result">
            <div className="cron-result-label">Итоговая строка для crontab</div>
            <div className="cron-result-row">
              <code className="cron-result-code">{fullCron}</code>
              <button className={`cron-copy-btn ${copied ? 'ok' : ''}`} onClick={copyExpr}>
                {copied ? '✓' : '⧉'}
              </button>
            </div>
          </div>
        </div>

        <div className="cron-right">
          <div className="cron-presets-title">Готовые варианты</div>
          <div className="cron-presets">
            {PRESETS.map(p => (
              <button
                key={p.expr}
                className={`cron-preset ${expr === p.expr ? 'active' : ''}`}
                onClick={() => setExpr(p.expr)}
              >
                <span className="preset-label">{p.label}</span>
                <span className="preset-expr">{p.expr}</span>
              </button>
            ))}
          </div>

          {nextRuns.length > 0 && (
            <div className="cron-next">
              <div className="cron-next-title">Ближайшие запуски</div>
              {nextRuns.map((r, i) => (
                <div key={i} className="cron-next-item">
                  <span className="cni-num">{i + 1}</span>
                  <span className="cni-time">{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="cron-hint">
        <div className="cron-hint-title">Синтаксис</div>
        <div className="cron-hint-grid">
          <div className="hint-cell"><code>*</code><span>любое значение</span></div>
          <div className="hint-cell"><code>*/5</code><span>каждые 5 единиц</span></div>
          <div className="hint-cell"><code>1-5</code><span>диапазон от 1 до 5</span></div>
          <div className="hint-cell"><code>1,3,5</code><span>конкретные значения</span></div>
          <div className="hint-cell"><code>@reboot</code><span>при загрузке системы</span></div>
          <div className="hint-cell"><code>@daily</code><span>раз в сутки</span></div>
        </div>
      </div>
    </div>
  )
}
