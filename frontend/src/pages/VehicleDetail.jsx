import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BatteryCharging, Route, Gauge, Calendar, Clock, ArrowLeft, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { vehicleService } from '../services/vehicleService';
import { bookingService } from '../services/bookingService';
import { formatPrice } from '../utils/formatPrice';
import useAuthStore from '../store/authStore';

const pickupLocations = [
  'Đà Nẵng - 54 Nguyễn Văn Linh',
  'Đà Nẵng - 2 Trần Phú (Bờ biển Mỹ Khê)',
  'Đà Nẵng - 99 Hùng Vương',
  'Đà Nẵng - 300 Điện Biên Phủ',
  'Đà Nẵng - Sân bay quốc tế',
  'Hội An - 10 Trần Hưng Đạo',
];

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const storeAuth = useAuthStore();
  const lsUser = JSON.parse(localStorage.getItem('user') || 'null');
  const lsToken = localStorage.getItem('accessToken');
  const rawUser = storeAuth.user || lsUser;
  const user = rawUser ? { ...rawUser, id: rawUser.id || rawUser.userId } : null;
  const isAuthenticated = storeAuth.isAuthenticated || !!lsUser;
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(pickupLocations[0]);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const toDateStr = (d) => d.toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(toDateStr(today));
  const [startHour, setStartHour] = useState('09:00');
  const [endDate, setEndDate] = useState(toDateStr(tomorrow));
  const [endHour, setEndHour] = useState('09:00');

  useEffect(() => {
    vehicleService.getById(id)
      .then((res) => setVehicle(res.data.data || res.data))
      .catch(() => toast.error('Không tải được thông tin xe'))
      .finally(() => setLoading(false));
  }, [id]);

  const calcPrice = () => {
    if (!vehicle) return 0;
    const start = new Date(startDate + 'T' + startHour);
    const end = new Date(endDate + 'T' + endHour);
    const hours = Math.max(1, Math.floor((end - start) / 3600000));
    if (hours >= 24 && vehicle.pricePerDay) {
      const days = Math.floor(hours / 24);
      const rem = hours % 24;
      return days * vehicle.pricePerDay + rem * vehicle.pricePerHour;
    }
    return hours * vehicle.pricePerHour;
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập trước khi đặt xe!');
      navigate('/login');
      return;
    }
    const startTime = startDate + 'T' + startHour + ':00';
    const endTime = endDate + 'T' + endHour + ':00';
    if (new Date(endTime) <= new Date(startTime)) {
      toast.error('Thời gian trả phải sau thời gian thuê!');
      return;
    }
    setSubmitting(true);
    try {
      await bookingService.create(user.id, {
        vehicleId: Number(id),
        startTime,
        endTime,
      });
      toast.success('Đặt xe thành công!');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt xe thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="h-80 rounded-2xl bg-white/[0.04] animate-pulse" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">
        Không tìm thấy xe.
      </div>
    );
  }

  const hourOptions = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
        <ArrowLeft size={18} /> Quay lại
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="rounded-2xl overflow-hidden border border-cyan-500/20 mb-6">
            {vehicle.thumbnailUrl ? (
              <img src={vehicle.thumbnailUrl} alt={vehicle.name} className="w-full h-72 object-cover" />
            ) : (
              <div className="w-full h-72 bg-gray-800 flex items-center justify-center"><Gauge size={64} className="text-gray-600" /></div>
            )}
          </div>

          <h1 className="text-3xl font-extrabold mb-2">{vehicle.name}</h1>
          <p className="text-gray-400 mb-4">{vehicle.brand} - {vehicle.model}</p>
          <p className="text-gray-300 text-sm mb-6">{vehicle.description}</p>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-cyan-500/20">
              <Route size={18} className="text-green-400" />
              <span className="text-sm font-semibold">{vehicle.rangeKm} km</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-cyan-500/20">
              <BatteryCharging size={18} className="text-cyan-400" />
              <span className="text-sm font-semibold">{vehicle.batteryCapacity}V</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-cyan-500/20">
              <Gauge size={18} className="text-purple-400" />
              <span className="text-sm font-semibold">{vehicle.maxSpeed} km/h</span>
            </div>
          </div>

          <div className="flex gap-6">
            <div>
              <span className="text-xs text-gray-500">Giá theo giờ</span>
              <p className="font-mono font-bold text-cyan-400">{formatPrice(vehicle.pricePerHour)}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Giá theo ngày</span>
              <p className="font-mono font-bold text-green-400">{formatPrice(vehicle.pricePerDay)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-white/[0.04] backdrop-blur-sm p-6">
          <h2 className="text-xl font-bold mb-6">Đặt xe</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Điểm nhận xe</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <select value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-cyan-500/20 text-sm focus:outline-none focus:border-cyan-400 appearance-none text-gray-100" style={{backgroundColor:'#0d1117'}}>
                  {pickupLocations.map((loc) => <option key={loc} value={loc} className="bg-gray-900 text-gray-100">{loc}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Ngày thuê</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/[0.06] border border-cyan-500/20 text-sm focus:outline-none focus:border-cyan-400" />
                </div>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <select value={startHour} onChange={(e) => setStartHour(e.target.value)}
                    className="pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-cyan-500/20 text-sm focus:outline-none focus:border-cyan-400 appearance-none text-gray-100" style={{backgroundColor:'#0d1117'}}>
                    {hourOptions.map((h) => <option key={h} value={h} className="bg-gray-900 text-gray-100">{h}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Ngày trả</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/[0.06] border border-cyan-500/20 text-sm focus:outline-none focus:border-cyan-400" />
                </div>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <select value={endHour} onChange={(e) => setEndHour(e.target.value)}
                    className="pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-cyan-500/20 text-sm focus:outline-none focus:border-cyan-400 appearance-none text-gray-100" style={{backgroundColor:'#0d1117'}}>
                    {hourOptions.map((h) => <option key={h} value={h} className="bg-gray-900 text-gray-100">{h}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Xe</span>
                <span className="font-semibold">{vehicle.name}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Điểm nhận</span>
                <span className="font-semibold text-right text-xs max-w-[200px]">{pickupLocation}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Thời gian</span>
                <span className="font-semibold">
                  {startDate} {startHour} - {endDate} {endHour}
                </span>
              </div>
              <div className="flex justify-between text-lg mt-4 pt-4 border-t border-gray-800">
                <span className="font-bold">Tổng tiền</span>
                <span className="font-mono font-extrabold text-cyan-400">{formatPrice(calcPrice())}</span>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-semibold text-gray-900 bg-gradient-to-r from-green-400 to-cyan-400 hover:shadow-lg hover:shadow-cyan-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Đang xử lý...' : 'Đặt xe ngay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}