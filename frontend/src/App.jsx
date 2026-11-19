import { useState, useEffect } from 'react'
import MealTracking from './pages/MealTracking'
import Progress from './pages/progress'
import './App.css'

function App() {
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  if (hash === '#/progress') return <Progress />

  return <MealTracking />
}

export default App