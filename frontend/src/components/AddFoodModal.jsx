import { useState, useEffect, useRef } from 'react'
import api from '../services/api'

// يستخرج الغرامات من حقل الحجم (مثل "200g grilled")
function parseGrams(description) {
  const match = String(description || '').match(
    /(\d+(?:\.\d+)?)\s*(?:g|gr|gram|grams)(?![a-z])/i
  )
  return match ? Number(match[1]) : null
}

// تقدير الماكروز من السعرات: بنفس نسب الطعام الأصلي إن وُجدت، وإلا 25% / 50% / 25%
function estimateMacros(kcal, ratio) {
  if (ratio) {
    return {
      protein: Math.round(kcal * ratio.protein),
      carbs: Math.round(kcal * ratio.carbs),
      fat: Math.round(kcal * ratio.fat),
    }
  }

  return {
    protein: Math.round((kcal * 0.25) / 4),
    carbs: Math.round((kcal * 0.5) / 4),
    fat: Math.round((kcal * 0.25) / 9),
  }
}

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

  // الحقول التي كتبها المستخدم بنفسه (لا نكتب فوقها)
  const touched = useRef(new Set())

  // هل غيّر المستخدم الاسم أو الحجم (لتفعيل البحث في قاعدة البيانات)
  const lookupNeeded = useRef(false)

  // نسب الماكروز الأصلية عند فتح التعديل
  const baseRatio = useRef(
    initialFood &&
      Number(initialFood.calories) > 0 &&
      Number(initialFood.protein || 0) +
        Number(initialFood.carbs || 0) +
        Number(initialFood.fat || 0) > 0
      ? {
          protein: Number(initialFood.protein || 0) / Number(initialFood.calories),
          carbs: Number(initialFood.carbs || 0) / Number(initialFood.calories),
          fat: Number(initialFood.fat || 0) / Number(initialFood.calories),
        }
      : null
  )

  // إن كان الطعام موجودًا في قاعدة البيانات: قيم دقيقة من الباك
  useEffect(() => {
    if (!lookupNeeded.current) return

    const timer = setTimeout(async () => {
      const name = food.name.trim()
      const grams = parseGrams(food.description)

      if (!name || !grams || touched.current.has('calories')) return

      try {
        const res = await api.post('/foods/calculate', { name, grams })
        const n = res.data.nutrition

        setFood((cur) => ({
          ...cur,
          calories: Math.round(n.calories),
          protein: touched.current.has('protein') ? cur.protein : Math.round(n.protein_g),
          carbs: touched.current.has('carbs') ? cur.carbs : Math.round(n.carbs_g),
          fat: touched.current.has('fat') ? cur.fat : Math.round(n.fat_g),
        }))
      } catch {
        // غير موجود في القاعدة: لا شيء
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [food.name, food.description])

  function updateField(event) {
    const { name, value } = event.target

    if (name === 'name' || name === 'description') {
      lookupNeeded.current = true
    }

    if (['calories', 'protein', 'carbs', 'fat'].includes(name)) {
      if (value === '') touched.current.delete(name)
      else if (name !== 'calories') touched.current.add(name)
      else touched.current.add('calories')
    }

    setFood((current) => {
      const next = { ...current, [name]: value }

      // عند تغيير السعرات: أعد حساب الماكروز التي لم يكتبها المستخدم يدويًا
      if (name === 'calories') {
        const kcal = Number(value)

        if (kcal > 0) {
          const est = estimateMacros(kcal, baseRatio.current)

          if (!touched.current.has('protein')) next.protein = est.protein
          if (!touched.current.has('carbs')) next.carbs = est.carbs
          if (!touched.current.has('fat')) next.fat = est.fat
        }
      }

      return next
    })
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