
import { useState, useEffect } from 'react'

function HydrationTracker() {
  const [water, setWater] = useState(() => {
    try {
      const savedWater = localStorage.getItem('fitsync-water')
      return savedWater !== null ? Number(savedWater) : 1250
    } catch {
      return 1250
    }
  })

  const goal = 2500
  const percentage = Math.min((water / goal) * 100, 100)

  useEffect(() => {
    localStorage.setItem('fitsync-water', String(water))
  }, [water])

  function addWater(amount) {
    setWater((current) => current + amount)
  }

  return (
    <section className="hydration-card">
      <div className="hydration-header">
        <div>
          <h2>Hydration</h2>
          <p>Keep your body hydrated throughout the day.</p>
        </div>

        <span className="water-icon">💧</span>
      </div>

      <div className="water-total">
        <strong>{water.toLocaleString()} ml</strong>
        <span> / {goal.toLocaleString()} ml</span>
      </div>

      <div className="water-track">
        <div
          className="water-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="water-status">
        {Math.round(percentage)}% of your daily goal
      </p>

      <div className="water-actions">
        <button type="button" onClick={() => addWater(250)}>
          +250 ml
        </button>

        <button type="button" onClick={() => addWater(500)}>
          +500 ml
        </button>

        <button
          type="button"
          className="water-reset"
          onClick={() => setWater(0)}
        >
          Reset
        </button>
      </div>
    </section>
  )
}

export default HydrationTracker
