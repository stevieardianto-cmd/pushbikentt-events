import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import { useAuth } from '../../context/AuthContext'
import { exportRiderListPDF, exportHeatDrawPDF } from '../../components/ExportPDF'

const CLASS_INFO = {
  K1:'Siput', K2:'Pro', K3:'¾ Wheel', K4:'Campuran',
  K5:'Pro', K6:'Pemula', K7:'Pro', K8:'Boys/Girls',
  K9:'Pro', K10:'Rockie', K11:'Girls', K12:'Girls',
  K13:'Girls', K14:'Campuran', K15:'Rockie', K16:'Girls',
  K17:'Pro', K18:'Pro', K19:'FFA'
}
const CLASSES = ['K1','K2','K3','K4','K5','K6','K7','K8','K9','K10',
                 'K11','K12','K13','K14','K15','K16','K17','K18','K19']

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
  const [entries, setEntries] = useState([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [manualEntry, setManualEntry] = useState({ class_id:'K1', round:'Semi Final', notes:'' })
  const ROUNDS = ['Heat 1','Heat 2','Heat 3','Semi Final 1','Semi Final 2','Final']

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

    const existing = schedData || []
    const existingKeys = new Set(existing.map(s => `${s.class_id}__${s.round}`))

    // Only add heats not yet in schedule — use upsert to avoid duplicates
    const toAdd = uniqueHeats.filter(h => !existingKeys.has(`${h.class_id}__${h.round}`))

    if (toAdd.length > 0) {
      const maxOrder = existing.length > 0 ? Math.max(...existing.map(s => s.order_number)) : 0
      const newRows = toAdd.map((h, i) => ({
        class_id: h.class_id,
        round: h.round,
        scheduled_time: '',
        order_number: maxOrder + i + 1,
        notes: '',
        status: 'upcoming'
      }))

      const { data: inserted, error } = await supabase
        .from('schedule')
        .upsert(newRows, { onConflict: 'class_id,round', ignoreDuplicates: true })
        .select()

      setEntries([...existing, ...(inserted || [])])
    } else {
      setEntries(existing)
    }
  }

  const showMsg = (text) => { setMessage(text); setTimeout(() => setMessage(''), 3000) }

  const moveUp = async (index) => {
    if (index === 0) return
    const updated = [...entries]
    const temp = updated[index - 1]
    updated[index - 1] = updated[index]
    updated[index] = temp
    const reordered = updated.map((e, i) => ({ ...e, order_number: i + 1 }))
    setEntries(reordered)
    await Promise.all(reordered.map(e => supabase.from('schedule').update({ order_number: e.order_number }).eq('id', e.id)))
  }

  const moveDown = async (index) => {
    if (index === entries.length - 1) return
    const updated = [...entries]
    const temp = updated[index + 1]
    updated[index + 1] = updated[index]
    updated[index] = temp
    const reordered = updated.map((e, i) => ({ ...e, order_number: i + 1 }))
    setEntries(reordered)
    await Promise.all(reordered.map(e => supabase.from('schedule').update({ order_number: e.order_number }).eq('id', e.id)))
  }

  const updateNotes = (index, value) => {
    setEntries(prev => prev.map((e, i) => i === index ? { ...e, notes: value } : e))
  }

  const saveNotes = async (entry) => {
    await supabase.from('schedule').update({ notes: entry.notes }).eq('id', entry.id)
    showMsg('✅ Notes saved!')
  }

  const deleteEntry = async (entry) => {
    if (!confirm('Remove from schedule?')) return
    await supabase.from('schedule').delete().eq('id', entry.id)
    showMsg('✅ Removed!')
    fetchData()
  }

  const addManual = async () => {
    setSaving(true)
    const maxOrder = entries.length > 0 ? Math.max(...entries.map(e => e.order_number)) : 0
    const { error } = await supabase.from('schedule').insert({
      class_id: manualEntry.class_id, round: manualEntry.round,
      scheduled_time: '', order_number: maxOrder + 1,
      notes: manualEntry.notes || '', status: 'upcoming'
    })
    if (error) showMsg('❌ ' + error.message)
    else { showMsg('✅ Added!'); setShowManual(false); fetchData() }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
          <div>
            <h3 className="text-yellow-400 font-black text-lg">📋 Schedule Manager</h3>
            <p className="text-gray-400 text-xs mt-1">
              Heats auto-load from Heat Draw. Use ↑↓ arrows to set race order.
            </p>
          </div>
          <button onClick={() => setShowManual(!showManual)}
            className="border border-gray-500 text-gray-300 font-bold px-4 py-2 rounded-xl hover:border-yellow-400 hover:text-yellow-400 transition-colors text-sm">
            {showManual ? '✕ Cancel' : '➕ Add Semi/Final'}
          </button>
        </div>

        {message && (
          <div className={`rounded-xl p-3 mb-4 text-sm font-bold ${message.startsWith('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {[
            { label:'Total Races', v: entries.length },
            { label:'Done', v: entries.filter(e => e.status === 'done').length },
            { label:'Remaining', v: entries.filter(e => e.status !== 'done').length },
          ].map(({ label, v }) => (
            <div key={label} className="bg-gray-700 rounded-xl px-4 py-2 text-center">
              <div className="text-yellow-400 font-black">{v}</div>
              <div className="text-gray-400 text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Add Manual Entry */}
        {showManual && (
          <div className="bg-gray-700 rounded-xl p-5 mb-6 border border-yellow-400/50">
            <h4 className="text-yellow-400 font-black mb-4 text-sm">➕ Add Semi Final / Final</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
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
                <label className="text-gray-400 text-xs mb-1 block">Notes (optional)</label>
                <input type="text" value={manualEntry.notes} placeholder="e.g. After lunch"
                  onChange={e => setManualEntry(p => ({...p, notes: e.target.value}))}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
              </div>
            </div>
            <button onClick={addManual} disabled={saving}
              className="bg-yellow-400 text-gray-900 font-black px-5 py-2 rounded-lg text-sm hover:bg-yellow-300 disabled:opacity-50">
              ✅ Add to Schedule
            </button>
          </div>
        )}

        {heats.length === 0 && entries.length === 0 ? (
          <div className="bg-yellow-400/10 border border-yellow-400 rounded-xl p-4 text-center">
            <p className="text-yellow-400 font-bold text-sm">⚠️ No heats assigned yet!</p>
            <p className="text-gray-400 text-xs mt-1">Go to 🎲 Heat Draw first → assign riders → Save.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-3 py-2 text-gray-500 text-xs font-bold uppercase">
              <div className="col-span-1">Order</div>
              <div className="col-span-2">Class</div>
              <div className="col-span-3">Round</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Notes</div>
              <div className="col-span-2">Actions</div>
            </div>

            {entries.map((entry, index) => (
              <div key={entry.id}
                className={`grid grid-cols-12 gap-2 items-center rounded-xl px-3 py-3 border transition-colors ${
                  entry.status === 'done' ? 'bg-gray-700/40 border-gray-700 opacity-60' :
                  entry.status === 'racing' ? 'bg-green-500/10 border-green-500' :
                  'bg-gray-700 border-gray-600'
                }`}>
                <div className="col-span-1 text-gray-500 font-black text-sm">{index + 1}</div>
                <div className="col-span-2">
                  <span className="text-white font-black">{entry.class_id}</span>
                  <p className="text-gray-500 text-xs">{CLASS_INFO[entry.class_id]}</p>
                </div>
                <div className="col-span-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    entry.round.includes('Final') && !entry.round.includes('Semi') ? 'bg-yellow-400 text-gray-900' :
                    entry.round.includes('Semi') ? 'bg-orange-500 text-white' :
                    'bg-gray-600 text-gray-300'
                  }`}>
                    {entry.round}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs font-bold ${
                    entry.status === 'done' ? 'text-gray-500' :
                    entry.status === 'racing' ? 'text-green-400' :
                    'text-gray-400'
                  }`}>
                    {entry.status === 'done' ? '✅ Done' : entry.status === 'racing' ? '🏁 Racing' : '⏳ Upcoming'}
                  </span>
                </div>
                <div className="col-span-2">
                  <input type="text" value={entry.notes || ''}
                    onChange={e => updateNotes(index, e.target.value)}
                    onBlur={() => saveNotes(entry)}
                    placeholder="Notes"
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-yellow-400" />
                </div>
                <div className="col-span-2 flex gap-1 items-center">
                  <button onClick={() => moveUp(index)} disabled={index === 0}
                    className="w-7 h-7 bg-gray-600 hover:bg-yellow-400 hover:text-gray-900 text-gray-300 rounded-lg flex items-center justify-center font-black text-xs disabled:opacity-30 transition-colors">
                    ↑
                  </button>
                  <button onClick={() => moveDown(index)} disabled={index === entries.length - 1}
                    className="w-7 h-7 bg-gray-600 hover:bg-yellow-400 hover:text-gray-900 text-gray-300 rounded-lg flex items-center justify-center font-black text-xs disabled:opacity-30 transition-colors">
                    ↓
                  </button>
                  <button onClick={() => deleteEntry(entry)}
                    className="w-7 h-7 bg-gray-600 hover:bg-red-500 text-gray-300 hover:text-white rounded-lg flex items-center justify-center text-xs transition-colors">
                    ✕
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

  const updateStatus = async (item, status) => {
    await supabase.from('schedule').update({ status }).eq('id', item.id)
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

  const statusStyle = {
    upcoming: 'bg-gray-700 border-gray-600',
    waiting:  'bg-yellow-500/10 border-yellow-500',
    racing:   'bg-green-500/10 border-green-500',
    done:     'bg-gray-700/40 border-gray-700 opacity-50'
  }

  const doneCount = schedule.filter(s => s.status === 'done').length
  const waitingCount = schedule.filter(s => s.status === 'waiting').length
  const racingCount = schedule.filter(s => s.status === 'racing').length

  return (
    <div className="space-y-4">
      {/* Live Status Bar */}
      {(waitingCount > 0 || racingCount > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {waitingCount > 0 && (
            <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-2xl p-4 text-center">
              <p className="text-yellow-400 font-black text-sm">🟡 IN WAITING ZONE</p>
              {schedule.filter(s => s.status === 'waiting').map(s => (
                <p key={s.id} className="text-white font-bold mt-1">{s.class_id} — {s.round}</p>
              ))}
            </div>
          )}
          {racingCount > 0 && (
            <div className="bg-green-500/20 border-2 border-green-500 rounded-2xl p-4 text-center animate-pulse">
              <p className="text-green-400 font-black text-sm">🏁 RACING NOW</p>
              {schedule.filter(s => s.status === 'racing').map(s => (
                <p key={s.id} className="text-white font-bold mt-1">{s.class_id} — {s.round}</p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-yellow-400 font-black">🏁 Race Control & Results</h2>
          {schedule.length > 0 && (
            <span className="text-gray-400 text-xs font-bold">
              {doneCount}/{schedule.length} done
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-yellow-400 animate-pulse font-bold">Loading...</div>
        ) : schedule.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">📅</div>
            <p className="font-bold text-white">No schedule entries yet.</p>
            <p className="text-sm mt-2">Go to 📋 Schedule Manager first.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedule.map(item => (
              <div key={item.id}
                className={`rounded-xl border-2 overflow-hidden transition-colors ${statusStyle[item.status] || statusStyle.upcoming}`}>

                {/* Row Header */}
                <div className="px-4 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      item.status === 'done' ? 'bg-gray-500' :
                      item.status === 'racing' ? 'bg-green-500 animate-pulse' :
                      item.status === 'waiting' ? 'bg-yellow-400 animate-pulse' :
                      'bg-gray-600'
                    }`} />
                    <div>
                      <span className="text-white font-black text-base">{item.class_id}</span>
                      <span className="text-gray-400 text-sm ml-2">{CLASS_INFO[item.class_id]} · {item.round}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center flex-wrap justify-end">
                    {/* Status Badge */}
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      item.status === 'done'    ? 'border-gray-600 text-gray-400' :
                      item.status === 'racing'  ? 'border-green-500 text-green-400' :
                      item.status === 'waiting' ? 'border-yellow-500 text-yellow-400' :
                      'border-gray-600 text-gray-400'
                    }`}>
                      {item.status === 'done' ? '✅ Done' :
                       item.status === 'racing' ? '🏁 Racing' :
                       item.status === 'waiting' ? '🟡 Waiting Zone' :
                       '⏳ Upcoming'}
                    </span>

                    {/* Action Buttons based on status */}
                    {item.status === 'upcoming' && (
                      <button onClick={() => updateStatus(item, 'waiting')}
                        className="bg-yellow-400 text-gray-900 font-bold px-4 py-1.5 rounded-full text-xs hover:bg-yellow-300 transition-colors">
                        🟡 Call to Waiting Zone
                      </button>
                    )}

                    {item.status === 'waiting' && (
                      <>
                        <button onClick={() => updateStatus(item, 'upcoming')}
                          className="border border-gray-500 text-gray-300 font-bold px-3 py-1.5 rounded-full text-xs hover:border-gray-300 transition-colors">
                          ↩ Undo
                        </button>
                        <button onClick={() => updateStatus(item, 'racing')}
                          className="bg-green-500 text-white font-bold px-4 py-1.5 rounded-full text-xs hover:bg-green-600 transition-colors">
                          🏁 Start Race
                        </button>
                      </>
                    )}

                    {item.status === 'racing' && (
                      <>
                        <button onClick={() => updateStatus(item, 'waiting')}
                          className="border border-gray-500 text-gray-300 font-bold px-3 py-1.5 rounded-full text-xs hover:border-gray-300 transition-colors">
                          ↩ Undo
                        </button>
                        <button onClick={() => expandedId === item.id ? closeResults() : openResults(item)}
                          className="bg-yellow-400 text-gray-900 font-bold px-4 py-1.5 rounded-full text-xs hover:bg-yellow-300 transition-colors">
                          {expandedId === item.id ? '▲ Close' : '✅ Done — Enter Results'}
                        </button>
                      </>
                    )}

                    {item.status === 'done' && (
                      <>
                        <button onClick={() => updateStatus(item, 'racing')}
                          className="border border-gray-500 text-gray-400 font-bold px-3 py-1.5 rounded-full text-xs hover:border-yellow-400 hover:text-yellow-400 transition-colors">
                          ↩ Undo
                        </button>
                        <button onClick={() => expandedId === item.id ? closeResults() : openResults(item)}
                          className="border border-gray-500 text-gray-300 font-bold px-3 py-1.5 rounded-full text-xs hover:border-yellow-400 hover:text-yellow-400 transition-colors">
                          {expandedId === item.id ? '▲ Close' : '✏️ Edit Results'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Results Entry Panel */}
                {expandedId === item.id && (
                  <div className="bg-gray-900 px-5 py-5 border-t border-gray-700">
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
                          <div className="hidden sm:grid grid-cols-12 gap-3 px-3 py-2 text-gray-500 text-xs font-bold uppercase">
                            <div className="col-span-1">#</div>
                            <div className="col-span-6">Rider Name</div>
                            <div className="col-span-3">Finish Pos.</div>
                            <div className="col-span-2">Qualified</div>
                          </div>
                          {riders.map((rider, idx) => (
                            <div key={rider.rider_name || idx}
                              className={`rounded-xl px-3 py-3 border ${positions[rider.rider_name] ? 'bg-gray-700 border-gray-600' : 'bg-gray-700/50 border-gray-700'}`}>
                              {/* Mobile */}
                              <div className="flex items-center gap-3 sm:hidden">
                                <span className="text-gray-500 text-xs font-bold w-5">{idx+1}</span>
                                <span className="text-white font-bold text-sm flex-1 truncate">{rider.rider_name}</span>
                                <select value={positions[rider.rider_name] || ''}
                                  onChange={e => setPositions(p => ({...p, [rider.rider_name]: e.target.value}))}
                                  className="bg-gray-600 border border-gray-500 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-400">
                                  <option value="">—</option>
                                  {riders.map((_, i) => {
                                    const posValue = String(i+1)
                                    const usedByOther = Object.entries(positions).some(([name, val]) => name !== rider.rider_name && val === posValue)
                                    if (usedByOther) return null
                                    return <option key={i+1} value={posValue}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</option>
                                  })}
                                </select>
                                <label className="flex items-center gap-1 cursor-pointer flex-shrink-0">
                                  <input type="checkbox" checked={qualified[rider.rider_name] || false}
                                    onChange={e => setQualified(p => ({...p, [rider.rider_name]: e.target.checked}))}
                                    className="w-4 h-4 accent-yellow-400" />
                                  <span className="text-green-400 text-xs font-bold">QF</span>
                                </label>
                              </div>
                              {/* Desktop */}
                              <div className="hidden sm:grid grid-cols-12 gap-3 items-center">
                                <div className="col-span-1 text-gray-500 text-sm font-bold">{idx+1}</div>
                                <div className="col-span-6 text-white font-bold">{rider.rider_name}</div>
                                <div className="col-span-3">
                                  <select value={positions[rider.rider_name] || ''}
                                    onChange={e => setPositions(p => ({...p, [rider.rider_name]: e.target.value}))}
                                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-yellow-400">
                                    <option value="">— Rank —</option>
                                    {riders.map((_, i) => {
                                      const posValue = String(i+1)
                                      const usedByOther = Object.entries(positions).some(([name, val]) => name !== rider.rider_name && val === posValue)
                                      if (usedByOther) return null
                                      return <option key={i+1} value={posValue}>{i===0?'🥇 1st':i===1?'🥈 2nd':i===2?'🥉 3rd':`#${i+1}`}</option>
                                    })}
                                  </select>
                                </div>
                                <div className="col-span-2">
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" checked={qualified[rider.rider_name] || false}
                                      onChange={e => setQualified(p => ({...p, [rider.rider_name]: e.target.checked}))}
                                      className="w-4 h-4 accent-yellow-400" />
                                    <span className="text-green-400 text-xs font-bold">QF</span>
                                  </label>
                                </div>
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
    const toSave = Object.entries(assignments).filter(([_, v]) => v.heat)
    if (toSave.length === 0) { showMessage('❌ No riders assigned to any heat!'); return }
    setSaving(true)
    
    // Step 1: Delete existing
    const { error: delError } = await supabase.from('heats')
      .delete().eq('class_id', selectedClass).eq('round', selectedRound)
    if (delError) {
      showMessage('❌ Delete error: ' + delError.message)
      setSaving(false)
      return
    }

    // Step 2: Build rows
    const heatCounters = {}
    const rows = toSave
      .sort(([_a, a], [_b, b]) => parseInt(a.heat) - parseInt(b.heat))
      .map(([name, val]) => {
        const h = parseInt(val.heat)
        heatCounters[h] = (heatCounters[h] || 0) + 1
        return {
          class_id: selectedClass,
          round: selectedRound,
          heat_number: h,
          rider_name: name,
          lane: heatCounters[h]
        }
      })

    // Step 3: Insert
    const { data: inserted, error: insError } = await supabase.from('heats').insert(rows).select()
    if (insError) {
      showMessage('❌ Insert error: ' + insError.message)
    } else {
      showMessage(`✅ Saved ${inserted?.length || rows.length} riders for ${selectedClass} ${selectedRound}!`)
      loadClass(selectedClass, selectedRound)
    }
    setSaving(false)
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
            <div className="hidden sm:grid grid-cols-12 gap-3 px-3 py-2 text-gray-500 text-xs font-bold uppercase">
              <div className="col-span-8">Rider Name</div>
              <div className="col-span-3">Heat #</div>
              <div className="col-span-1"></div>
            </div>
            {riders.map(name => (
              <div key={name} className={`bg-gray-700 rounded-xl px-3 py-3 border transition-colors ${assignments[name].heat ? 'border-gray-600' : 'border-yellow-400/30'}`}>
                {/* Mobile layout */}
                <div className="flex items-center gap-3 sm:hidden">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{name}</p>
                    {!assignments[name].heat && <p className="text-yellow-400 text-xs">⚠️ Unassigned</p>}
                  </div>
                  <select value={assignments[name]?.heat || ''} onChange={e => updateAssignment(name, e.target.value)}
                    className="bg-gray-600 border border-gray-500 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-yellow-400">
                    <option value="">—</option>
                    {Array.from({ length: heatCount }, (_, i) => i+1).map(n => <option key={n} value={String(n)}>H{n}</option>)}
                  </select>
                  <button onClick={() => removeRider(name)} className="text-red-400 text-sm flex-shrink-0">✕</button>
                </div>
                {/* Desktop layout */}
                <div className="hidden sm:grid grid-cols-12 gap-3 items-center">
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
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('adminActiveTab') || 'registrations'
  })

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
          <div className="flex items-center gap-2">
            <span className="text-gray-300 text-sm hidden md:block">
              👤 {adminRole?.name}
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${adminRole?.role === 'super_admin' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-300'}`}>
                {adminRole?.role === 'super_admin' ? '⭐ Super Admin' : 'Admin'}
              </span>
            </span>
            {adminRole?.role === 'super_admin' && (
              <Link to="/admin/manage" className="hidden md:block text-xs font-bold border border-yellow-400 text-yellow-400 px-3 py-1.5 rounded-full hover:bg-yellow-400 hover:text-gray-900 transition-colors">
                👥 Manage Admins
              </Link>
            )}
            <button onClick={() => setShowChangePassword(true)} className="text-xs font-bold border border-blue-400 text-blue-400 px-3 py-1.5 rounded-full hover:bg-blue-400 hover:text-white transition-colors">
              🔑
            </button>
            <button onClick={handleSignOut} className="text-xs font-bold border border-red-400 text-red-400 px-3 py-1.5 rounded-full hover:bg-red-400 hover:text-white transition-colors">
              🚪
            </button>
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

        {/* Tabs — Dropdown on mobile, horizontal on desktop */}
        <div className="mb-8">
          {/* Mobile Dropdown */}
          <div className="md:hidden">
            <select
              value={activeTab}
              onChange={e => {
                setActiveTab(e.target.value)
                localStorage.setItem('adminActiveTab', e.target.value)
              }}
              className="w-full bg-gray-800 border-2 border-yellow-400 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none">
              {tabs.map(tab => (
                <option key={tab.id} value={tab.id}>{tab.label}</option>
              ))}
            </select>
          </div>
          {/* Desktop Tabs */}
          <div className="hidden md:flex gap-1 border-b border-gray-700 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => {
                setActiveTab(tab.id)
                localStorage.setItem('adminActiveTab', tab.id)
              }}
                className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-gray-400 hover:text-white'}`}>
                {tab.label}
              </button>
            ))}
          </div>
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