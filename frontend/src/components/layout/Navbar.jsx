import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { pathname } = useLocation();

  const links = [
    { to: '/', label: 'Trang chủ' },
    { to: '/vehicles', label: 'Xe điện' },
    { to: '/pricing', label: 'Bảng giá' },
  ];

  if (isAuthenticated) {
    links.push({ to: '/my-bookings', label: 'Đơn thuê' });
    if (user?.role === 'ADMIN') links.push({ to: '/admin', label: 'Admin' });
    if (user?.role === 'ADMIN') {
      links.push({ to: '/admin', label: 'Admin' });
    }
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/70 border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-cyan-400 grid place-items-center">
            <Zap size={20} className="text-gray-900" />
          </span>
          <span className="font-mono font-bold text-lg">VOLTA Ride</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.to} to={l.to}
              className={`text-sm transition-colors ${pathname === l.to ? 'text-cyan-400 font-semibold' : 'text-gray-300 hover:text-white'}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-cyan-400">{user?.fullName}</span>
              <button onClick={logout} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-300 hover:text-white transition">{'Đăng nhập'}</Link>
              <Link to="/register"
                className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-400 to-cyan-400 text-gray-900 hover:shadow-lg hover:shadow-cyan-500/25 transition">
                {'Đăng ký'}
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-300">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-cyan-500/20 bg-gray-950/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className="block text-sm text-gray-300 hover:text-white py-2">{l.label}</Link>
            ))}
            {!isAuthenticated && (
              <div className="pt-3 border-t border-gray-800 flex gap-3">
                <Link to="/login" onClick={() => setOpen(false)}
                  className="flex-1 text-center text-sm py-2.5 rounded-xl border border-cyan-500/30 text-gray-300">{'Đăng nhập'}</Link>
                <Link to="/register" onClick={() => setOpen(false)}
                  className="flex-1 text-center text-sm py-2.5 rounded-xl bg-gradient-to-r from-green-400 to-cyan-400 text-gray-900 font-semibold">{'Đăng ký'}</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}