import { useState } from 'react'

const CLASSES = [
  { id: 'K1',  label: 'K1 — Siput (1-2 thn)' },
  { id: 'K2',  label: 'K2 — Open (2-3 thn)' },
  { id: 'K3',  label: 'K3 — Open (3-4 thn)' },
  { id: 'K4',  label: 'K4 — Open (4-5 thn)' },
  { id: 'K5',  label: 'K5 — Open (5-6 thn)' },
  { id: 'K6',  label: 'K6 — Girls Only (6-7 thn)' },
  { id: 'K7',  label: 'K7 — Rockie (2-3 thn)' },
  { id: 'K8',  label: 'K8 — ¾ Wheel (2 thn)' },
  { id: 'K9',  label: 'K9 — Rockie (3-4 thn)' },
  { id: 'K10', label: 'K10 — Rockie (4-5 thn)' },
  { id: 'K11', label: 'K11 — Rockie (5-6 thn)' },
  { id: 'K12', label: 'K12 — Mix (3 thn)' },
  { id: 'K13', label: 'K13 — Mix (4 thn)' },
  { id: 'K14', label: 'K14 — Girls Only (4 thn)' },
  { id: 'K15', label: 'K15 — Girls Only (5 thn)' },
  { id: 'K16', label: 'K16 — Girls Only (6 thn)' },
  { id: 'K17', label: 'K17 — Open (6-7 thn)' },
  { id: 'K18', label: 'K18 — Open (7-8 thn)' },
  { id: 'K19', label: 'K19 — Girls Only (7-8 thn)' },
  { id: 'K20', label: 'K20 — FFA (Free For All)' },
]

const emptyChild = { name: '', dob: '', gender: '', classes: [] }

