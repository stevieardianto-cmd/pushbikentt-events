import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../supabase'

function ManageAdmins() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', name: '', role: 'admin' })
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => { fetchAdmins() }, [])

  const fetchAdmins = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('admin_roles')
      .select('*')
      .order('created_at', { ascending: true })
    setAdmins(data || [])
    setLoading(false)
  }

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  const handleAddAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password || !newAdmin.name) {
      showMessage('Mohon lengkapi semua field. / Please fill all fields.', 'error')
      return
    }
    setAdding(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password
      })
      if (authError) throw authError
      const userId = authData.user?.id
      if (!userId) throw new Error('User ID not found')
      const { error: roleError } = await supabase
        .from('admin_roles')
        .insert({ user_id: userId, role: newAdmin.role, name: newAdmin.name })
      if (roleError) throw roleError
      showMessage('Admin ' + newAdmin.name + ' berhasil ditambahkan!', 'success')
      setNewAdmin({ email: '', password: '', name: '', role: 'admin' })
      fetchAdmins()
    } catch (error) {
      showMessage('Error: ' + error.message, 'error')
    }
    setAdding(false)
  }

  const handleRemoveAdmin = async (adminId, adminName) => {
    if (!confirm('Hapus admin ' + adminName + '?')) return
    const { error } = await supabase
      .from('admin_roles')
      .delete()
      .eq('id', adminId)
    if (!error) {
      showMessage('Admin ' + adminName + ' dihapus.', 'success')
      fetchAdmins()
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="bg-gray-900 border-b-2 border-yellow-400 px-6 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="text-yellow-400 font-black text-sm">MANAGE ADMINS</h1>
              <p className="text-gray-400 text-xs">Super Admin Only</p>
            </div>
          </div>
          <Link to="/admin"
            className="text-xs font-bold border border-gray-600 text-gray-300 px-4 py-2 rounded-full hover:border-yellow-400 hover:text-yellow-400 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {message.text && (
          <div className={message.type === 'success'
            ? 'bg-green-500/20 border border-green-500 text-green-400 rounded-xl p-4 mb-6 font-bold text-sm'
            : 'bg-red-500/20 border border-red-500 text-red-400 rounded-xl p-4 mb-6 font-bold text-sm'}>
            {message.text}
          </div>
        )}

        {/* Add New Admin */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-8">
          <h2 className="text-yellow-400 font-black text-lg mb-6">
            Add New Admin / Tambah Admin Baru
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Nama / Name</label>
              <input type="text" value={newAdmin.name}
                onChange={e => setNewAdmin(p => ({ ...p, name: e.target.value }))}
                placeholder="Nama admin"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Email</label>
              <input type="email" value={newAdmin.email}
                onChange={e => setNewAdmin(p => ({ ...p, email: e.target.value }))}
                placeholder="admin@email.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Password</label>
              <input type="password" value={newAdmin.password}
                onChange={e => setNewAdmin(p => ({ ...p, password: e.target.value }))}
                placeholder="Min. 6 characters"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Role</label>
              <select value={newAdmin.role}
                onChange={e => setNewAdmin(p => ({ ...p, role: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors">
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          </div>
          <button onClick={handleAddAdmin} disabled={adding}
            className="bg-yellow-400 text-gray-900 font-black px-8 py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50">
            {adding ? 'Adding...' : 'Add Admin / Tambah Admin'}
          </button>
        </div>

        {/* Admins List */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-yellow-400 font-black text-lg mb-6">
            Admin List / Daftar Admin ({admins.length})
          </h2>
          {loading ? (
            <p className="text-yellow-400 animate-pulse font-bold">Loading...</p>
          ) : (
            <div className="space-y-3">
              {admins.map(admin => (
                <div key={admin.id}
                  className="bg-gray-700 rounded-xl px-5 py-4 flex justify-between items-center border border-gray-600">
                  <div>
                    <p className="text-white font-bold">{admin.name}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(admin.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={admin.role === 'super_admin'
                      ? 'bg-yellow-400 text-gray-900 text-xs font-black px-3 py-1 rounded-full'
                      : 'bg-gray-600 text-gray-300 text-xs font-black px-3 py-1 rounded-full'}>
                      {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                    {admin.role !== 'super_admin' && (
                      <button
                        onClick={() => handleRemoveAdmin(admin.id, admin.name)}
                        className="text-red-400 hover:text-red-300 text-xs font-bold border border-red-400 px-3 py-1 rounded-full transition-colors">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ManageAdmins