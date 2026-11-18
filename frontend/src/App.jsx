import { useState, useEffect } from 'react'
import MealTracking from './pages/MealTracking'
import Progress from './pages/progress'
import './App.css'

function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#nutrition')

  useEffect(() => {
    function handleHashChange() {
      setCurrentRoute(window.location.hash || '#nutrition')
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  if (currentRoute === '#progress') {
    return <Progress />
  }

  return <MealTracking />
}

export default App