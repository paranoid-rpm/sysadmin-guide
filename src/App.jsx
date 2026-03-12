import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Theory from './pages/Theory'
import Skills from './pages/Skills'
import Tools from './pages/Tools'
import Quiz from './pages/Quiz'
import Incident from './pages/Incident'
import DragStack from './pages/DragStack'
import Terminal from './pages/Terminal'
import Roadmap from './pages/Roadmap'
import Checklist from './pages/Checklist'
import Network from './pages/Network'
import './App.css'

function AnimatedBg() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${Math.floor(Math.random() * 100)}%`,
    top: `${Math.floor(Math.random() * 100)}%`,
    duration: `${8 + Math.floor(Math.random() * 12)}s`,
    delay: `${Math.floor(Math.random() * 10)}s`,
  }))
  return (
    <div className="app-bg">
      <div className="app-bg-grid" />
      <div className="app-bg-glow g1" />
      <div className="app-bg-glow g2" />
      <div className="app-bg-particles">
        {particles.map(p => (
          <div key={p.id} className="particle" style={{
            left: p.left, top: p.top,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }} />
        ))}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="app">
      <AnimatedBg />
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/theory" element={<Theory />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/incident" element={<Incident />} />
          <Route path="/drag-stack" element={<DragStack />} />
          <Route path="/terminal" element={<Terminal />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/network" element={<Network />} />
        </Routes>
      </main>
    </div>
  )
}
