import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, LifeBuoy, MapPin, ChevronRight, BatteryCharging, Route } from 'lucide-react';
import VehicleCard from '../components/vehicle/VehicleCard';
import { vehicleService } from '../services/vehicleService';

export default function Home() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    vehicleService.getAll({ size: 3 }).then((res) => {
      setVehicles(res.data.data?.content || []);
    }).catch(() => {});
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32 relative">
          <div className="max-w-2xl">
            <span className="inline-block mb-5 px-4 py-1.5 rounded-full text-xs font-semibold border border-cyan-500/30 text-cyan-400 bg-cyan-500/10">
              ⚡ Xe điện — Tương lai di chuyển
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                Vi vu phố phường
              </span>
              <br />
              bằng xe máy điện
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-lg">
              Thuê xe máy điện cao cấp chỉ từ 79.000đ/ngày. Xe sạc đầy pin, bảo hiểm toàn diện, cứu hộ 24/7.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/vehicles"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:shadow-xl hover:shadow-purple-500/25 transition-all"
              >
                Xem xe ngay <ChevronRight size={18} />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold border border-cyan-500/30 text-gray-300 hover:bg-white/5 transition"
              >
                Bảng giá
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 border-y border-cyan-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-3 gap-4 text-center">
          {[
            { num: '500+', label: 'Khách hàng tin tưởng' },
            { num: '50+', label: 'Xe luôn sẵn sàng' },
            { num: '24/7', label: 'Hỗ trợ cứu hộ' },
          ].map((s) => (
            <div key={s.label} className="p-6 rounded-2xl bg-white/[0.04] border border-cyan-500/10">
              <div className="font-mono font-bold text-3xl bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                {s.num}
              </div>
              <div className="text-gray-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED VEHICLES */}
      {vehicles.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold mb-3">Dòng xe nổi bật</h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Đa dạng mẫu xe từ city bike đến sport — luôn sạc đầy, sẵn sàng lăn bánh.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                to="/vehicles"
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold transition"
              >
                Xem tất cả xe <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* SERVICES */}
      <section className="py-16 md:py-20 border-t border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold text-center mb-12">Dịch vụ đi kèm</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: LifeBuoy, title: 'Cứu hộ 24/7', desc: 'Hết pin giữa đường? Một cuộc gọi, đội cứu hộ có mặt trong 30 phút.', color: 'from-green-400 to-cyan-400' },
              { icon: Shield, title: 'Bảo hiểm toàn diện', desc: 'Mọi chuyến đi đều được bảo hiểm tai nạn và hỏng xe. An tâm tuyệt đối.', color: 'from-purple-500 to-cyan-400' },
              { icon: MapPin, title: 'Trạm đổi pin', desc: '20+ trạm đổi pin khắp thành phố. Đổi pin chỉ 2 phút, tiếp tục hành trình.', color: 'from-cyan-400 to-blue-500' },
            ].map((s) => (
              <div key={s.title} className="p-6 rounded-2xl border border-cyan-500/20 bg-white/[0.04] hover:-translate-y-1 transition-all duration-300">
                <span className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} grid place-items-center mb-4`}>
                  <s.icon size={24} className="text-gray-900" />
                </span>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
