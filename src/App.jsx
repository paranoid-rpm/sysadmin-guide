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

export default function App() {
  return (
    <div className="app">
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
