import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, XCircle, Wallet, Star } from 'lucide-react';
import { reviewService } from '../services/reviewService';
import toast from 'react-hot-toast';
import { bookingService } from '../services/bookingService';
import { formatPrice } from '../utils/formatPrice';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const statusMap = {
  PENDING_PAYMENT: { label: 'Chờ thanh toán', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
  PAID: { label: 'Đã thanh toán', color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  RENTING: { label: 'Đang thuê', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30' },
  RETURNED: { label: 'Đã trả', color: 'text-gray-400 bg-gray-400/10 border-gray-400/30' },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
};

export default function MyBookings() {
  const storeAuth = useAuthStore();
  const lsUser = JSON.parse(localStorage.getItem('user') || 'null');
  const lsToken = localStorage.getItem('accessToken');
  const rawUser = storeAuth.user || lsUser;
  const user = rawUser ? { ...rawUser, id: rawUser.id || rawUser.userId } : null;
  const isAuthenticated = storeAuth.isAuthenticated || !!lsUser;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewedIds, setReviewedIds] = useState([]);

  const fetchBookings = () => {
    if (!user) return;
    setLoading(true);
    bookingService.getMyBookings(user.id)
      .then((res) => setBookings(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchWallet = () => {
    if (!user) return;
    api.get('/wallet/me?email=' + user.email)
      .then((res) => setWalletBalance(res.data.walletBalance || 0))
      .catch(() => {});
  };

  useEffect(() => { fetchBookings(); fetchWallet(); }, [user?.id]);

  const handleReview = async () => {
    if (!reviewModal) return;
    try {
      await reviewService.create({ bookingId: reviewModal.id, rating: reviewRating, comment: reviewComment });
      toast.success('Cảm ơn bạn đã đánh giá!');
      setReviewedIds(prev => [...prev, reviewModal.id]);
      setReviewModal(null);
      setReviewRating(5);
      setReviewComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đánh giá thất bại');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Bạn có chắc muốn hủy đơn này?')) return;
    try {
      await bookingService.cancel(id, user.id);
      toast.success('Đã hủy đơn');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi');
    }
  };

  const handlePayWallet = async (booking) => {
    if (walletBalance < booking.totalPrice) {
      toast.error('Số dư ví không đủ. Vui lòng nạp thêm qua VNPay.');
      return;
    }
    try {
      await bookingService.payWallet(booking.id, user.id);
      toast.success('Thanh toán thành công!');
      fetchBookings();
      fetchWallet();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thanh toán thất bại');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Vui lòng đăng nhập.</p>
        <Link to="/login" className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-400 to-cyan-400 text-gray-900">
          Đăng nhập
        </Link>
      </div>
    );
  }

  const formatDT = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold">Đơn thuê của tôi</h1>
        <div className="text-right">
          <span className="text-xs text-gray-500">Số dư ví</span>
          <p className="font-mono font-bold text-green-400">{formatPrice(walletBalance)}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">Bạn chưa có đơn thuê nào.</p>
          <Link to="/vehicles" className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-400 to-cyan-400 text-gray-900">
            Thuê xe ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const st = statusMap[b.status] || statusMap.PENDING_PAYMENT;
            return (
              <div key={b.id} className="rounded-2xl border border-cyan-500/20 bg-white/[0.04] backdrop-blur-sm p-5 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{b.vehicleName}</h3>
                    <span className={"px-2.5 py-1 rounded-full text-xs font-semibold border " + st.color}>
                      {st.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} /> {formatDT(b.startTime)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} /> {formatDT(b.endTime)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{"Mã đơn: #" + b.id}</p>
                </div>
                <div className="flex flex-col items-end justify-between gap-2">
                  <span className="font-mono font-bold text-cyan-400 text-lg">{formatPrice(b.totalPrice)}</span>
                  {(b.status === 'PAID' || b.status === 'RETURNED') && !reviewedIds.includes(b.id) && (
                    <button onClick={() => setReviewModal(b)}
                      className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition">
                      <Star size={16} /> Đánh giá
                    </button>
                  )}
                  {b.status === 'PENDING_PAYMENT' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handlePayWallet(b)}
                        className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-cyan-400 text-gray-900 hover:shadow-lg transition"
                      >
                        <Wallet size={16} /> Trả bằng ví
                      </button>
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition"
                      >
                        <XCircle size={16} /> Hủy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {reviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-gray-900 border border-cyan-500/20">
            <h3 className="text-lg font-bold mb-1">Đánh giá xe</h3>
            <p className="text-sm text-gray-400 mb-4">{reviewModal.vehicleName} - Đơn #{reviewModal.id}</p>
            <div className="flex gap-2 mb-4">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setReviewRating(s)}
                  className={s <= reviewRating ? 'text-yellow-400' : 'text-gray-600'}>
                  <Star size={28} fill={s <= reviewRating ? '#facc15' : 'none'} />
                </button>
              ))}
            </div>
            <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)}
              placeholder="Nhận xét của bạn..." rows={3}
              className="w-full rounded-xl bg-white/[0.06] border border-cyan-500/20 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 mb-4" />
            <div className="flex gap-3">
              <button onClick={handleReview}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-green-400 to-cyan-400 text-gray-900">
                Gửi đánh giá
              </button>
              <button onClick={() => setReviewModal(null)}
                className="flex-1 py-2.5 rounded-xl font-semibold border border-gray-700 text-gray-400 hover:text-white">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}