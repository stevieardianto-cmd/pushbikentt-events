import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const CLASS_INFO = {
  K1:'Siput', K2:'Pro', K3:'¾ Wheel', K4:'Campuran',
  K5:'Pro', K6:'Pemula', K7:'Pro', K8:'Boys/Girls',
  K9:'Pro', K10:'Rockie', K11:'Girls', K12:'Girls',
  K13:'Girls', K14:'Campuran', K15:'Rockie', K16:'Girls',
  K17:'Pro', K18:'Pro', K19:'FFA'
}

function Heats() {
  const [heats, setHeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState('all')

  useEffect(() => {
    fetchHeats()
    const interval = setInterval(fetchHeats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchHeats = async () => {
    const { data } = await supabase
      .from('heats')
      .select('*')
      .order('class_id')
      .order('heat_number')
      .order('lane')
    setHeats(data || [])
    setLoading(false)
  }

  const classes = [...new Set(heats.map(h => h.class_id))]

  const grouped = heats.reduce((acc, h) => {
    const key = h.class_id
    if (!acc[key]) acc[key] = {}
    if (!acc[key][h.heat_number]) acc[key][h.heat_number] = []
    acc[key][h.heat_number].push(h)
    return acc
  }, {})

  const filteredGrouped = selectedClass === 'all'
    ? grouped
    : { [selectedClass]: grouped[selectedClass] }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-3">
          HEAT DRAW <span className="text-yellow-400">/ PEMBAGIAN HEAT</span>
        </h1>
        <p className="text-gray-400">
          Pembagian heat secara acak · Randomly assigned heats
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-yellow-400 animate-pulse font-bold">
          Loading heat draws...
        </div>
      ) : heats.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎲</div>
          <h2 className="text-2xl font-black text-white mb-3">
            Belum Ada Heat Draw
          </h2>
          <p className="text-gray-400">
            Heat draw akan dilakukan oleh admin sebelum perlombaan.<br />
            Heat draws will be done by admin before the race.
          </p>
        </div>
      ) : (
        <>
          {/* Class Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button onClick={() => setSelectedClass('all')}
              className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-colors ${
                selectedClass === 'all'
                  ? 'bg-yellow-400 text-gray-900 border-yellow-400'
                  : 'border-gray-600 text-gray-400 hover:border-yellow-400'
              }`}>
              All Classes
            </button>
            {classes.map(cls => (
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

          {/* Heat Cards */}
          <div className="space-y-8">
            {Object.entries(filteredGrouped).map(([classId, heatGroups]) => (
              <div key={classId}>
                {/* Class Header */}
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-black text-white">{classId}</h2>
                  <span className="text-yellow-400 font-bold text-sm">
                    {CLASS_INFO[classId]}
                  </span>
                  <div className="flex-1 h-px bg-gray-700"></div>
                </div>

                {/* Heats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(heatGroups || {}).map(([heatNum, riders]) => (
                    <div key={heatNum}
                      className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                      <div className="bg-gray-700 px-5 py-3 flex justify-between items-center">
                        <h3 className="text-yellow-400 font-black">
                          Heat {heatNum}
                        </h3>
                        <span className="text-gray-400 text-xs font-bold">
                          {riders.length} riders
                        </span>
                      </div>
                      <div className="divide-y divide-gray-700">
                        {riders.map(rider => (
                          <div key={rider.id}
                            className="px-5 py-3 flex items-center gap-4">
                            <div className="w-8 h-8 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">
                              {rider.lane}
                            </div>
                            <p className="text-white font-bold">{rider.rider_name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="text-center mt-8">
        <button onClick={fetchHeats}
          className="border border-gray-600 text-gray-400 hover:border-yellow-400 hover:text-yellow-400 px-6 py-2 rounded-full text-sm font-bold transition-colors">
          🔄 Refresh
        </button>
      </div>
    </div>
  )
}

export default Heats