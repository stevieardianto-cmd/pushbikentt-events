import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const CLASS_INFO = {
  K1: { label: 'Siput', color: 'bg-pink-500' },
  K2: { label: 'Open', color: 'bg-blue-500' },
  K3: { label: 'Open', color: 'bg-blue-500' },
  K4: { label: 'Open', color: 'bg-blue-500' },
  K5: { label: 'Open', color: 'bg-blue-500' },
  K6: { label: 'Girls Only', color: 'bg-rose-500' },
  K7: { label: 'Rockie', color: 'bg-green-500' },
  K8: { label: '¾ Wheel', color: 'bg-purple-500' },
  K9: { label: 'Rockie', color: 'bg-green-500' },
  K10: { label: 'Rockie', color: 'bg-green-500' },
  K11: { label: 'Rockie', color: 'bg-green-500' },
  K12: { label: 'Mix', color: 'bg-orange-500' },
  K13: { label: 'Mix', color: 'bg-orange-500' },
  K14: { label: 'Girls Only', color: 'bg-rose-500' },
  K15: { label: 'Girls Only', color: 'bg-rose-500' },
  K16: { label: 'Girls Only', color: 'bg-rose-500' },
  K17: { label: 'Open', color: 'bg-blue-500' },
  K18: { label: 'Open', color: 'bg-blue-500' },
  K19: { label: 'Girls Only', color: 'bg-rose-500' },
  K20: { label: 'FFA', color: 'bg-yellow-500' },
}

function Schedule() {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchSchedule() }, [])

  const fetchSchedule = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('schedule')
      .select('*')
      .order('order_number', { ascending: true })
    setSchedule(data || [])
    setLoading(false)
  }

  const rounds = [...new Set(schedule.map(s => s.round))]
  const filtered = filter === 'all'
    ? schedule
    : schedule.filter(s => s.round === filter)

  const statusStyle = {
    upcoming: 'bg-gray-700 text-gray-300 border-gray-600',
    racing:   'bg-green-500/20 text-green-400 border-green-500 animate-pulse',
    done:     'bg-gray-800 text-gray-500 border-gray-700 opacity-60',
  }

  const statusLabel = {
    upcoming: '⏳ Upcoming',
    racing:   '🏁 RACING NOW',
    done:     '✅ Done',
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-3">
          JADWAL <span className="text-yellow-400">/ SCHEDULE</span>
        </h1>
        <p className="text-gray-400">Race Day · 15 Agustus 2025 · Kupang, NTT</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {[
          { status: 'upcoming', label: '⏳ Upcoming' },
          { status: 'racing', label: '🏁 Racing Now' },
          { status: 'done', label: '✅ Selesai / Done' },
        ].map(({ status, label }) => (
          <div key={status} className={`px-4 py-2 rounded-full text-xs font-bold border ${statusStyle[status]}`}>
            {label}
          </div>
        ))}
      </div>

      {/* Round Filter */}
      {rounds.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-colors ${
              filter === 'all'
                ? 'bg-yellow-400 text-gray-900 border-yellow-400'
                : 'border-gray-600 text-gray-400 hover:border-yellow-400'
            }`}>
            All Rounds
          </button>
          {rounds.map(round => (
            <button key={round}
              onClick={() => setFilter(round)}
              className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-colors ${
                filter === round
                  ? 'bg-yellow-400 text-gray-900 border-yellow-400'
                  : 'border-gray-600 text-gray-400 hover:border-yellow-400'
              }`}>
              {round}
            </button>
          ))}
        </div>
      )}

      {/* Schedule Table */}
      {loading ? (
        <div className="text-center py-20 text-yellow-400 animate-pulse font-bold text-lg">
          Loading schedule...
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, index) => (
            <div key={item.id}
              className={`rounded-2xl border-2 px-6 py-4 flex items-center gap-4 transition-all ${statusStyle[item.status]}`}>

              {/* Time */}
              <div className="text-center min-w-16">
                <p className="text-yellow-400 font-black text-lg">{item.scheduled_time}</p>
                <p className="text-gray-500 text-xs">WITA</p>
              </div>

              <div className="w-px h-10 bg-gray-600"></div>

              {/* Class Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-white font-black text-xl">{item.class_id}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${CLASS_INFO[item.class_id]?.color || 'bg-gray-500'}`}>
                    {CLASS_INFO[item.class_id]?.label}
                  </span>
                  <span className="text-gray-400 text-sm">{item.round}</span>
                </div>
                {item.notes && (
                  <p className="text-gray-500 text-xs mt-1">📌 {item.notes}</p>
                )}
              </div>

              {/* Status */}
              <div className="text-right">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusStyle[item.status]}`}>
                  {statusLabel[item.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh */}
      <div className="text-center mt-8">
        <button onClick={fetchSchedule}
          className="border border-gray-600 text-gray-400 hover:border-yellow-400 hover:text-yellow-400 px-6 py-2 rounded-full text-sm font-bold transition-colors">
          🔄 Refresh Schedule
        </button>
        <p className="text-gray-600 text-xs mt-2">
          Status diperbarui secara langsung / Status updated live
        </p>
      </div>
    </div>
  )
}

export default Schedule