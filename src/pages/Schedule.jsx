import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const CLASS_INFO = {
  K1:'Siput',K2:'Open',K3:'Open',K4:'Open',K5:'Open',
  K6:'Girls Only',K7:'Rockie',K8:'¾ Wheel',K9:'Rockie',
  K10:'Rockie',K11:'Rockie',K12:'Mix',K13:'Mix',
  K14:'Girls Only',K15:'Girls Only',K16:'Girls Only',
  K17:'Open',K18:'Open',K19:'Girls Only',K20:'FFA'
}

function Schedule() {
  const [schedule, setSchedule] = useState([])
  const [heats, setHeats] = useState([])
  const [results, setResults] = useState([])
  const [announcement, setAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchAll = async () => {
    const [{ data: sched }, { data: heatData }, { data: resultData }, { data: ann }] = await Promise.all([
      supabase.from('schedule').select('*').order('order_number'),
      supabase.from('heats').select('*').order('lane'),
      supabase.from('results').select('*'),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(1)
    ])
    setSchedule(sched || [])
    setHeats(heatData || [])
    setResults(resultData || [])
    setAnnouncement(ann?.[0] || null)
    setLoading(false)
  }

  const getRidersForEntry = (item) => {
    const heatMatch = item.round.match(/^Heat (\d+)$/)
    if (heatMatch) {
      return heats
        .filter(h => h.class_id === item.class_id && h.heat_number === parseInt(heatMatch[1]))
        .sort((a, b) => a.lane - b.lane)
        .map(h => h.rider_name)
    }
    // Semi Final / Final — show qualified riders from prior rounds
    const names = results
      .filter(r => r.class_id === item.class_id && r.qualified)
      .map(r => r.rider_name)
    return [...new Set(names)]
  }

  const rounds = [...new Set(schedule.map(s => s.round))]
  const filtered = filter === 'all' ? schedule : schedule.filter(s => s.round === filter)

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
    <div className="max-w-4xl mx-auto px-6 py-12 pb-24">

      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-3">
          JADWAL <span className="text-yellow-400">/ SCHEDULE</span>
        </h1>
        <p className="text-gray-400">Race Day Schedule · Klik untuk lihat daftar pembalap</p>
      </div>

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

      {rounds.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-colors ${filter === 'all' ? 'bg-yellow-400 text-gray-900 border-yellow-400' : 'border-gray-600 text-gray-400 hover:border-yellow-400'}`}>
            All Rounds
          </button>
          {rounds.map(round => (
            <button key={round} onClick={() => setFilter(round)}
              className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-colors ${filter === round ? 'bg-yellow-400 text-gray-900 border-yellow-400' : 'border-gray-600 text-gray-400 hover:border-yellow-400'}`}>
              {round}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-yellow-400 animate-pulse font-bold text-lg">Loading schedule...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-400">Belum ada jadwal. / Schedule not available yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const riders = getRidersForEntry(item)
            const isExpanded = expandedId === item.id
            return (
              <div key={item.id}
                className={`rounded-2xl border-2 transition-all overflow-hidden ${statusStyle[item.status]}`}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full px-6 py-4 flex items-center gap-4 text-left">
                  <div className="text-center min-w-16">
                    <p className="text-yellow-400 font-black text-lg">{item.scheduled_time}</p>
                    <p className="text-gray-500 text-xs">WITA</p>
                  </div>
                  <div className="w-px h-10 bg-gray-600"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-white font-black text-xl">{item.class_id}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${
                        item.round === 'Final' ? 'bg-yellow-500' : item.round === 'Semi Final' ? 'bg-orange-500' : 'bg-gray-600'
                      }`}>
                        {CLASS_INFO[item.class_id]}
                      </span>
                      <span className="text-gray-400 text-sm">{item.round}</span>
                      {riders.length > 0 && (
                        <span className="text-gray-500 text-xs">({riders.length} riders)</span>
                      )}
                    </div>
                    {item.notes && <p className="text-gray-500 text-xs mt-1">📌 {item.notes}</p>}
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusStyle[item.status]}`}>
                    {statusLabel[item.status]}
                  </span>
                  <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-4 border-t border-gray-600/50 pt-3">
                    {riders.length === 0 ? (
                      <p className="text-gray-500 text-sm">Daftar pembalap belum tersedia. / Rider list not available yet.</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {riders.map((name, i) => (
                          <div key={i} className="bg-gray-800/60 rounded-lg px-3 py-2 flex items-center gap-2">
                            <span className="w-5 h-5 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-white text-sm font-bold truncate">{name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="text-center mt-8">
        <button onClick={fetchAll}
          className="border border-gray-600 text-gray-400 hover:border-yellow-400 hover:text-yellow-400 px-6 py-2 rounded-full text-sm font-bold transition-colors">
          🔄 Refresh Schedule
        </button>
        <p className="text-gray-600 text-xs mt-2">Status diperbarui otomatis setiap 15 detik</p>
      </div>

      {/* Announcement Ticker */}
      {announcement?.active && announcement?.message && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-400 text-gray-900 py-3 z-40 overflow-hidden border-t-4 border-gray-900">
          <div className="flex items-center gap-3 px-4 whitespace-nowrap animate-marquee">
            <span className="font-black flex-shrink-0">📢 PENGUMUMAN / ANNOUNCEMENT:</span>
            <span className="font-bold">{announcement.message}</span>
            <span className="font-black flex-shrink-0 ml-12">📢 PENGUMUMAN / ANNOUNCEMENT:</span>
            <span className="font-bold">{announcement.message}</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default Schedule