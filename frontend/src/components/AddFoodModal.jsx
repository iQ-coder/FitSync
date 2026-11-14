
import { useState } from 'react'

function AddFoodModal({ mealName, onClose, onAdd, initialFood = null }) {
  const [food, setFood] = useState({
    name: initialFood?.name || '',
    description: initialFood?.description || '',
    calories: initialFood?.calories ?? '',
    protein: initialFood?.protein ?? '',
    carbs: initialFood?.carbs ?? '',
    fat: initialFood?.fat ?? '',
  })

  const isEditing = Boolean(initialFood)

  function updateField(event) {
    const { name, value } = event.target

    setFood((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!food.name.trim()) return

    onAdd({
      ...food,
      name: food.name.trim(),
      calories: Number(food.calories) || 0,
      protein: Number(food.protein) || 0,
      carbs: Number(food.carbs) || 0,
      fat: Number(food.fat) || 0,
    })

    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="food-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">NUTRITION TRACKER</span>
            <h2>{isEditing ? 'Edit Food' : 'Add Food'}</h2>
            <p>
              {isEditing ? 'Update' : 'Add an entry to'} {mealName}.
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Food name
            <input
              name="name"
              value={food.name}
              onChange={updateField}
              placeholder="e.g. Chicken breast"
              required
            />
          </label>

          <label>
            Serving size
            <input
              name="description"
              value={food.description}
              onChange={updateField}
              placeholder="e.g. 200g grilled"
            />
          </label>

          <div className="form-divider">
            NUTRITION INFORMATION
          </div>

          <label>
            Calories (kcal)
            <input
              type="number"
              min="0"
              name="calories"
              value={food.calories}
              onChange={updateField}
              placeholder="0"
            />
          </label>

          <div className="nutrition-input-grid">
            <label>
              Protein (g)
              <input
                type="number"
                min="0"
                name="protein"
                value={food.protein}
                onChange={updateField}
                placeholder="0"
              />
            </label>

            <label>
              Carbs (g)
              <input
                type="number"
                min="0"
                name="carbs"
                value={food.carbs}
                onChange={updateField}
                placeholder="0"
              />
            </label>

            <label>
              Fat (g)
              <input
                type="number"
                min="0"
                name="fat"
                value={food.fat}
                onChange={updateField}
                placeholder="0"
              />
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="save-food-button">
              {isEditing ? 'Save Changes' : 'Add Food'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddFoodModal
