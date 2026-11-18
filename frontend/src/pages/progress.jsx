import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

function Progress() {
  // حالات تخزين بيانات التقدم والقياسات البدنية
  const [progressData, setProgressData] = useState({
    weightCurrent: 78.5,
    weightGoal: 75.0,
    bodyFat: 15.2,
    streakDays: 12,
    history: [
      { date: 'Nov 01', weight: 79.8, fat: 16.0 },
      { date: 'Nov 07', weight: 79.2, fat: 15.8 },
      { date: 'Nov 14', weight: 78.8, fat: 15.5 },
      { date: 'Nov 20', weight: 78.5, fat: 15.2 },
    ]
  })

  // حالة لفتح نافذة إضافة قياس جديد (وزن وصور دورية)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newWeight, setNewWeight] = useState('')
  const [newFat, setNewFat] = useState('')

  // دالة إضافة قياس جديد وتحديث السجل
  function handleAddProgress(e) {
    e.preventDefault()
    if (!newWeight) return

    const updatedHistory = [
      ...progressData.history,
      { date: 'Today', weight: Number(newWeight), fat: Number(newFat || 15.0) }
    ]

    setProgressData(prev => ({
      ...prev,
      weightCurrent: Number(newWeight),
      history: updatedHistory
    }))

    setNewWeight('')
    setNewFat('')
    setShowAddModal(false)
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="eyebrow">YOUR TRANSFORMATION JOURNEY</span>
            <h1>Body Progress</h1>
            <p>
              Track your weight, body metrics, and progress timeline over time.
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            + Log Progress
          </button>
        </header>

        {/* بطاقات المؤشرات الرئيسية */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          
          <div style={{ background: '#18181b', padding: '24px', borderRadius: '16px', border: '1px solid #27272a' }}>
            <span style={{ color: '#a1a1aa', fontSize: '14px' }}>Current Weight</span>
            <h2 style={{ color: '#fff', fontSize: '28px', marginTop: '8px' }}>{progressData.weightCurrent} kg</h2>
            <span style={{ color: '#10b981', fontSize: '12px' }}>-1.3 kg from start</span>
          </div>

          <div style={{ background: '#18181b', padding: '24px', borderRadius: '16px', border: '1px solid #27272a' }}>
            <span style={{ color: '#a1a1aa', fontSize: '14px' }}>Target Goal</span>
            <h2 style={{ color: '#fff', fontSize: '28px', marginTop: '8px' }}>{progressData.weightGoal} kg</h2>
            <span style={{ color: '#3b82f6', fontSize: '12px' }}>3.5 kg remaining</span>
          </div>

          <div style={{ background: '#18181b', padding: '24px', borderRadius: '16px', border: '1px solid #27272a' }}>
            <span style={{ color: '#a1a1aa', fontSize: '14px' }}>Body Fat</span>
            <h2 style={{ color: '#fff', fontSize: '28px', marginTop: '8px' }}>{progressData.bodyFat}%</h2>
            <span style={{ color: '#10b981', fontSize: '12px' }}>Optimized trend</span>
          </div>

          <div style={{ background: '#18181b', padding: '24px', borderRadius: '16px', border: '1px solid #27272a' }}>
            <span style={{ color: '#a1a1aa', fontSize: '14px' }}>Consistency Streak</span>
            <h2 style={{ color: '#fff', fontSize: '28px', marginTop: '8px' }}>{progressData.streakDays} Days</h2>
            <span style={{ color: '#f59e0b', fontSize: '12px' }}>Keep pushing! 🔥</span>
          </div>

        </div>

        {/* قسم الرسم البياني للتقدم */}
        <section style={{ background: '#18181b', padding: '24px', borderRadius: '16px', border: '1px solid #27272a', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#fff', fontSize: '20px' }}>Weight Timeline</h2>
            <span style={{ color: '#a1a1aa', fontSize: '14px' }}>Historical Records</span>
          </div>
          
          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', paddingBottom: '10px', borderBottom: '1px solid #27272a' }}>
            {progressData.history.map((item, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '8px' }}>{item.weight}kg</span>
                <div style={{ width: '100%', background: '#dc2626', height: `${(item.weight - 70) * 10}%`, borderRadius: '4px 4px 0 0', minHeight: '40px' }}></div>
                <span style={{ color: '#71717a', fontSize: '12px', marginTop: '8px' }}>{item.date}</span>
              </div>
            ))}
          </div>
        </section>

        {/* نموذج منبثق لإضافة قياس جديد */}
        {showAddModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: '#18181b', padding: '30px', borderRadius: '16px', width: '400px', border: '1px solid #27272a' }}>
              <h3 style={{ color: '#fff', marginBottom: '20px' }}>Add New Measurement</h3>
              <form onSubmit={handleAddProgress} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ color: '#a1a1aa', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Weight (kg)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={newWeight} 
                    onChange={e => setNewWeight(e.target.value)} 
                    placeholder="e.g. 78.0"
                    required
                    style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#a1a1aa', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Body Fat % (Optional)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={newFat} 
                    onChange={e => setNewFat(e.target.value)} 
                    placeholder="e.g. 15.0"
                    style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Save</button>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, background: '#27272a', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default Progress