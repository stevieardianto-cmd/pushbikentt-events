import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { to: '/',         label: '🏠 Home' },
  { to: '/classes',  label: '🏷️ Classes' },
  { to: '/register', label: '📝 Register' },
  { to: '/schedule', label: '📅 Schedule' },
  { to: '/heats',    label: '🎲 Heat Draw' },
  { to: '/results',  label: '🏆 Results' },
  { to: '/gallery',  label: '📸 Gallery' },
  { to: '/history',  label: '📖 History' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <nav className="bg-gray-900 border-b-2 border-yellow-400 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          <img src="/logo.png" alt="Pushbike Kupang-NTT" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-yellow-400 font-black text-lg leading-tight">PUSHBIKE</h1>
            <p className="text-white font-bold text-xs leading-tight">KUPANG-NTT</p>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 text-sm font-semibold">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to}
              className={`transition-colors ${isActive(to) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}>
              {label.split(' ')[1]}
            </Link>
          ))}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
           <Link to="/admin"
            className="border border-gray-600 text-gray-400 font-bold px-4 py-2 rounded-full text-xs hover:border-yellow-400 hover:text-yellow-400 transition-colors">
            🔐 Admin
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-700 transition-colors">
          <span className={`block w-6 h-0.5 bg-yellow-400 transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-yellow-400 transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-yellow-400 transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="bg-gray-800 border-t border-gray-700 px-6 py-4 space-y-1">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                isActive(to)
                  ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}>
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-700">
            <Link to="/register"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 font-black px-4 py-3 rounded-xl text-sm hover:bg-yellow-300 transition-colors">
              🏁 DAFTAR SEKARANG / REGISTER NOW
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar