import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import { useAuth } from '../../context/AuthContext'
import { exportRiderListPDF, exportHeatDrawPDF } from '../../components/ExportPDF'

const CLASS_INFO = {
  K1:'Siput',K2:'Open',K3:'Open',K4:'Open',K5:'Open',
  K6:'Girls Only',K7:'Rockie',K8:'¾ Wheel',K9:'Rockie',
  K10:'Rockie',K11:'Rockie',K12:'Mix',K13:'Mix',
  K14:'Girls Only',K15:'Girls Only',K16:'Girls Only',
  K17:'Open',K18:'Open',K19:'Girls Only',K20:'FFA'
}

const CLASSES = ['K1','K2','K3','K4','K5','K6','K7','K8','K9','K10',
                 'K11','K12','K13','K14','K15','K16','K17','K18','K19','K20']

// ─── Enter Results Component ───────────────────────────────────────────────
function EnterResults() {
  const [form, setForm] = useState({ class_id:'K1', round:'Heat 1', position:'1', rider_name:'', qualified:false, notes:'' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => { fetchResults() }, [])

  const fetchResults = async () => {
    const { data } = await supabase.from('results').select('*')
      .order('class_id').order('round').order('position')
    setResults(data || [])
  }

  const handleSave = async () => {
    if (!form.rider_name) { setMessage('❌ Enter rider name!'); return }
    setSaving(true)
    const { error } = await supabase.from('results').insert({
      class_id: form.class_id, round: form.round,
      position: parseInt(form.position), rider_name: form.rider_name,
      qualified: form.qualified, notes: form.notes
    })
    if (error) setMessage('❌ Error: ' + error.message)
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
            <select value={form.class_id} onChange={e => setForm(p => ({...p, class_id: e.target.value}))}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400">
              {CLASSES.map(k => <option key={k} value={k}>{k} — {CLASS_INFO[k]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Round</label>
            <select value={form.round} onChange={e => setForm(p => ({...p, round: e.target.value}))}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400">
              {['Heat 1','Heat 2','Semi Final','Final'].map(r => <option key={r} value={r}>{r}</option>)}
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
                  className="text-red-400 hover:text-red-300 text-xs border border-red-400 px-2 py-1 rounded-full transition-colors">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Heat Draw Manager Component ───────────────────────────────────────────
function HeatDrawManager({ registrations }) {
  const [selectedClass, setSelectedClass] = useState('K1')
  const [assignments, setAssignments] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [savedHeats, setSavedHeats] = useState([])
  const [heatCount, setHeatCount] = useState(2)

  useEffect(() => { loadClass(selectedClass) }, [selectedClass, registrations])

  const showMessage = (text) => { setMessage(text); setTimeout(() => setMessage(''), 4000) }

  const loadClass = async (cls) => {
    const riders = registrations.flatMap(r =>
      (r.children || []).filter(c => c.classes?.includes(cls)).map(c => c.child_name)
    )
    const { data } = await supabase.from('heats').select('*').eq('class_id', cls)
      .order('heat_number').order('lane')
    setSavedHeats(data || [])
    const existing = {}
    riders.forEach(name => {
      const saved = data?.find(h => h.rider_name === name)
      existing[name] = { heat: saved ? String(saved.heat_number) : '' }
    })
    data?.forEach(h => {
      if (!existing[h.rider_name]) existing[h.rider_name] = { heat: String(h.heat_number) }
    })
    setAssignments(existing)
  }

  const updateAssignment = (rider, value) =>
    setAssignments(prev => ({ ...prev, [rider]: { heat: value } }))

  const addManualRider = () => {
    const name = prompt('Enter rider name:')
    if (!name?.trim()) return
    setAssignments(prev => ({ ...prev, [name.trim()]: { heat: '' } }))
  }

  const removeRider = (name) => {
    setAssignments(prev => { const u = { ...prev }; delete u[name]; return u })
  }

  const saveAll = async () => {
    const toSave = Object.entries(assignments).filter(([_, val]) => val.heat)
    if (toSave.length === 0) { showMessage('❌ No riders assigned to any heat yet!'); return }
    setSaving(true)
    await supabase.from('heats').delete().eq('class_id', selectedClass)
    const heatCounters = {}
    const rows = toSave
      .sort(([_a, a], [_b, b]) => parseInt(a.heat) - parseInt(b.heat))
      .map(([name, val]) => {
        const h = parseInt(val.heat)
        heatCounters[h] = (heatCounters[h] || 0) + 1
        return { class_id: selectedClass, heat_number: h, rider_name: name, lane: heatCounters[h] }
      })
    const { error } = await supabase.from('heats').insert(rows)
    if (error) showMessage('❌ Error: ' + error.message)
    else {
      showMessage(`✅ Saved ${rows.length} riders for ${selectedClass}!`)
      loadClass(selectedClass)
    }
    setSaving(false)
  }

  const clearClass = async () => {
    if (!confirm(`Clear all heat assignments for ${selectedClass}?`)) return
    await supabase.from('heats').delete().eq('class_id', selectedClass)
    showMessage(`✅ Cleared ${selectedClass}`)
    loadClass(selectedClass)
  }

  const riders = Object.keys(assignments)
  const assignedCount = riders.filter(r => assignments[r].heat).length
  const heatNums = [...new Set(Object.values(assignments).map(v => v.heat).filter(Boolean))]
    .sort((a, b) => parseInt(a) - parseInt(b))

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-yellow-400 font-black mb-6">✍️ Manual Heat Assignment</h3>
        {message && (
          <div className={`rounded-xl p-3 mb-4 text-sm font-bold ${message.startsWith('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}
        <div className="flex flex-wrap gap-4 items-end mb-6">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Select Class</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400">
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Number of Heats</label>
            <input type="number" min="1" max="10" value={heatCount}
              onChange={e => setHeatCount(parseInt(e.target.value))}
              className="w-24 bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
          </div>
          <button onClick={addManualRider}
            className="border border-gray-500 text-gray-300 font-bold px-4 py-2 rounded-xl hover:border-yellow-400 hover:text-yellow-400 transition-colors text-sm">
            ➕ Add Rider Manually
          </button>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          {[
            { label: 'Total Riders', value: riders.length },
            { label: 'Assigned', value: assignedCount },
            { label: 'Unassigned', value: riders.length - assignedCount },
            { label: 'Heats', value: heatNums.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-700 rounded-xl px-4 py-2 text-center">
              <div className="text-yellow-400 font-black">{value}</div>
              <div className="text-gray-400 text-xs">{label}</div>
            </div>
          ))}
        </div>

        {riders.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <div className="text-4xl mb-3">👶</div>
            <p>No riders registered for {selectedClass} yet.</p>
            <p className="text-xs mt-1">Add riders manually using the button above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-3 px-3 py-2 text-gray-500 text-xs font-bold uppercase">
              <div className="col-span-8">Rider Name</div>
              <div className="col-span-3">Heat #</div>
              <div className="col-span-1"></div>
            </div>
            {riders.map(name => (
              <div key={name}
                className={`grid grid-cols-12 gap-3 items-center bg-gray-700 rounded-xl px-3 py-2 border transition-colors ${assignments[name].heat ? 'border-gray-600' : 'border-yellow-400/30'}`}>
                <div className="col-span-8">
                  <p className="text-white font-bold text-sm">{name}</p>
                  {!assignments[name].heat && <p className="text-yellow-400 text-xs">⚠️ Unassigned</p>}
                </div>
                <div className="col-span-3">
                  <select value={assignments[name]?.heat || ''}
                    onChange={e => updateAssignment(name, e.target.value)}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-yellow-400">
                    <option value="">— Pick —</option>
                    {Array.from({ length: heatCount }, (_, i) => i + 1).map(n => (
                      <option key={n} value={String(n)}>Heat {n}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1 flex justify-center">
                  <button onClick={() => removeRider(name)}
                    className="text-red-400 hover:text-red-300 transition-colors text-sm">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {riders.length > 0 && (
          <div className="flex gap-3 mt-6 flex-wrap">
            <button onClick={saveAll} disabled={saving}
              className="bg-yellow-400 text-gray-900 font-black px-8 py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50">
              {saving ? '⏳ Saving...' : '💾 Save Heat Draw'}
            </button>
            {savedHeats.length > 0 && (
              <>
                <button onClick={() => exportHeatDrawPDF(savedHeats, selectedClass)}
                  className="border border-blue-400 text-blue-400 font-bold px-4 py-3 rounded-xl hover:bg-blue-400 hover:text-white transition-colors text-sm">
                  🖨️ Export {selectedClass} PDF
                </button>
                <button onClick={clearClass}
                  className="border border-red-400 text-red-400 font-bold px-4 py-3 rounded-xl hover:bg-red-400 hover:text-white transition-colors text-sm">
                  🗑️ Clear {selectedClass}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {heatNums.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-yellow-400 font-black mb-4">👁️ Preview — {selectedClass}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {heatNums.map(heatNum => {
              const heatRiders = Object.entries(assignments)
                .filter(([_, v]) => v.heat === heatNum)
              return (
                <div key={heatNum} className="bg-gray-700 rounded-xl overflow-hidden border border-gray-600">
                  <div className="bg-gray-600 px-4 py-2 flex justify-between">
                    <h4 className="text-yellow-400 font-black">Heat {heatNum}</h4>
                    <span className="text-gray-400 text-xs font-bold">{heatRiders.length} riders</span>
                  </div>
                  <div className="divide-y divide-gray-600">
                    {heatRiders.map(([name], idx) => (
                      <div key={name} className="px-4 py-2 flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-600 text-gray-300 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-white font-bold text-sm">{name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Events Manager Component ──────────────────────────────────────────────
function GalleryManager() {
  const [photos, setPhotos] = useState([])
  const [form, setForm] = useState({ title:'', image_url:'', event_name:'', year:'2025' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchPhotos() }, [])

  const fetchPhotos = async () => {
    const { data } = await supabase.from('gallery').select('*')
      .order('created_at', { ascending: false })
    setPhotos(data || [])
  }

  const handleSave = async () => {
    if (!form.title || !form.image_url) {
      setMessage('❌ Title and image URL are required!'); return
    }
    setSaving(true)
    const { error } = await supabase.from('gallery').insert({
      title: form.title, image_url: form.image_url,
      event_name: form.event_name, year: parseInt(form.year)
    })
    if (error) setMessage('❌ ' + error.message)
    else {
      setMessage('✅ Photo added!')
      setForm({ title:'', image_url:'', event_name:'', year:'2025' })
      fetchPhotos()
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this photo?')) return
    await supabase.from('gallery').delete().eq('id', id)
    fetchPhotos()
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-yellow-400 font-black mb-4">➕ Add Photo</h3>
        <p className="text-gray-400 text-xs mb-4">
          💡 Upload photos to Google Drive, Imgur, or any image host and paste the direct image URL here.
        </p>
        {message && (
          <div className={`rounded-xl p-3 mb-4 text-sm font-bold ${message.startsWith('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Photo Title *</label>
            <input type="text" value={form.title} placeholder="e.g. K1 Final Race"
              onChange={e => setForm(p => ({...p, title: e.target.value}))}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Year</label>
            <input type="number" value={form.year}
              onChange={e => setForm(p => ({...p, year: e.target.value}))}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
          </div>
          <div className="md:col-span-2">
            <label className="text-gray-400 text-xs mb-1 block">Image URL *</label>
            <input type="url" value={form.image_url} placeholder="https://..."
              onChange={e => setForm(p => ({...p, image_url: e.target.value}))}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
          </div>
          <div className="md:col-span-2">
            <label className="text-gray-400 text-xs mb-1 block">Event Name</label>
            <input type="text" value={form.event_name} placeholder="e.g. Championship 2025"
              onChange={e => setForm(p => ({...p, event_name: e.target.value}))}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
          </div>
        </div>

        {form.image_url && (
          <div className="mb-4">
            <p className="text-gray-400 text-xs mb-2">Preview:</p>
            <img src={form.image_url} alt="preview"
              className="h-32 w-32 object-cover rounded-xl border border-gray-600"
              onError={e => { e.target.src = 'https://placehold.co/128x128/1f2937/facc15?text=❌' }} />
          </div>
        )}

        <button onClick={handleSave} disabled={saving}
          className="bg-yellow-400 text-gray-900 font-black px-6 py-2 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50 text-sm">
          {saving ? 'Saving...' : '💾 Add Photo'}
        </button>
      </div>

      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-yellow-400 font-black mb-4">📸 All Photos ({photos.length})</h3>
        {photos.length === 0 ? (
          <p className="text-gray-500 text-sm">No photos yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="bg-gray-700 rounded-xl overflow-hidden border border-gray-600">
                <img src={photo.image_url} alt={photo.title}
                  className="w-full aspect-square object-cover"
                  onError={e => { e.target.src = 'https://placehold.co/200x200/1f2937/facc15?text=📸' }} />
                <div className="p-3">
                  <p className="text-white font-bold text-xs truncate">{photo.title}</p>
                  <button onClick={() => handleDelete(photo.id)}
                    className="text-red-400 hover:text-red-300 text-xs mt-2 font-bold">
                    ✕ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
function EventsManager() {
  const [events, setEvents] = useState([])
  const [form, setForm] = useState({ name:'', date:'', location:'', description:'', total_riders:'0' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false })
    setEvents(data || [])
  }

  const handleSave = async () => {
    if (!form.name || !form.date || !form.location) {
      setMessage('❌ Fill in name, date and location!'); return
    }
    setSaving(true)
    const { error } = await supabase.from('events').insert({
      name: form.name, date: form.date, location: form.location,
      description: form.description, total_riders: parseInt(form.total_riders) || 0, status: 'completed'
    })
    if (error) setMessage('❌ ' + error.message)
    else {
      setMessage('✅ Event saved!')
      setForm({ name:'', date:'', location:'', description:'', total_riders:'0' })
      fetchEvents()
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    fetchEvents()
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-yellow-400 font-black mb-4">➕ Add Past Event</h3>
        {message && (
          <div className={`rounded-xl p-3 mb-4 text-sm font-bold ${message.startsWith('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[
            { key:'name', label:'Event Name', placeholder:'Championship 2025' },
            { key:'date', label:'Date', placeholder:'15 Agustus 2025' },
            { key:'location', label:'Location', placeholder:'Kupang, NTT' },
            { key:'total_riders', label:'Total Riders', placeholder:'0' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-gray-400 text-xs mb-1 block">{label}</label>
              <input type="text" value={form[key]} placeholder={placeholder}
                onChange={e => setForm(p => ({...p, [key]: e.target.value}))}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="text-gray-400 text-xs mb-1 block">Description</label>
            <input type="text" value={form.description} placeholder="Brief description..."
              onChange={e => setForm(p => ({...p, description: e.target.value}))}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="bg-yellow-400 text-gray-900 font-black px-6 py-2 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50 text-sm">
          {saving ? 'Saving...' : '💾 Save Event'}
        </button>
      </div>
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-yellow-400 font-black mb-4">📖 All Events ({events.length})</h3>
        <div className="space-y-3">
          {events.map(event => (
            <div key={event.id} className="bg-gray-700 rounded-xl px-4 py-3 flex justify-between items-center border border-gray-600">
              <div>
                <p className="text-white font-bold text-sm">{event.name}</p>
                <p className="text-gray-400 text-xs">{event.date} · {event.location} · {event.total_riders} riders</p>
              </div>
              <button onClick={() => handleDelete(event.id)}
                className="text-red-400 hover:text-red-300 text-xs border border-red-400 px-2 py-1 rounded-full transition-colors">✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────
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
    const { data } = await supabase.from('registrations').select('*, children(*)')
      .order('created_at', { ascending: false })
    setRegistrations(data || [])
    setLoading(false)
  }

  const fetchSchedule = async () => {
    const { data } = await supabase.from('schedule').select('*').order('order_number')
    setSchedule(data || [])
  }

  const updateScheduleStatus = async (id, status) => {
    await supabase.from('schedule').update({ status }).eq('id', id)
    fetchSchedule()
  }

  const handleSignOut = async () => { await signOut(); navigate('/admin/login') }

  const allChildren = registrations.flatMap(r => r.children || [])
  const allClasses = allChildren.flatMap(c => c.classes || [])
  const classCounts = allClasses.reduce((acc, cls) => { acc[cls] = (acc[cls]||0)+1; return acc }, {})

  const filtered = registrations.filter(r =>
    r.parent_name.toLowerCase().includes(search.toLowerCase()) ||
    r.phone.includes(search) ||
    r.children?.some(c => c.child_name.toLowerCase().includes(search.toLowerCase()))
  )

  const tabs = [
    { id: 'registrations', label: '📋 Registrations' },
    { id: 'schedule',      label: '🏁 Race Control' },
    { id: 'heats',         label: '🎲 Heat Draw' },
    { id: 'results',       label: '🏆 Enter Results' },
    { id: 'classcounts',   label: '📊 Class Counts' },
    { id: 'events',        label: '📖 Events' },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
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
            { icon:'👨‍👩‍👧', label:'Families', value: registrations.length },
            { icon:'🚲', label:'Riders', value: allChildren.length },
            { icon:'🏷️', label:'Class Entries', value: allClasses.length },
            { icon:'📊', label:'Classes Active', value: Object.keys(classCounts).length },
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
              className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-gray-400 hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Class Counts */}
        {activeTab === 'classcounts' && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <h2 className="text-yellow-400 font-black">📊 Riders Per Class</h2>
              <button onClick={() => exportRiderListPDF(registrations)}
                className="bg-yellow-400 text-gray-900 font-black px-5 py-2 rounded-xl hover:bg-yellow-300 transition-colors text-sm">
                🖨️ Export All Riders PDF
              </button>
            </div>
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

        {/* Race Control */}
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

        {activeTab === 'heats' && <HeatDrawManager registrations={registrations} />}
        {activeTab === 'results' && <EnterResults />}
        {activeTab === 'gallery' && <GalleryManager />}
        {activeTab === 'events' && <EventsManager />}

        {/* Registrations */}
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