
function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>FIT<span>SYNC</span></h2>
        <p>YOUR FITNESS. YOUR WAY.</p>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-label">MAIN MENU</p>

        <a href="#" className="nav-item">
          <span>▦</span> Dashboard
        </a>

        <a href="#" className="nav-item">
          <span>🏋</span> Workouts
        </a>

        <a href="#" className="nav-item active">
          <span>◉</span> Nutrition
        </a>

        <a href="#" className="nav-item">
          <span>▥</span> Progress
        </a>

        <a href="#" className="nav-item">
          <span>⌖</span> Find Gyms
        </a>

        <a href="#" className="nav-item">
          <span>♙</span> Trainers
        </a>

        <p className="nav-label">ACCOUNT</p>

        <a href="#" className="nav-item">
          <span>⚙</span> Settings
        </a>
      </nav>
    </aside>
  )
}

export default Sidebar
