import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.register(form);
      const data = res.data.data;
      setAuth(
        { id: data.userId, fullName: data.fullName, email: data.email, role: data.role },
        data.accessToken
      );
      toast.success('Đăng ký thành công!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'fullName', label: 'Họ và tên', type: 'text', icon: User, placeholder: 'Nguyễn Văn A', required: true },
    { name: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'email@example.com', required: true },
    { name: 'phone', label: 'Số điện thoại', type: 'tel', icon: Phone, placeholder: '0901234567' },
    { name: 'password', label: 'Mật khẩu', type: 'password', icon: Lock, placeholder: '••••••••', required: true },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/[0.04] border border-cyan-500/20 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-cyan-400 grid place-items-center mx-auto mb-4">
            <Zap size={28} className="text-gray-900" />
          </div>
          <h1 className="text-2xl font-bold">Tạo tài khoản</h1>
          <p className="text-gray-400 text-sm mt-1">Tham gia VOLTA Ride ngay hôm nay</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="text-sm text-gray-400 mb-1.5 block">{f.label}</label>
              <div className="relative">
                <f.icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={f.type}
                  required={f.required}
                  value={form[f.name]}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-cyan-500/20 text-sm focus:outline-none focus:border-cyan-400 transition"
                  placeholder={f.placeholder}
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-purple-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Đăng ký
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
