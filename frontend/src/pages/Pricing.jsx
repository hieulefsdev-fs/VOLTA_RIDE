import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Gói Ngày',
    price: '149.000đ',
    period: '/ngày',
    features: ['Thuê xe tối đa 24 giờ', 'Bảo hiểm cơ bản', 'Hỗ trợ cứu hộ'],
    featured: false,
  },
  {
    name: 'Gói Tuần',
    price: '890.000đ',
    period: '/tuần',
    badge: 'Phổ biến nhất',
    features: ['Thuê xe 7 ngày liên tục', 'Bảo hiểm toàn diện', 'Đổi pin miễn phí không giới hạn'],
    featured: true,
  },
  {
    name: 'Gói Tháng',
    price: '2.990.000đ',
    period: '/tháng',
    features: ['Thuê xe 30 ngày', 'Bảo hiểm premium', 'Ưu tiên đổi xe khi bảo trì'],
    featured: false,
  },
];

export default function Pricing() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold mb-3">Bảng giá thuê xe</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Giá đã bao gồm bảo hiểm và hỗ trợ cứu hộ. Không phát sinh chi phí ẩn.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`p-7 rounded-3xl flex flex-col backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${
              plan.featured
                ? 'bg-white/[0.08] border-2 border-cyan-400 shadow-[0_0_40px_rgba(0,191,255,0.15)]'
                : 'bg-white/[0.04] border border-cyan-500/20'
            }`}
          >
            {plan.badge && (
              <span className="self-start mb-3 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-400 to-cyan-400 text-gray-900">
                {plan.badge}
              </span>
            )}
            <h3 className="font-bold text-xl mb-2">{plan.name}</h3>
            <div className="flex items-end gap-1 mb-1">
              <span className="font-mono font-bold text-4xl">{plan.price}</span>
              <span className="text-gray-400 text-sm mb-1">{plan.period}</span>
            </div>
            <ul className="mt-5 space-y-3 text-sm flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check size={18} className="text-green-400 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/vehicles"
              className={`mt-6 text-center px-5 py-3 rounded-xl font-semibold transition ${
                plan.featured
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-purple-500/25'
                  : 'border border-cyan-500/30 text-gray-300 hover:bg-white/5'
              }`}
            >
              Chọn gói này
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
