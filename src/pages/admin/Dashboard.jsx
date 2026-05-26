import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import { useAuth } from '../../context/AuthContext'

const CLASS_INFO = {
  K1:'Siput',K2:'Open',K3:'Open',K4:'Open',K5:'Open',
  K6:'Girls Only',K7:'Rockie',K8:'¾ Wheel',K9:'Rockie',
  K10:'Rockie',K11:'Rockie',K12:'Mix',K13:'Mix',
  K14:'Girls Only',K15:'Girls Only',K16:'Girls Only',
  K17:'Open',K18:'Open',K19:'Girls Only',K20:'FFA'
}

function EnterResults() {
  const [form, setForm] = useState({
    class_id:'K1', round:'Heat 1', position:'1',
    rider_name:'', qualified:false, notes:''
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => { fetchResults() }, [])

  const fetchResults = async () => {
    const { data } = await supabase
      .from('results').select('*')
      .order('class_id').order('round').order('position')
    setResults(data || [])
  }

  const handleSave = async () => {
    if (!form.rider_name) { setMessage('❌ Enter rider name!'); return }
    setSaving(true)
    const { error } = await supabase.from('results').insert({
      class_id: form.class_id,
      round: form.round,
      position: parseInt(form.position),
      rider_name: form.rider_name,
      qualified: form.qualified,
      notes: form.notes
    })
    if (error) { setMessage('❌ Error: ' + error.message) }
    else {
      setMessage('✅ Result saved!')
      setForm(p => ({ ...p, rider_name:'', notes:'', position: String(parseInt(p.position)+1) }))
      fetchResults()
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this result?')) return
    await supabase.from('results').delete().eq('id', id)
    fetchResults()
  }

  return (
    <div className="space-y-6">
      {/* Entry Form */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-yellow-400 font-black mb-4">➕ Add Result</h3>
        {message && (
          <div className={`rounded-xl p-3 mb-4 text-sm font-bold ${message.startsWith('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Class</label>
            <select value={form.class_id}
              onChange={e => setForm(p => ({...p, class_id: e.target.value}))}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400">
              {Object.keys(CLASS_INFO).map(k => (
                <option key={k} value={k}>{k} — {CLASS_INFO[k]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Round</label>
            <select value={form.round}
              onChange={e => setForm(p => ({...p, round: e.target.value}))}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400">
              {['Heat 1','Heat 2','Semi Final','Final'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Position</label>
            <input type="number" min="1" value={form.position}
              onChange={e => setForm(p => ({...p, position: e.target.value}))}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
          </div>
          <div className="md:col-span-2">
            <label className="text-gray-400 text-xs mb-1 block">Rider Name</label>
            <input type="text" value={form.rider_name} placeholder="Nama pembalap"
              onChange={e => setForm(p => ({...p, rider_name: e.target.value}))}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Notes (optional)</label>
            <input type="text" value={form.notes} placeholder="e.g. DNF"
              onChange={e => setForm(p => ({...p, notes: e.target.value}))}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.qualified}
              onChange={e => setForm(p => ({...p, qualified: e.target.checked}))}
              className="w-4 h-4 accent-yellow-400" />
            <span className="text-gray-300 text-sm font-bold">✅ Qualified to next round</span>
          </label>
          <button onClick={handleSave} disabled={saving}
            className="bg-yellow-400 text-gray-900 font-black px-6 py-2 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50 text-sm">
            {saving ? 'Saving...' : '💾 Save Result'}
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-yellow-400 font-black mb-4">📋 Saved Results ({results.length})</h3>
        {results.length === 0 ? (
          <p className="text-gray-500 text-sm">No results yet.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map(r => (
              <div key={r.id} className="bg-gray-700 rounded-xl px-4 py-3 flex justify-between items-center">
                <div>
                  <span className="text-yellow-400 font-black mr-2">{r.class_id}</span>
                  <span className="text-gray-400 text-xs mr-2">{r.round}</span>
                  <span className="text-white font-bold">#{r.position} {r.rider_name}</span>
                  {r.qualified && <span className="ml-2 text-green-400 text-xs font-bold">✅ QF</span>}
                </div>
                <button onClick={() => handleDelete(r.id)}
                  className="text-red-400 hover:text-red-300 text-xs border border-red-400 px-2 py-1 rounded-full transition-colors">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Dashboard() {
  const { adminRole, signOut } = useAuth()
  const navigate = useNavigate()
  const [registrations, setRegistrations] = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [activeTab, setActiveTab] = useState('registrations')

  useEffect(() => { fetchRegistrations(); fetchSchedule() }, [])

  const fetchRegistrations = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('registrations').select('*, children(*)')
      .order('created_at', { ascending: false })
    setRegistrations(data || [])
    setLoading(false)
  }

  const fetchSchedule = async () => {
    const { data } = await supabase
      .from('schedule').select('*')
      .order('order_number', { ascending: true })
    setSchedule(data || [])
  }

  const updateScheduleStatus = async (id, status) => {
    await supabase.from('schedule').update({ status }).eq('id', id)
    fetchSchedule()
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const allChildren = registrations.flatMap(r => r.children || [])
  const allClasses = allChildren.flatMap(c => c.classes || [])
  const classCounts = allClasses.reduce((acc, cls) => {
    acc[cls] = (acc[cls] || 0) + 1; return acc
  }, {})

  const filtered = registrations.filter(r =>
    r.parent_name.toLowerCase().includes(search.toLowerCase()) ||
    r.phone.includes(search) ||
    r.children?.some(c => c.child_name.toLowerCase().includes(search.toLowerCase()))
  )

  const tabs = [
    { id: 'registrations', label: '📋 Registrations' },
    { id: 'schedule', label: '🏁 Race Control' },
    { id: 'results', label: '🏆 Enter Results' },
    { id: 'classcounts', label: '📊 Class Counts' },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b-2 border-yellow-400 px-6 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="text-yellow-400 font-black text-sm">ADMIN PANEL</h1>
              <p className="text-gray-400 text-xs">Pushbike Kupang-NTT</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-300 text-sm hidden md:block">
              👤 {adminRole?.name}
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${adminRole?.role === 'super_admin' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-300'}`}>
                {adminRole?.role === 'super_admin' ? '⭐ Super Admin' : 'Admin'}
              </span>
            </span>
            {adminRole?.role === 'super_admin' && (
              <Link to="/admin/manage"
                className="text-xs font-bold border border-yellow-400 text-yellow-400 px-3 py-1.5 rounded-full hover:bg-yellow-400 hover:text-gray-900 transition-colors">
                👥 Manage Admins
              </Link>
            )}
            <button onClick={handleSignOut}
              className="text-xs font-bold border border-red-400 text-red-400 px-3 py-1.5 rounded-full hover:bg-red-400 hover:text-white transition-colors">
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '👨‍👩‍👧', label: 'Families', value: registrations.length },
            { icon: '🚲', label: 'Riders', value: allChildren.length },
            { icon: '🏷️', label: 'Class Entries', value: allClasses.length },
            { icon: '📊', label: 'Classes Active', value: Object.keys(classCounts).length },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-gray-800 rounded-2xl p-5 border border-gray-700 text-center">
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-2xl font-black text-yellow-400">{value}</div>
              <div className="text-gray-400 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-gray-700 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-yellow-400 text-yellow-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Class Counts Tab */}
        {activeTab === 'classcounts' && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-yellow-400 font-black mb-4">📊 Riders Per Class</h2>
            {Object.keys(classCounts).length === 0 ? (
              <p className="text-gray-500 text-sm">No registrations yet.</p>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(classCounts)
                  .sort(([a],[b]) => a.localeCompare(b, undefined, { numeric: true }))
                  .map(([cls, count]) => (
                    <div key={cls} className="bg-gray-700 rounded-xl p-3 text-center border border-gray-600">
                      <div className="text-yellow-400 font-black">{cls}</div>
                      <div className="text-white font-bold text-xl">{count}</div>
                      <div className="text-gray-400 text-xs">riders</div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Race Control Tab */}
        {activeTab === 'schedule' && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-yellow-400 font-black mb-6">🏁 Race Day Control</h2>
            <div className="space-y-3">
              {schedule.map(item => (
                <div key={item.id}
                  className="bg-gray-700 rounded-xl px-5 py-3 flex justify-between items-center border border-gray-600 flex-wrap gap-3">
                  <div>
                    <span className="text-white font-black text-lg mr-3">{item.class_id}</span>
                    <span className="text-gray-400 text-sm">{item.round} · {item.scheduled_time} WITA</span>
                  </div>
                  <div className="flex gap-2">
                    {['upcoming','racing','done'].map(status => (
                      <button key={status} onClick={() => updateScheduleStatus(item.id, status)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                          item.status === status
                            ? status === 'racing' ? 'bg-green-500 text-white border-green-500'
                              : status === 'done' ? 'bg-gray-500 text-white border-gray-500'
                              : 'bg-yellow-400 text-gray-900 border-yellow-400'
                            : 'border-gray-500 text-gray-400 hover:border-white hover:text-white'
                        }`}>
                        {status === 'upcoming' ? '⏳' : status === 'racing' ? '🏁' : '✅'} {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enter Results Tab */}
        {activeTab === 'results' && <EnterResults />}

        {/* Registrations Tab */}
        {activeTab === 'registrations' && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-yellow-400 font-black">📋 All Registrations ({registrations.length})</h2>
              <div className="flex gap-3 w-full md:w-auto">
                <input type="text" placeholder="🔍 Search name / phone..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm w-full md:w-64 transition-colors" />
                <button onClick={fetchRegistrations}
                  className="bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-gray-300 hover:border-yellow-400 transition-colors text-sm font-bold">
                  🔄
                </button>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-12 text-yellow-400 animate-pulse font-bold">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3">📭</div>
                <p>No registrations yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((reg, index) => (
                  <div key={reg.id} className="bg-gray-700 rounded-xl border border-gray-600 hover:border-yellow-400 transition-colors">
                    <button onClick={() => setExpandedId(expandedId === reg.id ? null : reg.id)}
                      className="w-full text-left px-5 py-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500 text-sm font-bold w-6">#{index+1}</span>
                        <div>
                          <p className="text-white font-bold">{reg.parent_name}</p>
                          <p className="text-gray-400 text-sm">
                            📱 {reg.phone}
                            {reg.email && <span className="ml-3">📧 {reg.email}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-yellow-400/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">
                          {reg.children?.length} anak
                        </span>
                        <span className="text-gray-400 text-xs">
                          {new Date(reg.created_at).toLocaleDateString('id-ID')}
                        </span>
                        <span className="text-gray-400">{expandedId === reg.id ? '▲' : '▼'}</span>
                      </div>
                    </button>
                    {expandedId === reg.id && (
                      <div className="px-5 pb-4 border-t border-gray-600 pt-4">
                        {reg.address && <p className="text-gray-400 text-sm mb-3">📍 {reg.address}</p>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {reg.children?.map(child => (
                            <div key={child.id} className="bg-gray-800 rounded-xl p-4 border border-gray-600">
                              <p className="text-white font-bold">🚲 {child.child_name}</p>
                              <p className="text-gray-400 text-sm mt-1">
                                {child.gender} · {new Date(child.date_of_birth).toLocaleDateString('id-ID')}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {child.classes?.map(cls => (
                                  <span key={cls} className="bg-yellow-400 text-gray-900 text-xs font-black px-2 py-0.5 rounded-full">
                                    {cls}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard