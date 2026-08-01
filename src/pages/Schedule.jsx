import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const CLASS_INFO = {
  K1:'Siput', K2:'Pro', K3:'¾ Wheel', K4:'Campuran',
  K5:'Pro', K6:'Pemula', K7:'Pro', K8:'Boys/Girls',
  K9:'Pro', K10:'Rockie', K11:'Girls', K12:'Girls',
  K13:'Girls', K14:'Campuran', K15:'Rockie', K16:'Girls',
  K17:'Pro', K18:'Pro', K19:'FFA'
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
    const match = item.round.match(/^(Heat|Semi Final|Final) (\d+)$/)
    if (match) {
      return heats
        .filter(h => h.class_id === item.class_id && h.round === match[1] && h.heat_number === parseInt(match[2]))
        .sort((a, b) => a.lane - b.lane)
        .map(h => h.rider_name)
    }
    const names = results
      .filter(r => r.class_id === item.class_id && r.qualified)
      .map(r => r.rider_name)
    return [...new Set(names)]
  }

  const statusStyle = {
    upcoming: 'bg-gray-700 border-gray-600',
    waiting:  'bg-yellow-500/20 border-yellow-500',
    racing:   'bg-green-500/20 border-green-500 animate-pulse',
    done:     'bg-gray-800 border-gray-700 opacity-60',
  }

  const filters = ['all', 'upcoming', 'racing', 'done']
  const filtered = filter === 'all' ? schedule : schedule.filter(s => s.status === filter)
  const racingNow = schedule.filter(s => s.status === 'racing')

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 pb-24">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-3">
          JADWAL <span className="text-yellow-400">/ SCHEDULE</span>
        </h1>
        <p className="text-gray-400">Race Order · Klik untuk lihat daftar pembalap</p>
      </div>

      {/* Racing Now + Waiting Zone Banners */}
      {schedule.some(s => s.status === 'waiting') && (
        <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-2xl p-4 mb-4 text-center">
          <p className="text-yellow-400 font-black text-lg">🟡 DIPANGGIL KE ZONA TUNGGU / CALLED TO WAITING ZONE</p>
          {schedule.filter(s => s.status === 'waiting').map(s => (
            <p key={s.id} className="text-white font-bold text-xl mt-1">
              {s.class_id} — {CLASS_INFO[s.class_id]} · {s.round}
            </p>
          ))}
          <p className="text-yellow-300 text-sm mt-2 font-bold">
            ⚠️ Peserta harap segera ke zona tunggu / Riders please proceed to waiting zone
          </p>
        </div>
      )}

      {schedule.some(s => s.status === 'racing') && (
        <div className="bg-green-500/20 border-2 border-green-500 rounded-2xl p-4 mb-6 text-center">
          <p className="text-green-400 font-black text-lg animate-pulse">🏁 SEDANG BERLOMBA / RACING NOW</p>
          {schedule.filter(s => s.status === 'racing').map(s => (
            <p key={s.id} className="text-white font-bold text-xl mt-1">
              {s.class_id} — {CLASS_INFO[s.class_id]} · {s.round}
            </p>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap justify-center">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-colors capitalize ${
              filter === f ? 'bg-yellow-400 text-gray-900 border-yellow-400' : 'border-gray-600 text-gray-400 hover:border-yellow-400'
            }`}>
            {f === 'all' ? '📋 All' : f === 'upcoming' ? '⏳ Upcoming' : f === 'racing' ? '🏁 Racing' : '✅ Done'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-yellow-400 animate-pulse font-bold">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-400">Belum ada jadwal. / Schedule not available yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, index) => {
            const riders = getRidersForEntry(item)
            const isExpanded = expandedId === item.id
            const globalIndex = schedule.findIndex(s => s.id === item.id)

            return (
              <div key={item.id}
                className={`rounded-2xl border-2 overflow-hidden transition-all ${statusStyle[item.status]}`}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full px-5 py-4 flex items-center gap-4 text-left">

                  {/* Order Number */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                    item.status === 'done'    ? 'bg-gray-600 text-gray-400' :
                    item.status === 'racing'  ? 'bg-green-500 text-white' :
                    item.status === 'waiting' ? 'bg-yellow-400 text-gray-900 animate-pulse' :
                    'bg-gray-600 text-yellow-400'
                  }`}>
                    {globalIndex + 1}
                  </div>

                  {/* Class Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-black text-lg">{item.class_id}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${
                        item.round.includes('Final') && !item.round.includes('Semi') ? 'bg-yellow-500' :
                        item.round.includes('Semi') ? 'bg-orange-500' : 'bg-gray-600'
                      }`}>
                        {CLASS_INFO[item.class_id]}
                      </span>
                      <span className="text-gray-400 text-sm">{item.round}</span>
                      {riders.length > 0 && (
                        <span className="text-gray-500 text-xs">· {riders.length} riders</span>
                      )}
                    </div>
                    {item.notes && <p className="text-gray-500 text-xs mt-1">📌 {item.notes}</p>}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      item.status === 'done'    ? 'border-gray-600 text-gray-500' :
                      item.status === 'racing'  ? 'border-green-500 text-green-400 animate-pulse' :
                      item.status === 'waiting' ? 'border-yellow-500 text-yellow-400 animate-pulse' :
                      'border-gray-600 text-gray-400'
                    }`}>
                      {item.status === 'done'    ? '✅ Done' :
                       item.status === 'racing'  ? '🏁 Racing Now' :
                       item.status === 'waiting' ? '🟡 Waiting Zone' :
                       '⏳ Upcoming'}
                    </span>
                    <span className="text-gray-500 text-sm">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>

                {/* Expandable Section */}
                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-gray-600/50 pt-4">
                    {item.status === 'done' ? (
                      /* Show Results if race is done */
                      (() => {
                        const raceResults = results
                          .filter(r => r.class_id === item.class_id && r.round === item.round)
                          .sort((a, b) => a.position - b.position)
                        return raceResults.length === 0 ? (
                          <p className="text-gray-500 text-sm">Hasil belum tersedia. / Results not available yet.</p>
                        ) : (
                          <div>
                            <p className="text-yellow-400 font-black text-xs mb-3 tracking-widest">🏆 HASIL / RESULTS</p>
                            <div className="space-y-2">
                              {raceResults.map((r, i) => (
                                <div key={r.id}
                                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 ${
                                    r.position === 1 ? 'bg-yellow-400/20 border border-yellow-400' :
                                    r.position === 2 ? 'bg-gray-400/10 border border-gray-400' :
                                    r.position === 3 ? 'bg-orange-400/10 border border-orange-400' :
                                    'bg-gray-700/60 border border-gray-600'
                                  }`}>
                                  <span className="text-xl flex-shrink-0">
                                    {r.position === 1 ? '🥇' : r.position === 2 ? '🥈' : r.position === 3 ? '🥉' : `#${r.position}`}
                                  </span>
                                  <span className="text-white font-bold flex-1">{r.rider_name}</span>
                                  {r.qualified && (
                                    <span className="bg-green-500/20 border border-green-500 text-green-400 text-xs font-black px-2 py-0.5 rounded-full flex-shrink-0">
                                      ✅ LOLOS / QUALIFIED
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })()
                    ) : (
                      /* Show Rider List if race is upcoming/waiting/racing */
                      <div>
                        {item.status === 'waiting' && (
                          <p className="text-yellow-400 font-bold text-xs mb-3 animate-pulse">
                            🟡 Peserta ini sedang dipanggil ke zona tunggu!
                          </p>
                        )}
                        {item.status === 'racing' && (
                          <p className="text-green-400 font-bold text-xs mb-3 animate-pulse">
                            🏁 Sedang berlomba sekarang!
                          </p>
                        )}
                        <p className="text-gray-400 font-black text-xs mb-3 tracking-widest">👶 DAFTAR PEMBALAP / RIDERS</p>
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
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="text-center mt-8">
        <button onClick={fetchAll}
          className="border border-gray-600 text-gray-400 hover:border-yellow-400 hover:text-yellow-400 px-6 py-2 rounded-full text-sm font-bold transition-colors">
          🔄 Refresh
        </button>
        <p className="text-gray-600 text-xs mt-2">Auto-refresh setiap 15 detik</p>
      </div>

      {/* Announcement Ticker */}
      {announcement?.active && announcement?.message && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-400 text-gray-900 py-3 z-40 overflow-hidden border-t-4 border-gray-900">
          <div className="flex items-center gap-3 px-4 whitespace-nowrap animate-marquee">
            <span className="font-black flex-shrink-0">📢 PENGUMUMAN:</span>
            <span className="font-bold">{announcement.message}</span>
            <span className="font-black flex-shrink-0 ml-16">📢 PENGUMUMAN:</span>
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