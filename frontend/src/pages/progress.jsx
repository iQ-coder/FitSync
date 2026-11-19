import { useState, useMemo } from 'react'
import Sidebar from '../components/Sidebar'

const pad = (n) => String(n).padStart(2, '0')

function getToday() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(iso) {
  return parseISO(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function daysAgo(iso) {
  return Math.floor((new Date() - parseISO(iso)) / 86400000)
}

const byDate = (a, b) => a.date.localeCompare(b.date)

const initialWeights = [
  { date: '2026-08-22', weight: 82.0 },
  { date: '2026-09-01', weight: 81.2 },
  { date: '2026-09-12', weight: 80.1 },
  { date: '2026-09-24', weight: 79.4 },
  { date: '2026-10-05', weight: 78.6 },
  { date: '2026-10-16', weight: 77.9 },
  { date: '2026-10-27', weight: 77.2 },
  { date: '2026-11-07', weight: 76.8 },
  { date: '2026-11-17', weight: 76.4 },
]

const metrics = [
  { key: 'chest', label: 'Chest', good: 'up' },
  { key: 'waist', label: 'Waist', good: 'down' },
  { key: 'hips', label: 'Hips', good: 'down' },
  { key: 'arm', label: 'Arm', good: 'up' },
  { key: 'thigh', label: 'Thigh', good: 'up' },
]

const initialMeasurements = [
  { date: '2026-08-22', chest: 100, waist: 92, hips: 100, arm: 33, thigh: 58 },
  { date: '2026-11-17', chest: 101, waist: 86, hips: 97, arm: 34.5, thigh: 57.5 },
]

const initialPhotos = [
  { id: 1, date: '2026-08-22', label: 'Start', url: null },
  { id: 2, date: '2026-10-05', label: 'Week 6', url: null },
  { id: 3, date: '2026-11-17', label: 'Latest', url: null },
]

const emptyMeasureForm = { chest: '', waist: '', hips: '', arm: '', thigh: '' }

function WeightChart({ entries, goal }) {
  const W = 600
  const H = 240
  const padL = 44
  const padR = 16
  const padT = 16
  const padB = 28

  if (entries.length < 2) {
    return <p className="pg-empty">Add at least two entries to see the chart.</p>
  }

  const values = entries.map((e) => e.weight)
  const all = goal > 0 ? [...values, goal] : values
  const min = Math.floor(Math.min(...all) - 1)
  const max = Math.ceil(Math.max(...all) + 1)

  const x = (i) => padL + (i / (entries.length - 1)) * (W - padL - padR)
  const y = (v) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB)

  const line = entries.map((e, i) => `${x(i)},${y(e.weight)}`).join(' ')
  const area = `${x(0)},${H - padB} ${line} ${x(entries.length - 1)},${H - padB}`
  const ticks = Array.from({ length: 5 }, (_, i) => min + ((max - min) * i) / 4)
  const labelIdx = [0, Math.floor((entries.length - 1) / 2), entries.length - 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Weight chart">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="#2a2a31" strokeWidth="1" />
          <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#8b8b95">
            {t.toFixed(0)}
          </text>
        </g>
      ))}

      {goal > 0 && (
        <g>
          <line
            x1={padL}
            x2={W - padR}
            y1={y(goal)}
            y2={y(goal)}
            stroke="#22c55e"
            strokeWidth="1.5"
            strokeDasharray="6 5"
          />
          <text x={W - padR} y={y(goal) - 6} textAnchor="end" fontSize="11" fill="#22c55e">
            Goal {goal} kg
          </text>
        </g>
      )}

      <polygon points={area} fill="#e11d2e" opacity="0.12" />
      <polyline
        points={line}
        fill="none"
        stroke="#e11d2e"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {entries.map((e, i) => (
        <circle key={e.date} cx={x(i)} cy={y(e.weight)} r="4" fill="#17171c" stroke="#e11d2e" strokeWidth="2.5" />
      ))}

      {labelIdx.map((i) => (
        <text
          key={i}
          x={x(i)}
          y={H - 8}
          textAnchor={i === 0 ? 'start' : i === entries.length - 1 ? 'end' : 'middle'}
          fontSize="11"
          fill="#8b8b95"
        >
          {formatDate(entries[i].date)}
        </text>
      ))}
    </svg>
  )
}

