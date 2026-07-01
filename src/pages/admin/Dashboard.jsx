import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import { useAuth } from '../../context/AuthContext'
import { exportRiderListPDF, exportHeatDrawPDF } from '../../components/ExportPDF'

const CLASS_INFO = {
  K1:'Siput', K2:'Open', K3:'Open', K4:'Open', K5:'Open',
  K6:'Girls Only', K7:'Rockie', K8:'¾ Wheel', K9:'Rockie',
  K10:'Rockie', K11:'Rockie', K12:'Mix', K13:'Mix',
  K14:'Girls Only', K15:'Girls Only', K16:'Girls Only',
  K17:'Open', K18:'Open', K19:'Girls Only', K20:'FFA'
}
const CLASSES = ['K1','K2','K3','K4','K5','K6','K7','K8','K9','K10',
                 'K11','K12','K13','K14','K15','K16','K17','K18','K19','K20']

// ─── Bulk Import ────────────────────────────────────────────────────────────
function BulkImport() {
  const [selectedClass, setSelectedClass] = useState('K1')
  const [names, setNames] = useState('')
  const [gender, setGender] = useState('Unknown')
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState('')
  const [preview, setPreview] = useState([])
  const [importedCount, setImportedCount] = useState(0)

  const parseNames = (text) => text.split('\n').map(n => n.trim()).filter(n => n.length > 0)
  useEffect(() => { setPreview(parseNames(names)) }, [names])

  const handleImport = async () => {
    const riderNames = parseNames(names)
    if (riderNames.length === 0) { setMessage('❌ Enter at least one name!'); return }
    setImporting(true)
    setMessage('')
    try {
      const { data: reg, error: regError } = await supabase
        .from('registrations')
        .insert({ parent_name: `Walk-in Import — ${selectedClass}`, phone: 'N/A', email: '', address: '' })
        .select().single()
      if (regError) throw regError
      const { error } = await supabase.from('children').insert(
        riderNames.map(name => ({ registration_id: reg.id, child_name: name, gender, date_of_birth: null, classes: [selectedClass] }))
      )
      if (error) throw error
      setImportedCount(p => p + riderNames.length)
      setMessage(`✅ Imported ${riderNames.length} riders into ${selectedClass}!`)
      setNames(''); setPreview([])
    } catch (err) { setMessage('❌ ' + err.message) }
    setImporting(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-yellow-400 font-black mb-2">📥 Bulk Import Riders</h3>
        <p className="text-gray-400 text-sm mb-6">Paste names from WhatsApp — one per line. Select class then import!</p>
        {message && <div className={`rounded-xl p-3 mb-4 text-sm font-bold ${message.startsWith('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{message}</div>}
        {importedCount > 0 && <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-3 mb-4 text-sm text-blue-400 font-bold">📊 Total imported: {importedCount} riders</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs mb-1 block font-bold">Select Class *</label>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400">
                {CLASSES.map(c => <option key={c} value={c}>{c} — {CLASS_INFO[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block font-bold">Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400">
                <option value="Unknown">Unknown / Mixed</option>
                <option value="Laki-laki">Laki-laki / Male</option>
                <option value="Perempuan">Perempuan / Female</option>
              </select>
            </div>
            <div className="bg-yellow-400/10 border border-yellow-400 rounded-xl p-4 text-xs text-gray-300 space-y-1">
              <p className="text-yellow-400 font-bold mb-2">💡 How to use:</p>
              <p>1. Select class · 2. Paste names · 3. Import · 4. Repeat per class</p>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block font-bold">Rider Names — one per line</label>
            <textarea value={names} onChange={e => setNames(e.target.value)}
              placeholder={'Rider 1\nRider 2\nRider 3'} rows={10}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400 resize-none font-mono" />
            {preview.length > 0 && <p className="text-yellow-400 text-xs mt-2 font-bold">📋 {preview.length} riders ready for {selectedClass}</p>}
          </div>
        </div>
        {preview.length > 0 && (
          <div className="mt-4 bg-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-xs font-bold mb-2">👁️ Preview:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {preview.map((name, i) => (
                <div key={i} className="bg-gray-600 rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <span className="text-yellow-400 font-black text-xs">{i+1}</span>
                  <span className="text-white text-xs truncate">{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <button onClick={handleImport} disabled={importing || preview.length === 0}
          className="mt-6 w-full bg-yellow-400 text-gray-900 font-black py-4 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50 text-lg">
          {importing ? '⏳ Importing...' : `📥 Import ${preview.length > 0 ? preview.length : ''} Riders into ${selectedClass}`}
        </button>
      </div>
    </div>
  )
}

// ─── Schedule Manager ────────────────────────────────────────────────────────
function AnnouncementManager() {
  const [message, setMessage] = useState('')
  const [active, setActive] = useState(false)
  const [id, setId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(1)
    if (data?.[0]) {
      setId(data[0].id)
      setMessage(data[0].message || '')
      setActive(data[0].active || false)
    }
  }

  const save = async (newActive) => {
    setSaving(true)
    const payload = { message, active: newActive }
    if (id) await supabase.from('announcements').update(payload).eq('id', id)
    else {
      const { data } = await supabase.from('announcements').insert(payload).select().single()
      if (data) setId(data.id)
    }
    setActive(newActive)
    setStatus(newActive ? '✅ Ticker is LIVE on /schedule!' : '✅ Ticker hidden')
    setSaving(false)
    setTimeout(() => setStatus(''), 3000)
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-yellow-400 font-black mb-2">📢 Schedule Announcement Ticker</h3>
      <p className="text-gray-400 text-sm mb-6">
        Type a message and turn it ON to show a scrolling banner at the bottom of the public /schedule page.
        Useful for live updates, delays, or emergencies.
      </p>

      {status && (
        <div className="bg-green-500/20 border border-green-500 text-green-400 rounded-xl p-3 mb-4 text-sm font-bold">
          {status}
        </div>
      )}

      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="e.g. K5 Heat 2 ditunda 10 menit karena ada kendala di lintasan. / K5 Heat 2 delayed 10 minutes due to track issue."
        rows={3}
        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400 resize-none mb-4"
      />

      <div className="flex gap-3 items-center flex-wrap">
        <button onClick={() => save(true)} disabled={saving || !message.trim()}
          className="bg-green-500 text-white font-black px-6 py-2 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 text-sm">
          {saving ? '⏳...' : '🔴 Turn ON Ticker'}
        </button>
        <button onClick={() => save(false)} disabled={saving}
          className="border border-gray-500 text-gray-300 font-bold px-6 py-2 rounded-xl hover:border-red-400 hover:text-red-400 transition-colors text-sm">
          ⬛ Turn OFF Ticker
        </button>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${active ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-gray-600 text-gray-500'}`}>
          {active ? '🔴 Currently LIVE' : '⚫ Currently OFF'}
        </span>
      </div>
    </div>
  )
}

function ScheduleManager() {
  const [heats, setHeats] = useState([])
  const [assignments, setAssignments] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [manualEntry, setManualEntry] = useState({ class_id:'K1', round:'Semi Final', notes:'', order_number:'' })
  const ROUNDS = ['Heat 1','Heat 2','Heat 3','Semi Final','Final']

  useEffect(() => { fetchData() }, [])

const fetchData = async () => {
    const [{ data: heatData }, { data: schedData }] = await Promise.all([
      supabase.from('heats').select('class_id, round, heat_number').order('class_id').order('round').order('heat_number'),
      supabase.from('schedule').select('*').order('order_number')
    ])
    const uniqueHeats = []
    const seen = new Set()
    ;(heatData || []).forEach(h => {
      const label = `${h.round} ${h.heat_number}`
      const key = `${h.class_id}__${label}`
      if (!seen.has(key)) { seen.add(key); uniqueHeats.push({ class_id: h.class_id, round: label }) }
    })
    setHeats(uniqueHeats)
    const existing = {}
    uniqueHeats.forEach(h => {
      const key = `${h.class_id}__${h.round}`
      const saved = schedData?.find(s => s.class_id === h.class_id && s.round === h.round)
      existing[key] = { order: saved?.order_number ? String(saved.order_number) : '', notes: saved?.notes || '', id: saved?.id || null }
    })
    schedData?.forEach(s => {
      const isHeat = uniqueHeats.some(h => h.class_id === s.class_id && h.round === s.round)
      if (!isHeat) {
        const key = `${s.class_id}__${s.round}`
        existing[key] = { order: String(s.order_number), notes: s.notes || '', id: s.id }
      }
    })
    setAssignments(existing)
  }

  const showMsg = (text) => { setMessage(text); setTimeout(() => setMessage(''), 3000) }
  const update = (key, field, value) => setAssignments(p => ({ ...p, [key]: { ...p[key], [field]: value } }))

  const saveAll = async () => {
    setSaving(true)
    let saved = 0
    for (const [key, val] of Object.entries(assignments)) {
      const [class_id, round] = key.split('__')
      const data = { class_id, round, scheduled_time: null, order_number: parseInt(val.order) || 999, notes: val.notes || null, status: 'upcoming' }
      if (val.id) { await supabase.from('schedule').update(data).eq('id', val.id); saved++ }
      else {
        const { data: newEntry, error } = await supabase.from('schedule').insert(data).select().single()
        if (!error) { saved++; setAssignments(p => ({ ...p, [key]: { ...p[key], id: newEntry.id } })) }
      }
    }
    showMsg(`✅ Saved ${saved} entries!`)
    setSaving(false)
    fetchData()
  }

  const deleteEntry = async (key) => {
    const entry = assignments[key]
    if (entry?.id) { if (!confirm('Remove from schedule?')) return; await supabase.from('schedule').delete().eq('id', entry.id) }
    setAssignments(p => { const u = {...p}; delete u[key]; return u })
    showMsg('✅ Removed!'); fetchData()
  }

  const addManual = async () => {
    setSaving(true)
    const maxOrder = Math.max(...Object.values(assignments).map(a => parseInt(a.order) || 0), 0)
    const { error } = await supabase.from('schedule').insert({
      class_id: manualEntry.class_id, round: manualEntry.round,
      scheduled_time: null, order_number: parseInt(manualEntry.order_number) || maxOrder + 1,
      notes: manualEntry.notes || null, status: 'upcoming'
    })
    if (error) showMsg('❌ ' + error.message)
    else { showMsg('✅ Added!'); setShowManual(false); fetchData() }
    setSaving(false)
  }

  const allKeys = [...new Set([...heats.map(h => `${h.class_id}__${h.round}`), ...Object.keys(assignments)])]
  const sorted = allKeys.map(key => { const [c, r] = key.split('__'); return { key, class_id: c, round: r, ...(assignments[key] || {}) } })
    .sort((a, b) => (parseInt(a.order) || 999) - (parseInt(b.order) || 999))

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
          <div>
            <h3 className="text-yellow-400 font-black text-lg">📅 Schedule Manager</h3>
            <p className="text-gray-400 text-xs mt-1">Heats auto-load from Heat Draw. Set order & notes, then save.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowManual(!showManual)}
              className="border border-gray-500 text-gray-300 font-bold px-4 py-2 rounded-xl hover:border-yellow-400 hover:text-yellow-400 transition-colors text-sm">
              {showManual ? '✕ Cancel' : '➕ Add Semi/Final'}
            </button>
            <button onClick={saveAll} disabled={saving}
              className="bg-yellow-400 text-gray-900 font-black px-6 py-2 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50 text-sm">
              {saving ? '⏳ Saving...' : '💾 Save All'}
            </button>
          </div>
        </div>
        {message && <div className={`rounded-xl p-3 mb-4 text-sm font-bold ${message.startsWith('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{message}</div>}
        <div className="flex gap-3 mb-6">
          <div className="bg-gray-700 rounded-xl px-4 py-2 text-center">
            <div className="text-yellow-400 font-black">{allKeys.length}</div>
            <div className="text-gray-400 text-xs">Total Slots</div>
          </div>
        </div>
        {showManual && (
          <div className="bg-gray-700 rounded-xl p-5 mb-6 border border-yellow-400/50">
            <h4 className="text-yellow-400 font-black mb-4 text-sm">➕ Add Semi Final / Final</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Class</label>
                <select value={manualEntry.class_id} onChange={e => setManualEntry(p => ({...p, class_id: e.target.value}))}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-yellow-400">
                  {CLASSES.map(c => <option key={c} value={c}>{c} — {CLASS_INFO[c]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Round</label>
                <select value={manualEntry.round} onChange={e => setManualEntry(p => ({...p, round: e.target.value}))}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-yellow-400">
                  {ROUNDS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Order #</label>
                <input type="number" value={manualEntry.order_number} placeholder="Auto" onChange={e => setManualEntry(p => ({...p, order_number: e.target.value}))}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Notes</label>
                <input type="text" value={manualEntry.notes} placeholder="Optional" onChange={e => setManualEntry(p => ({...p, notes: e.target.value}))}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
              </div>
            </div>
            <button onClick={addManual} disabled={saving} className="bg-yellow-400 text-gray-900 font-black px-5 py-2 rounded-lg text-sm hover:bg-yellow-300 transition-colors disabled:opacity-50">
              ✅ Add Entry
            </button>
          </div>
        )}
        {heats.length === 0 && (
          <div className="bg-yellow-400/10 border border-yellow-400 rounded-xl p-4 mb-6 text-center">
            <p className="text-yellow-400 font-bold text-sm">⚠️ No heats assigned yet!</p>
            <p className="text-gray-400 text-xs mt-1">Go to 🎲 Heat Draw tab first → assign riders → Save.</p>
          </div>
        )}
        {sorted.length > 0 && (
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 px-3 py-2 text-gray-500 text-xs font-bold uppercase">
              <div className="col-span-3">Class</div>
              <div className="col-span-3">Round</div>
              <div className="col-span-2">Order #</div>
              <div className="col-span-3">Notes</div>
              <div className="col-span-1"></div>
            </div>
            {sorted.map(({ key, class_id, round, order, notes }) => (
              <div key={key} className="grid grid-cols-12 gap-2 items-center rounded-xl px-3 py-2 border bg-gray-700 border-gray-600 transition-colors">
                <div className="col-span-3">
                  <span className="text-white font-black text-sm">{class_id}</span>
                  <p className="text-gray-500 text-xs">{CLASS_INFO[class_id]}</p>
                </div>
                <div className="col-span-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${round === 'Final' ? 'bg-yellow-400 text-gray-900' : round === 'Semi Final' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300'}`}>
                    {round}
                  </span>
                </div>
                <div className="col-span-2">
                  <input type="number" min="1" value={order} onChange={e => update(key, 'order', e.target.value)} placeholder="#"
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-yellow-400" />
                </div>
                <div className="col-span-3">
                  <input type="text" value={notes} onChange={e => update(key, 'notes', e.target.value)} placeholder="Notes"
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-400" />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button onClick={() => deleteEntry(key)} className="text-red-400 hover:text-red-300 transition-colors text-sm">✕</button>
                </div>
              </div>
            ))}
            <div className="pt-4">
              <button onClick={saveAll} disabled={saving}
                className="w-full bg-yellow-400 text-gray-900 font-black py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50">
                {saving ? '⏳ Saving...' : '💾 Save All Schedule'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Enter Results (Session-Based) ──────────────────────────────────────────
function RaceControl() {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [riders, setRiders] = useState([])
  const [positions, setPositions] = useState({})
  const [qualified, setQualified] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchSchedule() }, [])

  const fetchSchedule = async () => {
    setLoading(true)
    const { data } = await supabase.from('schedule').select('*').order('order_number')
    setSchedule(data || [])
    setLoading(false)
  }

  const startRace = async (item) => {
    await supabase.from('schedule').update({ status: 'racing' }).eq('id', item.id)
    fetchSchedule()
  }

