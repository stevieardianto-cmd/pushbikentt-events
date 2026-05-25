function Results() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <div className="text-6xl mb-6">🏆</div>
      <h1 className="text-4xl font-black mb-3">HASIL <span className="text-yellow-400">/ RESULTS</span></h1>
      <p className="text-gray-400 mb-8">Hasil perlombaan akan ditampilkan pada hari lomba.<br/>Race results will be shown on race day.</p>
      <div className="bg-yellow-400/10 border border-yellow-400 rounded-2xl p-6">
        <p className="text-yellow-400 font-bold">🏁 Race Day Feature</p>
        <p className="text-gray-300 text-sm mt-2">Live results tersedia saat perlombaan berlangsung.<br/>Live results available on race day.</p>
      </div>
    </div>
  )
}
export default Results