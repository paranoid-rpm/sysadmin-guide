import { useState, useRef } from 'react'
import './DragStack.css'

const INITIAL_ITEMS = [
  { id: 1, name: 'Файрвол',        icon: '', color: '#ff3d57', desc: 'Первый рубеж защиты. Фильтрует входящий и исходящий трафик по правилам.' },
  { id: 2, name: 'Балансировщик',  icon: '', color: '#00aaff', desc: 'Распределяет запросы между несколькими backend-серверами.' },
  { id: 3, name: 'Веб-сервер',     icon: '', color: '#00e676', desc: 'Nginx/Apache. Обрабатывает HTTP-запросы, отдаёт статику или проксирует на app-серверы.' },
  { id: 4, name: 'App-сервер',     icon: '', color: '#818cf8', desc: 'Бизнес-логика приложения. Node.js, Python, Java, Go и др.' },
  { id: 5, name: 'Кэш',            icon: '', color: '#ffb300', desc: 'Redis / Memcached. Хранит горячие данные в памяти для ускорения ответов.' },
  { id: 6, name: 'База данных',    icon: '', color: '#fb923c', desc: 'PostgreSQL / MySQL. Надёжное хранение структурированных данных.' },
  { id: 7, name: 'Очередь',        icon: '', color: '#a78bfa', desc: 'RabbitMQ / Kafka. Асинхронная обработка и развязка сервисов.' },
  { id: 8, name: 'Object Storage', icon: '', color: '#64748b', desc: 'MinIO / S3. Хранение файлов, медиа, бэкапов.' },
  { id: 9, name: 'CDN',            icon: '', color: '#0ea5e9', desc: 'Cloudflare / Fastly. Кэширование статики на edge-серверах ближе к пользователям.' },
  { id: 10, name: 'Мониторинг',    icon: '', color: '#00e676', desc: 'Prometheus + Grafana. Сбор метрик, алерты, дашборды.' },
]

export default function DragStack() {
  const [items] = useState(INITIAL_ITEMS)
  const [stack, setStack] = useState([])
  const dragSrc = useRef(null)
  const dragTarget = useRef(null)
  const [draggingId, setDraggingId] = useState(null)

  const addToStack = (item) => {
    if (stack.find(s => s.id === item.id)) return
    setStack(prev => [...prev, item])
  }

  const removeFromStack = (id) => setStack(prev => prev.filter(s => s.id !== id))

  const onDragStart = (e, id) => {
    dragSrc.current = id
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const onDragOver = (e, id) => {
    e.preventDefault()
    dragTarget.current = id
  }

  const onDrop = (e) => {
    e.preventDefault()
    if (dragSrc.current === dragTarget.current) return
    const src = dragSrc.current
    const tgt = dragTarget.current
    setStack(prev => {
      const arr = [...prev]
      const si = arr.findIndex(s => s.id === src)
      const ti = arr.findIndex(s => s.id === tgt)
      if (si === -1 || ti === -1) return arr
      const [moved] = arr.splice(si, 1)
      arr.splice(ti, 0, moved)
      return arr
    })
    setDraggingId(null)
  }

  const onDragEnd = () => setDraggingId(null)

  const reset = () => setStack([])

  return (
    <div>
      <h1 className="page-title">Конструктор <span className="accent">стека</span></h1>
      <p className="page-subtitle">Собери архитектуру сервиса из компонентов. Нажимай, чтобы добавить, и перетаскивай для изменения порядка.</p>

      <div className="drag-layout">
        <div className="drag-panel">
          <div className="drag-panel-title">Компоненты</div>
          <div className="drag-items">
            {items.map(item => (
              <div
                key={item.id}
                className={`drag-source-item ${stack.find(s => s.id === item.id) ? 'used' : ''}`}
                style={{ '--ic': item.color }}
                onClick={() => addToStack(item)}
              >
                <div className="drag-src-info">
                  <div className="drag-src-name">{item.name}</div>
                  <div className="drag-src-desc">{item.desc}</div>
                </div>
                <span className="drag-src-add">{stack.find(s => s.id === item.id) ? 'Добавлено' : 'Добавить'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="drag-stack-panel">
          <div className="drag-panel-title">
            Твой стек
            {stack.length > 0 && (
              <button className="drag-reset" onClick={reset}>Очистить</button>
            )}
          </div>

          {stack.length === 0 ? (
            <div className="drag-stack-empty">
              <div>Нажми на компонент слева, чтобы добавить его в стек.</div>
            </div>
          ) : (
            <div className="drag-stack-list">
              {stack.map((item, idx) => (
                <div
                  key={item.id}
                  className={`drag-stack-item ${draggingId === item.id ? 'dragging' : ''}`}
                  style={{ '--ic': item.color }}
                  draggable
                  onDragStart={e => onDragStart(e, item.id)}
                  onDragOver={e => onDragOver(e, item.id)}
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                >
                  <div className="stack-item-layer">{String(idx + 1).padStart(2, '0')}</div>
                  <div className="stack-item-info">
                    <div className="stack-item-name" style={{ color: item.color }}>{item.name}</div>
                    <div className="stack-item-desc">{item.desc}</div>
                  </div>
                  <div className="stack-item-actions">
                    <span className="stack-drag-handle">::</span>
                    <button className="stack-remove" onClick={() => removeFromStack(item.id)}>Удалить</button>
                  </div>
                </div>
              ))}

              <div className="drag-stack-summary">
                <div className="summary-label">Итого компонентов: {stack.length}</div>
                <div className="summary-flow">
                  {stack.map((item, idx) => (
                    <span key={item.id}>
                      <span style={{ color: item.color }}>{item.name}</span>
                      {idx < stack.length - 1 && <span className="flow-arrow"> → </span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
