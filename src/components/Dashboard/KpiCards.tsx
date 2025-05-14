export default function KpiCards() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Orders Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-gray-800">PEDIDO ATENDIDOS</h3>
            <p className="text-xs text-gray-500">HOY</p>
          </div>
          <div className="bg-purple-100 rounded-lg px-6 py-4">
            <span className="text-3xl font-bold text-purple-600">10</span>
          </div>
        </div>
      </div>
      
      {/* Revenue Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-gray-800">GANANCIAS</h3>
            <p className="text-xs text-gray-500">HOY</p>
          </div>
          <div className="bg-purple-100 rounded-lg px-6 py-4">
            <span className="text-3xl font-bold text-purple-600">$ 252.600</span>
          </div>
        </div>
      </div>
    </div>
  );
}