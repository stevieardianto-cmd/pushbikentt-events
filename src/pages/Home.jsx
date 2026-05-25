import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Home() {
  const [timeLeft, setTimeLeft] = useState({})
  const eventDate = new Date('2025-08-15T08:00:00')

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const difference = eventDate - now
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 py-20 px-6 text-center">
        <img src="/logo.png" alt="Logo" className="h-32 w-32 object-contain mx-auto mb-6" />
        <p className="text-yellow-400 font-semibold tracking-widest text-sm mb-3">
          KUPANG · NUSA TENGGARA TIMUR
        </p>
        <h2 className="text-5xl font-black mb-3">PUSHBIKE KUPANG-NTT</h2>
        <h3 className="text-2xl font-bold text-yellow-400 mb-4">RACING CHAMPIONSHIP 2025</h3>
        <p className="text-gray-400 mb-10 text-lg">
          Kejuaraan balap push bike terbesar untuk anak-anak di NTT
        </p>

        {/* Countdown */}
        <div className="flex justify-center gap-4 mb-10">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-800 border-2 border-yellow-400 rounded-xl p-4 w-20">
              <div className="text-3xl font-black text-yellow-400">
                {String(value ?? '00').padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/register"
            className="bg-yellow-400 text-gray-900 font-black px-8 py-3 rounded-full hover:bg-yellow-300 transition-colors">
            🏁 DAFTAR SEKARANG / REGISTER NOW
          </Link>
          <Link to="/schedule"
            className="border-2 border-yellow-400 text-yellow-400 font-black px-8 py-3 rounded-full hover:bg-yellow-400 hover:text-gray-900 transition-colors">
            📅 JADWAL / SCHEDULE
          </Link>
        </div>
      </div>

      {/* Info Cards */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 text-center hover:border-yellow-400 transition-colors">
          <div className="text-4xl mb-4">📅</div>
          <h4 className="text-yellow-400 font-bold mb-2">Tanggal / Date</h4>
          <p className="text-white font-semibold">15 Agustus 2025</p>
          <p className="text-gray-400 text-sm">08:00 - 17:00 WITA</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 text-center hover:border-yellow-400 transition-colors">
          <div className="text-4xl mb-4">📍</div>
          <h4 className="text-yellow-400 font-bold mb-2">Lokasi / Location</h4>
          <p className="text-white font-semibold">Kupang, NTT</p>
          <p className="text-gray-400 text-sm">Venue TBA</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 text-center hover:border-yellow-400 transition-colors">
          <div className="text-4xl mb-4">🏆</div>
          <h4 className="text-yellow-400 font-bold mb-2">Kategori / Classes</h4>
          <p className="text-white font-semibold">20 Kelas / Classes</p>
          <p className="text-gray-400 text-sm">Usia / Ages 1-8 tahun</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-6xl mx-auto px-6 pb-16 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { to: '/classes', icon: '🏷️', label: 'Lihat Kelas', sub: 'View Classes' },
          { to: '/register', icon: '📝', label: 'Daftar', sub: 'Register' },
          { to: '/results', icon: '🏆', label: 'Hasil', sub: 'Results' },
          { to: '/history', icon: '📖', label: 'Riwayat', sub: 'History' },
        ].map(({ to, icon, label, sub }) => (
          <Link key={to} to={to}
            className="bg-gray-800 rounded-2xl p-6 text-center border border-gray-700 hover:border-yellow-400 transition-colors group">
            <div className="text-3xl mb-2">{icon}</div>
            <p className="font-bold text-white group-hover:text-yellow-400 transition-colors">{label}</p>
            <p className="text-gray-400 text-xs">{sub}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home