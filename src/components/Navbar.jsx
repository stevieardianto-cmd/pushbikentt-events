import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-gray-900 border-b-2 border-yellow-400 px-6 py-3 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Pushbike Kupang-NTT" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-yellow-400 font-black text-lg leading-tight">PUSHBIKE</h1>
            <p className="text-white font-bold text-xs leading-tight">KUPANG-NTT</p>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex gap-6 text-sm font-semibold">
          <Link to="/" className="text-gray-300 hover:text-yellow-400 transition-colors">Home</Link>
          <Link to="/classes" className="text-gray-300 hover:text-yellow-400 transition-colors">Classes</Link>
          <Link to="/register" className="text-gray-300 hover:text-yellow-400 transition-colors">Register</Link>
          <Link to="/schedule" className="text-gray-300 hover:text-yellow-400 transition-colors">Schedule</Link>
          <Link to="/results" className="text-gray-300 hover:text-yellow-400 transition-colors">Results</Link>
          <Link to="/history" className="text-gray-300 hover:text-yellow-400 transition-colors">History</Link>
        </div>

        {/* Register Button */}
        <Link to="/register"
          className="bg-yellow-400 text-gray-900 font-black px-4 py-2 rounded-full text-xs hover:bg-yellow-300 transition-colors hidden md:block">
          🏁 DAFTAR / REGISTER
        </Link>

      </div>
    </nav>
  )
}

export default Navbar