const openResults = async (item) => {
    setExpandedId(item.id)
    setPositions({})
    setQualified({})
    setMessage('')

    const match = item.round.match(/^(Heat|Semi Final|Final) (\d+)$/)
    if (match) {
      const { data } = await supabase.from('heats').select('*')
        .eq('class_id', item.class_id).eq('round', match[1]).eq('heat_number', parseInt(match[2])).order('lane')
      setRiders(data || [])
    } else {
      const { data } = await supabase.from('results').select('rider_name')
        .eq('class_id', item.class_id).eq('qualified', true)
      setRiders([...new Set((data || []).map(r => r.rider_name))].map(n => ({ rider_name: n })))
    }

    const { data: existing } = await supabase.from('results').select('*')
      .eq('class_id', item.class_id).eq('round', item.round)
    if (existing?.length > 0) {
      const pos = {}; const qual = {}
      existing.forEach(r => { pos[r.rider_name] = String(r.position); qual[r.rider_name] = r.qualified })
      setPositions(pos); setQualified(qual)
    }
  }

  const closeResults = () => { setExpandedId(null); setRiders([]); setPositions({}); setQualified({}) }

  const saveResults = async (item) => {
    const ranked = riders.filter(r => positions[r.rider_name])
    if (ranked.length === 0) { setMessage('❌ Assign at least one position!'); return }
    setSaving(true)
    try {
      await supabase.from('results').delete().eq('class_id', item.class_id).eq('round', item.round)
      const { error } = await supabase.from('results').insert(
        ranked.map(r => ({ class_id: item.class_id, round: item.round, position: parseInt(positions[r.rider_name]), rider_name: r.rider_name, qualified: qualified[r.rider_name] || false }))
      )
      if (error) throw error
      await supabase.from('schedule').update({ status: 'done' }).eq('id', item.id)
      setMessage('✅ Saved!')
      await fetchSchedule()
      setTimeout(() => closeResults(), 800)
    } catch (err) { setMessage('❌ ' + err.message) }
    setSaving(false)
  }

  const statusBadge = {
    upcoming: 'border-gray-500 text-gray-400',
    racing:   'border-green-500 text-green-400 bg-green-500/10 animate-pulse',
    done:     'border-gray-700 text-gray-600'
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <h2 className="text-yellow-400 font-black mb-6">🏁 Race Control & Results</h2>

      {loading ? (
        <div className="text-center py-12 text-yellow-400 animate-pulse font-bold">Loading...</div>
      ) : schedule.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">📅</div>
          <p className="font-bold text-white">No schedule entries yet.</p>
          <p className="text-sm mt-2">Go to 📅 Schedule Manager → set times → Save All Times</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedule.map(item => (
            <div key={item.id} className={`rounded-xl border transition-colors overflow-hidden ${expandedId === item.id ? 'border-yellow-400' : 'border-gray-600'}`}>
              <div className="bg-gray-700 px-5 py-3 flex justify-between items-center flex-wrap gap-3">
                <div>
                  <span className="text-white font-black text-lg mr-3">{item.class_id}</span>
                  <span className="text-gray-400 text-sm">{CLASS_INFO[item.class_id]} · {item.round} · {item.scheduled_time} WITA</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${statusBadge[item.status]}`}>
                    {item.status === 'upcoming' ? '⏳ Upcoming' : item.status === 'racing' ? '🏁 Racing' : '✅ Done'}
                  </span>
                  {item.status === 'upcoming' && (
                    <button onClick={() => startRace(item)}
                      className="bg-green-500 text-white font-bold px-4 py-1.5 rounded-full text-xs hover:bg-green-600 transition-colors">
                      🏁 Start Race
                    </button>
                  )}
                  {item.status === 'racing' && (
                    <button onClick={() => expandedId === item.id ? closeResults() : openResults(item)}
                      className="bg-yellow-400 text-gray-900 font-bold px-4 py-1.5 rounded-full text-xs hover:bg-yellow-300 transition-colors">
                      {expandedId === item.id ? '▲ Close' : '✅ Done — Enter Results'}
                    </button>
                  )}
                  {item.status === 'done' && (
                    <button onClick={() => expandedId === item.id ? closeResults() : openResults(item)}
                      className="border border-gray-500 text-gray-300 font-bold px-4 py-1.5 rounded-full text-xs hover:border-yellow-400 hover:text-yellow-400 transition-colors">
                      {expandedId === item.id ? '▲ Close' : '✏️ Edit Results'}
                    </button>
                  )}
                </div>
              </div>

              {expandedId === item.id && (
                <div className="bg-gray-800 px-5 py-5 border-t border-gray-600">
                  {message && (
                    <div className={`rounded-xl p-3 mb-4 text-sm font-bold ${message.startsWith('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {message}
                    </div>
                  )}
                  {riders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-3xl mb-2">👶</div>
                      <p>No riders found for this heat.</p>
                      <p className="text-xs mt-1">Check 🎲 Heat Draw for {item.class_id}.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 mb-4">
                        <div className="grid grid-cols-12 gap-3 px-3 py-2 text-gray-500 text-xs font-bold uppercase">
                          <div className="col-span-1">#</div>
                          <div className="col-span-6">Rider Name</div>
                          <div className="col-span-3">Finish Pos.</div>
                          <div className="col-span-2">Qualified</div>
                        </div>
                        {riders.map((rider, idx) => (
                          <div key={rider.rider_name || idx}
                            className={`grid grid-cols-12 gap-3 items-center rounded-xl px-3 py-3 border transition-colors ${positions[rider.rider_name] ? 'bg-gray-700 border-gray-600' : 'bg-gray-700/50 border-gray-700'}`}>
                            <div className="col-span-1 text-gray-500 text-sm font-bold">{idx+1}</div>
                            <div className="col-span-6 text-white font-bold">{rider.rider_name}</div>
                            <div className="col-span-3">
                              <select value={positions[rider.rider_name] || ''} onChange={e => setPositions(p => ({...p, [rider.rider_name]: e.target.value}))}
                                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-yellow-400">
                                  <option value="">— Rank —</option>
                                  {riders.map((_, i) => {
                                    const posValue = String(i+1)
                                    const usedByOther = Object.entries(positions).some(([name, val]) => name !== rider.rider_name && val === posValue)
                                    if (usedByOther) return null
                                    return <option key={i+1} value={posValue}>{i===0?'🥇 1st':i===1?'🥈 2nd':i===2?'🥉 3rd':`#${i+1}`}</option>
                                  })}
                                </select>                            </div>
                            <div className="col-span-2">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" checked={qualified[rider.rider_name] || false}
                                  onChange={e => setQualified(p => ({...p, [rider.rider_name]: e.target.checked}))}
                                  className="w-4 h-4 accent-yellow-400" />
                                <span className="text-green-400 text-xs font-bold">QF</span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => saveResults(item)} disabled={saving}
                        className="w-full bg-yellow-400 text-gray-900 font-black py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50">
                        {saving ? '⏳ Saving...' : '💾 Save Results & Mark Done'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Heat Draw Manager ───────────────────────────────────────────────────────
function HeatDrawManager({ registrations }) {
  const [selectedClass, setSelectedClass] = useState('K1')
  const [selectedRound, setSelectedRound] = useState('Heat')
  const [assignments, setAssignments] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [savedHeats, setSavedHeats] = useState([])
  const [heatCount, setHeatCount] = useState(2)

  useEffect(() => { loadClass(selectedClass, selectedRound) }, [selectedClass, selectedRound, registrations])

  const showMessage = (text) => { setMessage(text); setTimeout(() => setMessage(''), 4000) }

const loadClass = async (cls, round) => {
    let riders = []
    if (round === 'Heat') {
      riders = registrations.flatMap(r => (r.children || []).filter(c => c.classes?.includes(cls)).map(c => c.child_name))
    } else {
      const sourceRound = round === 'Semi Final' ? 'Heat' : 'Semi Final'
      const { data: resultData } = await supabase.from('results')
        .select('rider_name, round, qualified')
        .eq('class_id', cls).eq('qualified', true)
      let names = (resultData || []).filter(r => r.round.startsWith(sourceRound)).map(r => r.rider_name)
      if (names.length === 0 && round === 'Final') {
        names = (resultData || []).filter(r => r.round.startsWith('Heat')).map(r => r.rider_name)
      }
      riders = [...new Set(names)]
    }
    const { data } = await supabase.from('heats').select('*').eq('class_id', cls).eq('round', round).order('heat_number').order('lane')
    setSavedHeats(data || [])
    const existing = {}
    riders.forEach(name => {
      const saved = data?.find(h => h.rider_name === name)
      existing[name] = { heat: saved ? String(saved.heat_number) : '' }
    })
    data?.forEach(h => { if (!existing[h.rider_name]) existing[h.rider_name] = { heat: String(h.heat_number) } })
    setAssignments(existing)
  }

  const updateAssignment = (rider, value) => setAssignments(p => ({ ...p, [rider]: { heat: value } }))

  const randomlyAssign = () => {
    const riderList = Object.keys(assignments)
    if (riderList.length === 0) return
    const shuffled = [...riderList].sort(() => Math.random() - 0.5)
    const newAssignments = { ...assignments }
    shuffled.forEach((name, i) => { newAssignments[name] = { heat: String((i % heatCount) + 1) } })
    setAssignments(newAssignments)
    showMessage('🎲 Randomly assigned! Review and adjust if needed.')
  }

  const addManualRider = () => {
    const name = prompt('Enter rider name:')
    if (!name?.trim()) return
    setAssignments(p => ({ ...p, [name.trim()]: { heat: '' } }))
  }

  const removeRider = (name) => { setAssignments(p => { const u = {...p}; delete u[name]; return u }) }

const saveAll = async () => {
    setSaving(true)
    let saved = 0
    for (const [key, val] of Object.entries(assignments)) {
      if (!val.time) continue
      const [class_id, round] = key.split('__')
      if (val.id) {
        // Update existing entry — do NOT touch status (Race Control owns that field)
        const { error } = await supabase.from('schedule').update({
          class_id, round, scheduled_time: val.time, order_number: parseInt(val.order) || 999, notes: val.notes || null
        }).eq('id', val.id)
        if (!error) saved++
      } else {
        // New entry — safe to default status
        const { data: newEntry, error } = await supabase.from('schedule').insert({
          class_id, round, scheduled_time: val.time, order_number: parseInt(val.order) || 999, notes: val.notes || null, status: 'upcoming'
        }).select().single()
        if (!error) { saved++; setAssignments(p => ({ ...p, [key]: { ...p[key], id: newEntry.id } })) }
      }
    }
    showMsg(`✅ Saved ${saved} entries!`)
    setSaving(false)
    fetchData()
  }

const clearClass = async () => {
    if (!confirm(`Clear all ${selectedRound} assignments for ${selectedClass}?`)) return
    await supabase.from('heats').delete().eq('class_id', selectedClass).eq('round', selectedRound)
    showMessage(`✅ Cleared`); loadClass(selectedClass, selectedRound)
  }
  
  const riders = Object.keys(assignments)
  const assignedCount = riders.filter(r => assignments[r].heat).length
  const heatNums = [...new Set(Object.values(assignments).map(v => v.heat).filter(Boolean))].sort((a,b) => parseInt(a)-parseInt(b))

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-yellow-400 font-black mb-6">✍️ Manual Heat Assignment</h3>
        {message && <div className={`rounded-xl p-3 mb-4 text-sm font-bold ${message.startsWith('✅') || message.startsWith('🎲') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{message}</div>}
        <div className="flex flex-wrap gap-4 items-end mb-6">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Select Class</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400">
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Round</label>
            <select value={selectedRound} onChange={e => setSelectedRound(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400">
              <option value="Heat">Heat (Qualifying)</option>
              <option value="Semi Final">Semi Final</option>
              <option value="Final">Final</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Number of Heats/Groups</label>            <input type="number" min="1" max="10" value={heatCount} onChange={e => setHeatCount(parseInt(e.target.value))}
              className="w-24 bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
          </div>
          <button onClick={addManualRider} className="border border-gray-500 text-gray-300 font-bold px-4 py-2 rounded-xl hover:border-yellow-400 hover:text-yellow-400 transition-colors text-sm">
            ➕ Add Rider
          </button>
          {riders.length > 0 && (
            <button onClick={randomlyAssign} className="border border-purple-400 text-purple-400 font-bold px-4 py-2 rounded-xl hover:bg-purple-400 hover:text-white transition-colors text-sm">
              🎲 Randomly Assign All
            </button>
          )}
        </div>
        <div className="flex gap-3 mb-4 flex-wrap">
          {[{ label:'Total', v: riders.length }, { label:'Assigned', v: assignedCount }, { label:'Unassigned', v: riders.length - assignedCount }, { label:'Heats', v: heatNums.length }].map(({ label, v }) => (
            <div key={label} className="bg-gray-700 rounded-xl px-4 py-2 text-center">
              <div className="text-yellow-400 font-black">{v}</div>
              <div className="text-gray-400 text-xs">{label}</div>
            </div>
          ))}
        </div>
        {riders.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <div className="text-4xl mb-3">👶</div>
            {selectedRound === 'Heat' ? (
              <>
                <p>No riders for {selectedClass}.</p>
                <p className="text-xs mt-1">Use 📥 Bulk Import or add manually above.</p>
              </>
            ) : (
              <>
                <p>No qualified riders found for {selectedRound}.</p>
                <p className="text-xs mt-1">Enter results for the previous round and mark riders as ✅ Qualified first.</p>
              </>
            )}
          </div>
        ) : (          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-3 px-3 py-2 text-gray-500 text-xs font-bold uppercase">
              <div className="col-span-8">Rider Name</div>
              <div className="col-span-3">Heat #</div>
              <div className="col-span-1"></div>
            </div>
            {riders.map(name => (
              <div key={name} className={`grid grid-cols-12 gap-3 items-center bg-gray-700 rounded-xl px-3 py-2 border transition-colors ${assignments[name].heat ? 'border-gray-600' : 'border-yellow-400/30'}`}>
                <div className="col-span-8">
                  <p className="text-white font-bold text-sm">{name}</p>
                  {!assignments[name].heat && <p className="text-yellow-400 text-xs">⚠️ Unassigned</p>}
                </div>
                <div className="col-span-3">
                  <select value={assignments[name]?.heat || ''} onChange={e => updateAssignment(name, e.target.value)}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-yellow-400">
                    <option value="">— Pick —</option>
                    {Array.from({ length: heatCount }, (_, i) => i+1).map(n => <option key={n} value={String(n)}>Heat {n}</option>)}
                  </select>
                </div>
                <div className="col-span-1 flex justify-center">
                  <button onClick={() => removeRider(name)} className="text-red-400 hover:text-red-300 transition-colors text-sm">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {riders.length > 0 && (
          <div className="flex gap-3 mt-6 flex-wrap">
            <button onClick={saveAll} disabled={saving} className="bg-yellow-400 text-gray-900 font-black px-8 py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50">
              {saving ? '⏳ Saving...' : '💾 Save Heat Draw'}
            </button>
            {savedHeats.length > 0 && (
              <>
                <button onClick={() => exportHeatDrawPDF(savedHeats, selectedClass)} className="border border-blue-400 text-blue-400 font-bold px-4 py-3 rounded-xl hover:bg-blue-400 hover:text-white transition-colors text-sm">
                  🖨️ Export PDF
                </button>
                <button onClick={clearClass} className="border border-red-400 text-red-400 font-bold px-4 py-3 rounded-xl hover:bg-red-400 hover:text-white transition-colors text-sm">
                  🗑️ Clear
                </button>
              </>
            )}
          </div>
        )}
      </div>
      {heatNums.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-yellow-400 font-black mb-4">👁️ Preview — {selectedClass} {selectedRound}</h3>          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {heatNums.map(heatNum => {
              const heatRiders = Object.entries(assignments).filter(([_, v]) => v.heat === heatNum)
              return (
                <div key={heatNum} className="bg-gray-700 rounded-xl overflow-hidden border border-gray-600">
                  <div className="bg-gray-600 px-4 py-2 flex justify-between">
                    <h4 className="text-yellow-400 font-black">Heat {heatNum}</h4>
                    <span className="text-gray-400 text-xs font-bold">{heatRiders.length} riders</span>
                  </div>
                  <div className="divide-y divide-gray-600">
                    {heatRiders.map(([name], idx) => (
                      <div key={name} className="px-4 py-2 flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-600 text-gray-300 rounded-full flex items-center justify-center font-black text-xs">{idx+1}</div>
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

// ─── Gallery Manager ─────────────────────────────────────────────────────────
function GalleryManager() {
  const [photos, setPhotos] = useState([])
  const [form, setForm] = useState({ title:'', image_url:'', event_name:'', year:'2026' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchPhotos() }, [])
  const fetchPhotos = async () => { const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false }); setPhotos(data || []) }

  const handleSave = async () => {
    if (!form.title || !form.image_url) { setMessage('❌ Title and URL required!'); return }
    setSaving(true)
    const { error } = await supabase.from('gallery').insert({ title: form.title, image_url: form.image_url, event_name: form.event_name, year: parseInt(form.year) })
    if (error) setMessage('❌ ' + error.message)
    else { setMessage('✅ Photo added!'); setForm({ title:'', image_url:'', event_name:'', year:'2026' }); fetchPhotos() }
    setSaving(false); setTimeout(() => setMessage(''), 3000)
  }

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; await supabase.from('gallery').delete().eq('id', id); fetchPhotos() }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-yellow-400 font-black mb-2">➕ Add Photo</h3>
        <p className="text-gray-400 text-xs mb-4">💡 Upload to Google Photos or Imgur and paste the direct URL.</p>
        {message && <div className={`rounded-xl p-3 mb-4 text-sm font-bold ${message.startsWith('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{message}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><label className="text-gray-400 text-xs mb-1 block">Title *</label><input type="text" value={form.title} placeholder="e.g. K1 Final" onChange={e => setForm(p => ({...p, title: e.target.value}))} className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" /></div>
          <div><label className="text-gray-400 text-xs mb-1 block">Year</label><input type="number" value={form.year} onChange={e => setForm(p => ({...p, year: e.target.value}))} className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" /></div>
          <div className="md:col-span-2"><label className="text-gray-400 text-xs mb-1 block">Image URL *</label><input type="url" value={form.image_url} placeholder="https://..." onChange={e => setForm(p => ({...p, image_url: e.target.value}))} className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" /></div>
          <div className="md:col-span-2"><label className="text-gray-400 text-xs mb-1 block">Event Name</label><input type="text" value={form.event_name} placeholder="e.g. Championship 2026" onChange={e => setForm(p => ({...p, event_name: e.target.value}))} className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" /></div>
        </div>
        {form.image_url && <div className="mb-4"><p className="text-gray-400 text-xs mb-2">Preview:</p><img src={form.image_url} alt="preview" className="h-32 w-32 object-cover rounded-xl border border-gray-600" onError={e => { e.target.src = 'https://placehold.co/128x128/1f2937/facc15?text=❌' }} /></div>}
        <button onClick={handleSave} disabled={saving} className="bg-yellow-400 text-gray-900 font-black px-6 py-2 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50 text-sm">{saving ? 'Saving...' : '💾 Add Photo'}</button>
      </div>
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-yellow-400 font-black mb-4">📸 All Photos ({photos.length})</h3>
        {photos.length === 0 ? <p className="text-gray-500 text-sm">No photos yet.</p> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map(p => (
              <div key={p.id} className="bg-gray-700 rounded-xl overflow-hidden border border-gray-600">
                <img src={p.image_url} alt={p.title} className="w-full aspect-square object-cover" onError={e => { e.target.src = 'https://placehold.co/200x200/1f2937/facc15?text=📸' }} />
                <div className="p-3"><p className="text-white font-bold text-xs truncate">{p.title}</p><button onClick={() => handleDelete(p.id)} className="text-red-400 text-xs mt-1 font-bold">✕ Delete</button></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Events Manager ──────────────────────────────────────────────────────────
function EventsManager() {
  const [events, setEvents] = useState([])
  const [form, setForm] = useState({ name:'', date:'', location:'', description:'', total_riders:'0' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchEvents() }, [])
  const fetchEvents = async () => { const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false }); setEvents(data || []) }

  const handleSave = async () => {
    if (!form.name || !form.date || !form.location) { setMessage('❌ Name, date and location required!'); return }
    setSaving(true)
    const { error } = await supabase.from('events').insert({ name: form.name, date: form.date, location: form.location, description: form.description, total_riders: parseInt(form.total_riders)||0, status:'completed' })
    if (error) setMessage('❌ ' + error.message)
    else { setMessage('✅ Event saved!'); setForm({ name:'', date:'', location:'', description:'', total_riders:'0' }); fetchEvents() }
    setSaving(false); setTimeout(() => setMessage(''), 3000)
  }

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; await supabase.from('events').delete().eq('id', id); fetchEvents() }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-yellow-400 font-black mb-4">➕ Add Past Event</h3>
        {message && <div className={`rounded-xl p-3 mb-4 text-sm font-bold ${message.startsWith('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{message}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[{ key:'name', label:'Event Name', ph:'Championship 2026' }, { key:'date', label:'Date', ph:'20-21 Juni 2026' }, { key:'location', label:'Location', ph:'Kupang, NTT' }, { key:'total_riders', label:'Total Riders', ph:'0' }].map(({ key, label, ph }) => (
            <div key={key}><label className="text-gray-400 text-xs mb-1 block">{label}</label><input type="text" value={form[key]} placeholder={ph} onChange={e => setForm(p => ({...p, [key]: e.target.value}))} className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" /></div>
          ))}
          <div className="md:col-span-2"><label className="text-gray-400 text-xs mb-1 block">Description</label><input type="text" value={form.description} placeholder="Brief description..." onChange={e => setForm(p => ({...p, description: e.target.value}))} className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" /></div>
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-yellow-400 text-gray-900 font-black px-6 py-2 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50 text-sm">{saving ? 'Saving...' : '💾 Save Event'}</button>
      </div>
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-yellow-400 font-black mb-4">📖 All Events ({events.length})</h3>
        <div className="space-y-3">
          {events.map(e => (
            <div key={e.id} className="bg-gray-700 rounded-xl px-4 py-3 flex justify-between items-center border border-gray-600">
              <div><p className="text-white font-bold text-sm">{e.name}</p><p className="text-gray-400 text-xs">{e.date} · {e.location} · {e.total_riders} riders</p></div>
              <button onClick={() => handleDelete(e.id)} className="text-red-400 text-xs border border-red-400 px-2 py-1 rounded-full">✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = async () => {
    if (newPassword.length < 6) { setMessage('❌ Password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setMessage('❌ Passwords do not match'); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setMessage('❌ ' + error.message)
    else setMessage('✅ Password changed successfully!')
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <h3 className="text-yellow-400 font-black text-lg mb-4">🔑 Change Password</h3>
        {message && (
          <div className={`rounded-xl p-3 mb-4 text-sm font-bold ${message.startsWith('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleChange} disabled={saving}
            className="flex-1 bg-yellow-400 text-gray-900 font-black py-2 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50 text-sm">
            {saving ? '⏳...' : '💾 Save New Password'}
          </button>
          <button onClick={onClose} className="border border-gray-500 text-gray-300 font-bold px-4 py-2 rounded-xl text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const { adminRole, signOut } = useAuth()
  const navigate = useNavigate()
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [registrations, setRegistrations] = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [activeTab, setActiveTab] = useState('registrations')

  useEffect(() => { fetchRegistrations(); fetchSchedule() }, [])

  const fetchRegistrations = async () => {
    setLoading(true)
    const { data } = await supabase.from('registrations').select('*, children(*)').order('created_at', { ascending: false })
    setRegistrations(data || []); setLoading(false)
  }

  const fetchSchedule = async () => {
    const { data } = await supabase.from('schedule').select('*').order('order_number')
    setSchedule(data || [])
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
    { id: 'bulkimport',    label: '📥 Bulk Import' },
    { id: 'schedulemgr',  label: '📅 Schedule Manager' },
    { id: 'announcements', label: '📢 Announcements' },
    { id: 'racecontrol',  label: '🏁 Race Control & Results' },
    { id: 'heats',        label: '🎲 Heat Draw' },
    { id: 'classcounts',  label: '📊 Class Counts' },
    { id: 'gallery',      label: '📸 Gallery' },
    { id: 'events',       label: '📖 Events' },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="bg-gray-900 border-b-2 border-yellow-400 px-6 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
            <div><h1 className="text-yellow-400 font-black text-sm">ADMIN PANEL</h1><p className="text-gray-400 text-xs">Pushbike Kupang-NTT</p></div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs font-bold border border-gray-500 text-gray-300 px-3 py-1.5 rounded-full hover:border-white hover:text-white transition-colors">
              🏠 Home
            </Link>
            <span className="text-gray-300 text-sm hidden md:block">
              👤 {adminRole?.name}
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${adminRole?.role === 'super_admin' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-300'}`}>
                {adminRole?.role === 'super_admin' ? '⭐ Super Admin' : 'Admin'}
              </span>
            </span>
            {adminRole?.role === 'super_admin' && (
              <Link to="/admin/manage" className="text-xs font-bold border border-yellow-400 text-yellow-400 px-3 py-1.5 rounded-full hover:bg-yellow-400 hover:text-gray-900 transition-colors">
                👥 Manage Admins
              </Link>
            )}
            <button onClick={() => setShowChangePassword(true)} className="text-xs font-bold border border-blue-400 text-blue-400 px-3 py-1.5 rounded-full hover:bg-blue-400 hover:text-white transition-colors">
              🔑 Password
            </button>
            <button onClick={handleSignOut} className="text-xs font-bold border border-red-400 text-red-400 px-3 py-1.5 rounded-full hover:bg-red-400 hover:text-white transition-colors">
              🚪 Logout
            </button>          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[{ icon:'👨‍👩‍👧', label:'Families', value: registrations.length }, { icon:'🚲', label:'Riders', value: allChildren.length }, { icon:'🏷️', label:'Class Entries', value: allClasses.length }, { icon:'📊', label:'Classes Active', value: Object.keys(classCounts).length }].map(({ icon, label, value }) => (
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

        {activeTab === 'bulkimport'   && <BulkImport />}
        {activeTab === 'schedulemgr'  && <ScheduleManager />}
        {activeTab === 'announcements' && <AnnouncementManager />}
        {activeTab === 'heats'        && <HeatDrawManager registrations={registrations} />}
        {activeTab === 'racecontrol'  && <RaceControl />}
        {activeTab === 'gallery'      && <GalleryManager />}
        {activeTab === 'events'       && <EventsManager />}

        {activeTab === 'classcounts' && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <h2 className="text-yellow-400 font-black">📊 Riders Per Class</h2>
              <button onClick={() => exportRiderListPDF(registrations)} className="bg-yellow-400 text-gray-900 font-black px-5 py-2 rounded-xl hover:bg-yellow-300 transition-colors text-sm">
                🖨️ Export PDF
              </button>
            </div>
            {Object.keys(classCounts).length === 0 ? <p className="text-gray-500 text-sm">No registrations yet.</p> : (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(classCounts).sort(([a],[b]) => a.localeCompare(b, undefined, { numeric: true })).map(([cls, count]) => (
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

        {activeTab === 'registrations' && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-yellow-400 font-black">📋 All Registrations ({registrations.length})</h2>
              <div className="flex gap-3 w-full md:w-auto">
                <input type="text" placeholder="🔍 Search name / phone..." value={search} onChange={e => setSearch(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm w-full md:w-64" />
                <button onClick={fetchRegistrations} className="bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-gray-300 hover:border-yellow-400 text-sm font-bold">🔄</button>
              </div>
            </div>
            {loading ? <div className="text-center py-12 text-yellow-400 animate-pulse font-bold">Loading...</div> :
              filtered.length === 0 ? <div className="text-center py-12 text-gray-500"><div className="text-4xl mb-3">📭</div><p>No registrations yet.</p></div> : (
              <div className="space-y-3">
                {filtered.map((reg, index) => (
                  <div key={reg.id} className="bg-gray-700 rounded-xl border border-gray-600 hover:border-yellow-400 transition-colors">
                    <button onClick={() => setExpandedId(expandedId === reg.id ? null : reg.id)} className="w-full text-left px-5 py-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500 text-sm font-bold w-6">#{index+1}</span>
                        <div>
                          <p className="text-white font-bold">{reg.parent_name}</p>
                          <p className="text-gray-400 text-sm">📱 {reg.phone}{reg.email && <span className="ml-3">📧 {reg.email}</span>}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-yellow-400/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">{reg.children?.length} anak</span>
                        <span className="text-gray-400 text-xs">{new Date(reg.created_at).toLocaleDateString('id-ID')}</span>
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
                              <p className="text-gray-400 text-sm mt-1">{child.gender}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {child.classes?.map(cls => <span key={cls} className="bg-yellow-400 text-gray-900 text-xs font-black px-2 py-0.5 rounded-full">{cls}</span>)}
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
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </div>
  )
}

export default Dashboard