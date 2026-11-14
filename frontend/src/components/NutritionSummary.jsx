
function NutritionSummary({ calories, goal = 2200 }) {
  const remaining = Math.max(goal - calories, 0)
  const percentage = Math.min(Math.round((calories / goal) * 100), 100)

  return (
    <section className="nutrition-summary">
      <div className="summary-header">
        <div>
          <h2>Today's Nutrition</h2>
          <p>Track your daily calorie intake</p>
        </div>

        <span className="date-label">Today</span>
      </div>

      <div className="calorie-card">
        <div className="calorie-info">
          <span>CALORIES CONSUMED</span>
          <h1>
            {calories.toLocaleString()} <small>/ {goal.toLocaleString()} kcal</small>
          </h1>
          <p>
            {remaining.toLocaleString()} kcal remaining
          </p>
        </div>

        <div className="calorie-progress">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <span>{percentage}% of daily goal</span>
        </div>
      </div>
    </section>
  )
}

export default NutritionSummary
