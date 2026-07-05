import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Phone, Loader2, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
        phone: form.phone.trim() || undefined,
      });
      await api.post('/auth/otp/send', { email: form.email.trim() });
      toast.success('Đã gửi mã OTP về email');
      setStep('otp');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) { toast.error('Vui lòng nhập mã OTP'); return; }
    setLoading(true);
    try {
      await api.post('/auth/otp/verify', { email: form.email.trim(), otp: otp.trim() });
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn');
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
            {step === 'form' ? <Zap size={28} className="text-gray-900" /> : <ShieldCheck size={28} className="text-gray-900" />}
          </div>
          <h1 className="text-2xl font-bold">{step === 'form' ? 'Tạo tài khoản' : 'Xác thực OTP'}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {step === 'form' ? 'Tham gia VOLTA Ride ngay hôm nay' : `Mã OTP đã gửi về ${form.email}`}
          </p>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleRegister} className="space-y-4">
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
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-green-400 to-cyan-400 text-gray-900 hover:shadow-lg hover:shadow-cyan-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 size={18} className="animate-spin" />}
              {'Đăng ký'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">{`Nhập mã OTP 6 số`}</label>
              <input
                type="text"
                maxLength="6"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full py-4 rounded-xl bg-white/[0.06] border border-cyan-500/20 text-2xl text-center tracking-[0.5em] focus:outline-none focus:border-cyan-400 transition"
                placeholder="------"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-green-400 to-cyan-400 text-gray-900 hover:shadow-lg hover:shadow-cyan-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 size={18} className="animate-spin" />}
              {`Xác nhận OTP`}
            </button>
            <button type="button" onClick={() => setStep('form')}
              className="w-full py-2 text-sm text-gray-400 hover:text-white transition">
              {'← Quay lại'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-400 mt-6">
          {'Đã có tài khoản? '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
            {'Đăng nhập'}
          </Link>
        </p>
      </div>
    </div>
  );
}