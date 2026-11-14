
const macros = [
  {
    name: 'Protein',
    goal: 160,
    unit: 'g',
    color: '#E31B23',
    key: 'protein',
  },
  {
    name: 'Carbs',
    goal: 220,
    unit: 'g',
    color: '#F59E0B',
    key: 'carbs',
  },
  {
    name: 'Fat',
    goal: 70,
    unit: 'g',
    color: '#3B82F6',
    key: 'fat',
  },
]

function MacroProgress({ totals }) {
  return (
    <section className="macro-section">
      <div className="section-heading">
        <h2>Macronutrients</h2>
        <span>Daily targets</span>
      </div>

      <div className="macro-grid">
        {macros.map((macro) => {
          const consumed = totals[macro.key] || 0

          const percentage = Math.min(
            (consumed / macro.goal) * 100,
            100
          )

          return (
            <div className="macro-card" key={macro.name}>
              <div className="macro-top">
                <h3>{macro.name}</h3>
                <span>{Math.round(percentage)}%</span>
              </div>

              <div className="macro-amount">
                <strong>{consumed}{macro.unit}</strong>
                <span> / {macro.goal}{macro.unit}</span>
              </div>

              <div className="macro-track">
                <div
                  className="macro-fill"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: macro.color,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default MacroProgress
