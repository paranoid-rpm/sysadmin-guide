import { useState, useMemo } from 'react'
import './Regex.css'

const FLAGS = [
  { id: 'g', label: 'g', desc: 'все совпадения' },
  { id: 'i', label: 'i', desc: 'без учёта регистра' },
  { id: 'm', label: 'm', desc: 'многострочный режим' },
  { id: 's', label: 's', desc: 'точка матчит перевод строки' },
]

const PRESETS = [
  { label: 'IPv4‑адрес', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
  { label: 'Email', pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', flags: 'gi' },
  { label: 'URL', pattern: 'https?:\\/\\/[\\w\\-._~:/?#[\\]@!$&\'()*+,;=%]+', flags: 'gi' },
  { label: 'MAC‑адрес', pattern: '([0-9A-Fa-f]{2}[:\\-]){5}[0-9A-Fa-f]{2}', flags: 'gi' },
  { label: 'UUID', pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', flags: 'gi' },
  { label: 'Дата DD.MM.YYYY', pattern: '\\b\\d{2}\\.\\d{2}\\.\\d{4}\\b', flags: 'g' },
  { label: 'Время HH:MM', pattern: '\\b([01]?\\d|2[0-3]):[0-5]\\d\\b', flags: 'g' },
  { label: 'Порт в URL', pattern: ':(\\d{2,5})(?:\\/|$)', flags: 'g' },
]

const DEFAULT_TEXT = `server1 IP: 192.168.1.10
server2 IP: 10.0.0.5
admin@example.com
user.name+tag@domain.co.uk
https://grafana.local:3000/dashboards
MAC: 00:1A:2B:3C:4D:5E
UUID: 550e8400-e29b-41d4-a716-446655440000
Дата: 12.03.2026 время 22:15`

export default function Regex() {
  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}')
  const [flags, setFlags] = useState('gi')
  const [text, setText] = useState(DEFAULT_TEXT)
  const [replace, setReplace] = useState('')
  const [tab, setTab] = useState('match')

  const toggleFlag = (f) => {
    setFlags(prev => prev.includes(f) ? prev.replace(f, '') : prev + f)
  }

  const { matches, highlighted, error, replaced } = useMemo(() => {
    if (!pattern) return { matches: [], highlighted: text, error: null, replaced: text }
    try {
      const baseFlags = flags.includes('g') ? flags : flags + 'g'
      const re = new RegExp(pattern, baseFlags)
      const allMatches = [...text.matchAll(re)]
      const replaced = text.replace(new RegExp(pattern, baseFlags), replace)

      let result = ''
      let last = 0
      const reH = new RegExp(pattern, baseFlags)
      let m
      while ((m = reH.exec(text)) !== null) {
        result += escHtml(text.slice(last, m.index))
        result += `<mark class="rx-mark">${escHtml(m[0])}</mark>`
        last = m.index + m[0].length
        if (m[0].length === 0) reH.lastIndex++
      }
      result += escHtml(text.slice(last))

      return { matches: allMatches, highlighted: result, error: null, replaced }
    } catch (e) {
      return { matches: [], highlighted: escHtml(text), error: e.message, replaced: text }
    }
  }, [pattern, flags, text, replace])

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  }

  return (
    <div>
      <h1 className="page-title">Regex <span className="accent">тестер</span></h1>
      <p className="page-subtitle">Проверь регулярные выражения с подсветкой совпадений и заменой.</p>

      <div className="rx-layout">
        <div className="rx-left">
          <div className="rx-pattern-row">
            <div className="rx-pattern-wrap">
              <span className="rx-slash">/</span>
              <input
                className="rx-input"
                value={pattern}
                onChange={e => setPattern(e.target.value)}
                placeholder="шаблон"
                spellCheck={false}
              />
              <span className="rx-slash">/</span>
              <span className="rx-flags-display">{flags || ' '}</span>
            </div>
            {error && <div className="rx-error">{error}</div>}
          </div>

          <div className="rx-flags">
            {FLAGS.map(f => (
              <button
                key={f.id}
                className={`rx-flag-btn ${flags.includes(f.id) ? 'on' : ''}`}
                onClick={() => toggleFlag(f.id)}
                title={f.desc}
              >
                {f.label} <span className="rx-flag-desc">{f.desc}</span>
              </button>
            ))}
          </div>

          <div className="rx-presets">
            {PRESETS.map(p => (
              <button
                key={p.label}
                className={`rx-preset-btn ${pattern === p.pattern ? 'active' : ''}`}
                onClick={() => { setPattern(p.pattern); setFlags(p.flags) }}
              >{p.label}</button>
            ))}
          </div>

          <div className="rx-tabs">
            <button className={`rx-tab ${tab==='match'?'active':''}`} onClick={()=>setTab('match')}>Совпадения ({matches.length})</button>
            <button className={`rx-tab ${tab==='replace'?'active':''}`} onClick={()=>setTab('replace')}>Замена</button>
          </div>

          {tab === 'replace' && (
            <div className="rx-replace-row">
              <label className="rx-small-label">Заменить на</label>
              <input
                className="rx-input-sm"
                value={replace}
                onChange={e => setReplace(e.target.value)}
                placeholder="строка замены"
                spellCheck={false}
              />
            </div>
          )}
        </div>

        <div className="rx-right">
          <div className="rx-section-label">Текст</div>
          <textarea
            className="rx-textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            rows={10}
            spellCheck={false}
          />
        </div>
      </div>

      <div className="rx-result">
        <div className="rx-result-label">
          {tab === 'match'
            ? `Результат — ${matches.length} совпадений`
            : 'Результат замены'}
        </div>
        {tab === 'match' ? (
          <>
            <div
              className="rx-highlighted"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
            {matches.length > 0 && (
              <div className="rx-match-list">
                {matches.map((m, i) => (
                  <div key={i} className="rx-match-item">
                    <span className="rx-mi-num">{i+1}</span>
                    <code className="rx-mi-val">{m[0]}</code>
                    {m.length > 1 && (
                      <span className="rx-mi-groups">
                        {m.slice(1).map((g, gi) => (
                          <span key={gi} className="rx-group">г{gi+1}: {g ?? 'undefined'}</span>
                        ))}
                      </span>
                    )}
                    <span className="rx-mi-pos">позиция {m.index}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="rx-highlighted">{replaced}</div>
        )}
      </div>
    </div>
  )
}
