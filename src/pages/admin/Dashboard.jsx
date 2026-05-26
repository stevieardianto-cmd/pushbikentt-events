import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import { useAuth } from '../../context/AuthContext'

function Dashboard() {
  const { adminRole, signOut } = useAuth()
  const navigate = useNavigate()
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => { fetchRegistrations() }, [])

  const fetchRegistrations = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('registrations')
      .select(`*, children(*)`)
      .order('created_at', { ascending: false })
    if (!error) setRegistrations(data || [])
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const allChildren = registrations.flatMap(r => r.children || [])
  const allClasses = allChildren.flatMap(c => c.classes || [])
  const classCounts = allClasses.reduce((acc, cls) => {
    acc[cls] = (acc[cls] || 0) + 1
    return acc
  }, {})

  const filtered = registrations.filter(r =>
    r.parent_name.toLowerCase().includes(search.toLowerCase()) ||
    r.phone.includes(search) ||
    r.children?.some(c => c.child_name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Admin Navbar */}
      <nav className="bg-gray-900 border-b-2 border-yellow-400 px-6 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="text-yellow-400 font-black text-sm">ADMIN PANEL</h1>
              <p className="text-gray-400 text-xs">Pushbike Kupang-NTT</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 text-sm hidden md:block">
              👤 {adminRole?.name}
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${
                adminRole?.role === 'super_admin'
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-gray-700 text-gray-300'
              }`}>
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
            { icon: '👨‍👩‍👧', label: 'Total Families', value: registrations.length },
            { icon: '🚲', label: 'Total Riders', value: allChildren.length },
            { icon: '🏷️', label: 'Class Entries', value: allClasses.length },
            { icon: '📅', label: 'Classes Active', value: Object.keys(classCounts).length },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-gray-800 rounded-2xl p-5 border border-gray-700 text-center">
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-2xl font-black text-yellow-400">{value}</div>
              <div className="text-gray-400 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Class Counts */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-8">
          <h2 className="text-yellow-400 font-black mb-4">
            📊 Riders Per Class / Peserta Per Kelas
          </h2>
          {Object.keys(classCounts).length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada pendaftar. / No registrations yet.</p>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {Object.entries(classCounts)
                .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
                .map(([cls, count]) => (
                  <div key={cls} className="bg-gray-700 rounded-xl p-3 text-center border border-gray-600">
                    <div className="text-yellow-400 font-black text-lg">{cls}</div>
                    <div className="text-white font-bold text-xl">{count}</div>
                    <div className="text-gray-400 text-xs">riders</div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Registrations List */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-yellow-400 font-black">
              📋 All Registrations / Semua Pendaftaran
            </h2>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="🔍 Search name / phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm w-full md:w-64 transition-colors"
              />
              <button onClick={fetchRegistrations}
                className="bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-gray-300 hover:border-yellow-400 transition-colors text-sm font-bold">
                🔄
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-yellow-400 animate-pulse font-bold">
              Loading registrations...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-3">📭</div>
              <p>Belum ada pendaftaran. / No registrations yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((reg, index) => (
                <div key={reg.id}
                  className="bg-gray-700 rounded-xl border border-gray-600 hover:border-yellow-400 transition-colors">
                  <button
                    onClick={() => setExpandedId(expandedId === reg.id ? null : reg.id)}
                    className="w-full text-left px-5 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500 text-sm font-bold w-6">#{index + 1}</span>
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
                        {reg.children?.length} anak / child
                      </span>
                      <span className="text-gray-400 text-xs">
                        {new Date(reg.created_at).toLocaleDateString('id-ID')}
                      </span>
                      <span className="text-gray-400">{expandedId === reg.id ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {expandedId === reg.id && (
                    <div className="px-5 pb-4 border-t border-gray-600 pt-4">
                      {reg.address && (
                        <p className="text-gray-400 text-sm mb-3">📍 {reg.address}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {reg.children?.map((child, i) => (
                          <div key={child.id} className="bg-gray-800 rounded-xl p-4 border border-gray-600">
                            <p className="text-white font-bold">🚲 {child.child_name}</p>
                            <p className="text-gray-400 text-sm mt-1">
                              {child.gender} · {new Date(child.date_of_birth).toLocaleDateString('id-ID')}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {child.classes?.map(cls => (
                                <span key={cls}
                                  className="bg-yellow-400 text-gray-900 text-xs font-black px-2 py-0.5 rounded-full">
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
      </div>
    </div>
  )
}

export default Dashboard