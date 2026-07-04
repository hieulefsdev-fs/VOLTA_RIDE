import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-cyan-500/20 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-cyan-400" />
          <span className="font-mono font-bold">VOLTA Ride</span>
        </div>
        <span className="text-sm text-gray-500">
          © 2026 VOLTA Ride — Cho thuê xe máy điện cao cấp tại Đà Nẵng
        </span>
      </div>
    </footer>
  );
}
