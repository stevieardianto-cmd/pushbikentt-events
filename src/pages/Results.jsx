import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const CLASS_INFO = {
  K1: 'Siput', K2: 'Open', K3: 'Open', K4: 'Open', K5: 'Open',
  K6: 'Girls Only', K7: 'Rockie', K8: '¾ Wheel', K9: 'Rockie',
  K10: 'Rockie', K11: 'Rockie', K12: 'Mix', K13: 'Mix',
  K14: 'Girls Only', K15: 'Girls Only', K16: 'Girls Only',
  K17: 'Open', K18: 'Open', K19: 'Girls Only', K20: 'FFA'
}

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' }

function Results() {
  const [results, setResults] = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState('all')

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    const [{ data: resultsData }, { data: scheduleData }] = await Promise.all([
      supabase.from('results').select('*').order('class_id').order('round').order('position'),
      supabase.from('schedule').select('*').order('order_number')
    ])
    setResults(resultsData || [])
    setSchedule(scheduleData || [])
    setLoading(false)
  }

  const racingNow = schedule.filter(s => s.status === 'racing')
  const completedClasses = [...new Set(results.map(r => r.class_id))]

  const groupedResults = results.reduce((acc, result) => {
    const key = result.class_id + '_' + result.round
    if (!acc[key]) acc[key] = { class_id: result.class_id, round: result.round, riders: [] }
    acc[key].riders.push(result)
    return acc
  }, {})

  const filtered = Object.values(groupedResults).filter(g =>
    selectedClass === 'all' || g.class_id === selectedClass
  )

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-3">
          HASIL <span className="text-yellow-400">/ RESULTS</span>
        </h1>
        <p className="text-gray-400">Live Race Results · Auto-refresh every 30 seconds</p>
      </div>

      {/* Racing Now Banner */}
      {racingNow.length > 0 && (
        <div className="bg-green-500/20 border-2 border-green-500 rounded-2xl p-5 mb-8 text-center animate-pulse">
          <p className="text-green-400 font-black text-lg">🏁 SEDANG BERLOMBA / RACING NOW</p>
          {racingNow.map(r => (
            <p key={r.id} className="text-white font-bold text-2xl mt-1">
              {r.class_id} — {CLASS_INFO[r.class_id]} · {r.round}
            </p>
          ))}
        </div>
      )}

      {/* No Results Yet */}
      {!loading && results.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏁</div>
          <h2 className="text-2xl font-black text-white mb-3">Belum Ada Hasil</h2>
          <p className="text-gray-400">
            Hasil akan ditampilkan setelah perlombaan dimulai.<br />
            Results will appear once racing begins.
          </p>
        </div>
      )}

      {/* Class Filter */}
      {completedClasses.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setSelectedClass('all')}
            className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-colors ${
              selectedClass === 'all'
                ? 'bg-yellow-400 text-gray-900 border-yellow-400'
                : 'border-gray-600 text-gray-400 hover:border-yellow-400'
            }`}>
            All Classes
          </button>
          {completedClasses.map(cls => (
            <button key={cls} onClick={() => setSelectedClass(cls)}
              className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-colors ${
                selectedClass === cls
                  ? 'bg-yellow-400 text-gray-900 border-yellow-400'
                  : 'border-gray-600 text-gray-400 hover:border-yellow-400'
              }`}>
              {cls}
            </button>
          ))}
        </div>
      )}

      {/* Results Cards */}
      <div className="space-y-6">
        {filtered.map(group => (
          <div key={group.class_id + group.round}
            className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gray-700 px-6 py-4 flex justify-between items-center">
              <div>
                <span className="text-white font-black text-xl">{group.class_id}</span>
                <span className="text-gray-400 ml-3 text-sm">
                  {CLASS_INFO[group.class_id]} · {group.round}
                </span>
              </div>
              <span className="bg-yellow-400/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full border border-yellow-400">
                {group.riders.length} riders
              </span>
            </div>

            {/* Riders */}
            <div className="divide-y divide-gray-700">
              {group.riders.map(rider => (
                <div key={rider.id}
                  className="px-6 py-4 flex items-center gap-4">
                  <div className="text-2xl w-8 text-center">
                    {MEDAL[rider.position] || `#${rider.position}`}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold">{rider.rider_name}</p>
                    {rider.notes && (
                      <p className="text-gray-500 text-xs">{rider.notes}</p>
                    )}
                  </div>
                  {rider.qualified && (
                    <span className="bg-green-500/20 text-green-400 text-xs font-black px-3 py-1 rounded-full border border-green-500">
                      ✅ QUALIFIED
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="text-center mt-8">
        <button onClick={fetchData}
          className="border border-gray-600 text-gray-400 hover:border-yellow-400 hover:text-yellow-400 px-6 py-2 rounded-full text-sm font-bold transition-colors">
          🔄 Refresh Results
        </button>
        <p className="text-gray-600 text-xs mt-2">Auto-refresh setiap 30 detik / every 30 seconds</p>
      </div>
    </div>
  )
}

export default Results