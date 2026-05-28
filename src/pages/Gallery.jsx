import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function Gallery() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchPhotos() }, [])

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from('gallery').select('*')
      .order('created_at', { ascending: false })
    setPhotos(data || [])
    setLoading(false)
  }

  const years = ['all', ...new Set(photos.map(p => p.year))].filter(Boolean)

  const filtered = filter === 'all'
    ? photos
    : photos.filter(p => String(p.year) === String(filter))

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-3">
          GALERI <span className="text-yellow-400">/ GALLERY</span>
        </h1>
        <p className="text-gray-400">Momen terbaik dari setiap perlombaan · Best moments from every race</p>
      </div>

      {/* Year Filter */}
      {years.length > 1 && (
        <div className="flex gap-2 mb-8 justify-center flex-wrap">
          {years.map(year => (
            <button key={year} onClick={() => setFilter(year)}
              className={`px-5 py-2 rounded-full text-sm font-bold border-2 transition-colors ${
                filter === String(year)
                  ? 'bg-yellow-400 text-gray-900 border-yellow-400'
                  : 'border-gray-600 text-gray-400 hover:border-yellow-400'
              }`}>
              {year === 'all' ? '📸 All Years' : `🏆 ${year}`}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-yellow-400 animate-pulse font-bold text-lg">
          Loading gallery...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📸</div>
          <h2 className="text-2xl font-black text-white mb-3">Belum Ada Foto</h2>
          <p className="text-gray-400">
            Foto akan ditambahkan setelah perlombaan.<br />
            Photos will be added after the race.
          </p>
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-6 text-center">{filtered.length} photos</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(photo => (
              <div key={photo.id}
                onClick={() => setSelected(photo)}
                className="group cursor-pointer rounded-2xl overflow-hidden border-2 border-gray-700 hover:border-yellow-400 transition-all hover:scale-105">
                <div className="aspect-square relative overflow-hidden bg-gray-800">
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={e => { e.target.src = 'https://placehold.co/400x400/1f2937/facc15?text=📸' }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-800">
                  <p className="text-white font-bold text-sm truncate">{photo.title}</p>
                  {photo.event_name && (
                    <p className="text-gray-400 text-xs truncate">{photo.event_name}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <img
              src={selected.image_url}
              alt={selected.title}
              className="w-full max-h-[70vh] object-contain rounded-2xl"
              onError={e => { e.target.src = 'https://placehold.co/800x600/1f2937/facc15?text=📸' }}
            />
            <div className="mt-4 flex justify-between items-center">
              <div>
                <p className="text-white font-black text-lg">{selected.title}</p>
                {selected.event_name && (
                  <p className="text-gray-400 text-sm">{selected.event_name} · {selected.year}</p>
                )}
              </div>
              <button onClick={() => setSelected(null)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-5 py-2 rounded-full transition-colors">
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery