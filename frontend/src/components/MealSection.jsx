
import { useState } from 'react'
import AddFoodModal from './AddFoodModal'

function MealSection({ meal, onAddFood, onEditFood, onDeleteFood }) {
  const [expanded, setExpanded] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)

  // Calculate meal totals from its food entries
  const mealTotals = meal.foods.reduce(
    (totals, food) => ({
      calories: totals.calories + Number(food.calories || 0),
      protein: totals.protein + Number(food.protein || 0),
      carbs: totals.carbs + Number(food.carbs || 0),
      fat: totals.fat + Number(food.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  function openAddModal() {
    setEditingIndex(null)
    setShowModal(true)
  }

  function openEditModal(index) {
    setEditingIndex(index)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingIndex(null)
  }

  function handleSave(food) {
    if (editingIndex !== null) {
      onEditFood(meal.name, editingIndex, food)
    } else {
      onAddFood(meal.name, food)
    }
  }

  const editingFood =
    editingIndex !== null ? meal.foods[editingIndex] : null

  return (
    <>
      <section className="meal-card">
        <div
          className="meal-header"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="meal-info">
            <div className="meal-icon">{meal.icon}</div>

            <div>
              <h3>{meal.name}</h3>
              <span>{meal.time}</span>

              <div className="meal-macros">
                <strong>{mealTotals.calories} kcal</strong>
                <span>{mealTotals.protein}g P</span>
                <span>{mealTotals.carbs}g C</span>
                <span>{mealTotals.fat}g F</span>
              </div>
            </div>
          </div>

          <div className="meal-header-right">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                openAddModal()
              }}
            >
              + Add Food
            </button>

            <span>{expanded ? '⌃' : '⌄'}</span>
          </div>
        </div>

        {expanded && (
          <div className="meal-food-list">
            {meal.foods.map((food, index) => (
              <div className="food-row" key={`${food.name}-${index}`}>
                <div className="food-details">
                  <h4>{food.name}</h4>
                  <p>{food.description}</p>
                </div>

                <div className="food-nutrition">
                  <strong>{food.calories} kcal</strong>

                  <span>
                    {food.protein}g P · {food.carbs}g C · {food.fat}g F
                  </span>

                  <div className="food-actions">
                    <button
                      type="button"
                      className="food-edit-button"
                      onClick={() => openEditModal(index)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="food-delete-button"
                      onClick={() => onDeleteFood(meal.name, index)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {meal.foods.length === 0 && (
              <p className="empty-meal">
                No food added yet. Start by adding a meal.
              </p>
            )}
          </div>
        )}
      </section>

      {showModal && (
        <AddFoodModal
          mealName={meal.name}
          initialFood={editingFood}
          onClose={closeModal}
          onAdd={handleSave}
        />
      )}
    </>
  )
}

export default MealSection