export default function Progress() {
  const [weights, setWeights] = useState(initialWeights)
  const [goal, setGoal] = useState(72)
  const [goalInput, setGoalInput] = useState('72')
  const [range, setRange] = useState('all')
  const [newWeight, setNewWeight] = useState('')
  const [newDate, setNewDate] = useState(getToday())
  const [measurements, setMeasurements] = useState(initialMeasurements)
  const [measureForm, setMeasureForm] = useState(emptyMeasureForm)
  const [photos, setPhotos] = useState(initialPhotos)

  const sorted = useMemo(() => [...weights].sort(byDate), [weights])

  const chartEntries = useMemo(
    () => (range === 'all' ? sorted : sorted.filter((e) => daysAgo(e.date) <= range)),
    [sorted, range]
  )

  const start = sorted[0]?.weight ?? 0
  const current = sorted[sorted.length - 1]?.weight ?? 0
  const change = current - start
  const toGo = current - goal
  const wantsLoss = goal <= start
  const changeIsGood = wantsLoss ? change <= 0 : change >= 0
  const percent =
    start === goal
      ? 100
      : Math.max(0, Math.min(100, ((start - current) / (start - goal)) * 100))

  const firstM = measurements[0]
  const lastM = measurements[measurements.length - 1]
  const waistChange = lastM.waist - firstM.waist

  function handleAddWeight(event) {
    event.preventDefault()
    const w = Number(newWeight)
    if (!w || w <= 0 || !newDate) return

    setWeights((cur) =>
      [...cur.filter((x) => x.date !== newDate), { date: newDate, weight: Number(w.toFixed(1)) }].sort(byDate)
    )
    setNewWeight('')
  }

  function handleDeleteWeight(date) {
    setWeights((cur) => cur.filter((x) => x.date !== date))
  }

  function handleSaveGoal(event) {
    event.preventDefault()
    const g = Number(goalInput)
    if (g > 0) setGoal(g)
  }

  function handleAddMeasurement(event) {
    event.preventDefault()

    const entry = { date: getToday() }
    let any = false

    metrics.forEach((m) => {
      const v = Number(measureForm[m.key])
      if (v > 0) {
        entry[m.key] = v
        any = true
      } else {
        entry[m.key] = lastM[m.key]
      }
    })

    if (!any) return

    setMeasurements((cur) => [...cur.filter((x) => x.date !== entry.date), entry].sort(byDate))
    setMeasureForm(emptyMeasureForm)
  }

  function handlePhoto(event) {
    const file = event.target.files[0]
    if (!file) return

    setPhotos((cur) => [
      ...cur,
      {
        id: Date.now(),
        date: getToday(),
        label: `Photo ${cur.length + 1}`,
        url: URL.createObjectURL(file),
      },
    ])
    event.target.value = ''
  }

  function handleDeletePhoto(photo) {
    if (photo.url) URL.revokeObjectURL(photo.url)
    setPhotos((cur) => cur.filter((p) => p.id !== photo.id))
  }

  const toneClass = (good, diff) => (diff === 0 ? 'pg-neutral' : good ? 'pg-good' : 'pg-bad')
  const sign = (n) => (n > 0 ? `+${n.toFixed(1)}` : n.toFixed(1))

  return (
    <div className="app-layout">
      <style>{css}</style>

      <Sidebar />

      <main className="main-content">
        <header className="page-header">
          <div>
            <span className="eyebrow">YOUR TRANSFORMATION JOURNEY</span>
            <h1>Progress</h1>
            <p>Monitor your weight, body measurements, and progress photos over time.</p>
          </div>
        </header>

        {/* Summary */}
        <section className="pg-stats">
          <div className="pg-card">
            <div className="pg-label">Current weight</div>
            <div className="pg-value">
              {current} <small>kg</small>
            </div>
            <div className={toneClass(changeIsGood, change)}>
              {sign(change)} kg since start
            </div>
          </div>

          <div className="pg-card">
            <div className="pg-label">Goal weight</div>
            <div className="pg-value">
              {goal} <small>kg</small>
            </div>
            <div className="pg-neutral">{Math.abs(toGo).toFixed(1)} kg to go</div>
          </div>

          <div className="pg-card">
            <div className="pg-label">Goal progress</div>
            <div className="pg-value">{Math.round(percent)}%</div>
            <div className="pg-bar">
              <div className="pg-bar-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>

          <div className="pg-card">
            <div className="pg-label">Waist</div>
            <div className="pg-value">
              {lastM.waist} <small>cm</small>
            </div>
            <div className={toneClass(waistChange <= 0, waistChange)}>
              {sign(waistChange)} cm since start
            </div>
          </div>
        </section>

        {/* Weight */}
        <section className="pg-section">
          <div className="pg-heading">
            <h2>Weight Tracking</h2>

            <div className="pg-tabs">
              {[
                { label: '30 days', value: 30 },
                { label: '90 days', value: 90 },
                { label: 'All', value: 'all' },
              ].map((t) => (
                <button
                  key={t.label}
                  type="button"
                  className={range === t.value ? 'active' : ''}
                  onClick={() => setRange(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pg-two">
            <div className="pg-card">
              <WeightChart entries={chartEntries} goal={goal} />
            </div>

            <div className="pg-card">
              <form className="pg-form" onSubmit={handleAddWeight}>
                <label>
                  Date
                  <input
                    type="date"
                    value={newDate}
                    max={getToday()}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </label>
                <label>
                  Weight (kg)
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    placeholder="e.g. 76.0"
                  />
                </label>
                <button type="submit" className="pg-btn">Add</button>
              </form>

              <form className="pg-form pg-goal-form" onSubmit={handleSaveGoal}>
                <label>
                  Goal (kg)
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                  />
                </label>
                <button type="submit" className="pg-btn pg-btn-ghost">Save goal</button>
              </form>

              <div className="pg-log">
                {[...sorted].reverse().map((entry, idx, arr) => {
                  const prev = arr[idx + 1]
                  const diff = prev ? entry.weight - prev.weight : null

                  return (
                    <div className="pg-log-row" key={entry.date}>
                      <span className="pg-log-date">{formatDate(entry.date)}</span>
                      <strong>{entry.weight} kg</strong>
                      <span
                        className={
                          diff === null ? 'pg-neutral' : toneClass(wantsLoss ? diff <= 0 : diff >= 0, diff)
                        }
                      >
                        {diff === null ? '—' : sign(diff)}
                      </span>
                      <button
                        type="button"
                        className="pg-del"
                        onClick={() => handleDeleteWeight(entry.date)}
                        aria-label="Delete entry"
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Measurements */}
        <section className="pg-section">
          <div className="pg-heading">
            <h2>Body Measurements</h2>
            <span>Last updated {formatDate(lastM.date)}</span>
          </div>

          <div className="pg-two">
            <div className="pg-card">
              <table className="pg-table">
                <thead>
                  <tr>
                    <th>Measurement</th>
                    <th>Start</th>
                    <th>Current</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m) => {
                    const diff = lastM[m.key] - firstM[m.key]
                    const good = m.good === 'down' ? diff <= 0 : diff >= 0

                    return (
                      <tr key={m.key}>
                        <td>{m.label}</td>
                        <td>{firstM[m.key]} cm</td>
                        <td><strong>{lastM[m.key]} cm</strong></td>
                        <td className={toneClass(good, diff)}>{sign(diff)} cm</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="pg-card">
              <form className="pg-form pg-measure-form" onSubmit={handleAddMeasurement}>
                {metrics.map((m) => (
                  <label key={m.key}>
                    {m.label} (cm)
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={measureForm[m.key]}
                      placeholder={String(lastM[m.key])}
                      onChange={(e) =>
                        setMeasureForm((cur) => ({ ...cur, [m.key]: e.target.value }))
                      }
                    />
                  </label>
                ))}
                <button type="submit" className="pg-btn">Save measurements</button>
              </form>
            </div>
          </div>
        </section>

        {/* Photos */}
        <section className="pg-section">
          <div className="pg-heading">
            <h2>Progress Photos</h2>

            <label className="pg-btn pg-upload">
              + Add photo
              <input type="file" accept="image/*" onChange={handlePhoto} hidden />
            </label>
          </div>

          <div className="pg-photos">
            {[...photos].sort(byDate).map((photo) => (
              <div className="pg-photo" key={photo.id}>
                <div className="pg-photo-frame">
                  {photo.url ? (
                    <img src={photo.url} alt={photo.label} />
                  ) : (
                    <div className="pg-photo-empty">📷</div>
                  )}

                  <button
                    type="button"
                    className="pg-del pg-photo-del"
                    onClick={() => handleDeletePhoto(photo)}
                    aria-label="Delete photo"
                  >
                    ×
                  </button>
                </div>

                <div className="pg-photo-meta">
                  <strong>{photo.label}</strong>
                  <span>{formatDate(photo.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

const css = `
.pg-card { background:#17171c; border:1px solid #2a2a31; border-radius:16px; padding:22px; }
.pg-stats { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:32px; }
.pg-label { font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:#8b8b95; font-weight:700; }
.pg-value { font-size:34px; font-weight:800; color:#fff; margin:8px 0 6px; }
.pg-value small { font-size:15px; font-weight:500; color:#8b8b95; }
.pg-good { color:#22c55e; }
.pg-bad { color:#ef4444; }
.pg-neutral { color:#8b8b95; }
.pg-bar { height:8px; background:#2a2a31; border-radius:999px; overflow:hidden; margin-top:14px; }
.pg-bar-fill { height:100%; background:#e11d2e; border-radius:999px; transition:width .3s; }
.pg-section { margin-bottom:36px; }
.pg-heading { display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:14px; }
.pg-heading h2 { margin:0; font-size:22px; color:#fff; }
.pg-heading > span { color:#8b8b95; font-size:14px; }
.pg-two { display:grid; grid-template-columns:3fr 2fr; gap:16px; }
@media (max-width: 1100px) { .pg-two { grid-template-columns:1fr; } }
.pg-tabs { display:flex; gap:6px; }
.pg-tabs button { background:#17171c; color:#b5b5be; border:1px solid #2a2a31; border-radius:10px; padding:8px 14px; cursor:pointer; font-weight:600; }
.pg-tabs button.active { background:#2a1317; color:#ff4d5e; border-color:#5a1d25; }
.pg-form { display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end; }
.pg-form label { display:flex; flex-direction:column; gap:6px; font-size:13px; color:#b5b5be; font-weight:600; }
.pg-form input { background:#0f0f12; border:1px solid #2a2a31; border-radius:10px; padding:10px 12px; color:#fff; font-size:14px; width:130px; }
.pg-form input:focus { outline:none; border-color:#e11d2e; }
.pg-goal-form { margin-top:14px; padding-bottom:16px; border-bottom:1px solid #2a2a31; }
.pg-measure-form input { width:110px; }
.pg-btn { background:#e11d2e; color:#fff; border:none; border-radius:10px; padding:11px 18px; font-weight:700; cursor:pointer; font-size:14px; }
.pg-btn:hover { background:#c91626; }
.pg-btn-ghost { background:#2a1317; color:#ff4d5e; border:1px solid #5a1d25; }
.pg-btn-ghost:hover { background:#3a1a1f; }
.pg-upload { display:inline-block; }
.pg-log { margin-top:12px; max-height:230px; overflow-y:auto; }
.pg-log-row { display:grid; grid-template-columns:1fr 1fr 60px 28px; align-items:center; gap:8px; padding:10px 0; border-bottom:1px solid #22222a; color:#fff; font-size:14px; }
.pg-log-date { color:#b5b5be; }
.pg-del { background:transparent; color:#8b8b95; border:none; font-size:20px; cursor:pointer; line-height:1; }
.pg-del:hover { color:#ef4444; }
.pg-empty { color:#8b8b95; margin:0; }
.pg-table { width:100%; border-collapse:collapse; color:#fff; }
.pg-table th { text-align:left; font-size:12px; letter-spacing:.1em; text-transform:uppercase; color:#8b8b95; padding:0 0 12px; }
.pg-table td { padding:14px 0; border-top:1px solid #22222a; }
.pg-photos { display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:16px; }
.pg-photo { background:#17171c; border:1px solid #2a2a31; border-radius:16px; overflow:hidden; }
.pg-photo-frame { position:relative; aspect-ratio:3 / 4; background:#0f0f12; }
.pg-photo-frame img { width:100%; height:100%; object-fit:cover; display:block; }
.pg-photo-empty { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:42px; background:linear-gradient(160deg, #1d1d24, #101014); }
.pg-photo-del { position:absolute; top:8px; right:8px; background:rgba(0,0,0,.6); border-radius:8px; width:28px; height:28px; color:#fff; }
.pg-photo-meta { display:flex; justify-content:space-between; padding:12px 14px; color:#fff; font-size:14px; }
.pg-photo-meta span { color:#8b8b95; }
`