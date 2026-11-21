import { useState, useEffect } from 'react'
import api from '../services/api'

// أول رسالة خطأ من استجابة Laravel (422)
function errorMessage(error) {
  const errors = error.response?.data?.errors
  if (errors) return Object.values(errors)[0]?.[0]
  return error.response?.data?.message || 'Something went wrong, please try again.'
}

function defaultServing(food) {
  return food.serving_unit ? `1 ${food.serving_unit}` : '100g'
}

function AddFoodModal({ mealName, onClose, onAdd, initialFood = null }) {
  const [name, setName] = useState(initialFood?.name || '')
  const [serving, setServing] = useState(initialFood?.description || '')

  const [catalog, setCatalog] = useState([])
  const [preview, setPreview] = useState(null)
  const [previewError, setPreviewError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)

  const isEditing = Boolean(initialFood)

  // قائمة الأطعمة من قاعدة البيانات
  useEffect(() => {
    api
      .get('/foods')
      .then((res) => setCatalog(res.data.data || []))
      .catch(() => setCatalog([]))
  }, [])

  // الباك هو من يحسب السعرات والماكروز: نرسل الاسم والحجم فقط
  useEffect(() => {
    setPreview(null)
    setPreviewError('')

    if (!name.trim() || !serving.trim()) return

    let cancelled = false

    const timer = setTimeout(async () => {
      try {
        const res = await api.post('/foods/calculate', {
          name: name.trim(),
          serving: serving.trim(),
        })

        if (!cancelled) setPreview(res.data)
      } catch (error) {
        if (!cancelled) setPreviewError(errorMessage(error))
      }
    }, 350)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [name, serving])

  function pickFood(food) {
    setName(food.name)
    setServing((current) => current.trim() || defaultServing(food))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!preview || saving) return

    setSaving(true)
    setSubmitError('')

    try {
      await onAdd({
        name: preview.food.name,
        serving: serving.trim(),
      })

      onClose()
    } catch (error) {
      setSubmitError(errorMessage(error))
      setSaving(false)
    }
  }

  const query = name.trim().toLowerCase()
  const visibleFoods = catalog.filter(
    (food) => !query || food.name.toLowerCase().includes(query)
  )

  const nutrition = preview?.nutrition

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
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Chicken Breast"
              autoComplete="off"
              required
            />
          </label>

          {visibleFoods.length > 0 && (
            <div className="food-chips">
              {visibleFoods.map((food) => (
                <button
                  type="button"
                  key={food.food_id}
                  className={
                    food.name.toLowerCase() === query
                      ? 'food-chip active'
                      : 'food-chip'
                  }
                  onClick={() => pickFood(food)}
                >
                  <span>
                    {food.emoji || '🍽'} {food.name}
                  </span>
                  <small>
                    per {food.serving_unit ? `1 ${food.serving_unit}` : '100g'}
                  </small>
                </button>
              ))}
            </div>
          )}

          <label>
            Serving size
            <input
              name="serving"
              value={serving}
              onChange={(event) => setServing(event.target.value)}
              placeholder="e.g. 200g  or  3 eggs"
              autoComplete="off"
              required
            />
          </label>

          <div className="form-divider">
            NUTRITION (CALCULATED AUTOMATICALLY)
          </div>

          {nutrition ? (
            <div className="nutrition-preview">
              <div>
                <strong>{Math.round(nutrition.calories)}</strong>
                <span>kcal</span>
              </div>
              <div>
                <strong>{Math.round(nutrition.protein_g)}g</strong>
                <span>Protein</span>
              </div>
              <div>
                <strong>{Math.round(nutrition.carbs_g)}g</strong>
                <span>Carbs</span>
              </div>
              <div>
                <strong>{Math.round(nutrition.fat_g)}g</strong>
                <span>Fat</span>
              </div>
            </div>
          ) : (
            <p className="preview-hint">
              {previewError || 'Enter a food and a serving size to see the nutrition.'}
            </p>
          )}

          {submitError && <p className="form-error">{submitError}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-food-button"
              disabled={!preview || saving}
            >
              {isEditing ? 'Save Changes' : 'Add Food'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddFoodModal
