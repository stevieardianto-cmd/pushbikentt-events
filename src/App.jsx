import { useState, useEffect } from 'react'

function App() {
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
    <div className="min-h-screen bg-gray-900 text-white">

      {/* Navbar */}
      <nav className="bg-gray-800 border-b-2 border-yellow-400 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚲</span>
            <div>
              <h1 className="text-yellow-400 font-black text-xl">PUSH BIKE NTT</h1>
              <p className="text-gray-400 text-xs">Racing Championship</p>
            </div>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-semibold">
            <a href="#" className="hover:text-yellow-400 transition-colors">Home</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Register</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Schedule</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Results</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">History</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 py-20 px-6 text-center">
        <p className="text-yellow-400 font-semibold tracking-widest text-sm mb-4">
          KUPANG · NUSA TENGGARA TIMUR
        </p>
        <h2 className="text-5xl font-black mb-3">PUSH BIKE NTT</h2>
        <h3 className="text-2xl font-bold text-yellow-400 mb-6">
          TOPMER SERI I 2026
        </h3>
        <p className="text-gray-400 mb-10 text-lg">
          Kejuaraan balap push bike terbesar untuk anak-anak di NTT
        </p>

        {/* Countdown Timer */}
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

        {/* CTA Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          <button className="bg-yellow-400 text-gray-900 font-black px-8 py-3 rounded-full hover:bg-yellow-300 transition-colors text-sm">
            🏁 DAFTAR SEKARANG / REGISTER NOW
          </button>
          <button className="border-2 border-yellow-400 text-yellow-400 font-black px-8 py-3 rounded-full hover:bg-yellow-400 hover:text-gray-900 transition-colors text-sm">
            📅 LIHAT JADWAL / SCHEDULE
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 text-center hover:border-yellow-400 transition-colors">
          <div className="text-4xl mb-4">📅</div>
          <h4 className="text-yellow-400 font-bold mb-2">Tanggal / Date</h4>
          <p className="text-white font-semibold">20-21 Juni 2026</p>
          <p className="text-gray-400 text-sm">15:00 WITA - Selesai</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 text-center hover:border-yellow-400 transition-colors">
          <div className="text-4xl mb-4">📍</div>
          <h4 className="text-yellow-400 font-bold mb-2">Lokasi / Location</h4>
          <p className="text-white font-semibold">Kota Kupang, NTT</p>
          <p className="text-gray-400 text-sm">Halaman Kantor Gubernur NTT, Jl. El Tari</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 text-center hover:border-yellow-400 transition-colors">
          <div className="text-4xl mb-4">🏆</div>
          <h4 className="text-yellow-400 font-bold mb-2">Kategori / Classes</h4>
          <p className="text-white font-semibold">20 Kelas / Classes</p>
          <p className="text-gray-400 text-sm">Usia / Ages 2 - 10 tahun</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 text-center py-6 text-gray-400 text-sm">
        <p>© 2025 Push Bike NTT Racing Championship. All rights reserved.</p>
      </footer>

    </div>
  )
}

export default App