function Register() {
  const [parent, setParent] = useState({ name: '', address: '', phone: '', email: '' })
  const [children, setChildren] = useState([{ ...emptyChild }])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const updateParent = (field, value) =>
    setParent(prev => ({ ...prev, [field]: value }))

  const updateChild = (index, field, value) =>
    setChildren(prev => prev.map((child, i) =>
      i === index ? { ...child, [field]: value } : child
    ))

  const toggleClass = (childIndex, classId) =>
    setChildren(prev => prev.map((child, i) => {
      if (i !== childIndex) return child
      const classes = child.classes.includes(classId)
        ? child.classes.filter(c => c !== classId)
        : [...child.classes, classId]
      return { ...child, classes }
    }))

  const addChild = () =>
    setChildren(prev => [...prev, { ...emptyChild, classes: [] }])

  const removeChild = (index) => {
    if (children.length === 1) return
    setChildren(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!parent.name || !parent.phone) {
      alert('Mohon isi nama dan nomor HP.\nPlease fill in parent name and phone number.')
      return
    }
    for (const child of children) {
      if (!child.name || !child.dob || !child.gender || child.classes.length === 0) {
        alert('Mohon lengkapi data semua anak.\nPlease complete all children\'s information.')
        return
      }
    }
    setLoading(true)
    setTimeout(() => { setLoading(false); setSubmitted(true) }, 1500)
  }

  const resetForm = () => {
    setSubmitted(false)
    setParent({ name: '', address: '', phone: '', email: '' })
    setChildren([{ ...emptyChild, classes: [] }])
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl font-black mb-3 text-yellow-400">PENDAFTARAN BERHASIL!</h2>
        <p className="text-white font-bold text-lg mb-2">Registration Successful!</p>
        <p className="text-gray-400 mb-8">
          Terima kasih, <span className="text-white font-bold">{parent.name}</span>!<br />
          Kami akan menghubungi Anda via WhatsApp untuk konfirmasi.<br />
          We will contact you via WhatsApp for confirmation.
        </p>
        <div className="bg-gray-800 rounded-2xl p-6 border border-yellow-400 text-left mb-8">
          <h3 className="text-yellow-400 font-bold mb-4">📋 Ringkasan / Summary</h3>
          <p className="text-gray-300 text-sm mb-1">👤 {parent.name}</p>
          <p className="text-gray-300 text-sm mb-1">📱 {parent.phone}</p>
          {parent.email && <p className="text-gray-300 text-sm mb-3">📧 {parent.email}</p>}
          <div className="border-t border-gray-700 pt-3 mt-3">
            {children.map((child, i) => (
              <div key={i} className="bg-gray-700 rounded-xl p-3 mb-2">
                <p className="text-white font-bold text-sm">🚲 {child.name}</p>
                <p className="text-gray-400 text-xs">{child.gender} · {child.dob}</p>
                <p className="text-yellow-400 text-xs mt-1 font-bold">
                  Kelas: {child.classes.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
        <button onClick={resetForm}
          className="bg-yellow-400 text-gray-900 font-black px-8 py-3 rounded-full hover:bg-yellow-300 transition-colors">
          + Daftar Lagi / Register Another
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-3">
          PENDAFTARAN <span className="text-yellow-400">/ REGISTER</span>
        </h1>
        <p className="text-gray-400">
          Isi form di bawah untuk mendaftarkan anak Anda.<br />
          Fill in the form below to register your child.
        </p>
      </div>

      {/* Parent Info */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-6">
        <h2 className="text-yellow-400 font-black text-lg mb-6">
          👨‍👩‍👧 Data Orang Tua / Parent Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Nama Lengkap / Full Name *</label>
            <input type="text" value={parent.name}
              onChange={e => updateParent('name', e.target.value)}
              placeholder="Nama orang tua"
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors" />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">No. HP / WhatsApp *</label>
            <input type="tel" value={parent.phone}
              onChange={e => updateParent('phone', e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors" />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Email</label>
            <input type="email" value={parent.email}
              onChange={e => updateParent('email', e.target.value)}
              placeholder="email@example.com"
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors" />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Alamat / Address</label>
            <input type="text" value={parent.address}
              onChange={e => updateParent('address', e.target.value)}
              placeholder="Alamat lengkap"
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors" />
          </div>
        </div>
      </div>

      {/* Children */}
      {children.map((child, index) => (
        <div key={index} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-yellow-400 font-black text-lg">
              🚲 Anak #{index + 1} / Child #{index + 1}
            </h2>
            {children.length > 1 && (
              <button onClick={() => removeChild(index)}
                className="text-red-400 hover:text-red-300 text-xs font-bold border border-red-400 px-3 py-1 rounded-full transition-colors">
                ✕ Hapus / Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Nama Anak / Child's Name *</label>
              <input type="text" value={child.name}
                onChange={e => updateChild(index, 'name', e.target.value)}
                placeholder="Nama lengkap anak"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Tanggal Lahir / DOB *</label>
              <input type="date" value={child.dob}
                onChange={e => updateChild(index, 'dob', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Jenis Kelamin / Gender *</label>
              <select value={child.gender}
                onChange={e => updateChild(index, 'gender', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors">
                <option value="">Pilih / Select</option>
                <option value="Laki-laki">Laki-laki / Male</option>
                <option value="Perempuan">Perempuan / Female</option>
              </select>
            </div>
          </div>

          {/* Class Selection */}
          <div>
            <label className="text-gray-400 text-sm mb-3 block">
              Pilih Kelas / Select Class(es) *
              <span className="text-yellow-400 ml-2 text-xs">
                (boleh lebih dari satu / can select multiple)
              </span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {CLASSES.map(({ id, label }) => (
                <button key={id} type="button"
                  onClick={() => toggleClass(index, id)}
                  className={`text-left px-3 py-2 rounded-xl text-xs font-bold border-2 transition-colors ${
                    child.classes.includes(id)
                      ? 'bg-yellow-400 text-gray-900 border-yellow-400'
                      : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-yellow-400'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            {child.classes.length > 0 && (
              <p className="text-yellow-400 text-xs mt-3 font-bold">
                ✓ Dipilih / Selected: {child.classes.join(', ')}
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Add Child */}
      <button onClick={addChild}
        className="w-full border-2 border-dashed border-gray-600 hover:border-yellow-400 text-gray-400 hover:text-yellow-400 rounded-2xl py-4 font-bold transition-colors mb-6">
        + Tambah Anak / Add Another Child
      </button>

      {/* Submit */}
      <button onClick={handleSubmit} disabled={loading}
        className="w-full bg-yellow-400 text-gray-900 font-black py-4 rounded-2xl text-lg hover:bg-yellow-300 transition-colors disabled:opacity-50">
        {loading ? '⏳ Memproses...' : '🏁 DAFTAR SEKARANG / REGISTER NOW'}
      </button>

      <p className="text-gray-500 text-xs text-center mt-4">
        * Wajib diisi / Required. Pembayaran di tempat / Payment at venue.
      </p>
    </div>
  )
}

export default Register