function Classes() {
  const classes = [
    { id:'K1',  age:'2 tahun',     category:'Siput',       color:'bg-pink-500' },
    { id:'K2',  age:'2-3 tahun',   category:'Pro',         color:'bg-blue-500' },
    { id:'K3',  age:'2 tahun',     category:'¾ Wheel',     color:'bg-purple-500' },
    { id:'K4',  age:'3 tahun',     category:'Campuran',    color:'bg-orange-500' },
    { id:'K5',  age:'3-4 tahun',   category:'Pro',         color:'bg-blue-500' },
    { id:'K6',  age:'4 tahun',     category:'Pemula',      color:'bg-green-500' },
    { id:'K7',  age:'4-5 tahun',   category:'Pro',         color:'bg-blue-500' },
    { id:'K8',  age:'5 tahun',     category:'Boys/Girls',  color:'bg-cyan-500' },
    { id:'K9',  age:'5-6 tahun',   category:'Pro',         color:'bg-blue-500' },
    { id:'K10', age:'2-3 tahun',   category:'Rockie',      color:'bg-green-500' },
    { id:'K11', age:'4 tahun',     category:'Girls',       color:'bg-rose-500' },
    { id:'K12', age:'5 tahun',     category:'Girls',       color:'bg-rose-500' },
    { id:'K13', age:'6-7 tahun',   category:'Girls',       color:'bg-rose-500' },
    { id:'K14', age:'6 tahun',     category:'Campuran',    color:'bg-orange-500' },
    { id:'K15', age:'4-5 tahun',   category:'Rockie',      color:'bg-green-500' },
    { id:'K16', age:'7-8 tahun',   category:'Girls',       color:'bg-rose-500' },
    { id:'K17', age:'6-7 tahun',   category:'Pro',         color:'bg-blue-500' },
    { id:'K18', age:'7-8 tahun',   category:'Pro',         color:'bg-blue-500' },
    { id:'K19', age:'Semua Usia',  category:'FFA',         color:'bg-yellow-500' },
  ]

  const categoryColors = {
    'Pro':       'border-blue-500 text-blue-400',
    'Girls':     'border-rose-500 text-rose-400',
    'Rockie':    'border-green-500 text-green-400',
    'Campuran':  'border-orange-500 text-orange-400',
    'Siput':     'border-pink-500 text-pink-400',
    '¾ Wheel':   'border-purple-500 text-purple-400',
    'Pemula':    'border-green-400 text-green-300',
    'Boys/Girls':'border-cyan-500 text-cyan-400',
    'FFA':       'border-yellow-500 text-yellow-400',
  }

  const legend = [
    { category:'Pro',        color:'bg-blue-500',    desc:'Kompetitif / Competitive' },
    { category:'Girls',      color:'bg-rose-500',    desc:'Khusus perempuan / Girls only' },
    { category:'Rockie',     color:'bg-green-500',   desc:'Pemula / Beginner' },
    { category:'Campuran',   color:'bg-orange-500',  desc:'Campuran / Mixed' },
    { category:'Siput',      color:'bg-pink-500',    desc:'Paling kecil / Youngest' },
    { category:'¾ Wheel',    color:'bg-purple-500',  desc:'Roda ¾ / ¾ Wheel bike' },
    { category:'Pemula',     color:'bg-green-400',   desc:'Pemula / Beginner' },
    { category:'Boys/Girls', color:'bg-cyan-500',    desc:'Putra & Putri / Both genders' },
    { category:'FFA',        color:'bg-yellow-500',  desc:'Free For All' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-3">
          KELAS <span className="text-yellow-400">LOMBA</span>
        </h1>
        <p className="text-gray-400">Race Classes · 19 Kategori · Usia 2-8 Tahun</p>
      </div>

      {/* Legend */}
      <div className="bg-gray-800 rounded-2xl p-6 mb-10 border border-gray-700">
        <h3 className="font-bold text-yellow-400 mb-4 text-sm tracking-widest">KATEGORI / CATEGORIES</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {legend.map(({ category, color, desc }) => (
            <div key={category} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${color} flex-shrink-0`}></div>
              <div>
                <p className="text-white text-xs font-bold">{category}</p>
                <p className="text-gray-400 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {classes.map(({ id, age, category }) => (
          <div key={id}
            className={`bg-gray-800 rounded-2xl p-5 border-2 ${categoryColors[category]} hover:scale-105 transition-transform`}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-2xl font-black text-white">{id}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full border ${categoryColors[category]}`}>
                {category}
              </span>
            </div>
            <p className="text-gray-300 text-sm font-semibold">{age}</p>
            <p className="text-gray-500 text-xs mt-1">
              {category === 'Girls' ? '👧 Perempuan saja' :
               category === 'Rockie' ? '🌱 Pemula' :
               category === 'FFA' ? '🏁 Free For All' :
               category === 'Siput' ? '🐌 Mini Riders' :
               category === '¾ Wheel' ? '🛞 ¾ Wheel' :
               category === 'Campuran' ? '🔀 Mix' :
               category === 'Pemula' ? '🌱 Pemula' :
               category === 'Boys/Girls' ? '👦👧 Both' : '🏆 Pro'}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-yellow-400/10 border border-yellow-400 rounded-2xl p-6 text-center">
        <p className="text-yellow-400 font-bold">⚠️ Catatan / Note</p>
        <p className="text-gray-300 text-sm mt-2">
          Peserta hanya dapat mendaftar di kelas yang sesuai dengan usia mereka.<br/>
          Participants may only register in classes matching their age group.
        </p>
      </div>
    </div>
  )
}

export default Classes