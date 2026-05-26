import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Mohon isi email dan password.')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) {
      setError('Email atau password salah. / Wrong email or password.')
      setLoading(false)
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Logo" className="h-20 w-20 object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white">ADMIN PANEL</h1>
          <p className="text-yellow-400 font-bold">Pushbike Kupang-NTT</p>
        </div>

        {/* Form */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <h2 className="text-white font-black text-lg mb-6">🔐 Login Admin</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-xl p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@email.com"
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="text-gray-400 text-sm mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-yellow-400 text-gray-900 font-black py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50">
            {loading ? '⏳ Loading...' : '🔐 LOGIN'}
          </button>
        </div>

        <p className="text-gray-600 text-xs text-center mt-4">
          Akses terbatas untuk admin resmi saja.<br />
          Restricted access for authorized admins only.
        </p>
      </div>
    </div>
  )
}

export default Login