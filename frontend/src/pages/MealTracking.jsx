import { useState, useEffect } from 'react'

import Sidebar from '../components/Sidebar'
import NutritionSummary from '../components/NutritionSummary'
import MacroProgress from '../components/MacroProgress'
import HydrationTracker from '../components/HydrationTracker'
import MealSection from '../components/MealSection'
import api from '../services/api' // ملف الاتصال بالسيرفر

const initialMeals = [
  {
    name: 'Breakfast',
    icon: '🍳',
    time: '7:30 AM',
    foods: [
      { name: 'Scrambled Eggs', description: '2 large eggs', calories: 180, protein: 13, carbs: 2, fat: 14 },
      { name: 'Oatmeal', description: '60g rolled oats', calories: 230, protein: 8, carbs: 40, fat: 4 },
      { name: 'Banana', description: '1 medium banana', calories: 110, protein: 1, carbs: 27, fat: 0 },
    ],
  },
  {
    name: 'Lunch',
    icon: '🍗',
    time: '1:00 PM',
    foods: [
      { name: 'Chicken Breast', description: '200g grilled', calories: 330, protein: 62, carbs: 0, fat: 7 },
      { name: 'White Rice', description: '200g cooked', calories: 260, protein: 5, carbs: 57, fat: 1 },
    ],
  },
  {
    name: 'Dinner',
    icon: '🥗',
    time: '7:00 PM',
    foods: [
      { name: 'Grilled Chicken Salad', description: 'Chicken, vegetables and dressing', calories: 420, protein: 30, carbs: 38, fat: 15 },
    ],
  },
  {
    name: 'Snacks',
    icon: '🍎',
    time: 'Throughout the day',
    foods: [
      { name: 'Full-fat Yogurt', description: '150g serving', calories: 180, protein: 10, carbs: 20, fat: 6 },
    ],
  },
]

function MealTracking() {
  const [mealData, setMealData] = useState(() => {
    try {
      const savedMeals = localStorage.getItem('fitsync-meals')
      return savedMeals ? JSON.parse(savedMeals) : initialMeals
    } catch {
      return initialMeals
    }
  })

  // جلب البيانات من قاعدة البيانات عبر الـ API عند فتح الصفحة
  useEffect(() => {
    api.get('/meal-logs')
      .then(response => {
        if (response.data && response.data.length > 0) {
          console.log("تم استرجاع السجلات بنجاح:", response.data);
        }
      })
      .catch(error => {
        console.log("الاعتماد على التخزين المحلي مؤقتاً:", error);
      });
  }, [])

  useEffect(() => {
    localStorage.setItem('fitsync-meals', JSON.stringify(mealData))
  }, [mealData])

  // حساب المجاميع والماكروز تلقائياً لحظة بلحظة وبدقة
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

  function handleAddFood(mealName, food) {
    // التأكد من أن القيم تُحسب بشكل سليم وتلقائي لكي لا تظهر بصفر أبداً
    const formattedFood = {
      name: food.name || 'Custom Food',
      description: food.description || '',
      calories: Number(food.calories || 0),
      protein: Number(food.protein || Math.round((food.calories * 0.3) / 4) || 0),
      carbs: Number(food.carbs || Math.round((food.calories * 0.4) / 4) || 0),
      fat: Number(food.fat || Math.round((food.calories * 0.3) / 9) || 0),
    }

    setMealData((currentMeals) =>
      currentMeals.map((meal) =>
        meal.name === mealName
          ? { ...meal, foods: [...meal.foods, formattedFood] }
          : meal
      )
    )

    // إرسال البيانات المنسقة إلى جدول قاعدة البيانات عبر لارافيل
    api.post('/meal-logs', { 
      meal_name: mealName, 
      ...formattedFood
    })
      .then(res => console.log("تم حفظ السجل في قاعدة البيانات بنجاح:", res.data))
      .catch(err => console.log("خطأ في الحفظ (تأكد من تسجيل الدخول لتجنب خطأ 401):", err));
  }

  function handleEditFood(mealName, foodIndex, updatedFood) {
    setMealData((currentMeals) =>
      currentMeals.map((meal) =>
        meal.name === mealName
          ? {
              ...meal,
              foods: meal.foods.map((food, index) =>
                index === foodIndex ? updatedFood : food
              ),
            }
          : meal
      )
    )
  }

  function handleDeleteFood(mealName, foodIndex) {
    setMealData((currentMeals) =>
      currentMeals.map((meal) =>
        meal.name === mealName
          ? {
              ...meal,
              foods: meal.foods.filter((_, index) => index !== foodIndex),
            }
          : meal
      )
    )
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
            <button type="button">‹</button>
            <span>Today, November 13</span>
            <button type="button">›</button>
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