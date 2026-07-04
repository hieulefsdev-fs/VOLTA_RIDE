import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import VehicleCard from '../components/vehicle/VehicleCard';
import { vehicleService } from '../services/vehicleService';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    vehicleService.getCategories().then((res) => {
      setCategories(res.data.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    vehicleService
      .getAll({ page, size: 9, search: search || undefined, categoryId: categoryId || undefined, status: 'AVAILABLE' })
      .then((res) => {
        const data = res.data.data;
        setVehicles(data?.content || []);
        setTotalPages(data?.totalPages || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, categoryId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold mb-8">Tất cả xe điện</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Tìm xe theo tên, hãng..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-cyan-500/20 text-sm focus:outline-none focus:border-cyan-400 transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setCategoryId(null); setPage(0); }}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              !categoryId ? 'bg-cyan-500 text-gray-900' : 'bg-white/[0.06] border border-cyan-500/20 text-gray-300 hover:bg-white/10'
            }`}
          >
            Tất cả
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => { setCategoryId(c.id); setPage(0); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                categoryId === c.id ? 'bg-cyan-500 text-gray-900' : 'bg-white/[0.06] border border-cyan-500/20 text-gray-300 hover:bg-white/10'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl bg-white/[0.04] border border-cyan-500/10 h-96 animate-pulse" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          Không tìm thấy xe nào phù hợp.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-10 h-10 rounded-xl text-sm font-medium transition ${
                page === i ? 'bg-cyan-500 text-gray-900' : 'bg-white/[0.06] text-gray-400 hover:bg-white/10'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
