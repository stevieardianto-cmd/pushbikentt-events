import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function History() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
    setEvents(data || [])
    setLoading(false)
  }

  const statusStyle = {
    upcoming:  { bg: 'bg-yellow-400/20 border-yellow-400 text-yellow-400', label: '🔜 Upcoming' },
    completed: { bg: 'bg-green-500/20 border-green-500 text-green-400',   label: '✅ Completed' },
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-3">
          RIWAYAT <span className="text-yellow-400">/ HISTORY</span>
        </h1>
        <p className="text-gray-400">Semua edisi kejuaraan · All championship editions</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-yellow-400 animate-pulse font-bold text-lg">
          Loading...
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📖</div>
          <p className="text-gray-400">Belum ada riwayat. / No history yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((event, index) => (
            <div key={event.id}
              className="bg-gray-800 rounded-2xl border border-gray-700 hover:border-yellow-400 transition-colors overflow-hidden">

              {/* Event Header */}
              <div className="bg-gray-700 px-6 py-4 flex justify-between items-center flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-yellow-400 font-black text-2xl">
                    #{events.length - index}
                  </span>
                  <div>
                    <h2 className="text-white font-black text-lg">{event.name}</h2>
                    <p className="text-gray-400 text-sm">📅 {event.date} · 📍 {event.location}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${statusStyle[event.status]?.bg || statusStyle.completed.bg}`}>
                  {statusStyle[event.status]?.label || '✅ Completed'}
                </span>
              </div>

              {/* Event Body */}
              <div className="px-6 py-5">
                {event.description && (
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {event.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-4">
                  {event.total_riders > 0 && (
                    <div className="flex items-center gap-2 bg-gray-700 rounded-xl px-4 py-2">
                      <span className="text-yellow-400 font-black">{event.total_riders}</span>
                      <span className="text-gray-400 text-sm">Total Riders</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-gray-700 rounded-xl px-4 py-2">
                    <span className="text-yellow-400 font-black">20</span>
                    <span className="text-gray-400 text-sm">Classes</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-700 rounded-xl px-4 py-2">
                    <span className="text-yellow-400 font-black">Ages 1-8</span>
                    <span className="text-gray-400 text-sm">Tahun / Years</span>
                  </div>
                </div>
              </div>

              {/* Est. Badge for first event */}
              {index === events.length - 1 && (
                <div className="px-6 pb-5">
                  <div className="bg-yellow-400/10 border border-yellow-400 rounded-xl p-3 text-center">
                    <p className="text-yellow-400 font-black text-sm">
                      🌟 EST. 2025 — Edisi Pertama / First Edition
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Timeline note */}
      <div className="text-center mt-12">
        <p className="text-gray-600 text-sm">
          Setiap tahun sejarah baru ditulis. / Every year a new history is written. 🚲
        </p>
      </div>
    </div>
  )
}

export default History