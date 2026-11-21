import { useState, useEffect } from 'react'
import api from '../services/api'

import Sidebar from '../components/Sidebar'
import NutritionSummary from '../components/NutritionSummary'
import MacroProgress from '../components/MacroProgress'
import HydrationTracker from '../components/HydrationTracker'
import MealSection from '../components/MealSection'

const mealTemplates = [
  { name: 'Breakfast', icon: '🍳', time: '7:30 AM', type: 'breakfast' },
  { name: 'Lunch', icon: '🍗', time: '1:00 PM', type: 'lunch' },
  { name: 'Dinner', icon: '🥗', time: '7:00 PM', type: 'dinner' },
  { name: 'Snacks', icon: '🍎', time: 'Throughout the day', type: 'snack' },
]

const pad = (n) => String(n).padStart(2, '0')

function getToday() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function shiftDate(iso, days) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d + days)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatHeaderDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const label = new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })

  return iso === getToday() ? `Today, ${label}` : label
}
// الصيغة التي يطلبها الباك: 2026-11-19T03:10:00+03:00
function nowWithOffset() {
  const d = new Date(Date.now() - 60000)
  const offset = -d.getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const abs = Math.abs(offset)
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  )
}
function consumedAtFor(dateISO) {
  if (dateISO === getToday()) return nowWithOffset()

  const d = new Date()
  const offset = -d.getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const abs = Math.abs(offset)

  return `${dateISO}T12:00:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
}
function normalizeLog(log) {
  return {
    id: log.meal_log_id,
    name: log.name,
    description: log.serving || `${Number(log.grams)}g`,
    calories: Number(log.calories || 0),
    protein: Number(log.protein_g || 0),
    carbs: Number(log.carbs_g || 0),
    fat: Number(log.fat_g || 0),
    type: log.meal_type,
  }
}

function buildMeals(logs) {
  const normalized = logs.map(normalizeLog)
  return mealTemplates.map(({ type, ...template }) => ({
    ...template,
    foods: normalized.filter((item) => item.type === type),
  }))
}

function MealTracking() {
  const [mealData, setMealData] = useState(buildMeals([]))
  const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(getToday())
  const today = selectedDate
    useEffect(() => {
    fetchMealsFromBackend()
  }, [selectedDate])

  const fetchMealsFromBackend = async () => {
    try {
      const response = await api.get('/meal-logs', { params: { date: today } })
      setMealData(buildMeals(response.data.data || []))
    } catch (error) {
      console.error('Error fetching meals from backend:', error.response?.data || error)
    } finally {
      setLoading(false)
    }
  }

  const dailyTotals = mealData.reduce(
    (daily, meal) => {
      const mealTotals = meal.foods.reduce(
        (totals, food) => ({
          calories: totals.calories + Number(food.calories || 0),
          protein: totals.protein + Number(food.protein || 0),
          carbs: totals.carbs + Number(food.carbs || 0),
          fat: totals.fat + Number(food.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      )

      return {
        calories: daily.calories + mealTotals.calories,
        protein: daily.protein + mealTotals.protein,
        carbs: daily.carbs + mealTotals.carbs,
        fat: daily.fat + mealTotals.fat,
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const typeOf = (mealName) =>
    mealTemplates.find((m) => m.name === mealName)?.type

  // الواجهة ترسل الاسم والحجم فقط؛ الباك يحسب السعرات والماكروز.
  // الأخطاء تُرمى للمودال ليعرضها للمستخدم.
  async function handleAddFood(mealName, food) {
    await api.post('/meal-logs', {
      name: food.name,
      serving: food.serving,
      meal_type: typeOf(mealName),
      consumed_at: consumedAtFor(selectedDate),
    })

    await fetchMealsFromBackend()
  }

  async function handleEditFood(mealName, foodIndex, updatedFood) {
    const current = mealData.find((m) => m.name === mealName)?.foods[foodIndex]
    if (!current) return

    await api.patch(`/meal-logs/${current.id}`, {
      name: updatedFood.name,
      serving: updatedFood.serving,
      meal_type: typeOf(mealName),
    })

    await fetchMealsFromBackend()
  }

  async function handleDeleteFood(mealName, foodIndex) {
    const current = mealData.find((m) => m.name === mealName)?.foods[foodIndex]
    if (!current) return

    try {
      await api.delete(`/meal-logs/${current.id}`)
      await fetchMealsFromBackend()
    } catch (error) {
      console.error('Error deleting food:', error.response?.data || error)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <header className="page-header">
          <div>
            <span className="eyebrow">YOUR HEALTH, YOUR CONTROL</span>
            <h1>Nutrition</h1>
            <p>
              Track your meals, monitor your macros, and reach your goals.
            </p>
          </div>

                    <div className="date-navigation">
            <button type="button" onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}>‹</button>
            <span>{formatHeaderDate(selectedDate)}</span>
            <button
              type="button"
              onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
              disabled={selectedDate >= getToday()}
            >
              ›
            </button>
          </div>
          
        </header>

        <NutritionSummary calories={dailyTotals.calories} />

        <MacroProgress totals={dailyTotals} />

        <HydrationTracker />

        <section className="meals-section">
          <div className="section-heading">
            <h2>Today's Meals</h2>
            <span>Food diary</span>
          </div>

          <div className="meals-list">
            {mealData.map((meal) => (
              <MealSection
                key={meal.name}
                meal={meal}
                onAddFood={handleAddFood}
                onEditFood={handleEditFood}
                onDeleteFood={handleDeleteFood}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default MealTracking