import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const CLASS_INFO = {
  K1:'Siput', K2:'Pro', K3:'¾ Wheel', K4:'Campuran',
  K5:'Pro', K6:'Pemula', K7:'Pro', K8:'Boys/Girls',
  K9:'Pro', K10:'Rockie', K11:'Girls', K12:'Girls',
  K13:'Girls', K14:'Campuran', K15:'Rockie', K16:'Girls',
  K17:'Pro', K18:'Pro', K19:'FFA'
}

function LiveDraw() {
  const [heats, setHeats] = useState([])
  const [selectedClass, setSelectedClass] = useState('K1')
  const [selectedRound, setSelectedRound] = useState('Heat')
  const [loading, setLoading] = useState(false)
  const [drawState, setDrawState] = useState('idle') // idle | shuffling | revealing | done
  const [shufflingName, setShufflingName] = useState('')
  const [revealedRiders, setRevealedRiders] = useState([])
  const [allRiders, setAllRiders] = useState([])
  const [drawSession, setDrawSession] = useState(null)

  const CLASSES = Object.keys(CLASS_INFO)

  useEffect(() => {
    fetchLatestDraw()
    // Subscribe to real-time changes on heats table
    const channel = supabase
      .channel('heats_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'heats' }, () => {
        fetchLatestDraw()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [selectedClass, selectedRound])

  const fetchLatestDraw = async () => {
    const { data } = await supabase.from('heats').select('*')
      .eq('class_id', selectedClass)
      .eq('round', selectedRound)
      .order('heat_number').order('lane')
    setHeats(data || [])

    if (data && data.length > 0) {
      setAllRiders(data)
      setDrawState('done')
      setRevealedRiders(data)
    } else {
      setDrawState('idle')
      setRevealedRiders([])
      setAllRiders([])
    }
  }

  const startAnimation = async (riders) => {
    setDrawState('shuffling')
    setRevealedRiders([])

    const names = riders.map(r => r.rider_name)
    let count = 0
    const total = names.length * 8

    // Shuffle animation
    const shuffleInterval = setInterval(() => {
      const randomName = names[Math.floor(Math.random() * names.length)]
      setShufflingName(randomName)
      count++
      if (count >= total) {
        clearInterval(shuffleInterval)
        revealOne(riders, 0)
      }
    }, 80)
  }

  const revealOne = (riders, index) => {
    if (index >= riders.length) {
      setDrawState('done')
      return
    }
    setDrawState('revealing')
    setTimeout(() => {
      setRevealedRiders(prev => [...prev, riders[index]])
      setTimeout(() => revealOne(riders, index + 1), 600)
    }, 300)
  }

  const groupByHeat = (riders) => {
    return riders.reduce((acc, r) => {
      if (!acc[r.heat_number]) acc[r.heat_number] = []
      acc[r.heat_number].push(r)
      return acc
    }, {})
  }

  const grouped = groupByHeat(revealedRiders)
  const allGrouped = groupByHeat(heats)
  const heatNumbers = [...new Set(heats.map(h => h.heat_number))].sort((a,b) => a-b)

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 pb-16">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🎲</div>
        <h1 className="text-3xl font-black text-white mb-1">
          LIVE <span className="text-yellow-400">HEAT DRAW</span>
        </h1>
        <p className="text-gray-400 text-sm">Undian Heat Langsung / Live Random Draw</p>
      </div>

      {/* Class + Round Selector */}
      <div className="max-w-lg mx-auto mb-8">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block font-bold">Kelas / Class</label>
            <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setDrawState('idle'); setRevealedRiders([]) }}
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-3 py-3 text-white font-bold text-sm focus:outline-none focus:border-yellow-400">
              {CLASSES.map(c => <option key={c} value={c}>{c} — {CLASS_INFO[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block font-bold">Babak / Round</label>
            <select value={selectedRound} onChange={e => { setSelectedRound(e.target.value); setDrawState('idle'); setRevealedRiders([]) }}
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-3 py-3 text-white font-bold text-sm focus:outline-none focus:border-yellow-400">
              <option value="Heat">Heat</option>
              <option value="Semi Final">Semi Final</option>
              <option value="Final">Final</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shuffling Animation */}
      {drawState === 'shuffling' && (
        <div className="max-w-lg mx-auto mb-8">
          <div className="bg-gray-800 border-2 border-yellow-400 rounded-2xl p-8 text-center">
            <div className="text-yellow-400 font-black text-4xl mb-4 animate-bounce">🎲</div>
            <p className="text-gray-400 text-sm mb-3 font-bold">MENGACAK... / SHUFFLING...</p>
            <div className="bg-gray-700 rounded-xl px-6 py-4">
              <p className="text-white font-black text-2xl transition-all duration-75">
                {shufflingName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reveal Animation + Final Result */}
      {(drawState === 'revealing' || drawState === 'done') && heats.length > 0 && (
        <div className="max-w-2xl mx-auto">

          {drawState === 'done' && (
            <div className="text-center mb-6">
              <p className="text-green-400 font-black text-lg">✅ UNDIAN SELESAI / DRAW COMPLETE!</p>
              <p className="text-gray-400 text-sm mt-1">
                {selectedClass} — {selectedRound} · {heats.length} riders · {heatNumbers.length} heat(s)
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {heatNumbers.map(heatNum => (
              <div key={heatNum} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="bg-gray-700 px-5 py-3 flex justify-between items-center">
                  <h3 className="text-yellow-400 font-black">
                    {selectedRound} {heatNum}
                  </h3>
                  <span className="text-gray-400 text-xs font-bold">
                    {(grouped[heatNum] || []).length}/{(allGrouped[heatNum] || []).length} riders
                  </span>
                </div>
                <div className="divide-y divide-gray-700">
                  {(allGrouped[heatNum] || []).map((rider, idx) => {
                    const revealed = (grouped[heatNum] || []).find(r => r.rider_name === rider.rider_name)
                    return (
                      <div key={rider.id}
                        className={`px-5 py-3 flex items-center gap-3 transition-all duration-500 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="w-7 h-7 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0">
                          {idx + 1}
                        </div>
                        <p className={`font-bold transition-all duration-300 ${revealed ? 'text-white translate-x-0' : 'text-transparent -translate-x-4'}`}>
                          {rider.rider_name}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Replay Button */}
          {drawState === 'done' && heats.length > 0 && (
            <div className="text-center mt-6">
              <button onClick={() => startAnimation(heats)}
                className="border-2 border-yellow-400 text-yellow-400 font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 hover:text-gray-900 transition-colors">
                🔄 Putar Ulang Animasi / Replay Animation
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {drawState === 'idle' && heats.length === 0 && (
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-white font-bold text-lg">Belum ada undian</p>
          <p className="text-gray-400 text-sm mt-2">
            Admin perlu membuat heat draw untuk {selectedClass} {selectedRound} terlebih dahulu.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            No draw yet. Admin needs to create the heat draw first.
          </p>
        </div>
      )}

    </div>
  )
}

export default LiveDraw