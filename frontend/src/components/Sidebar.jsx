function Sidebar() {
  const currentPath = window.location.hash || '#nutrition'

  // دالة لمنع الروابط الفارغة من إعادة توجيه الصفحة أو رفعها للأعلى
  function handleDisabledClick(e) {
    e.preventDefault()
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>FIT<span>SYNC</span></h2>
        <p>YOUR FITNESS. YOUR WAY.</p>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-label">MAIN MENU</p>

        <a href="#" onClick={handleDisabledClick} className="nav-item" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
          <span>▦</span> Dashboard
        </a>

        <a href="#" onClick={handleDisabledClick} className="nav-item" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
          <span>🏋</span> Workouts
        </a>

        <a href="#nutrition" className={`nav-item ${currentPath === '#nutrition' ? 'active' : ''}`}>
          <span>◉</span> Nutrition
        </a>

        <a href="#progress" className={`nav-item ${currentPath === '#progress' ? 'active' : ''}`}>
          <span>▥</span> Progress
        </a>

        <a href="#" onClick={handleDisabledClick} className="nav-item" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
          <span>⌖</span> Find Gyms
        </a>

        <a href="#" onClick={handleDisabledClick} className="nav-item" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
          <span>♙</span> Trainers
        </a>

        <p className="nav-label">ACCOUNT</p>

        <a href="#" onClick={handleDisabledClick} className="nav-item" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
          <span>⚙</span> Settings
        </a>
      </nav>
    </aside>
  )
}

export default Sidebar