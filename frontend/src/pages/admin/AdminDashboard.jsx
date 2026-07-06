import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Users, ShoppingCart, DollarSign, TrendingUp, Clock, Download, FileText, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import useAuthStore from '../../store/authStore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const PIE_COLORS = ['#facc15','#4ade80','#22d3ee','#a78bfa','#f87171'];
const statusVN = { PENDING_PAYMENT:'Chờ TT', PAID:'Đã TT', RENTING:'Đang thuê', RETURNED:'Đã trả', CANCELLED:'Hủy' };

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState('month');
  const [reportData, setReportData] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const fetchReport = (period) => {
    setReportPeriod(period);
    api.get('/admin/report?period=' + period).then(r => setReportData(r.data.data)).catch(()=>{});
  };

  useEffect(() => { fetchReport('month'); }, []);
  useEffect(() => { api.get('/admin/reviews').then(r => setReviews(r.data.data || [])).catch(()=>{}); }, []);

  const deleteReview = async (id) => {
    if (!confirm('Xóa đánh giá này?')) return;
    await api.delete('/admin/reviews/' + id);
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const exportExcel = () => {
    if (!reportData?.bookings?.length) return;
    const rows = reportData.bookings.map(b => ({
      'Ma đơn': b.id,
      'Khách hàng': b.full_name,
      'Email': b.email,
      'Xe': b.vehicle_name,
      'Ngày đặt': new Date(b.created_at).toLocaleString('vi-VN'),
      'Bắt đầu': b.start_time ? new Date(b.start_time).toLocaleString('vi-VN') : '',
      'Kết thúc': b.end_time ? new Date(b.end_time).toLocaleString('vi-VN') : '',
      'Trạng thái': statusVN[b.status] || b.status,
      'Số tiền': b.total_price,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bao cao');
    const buf = XLSX.write(wb, { bookType:'xlsx', type:'array' });
    saveAs(new Blob([buf]), 'volta-ride-report-' + reportPeriod + '.xlsx');
  };

  const exportInvoicePDF = (booking) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('VOLTA Ride - Hóa đơn thuê xe', 14, 22);
    doc.setFontSize(11);
    doc.text('Mã đơn: #' + booking.id, 14, 35);
    doc.text('Ngày tạo: ' + new Date(booking.created_at).toLocaleString('vi-VN'), 14, 42);
    doc.text('Khách hàng: ' + booking.full_name, 14, 52);
    doc.text('Email: ' + booking.email, 14, 59);
    autoTable(doc, {
      startY: 68,
      head: [['Xe', 'Bắt đầu', 'Kết thúc', 'Trạng thái', 'Thành tiền']],
      body: [[
        booking.vehicle_name,
        booking.start_time ? new Date(booking.start_time).toLocaleString('vi-VN') : '',
        booking.end_time ? new Date(booking.end_time).toLocaleString('vi-VN') : '',
        statusVN[booking.status] || booking.status,
        new Intl.NumberFormat('vi-VN').format(booking.total_price) + ' VND',
      ]],
    });
    doc.setFontSize(9);
    doc.text('VOLTA Ride - Cho thuê xe máy điện cao cấp tại Đà Nẵng', 14, doc.lastAutoTable.finalY + 15);
    doc.save('hoa-don-' + booking.id + '.pdf');
  };

  if (user?.role !== 'ADMIN') {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center"><p className="text-red-400 font-bold">Không có quyền truy cập.</p><Link to="/" className="text-cyan-400">Về trang chủ</Link></div>;
  }

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-10"><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="h-28 rounded-2xl bg-white/[0.04] animate-pulse"/>)}</div></div>;
  if (!stats) return null;

  const cards = [
    { icon: Car, label: 'Tổng xe', value: stats.totalVehicles, sub: stats.availableVehicles + ' sẵn sàng', color: 'from-cyan-400 to-blue-500' },
    { icon: Users, label: 'Người dùng', value: stats.totalUsers, sub: 'Tài khoản', color: 'from-purple-400 to-pink-500' },
    { icon: ShoppingCart, label: 'Tong đơn', value: stats.totalBookings, sub: stats.paidBookings + ' đã thanh toán', color: 'from-green-400 to-emerald-500' },
    { icon: DollarSign, label: 'Doanh thu', value: formatPrice(stats.totalRevenue), sub: 'Từ đơn đã TT', color: 'from-yellow-400 to-orange-500' },
  ];

  const revenueChart = (stats.revenueByDay || []).slice().reverse().map(r => ({
    date: new Date(r.date).toLocaleDateString('vi-VN', {day:'2-digit',month:'2-digit'}),
    revenue: Number(r.revenue),
    count: Number(r.count),
  }));

  const pieData = (stats.bookingsByStatus || []).map(s => ({
    name: statusVN[s.status] || s.status,
    value: Number(s.count),
  }));

  const formatDT = (dt) => { if(!dt) return ''; const d=new Date(dt); return d.toLocaleDateString('vi-VN')+' '+d.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}); };
  const periods = [{k:'day',l:'Hôm nay'},{k:'week',l:'Tuần này'},{k:'month',l:'Tháng này'},{k:'year',l:'Năm nay'}];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold mb-8">Dashboard Admin</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map(c=>(
          <div key={c.label} className="rounded-2xl border border-cyan-500/20 bg-white/[0.04] backdrop-blur-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={"w-10 h-10 rounded-xl bg-gradient-to-br "+c.color+" grid place-items-center"}><c.icon size={20} className="text-white"/></div>
              <span className="text-sm text-gray-400">{c.label}</span>
            </div>
            <p className="text-2xl font-mono font-bold">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-10">
        <div className="rounded-2xl border border-cyan-500/20 bg-white/[0.04] p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-green-400"/> Doanh thu 30 ngày</h2>
          {revenueChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                <XAxis dataKey="date" tick={{fill:'#94a3b8',fontSize:11}}/>
                <YAxis tick={{fill:'#94a3b8',fontSize:11}} tickFormatter={v=>v>=1000?(v/1000)+'K':v}/>
                <Tooltip contentStyle={{background:'#0f172a',border:'1px solid #22d3ee',borderRadius:12}} formatter={(v)=>[formatPrice(v),'Doanh thu']}/>
                <Bar dataKey="revenue" fill="#22d3ee" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-sm">Chưa có dữ liệu</p>}
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-white/[0.04] p-6">
          <h2 className="font-bold text-lg mb-4">Trạng thái đơn</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({name,percent})=>name+' '+Math.round(percent*100)+'%'}>
                  {pieData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={{background:'#0f172a',border:'1px solid #22d3ee',borderRadius:12}}/>
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-sm">Chưa có dữ liệu</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-white/[0.04] p-6 mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2"><FileText size={20} className="text-cyan-400"/> Báo cáo & Xuất file</h2>
          <div className="flex gap-2 flex-wrap">
            {periods.map(p=>(
              <button key={p.k} onClick={()=>fetchReport(p.k)}
                className={"px-3 py-1.5 rounded-lg text-sm font-medium transition "+(reportPeriod===p.k?'bg-cyan-500 text-gray-900':'bg-white/[0.06] text-gray-400 hover:bg-white/10')}>
                {p.l}
              </button>
            ))}
            <button onClick={exportExcel} className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-500/20 text-green-400 hover:bg-green-500/30 flex items-center gap-1">
              <Download size={14}/> Excel
            </button>
          </div>
        </div>
        {reportData && (
          <div className="mb-3 flex gap-6 text-sm">
            <span className="text-gray-400">Tổng đơn: <b className="text-white">{reportData.totalBookings}</b></span>
            <span className="text-gray-400">Doanh thu: <b className="text-green-400">{formatPrice(reportData.totalRevenue)}</b></span>
          </div>
        )}
        {reportData?.bookings?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-800 text-gray-500">
                <th className="py-2 text-left">#</th><th className="py-2 text-left">Khách hàng</th><th className="py-2 text-left">Xe</th>
                <th className="py-2 text-left">Ngay</th><th className="py-2 text-left">Trạng thái</th><th className="py-2 text-right">Số tiền</th><th className="py-2"></th>
              </tr></thead>
              <tbody>
                {reportData.bookings.map(b=>{
                  const st=statusVN[b.status]||b.status;
                  return (
                    <tr key={b.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                      <td className="py-2 text-gray-500">{b.id}</td>
                      <td className="py-2 text-gray-200">{b.full_name}</td>
                      <td className="py-2 text-gray-200">{b.vehicle_name}</td>
                      <td className="py-2 text-gray-400">{formatDT(b.created_at)}</td>
                      <td className="py-2"><span className={"px-2 py-0.5 rounded-full text-xs font-semibold "+(b.status==='PAID'?'bg-green-400/10 text-green-400':b.status==='CANCELLED'?'bg-red-400/10 text-red-400':'bg-yellow-400/10 text-yellow-400')}>{st}</span></td>
                      <td className="py-2 text-right font-mono text-cyan-400">{formatPrice(b.total_price)}</td>
                      <td className="py-2 text-right">
                        <button onClick={()=>exportInvoicePDF(b)} className="text-xs text-purple-400 hover:text-purple-300" title="Xuất hóa đơn PDF">
                          <FileText size={14}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <p className="text-gray-500 text-sm">Không có đơn trong kỳ này</p>}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-cyan-500/20 bg-white/[0.04] p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-green-400"/> Xe thuê nhiều nhất</h2>
          {stats.topVehicles?.length > 0 ? (
            <div className="space-y-3">
              {stats.topVehicles.map((v,i)=>(
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-bold grid place-items-center">{i+1}</span>
                    <span className="font-semibold">{v.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-400">{v.booking_count} don</span>
                    <p className="text-xs text-green-400 font-mono">{formatPrice(v.total_revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 text-sm">Chưa có dữ liệu</p>}
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-white/[0.04] p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Clock size={20} className="text-cyan-400"/> Đơn thuê gần đây</h2>
          {stats.recentBookings?.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {stats.recentBookings.map(b=>(
                <div key={b.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <span className="font-semibold text-sm">{b.vehicle_name}</span>
                    <p className="text-xs text-gray-500">{b.full_name} · {formatDT(b.created_at)}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className={"px-2 py-0.5 rounded-full text-xs font-semibold "+(b.status==='PAID'?'bg-green-400/10 text-green-400':b.status==='CANCELLED'?'bg-red-400/10 text-red-400':'bg-yellow-400/10 text-yellow-400')}>{statusVN[b.status]||b.status}</span>
                    <span className="text-xs font-mono text-cyan-400">{formatPrice(b.total_price)}</span>
                    <button onClick={()=>exportInvoicePDF(b)} className="text-purple-400 hover:text-purple-300" title="Xuất hóa đơn"><FileText size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 text-sm">Chưa có đơn nào</p>}
        </div>
      </div>
      <div className="rounded-2xl border border-cyan-500/20 bg-white/[0.04] p-6 mt-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Star size={20} className="text-yellow-400"/> Đánh giá từ khách hàng ({reviews.length})
        </h2>
        {reviews.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {reviews.map(r => (
              <div key={r.id} className="flex items-start justify-between py-3 border-b border-gray-800 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{r.userName}</span>
                    <span className="text-gray-500 text-xs">→ {r.vehicleName}</span>
                    <span className="text-gray-600 text-xs">Đơn #{r.bookingId}</span>
                  </div>
                  <div className="flex gap-0.5 mb-1">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={s <= r.rating ? 'text-yellow-400' : 'text-gray-700'}>★</span>
                    ))}
                  </div>
                  {r.comment && <p className="text-sm text-gray-300">{r.comment}</p>}
                  <span className="text-xs text-gray-600">{new Date(r.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <button onClick={() => deleteReview(r.id)} className="text-red-400 hover:text-red-300 text-xs px-2 py-1">Xóa</button>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 text-sm">Chưa có đánh giá nào</p>}
      </div>
    </div>
  );
}