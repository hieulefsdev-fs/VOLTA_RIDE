import { Link } from 'react-router-dom';
import { Route, BatteryCharging, Gauge } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';

export default function VehicleCard({ vehicle }) {
  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="group neo-card overflow-hidden rounded-2xl border border-cyan-500/20 bg-white/[0.04] backdrop-blur-sm hover:border-cyan-400/50 hover:-translate-y-1.5 hover:shadow-[0_0_30px_rgba(0,191,255,0.15)] transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
        {vehicle.thumbnailUrl ? (
          <img
            src={vehicle.thumbnailUrl}
            alt={vehicle.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <Gauge size={48} />
          </div>
        )}
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-400/20 text-green-400 border border-green-400/30">
          {vehicle.status === 'AVAILABLE' ? 'Sẵn sàng' : vehicle.status}
        </span>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-bold text-lg mb-1">{vehicle.name}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{vehicle.description}</p>

        {/* Battery bar */}
        <div className="h-2.5 rounded-full bg-gray-700/50 mb-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-700 group-hover:w-[94%]"
            style={{ width: '22%' }}
          />
        </div>

        {/* Specs */}
        <div className="flex gap-4 mb-5 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Route size={16} className="text-green-400" />
            <b>{vehicle.rangeKm}km</b>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BatteryCharging size={16} className="text-cyan-400" />
            <b>{vehicle.batteryCapacity}V</b>
          </span>
          {vehicle.maxSpeed && (
            <span className="inline-flex items-center gap-1.5">
              <Gauge size={16} className="text-purple-400" />
              <b>{vehicle.maxSpeed}km/h</b>
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-cyan-400">
            {formatPrice(vehicle.pricePerDay)}<span className="text-gray-500 text-xs">/ngày</span>
          </span>
          <span className="text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-cyan-400 text-gray-900 group-hover:shadow-lg transition">
            Thuê ngay
          </span>
        </div>
      </div>
    </Link>
  );
}
