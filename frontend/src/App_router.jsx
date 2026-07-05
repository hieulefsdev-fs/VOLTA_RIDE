import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  BatteryCharging,
  Check,
  LifeBuoy,
  Moon,
  Route,
  ShieldCheck,
  Sun,
  Zap
} from 'lucide-react'

import AuthModal from './components/AuthModal.jsx'

const navItems = [
  { label: 'Trang chủ', href: '#top' },
  { label: 'Dòng xe', href: '#vehicles' },
  { label: 'Bảng giá', href: '#pricing' },
  { label: 'Dịch vụ', href: '#services' },
  { label: 'Giới thiệu', href: '#intro' }
]

const vehicles = [
  {
    name: 'Volt City S',
    spec: 'Nhẹ, linh hoạt, phù hợp đi học - đi làm trong nội thành.',
    range: '90 km',
    charge: '2.5 giờ',
    price: '149K/ngày',
    image:
      'https://images.unsplash.com/photo-1623238913973-21e45cced554?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Volt Premium X',
    spec: 'Thiết kế thể thao, phanh an toàn, cốp rộng và pin bền.',
    range: '120 km',
    charge: '3 giờ',
    price: '219K/ngày',
    image:
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Volt Touring Pro',
    spec: 'Dành cho chuyến đi dài, yên êm, vận hành ổn định.',
    range: '150 km',
    charge: '3.5 giờ',
    price: '299K/ngày',
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80'
  }
]

const pricePlans = [
  {
    name: 'Gói Ngày',
    amount: '149K',
    period: '/ngày',
    features: [
      'Nhận xe nhanh trong 15 phút',
      'Mũ bảo hiểm và sạc đi kèm',
      'Hỗ trợ kỹ thuật cơ bản'
    ],
    featured: false
  },
  {
    name: 'Gói Tuần',
    amount: '890K',
    period: '/tuần',
    features: [
      'Tiết kiệm hơn thuê từng ngày',
      'Cứu hộ 24/7 trong thành phố',
      'Đổi xe linh hoạt khi cần'
    ],
    featured: true
  },
  {
    name: 'Gói Tháng',
    amount: '2.990K',
    period: '/tháng',
    features: [
      'Phù hợp đi học hoặc đi làm',
      'Bảo dưỡng định kỳ miễn phí',
      'Ưu tiên xe đời mới'
    ],
    featured: false
  }
]

const stats = [
  { num: '1.2K+', label: 'khách hàng' },
  { num: '24/7', label: 'hỗ trợ' },
  { num: '40+', label: 'điểm đổi pin' }
]

function Header({ isDark, onToggleTheme, onOpenAuth }) {
  return (
    <header
      className="sticky top-0 z-40 w-full border-b backdrop-blur-md"
      style={{ borderColor: 'var(--border)', background: 'var(--glass)' }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href="#top" className="flex shrink-0 items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl gradient-btn">
            <Zap size={20} color="#0B0E11" />
          </span>
          <span className="mono text-lg font-bold">VOLTA Ride</span>
        </a>

        <nav aria-label="Điều hướng chính" className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-sm hover:opacity-70">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Chuyển chế độ sáng tối"
            onClick={onToggleTheme}
            className="grid h-10 w-10 place-items-center rounded-xl border"
            style={{ borderColor: 'var(--border)' }}
          >
            {isDark ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button
            type="button"
            onClick={() => onOpenAuth('login')}
            className="hidden rounded-xl border px-4 py-2 text-sm font-semibold sm:inline-flex"
            style={{ borderColor: 'var(--border)' }}
          >
            Đăng nhập
          </button>

          <button
            type="button"
            onClick={() => onOpenAuth('register')}
            className="cta-shine hidden rounded-xl px-4 py-2 text-sm font-semibold gradient-btn sm:inline-flex"
          >
            Đăng ký
          </button>

          <a
            href="#pricing"
            className="cta-shine hidden items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold gradient-btn lg:inline-flex"
          >
            Thuê ngay
          </a>
        </div>
      </div>
    </header>
  )
}

function Hero({ heroImgRef }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
        <div className="reveal">
          <span
            className="mb-5 inline-block rounded-full border px-4 py-1.5 text-xs font-semibold"
            style={{ borderColor: 'var(--border)' }}
          >
            Xe máy điện cao cấp - sạch, êm, tiết kiệm
          </span>

          <h1 className="glow mb-5 font-extrabold leading-tight">
            Vi vu phố phường với xe điện{' '}
            <span className="accent-grad">VOLTA Ride</span>
          </h1>

          <p className="dim mb-8 max-w-lg text-base md:text-lg">
            Thuê xe nhanh, nhận xe dễ, có cứu hộ 24/7 và trạm đổi pin phủ khắp thành phố.
            Phù hợp đi học, đi làm, du lịch ngắn ngày hoặc thuê dài hạn.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#pricing"
              className="cta-shine pulse inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold gradient-btn"
            >
              Xem bảng giá
            </a>

            <a
              href="#vehicles"
              className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 font-semibold"
              style={{ borderColor: 'var(--border)' }}
            >
              Chọn dòng xe
            </a>
          </div>
        </div>

        <div className="reveal relative">
          <div
            className="absolute -inset-6 rounded-[40px] opacity-40 blur-2xl"
            style={{ background: 'radial-gradient(circle,#00BFFF,transparent 70%)' }}
          />

          <img
            ref={heroImgRef}
            className="hero-img relative h-72 w-full rounded-[32px] border object-cover md:h-[26rem]"
            style={{ borderColor: 'var(--border)' }}
            loading="lazy"
            src="https://images.unsplash.com/photo-1609770231080-e321deccc34c?auto=format&fit=crop&w=1200&q=80"
            alt="Xe máy điện VOLTA Ride di chuyển trong thành phố"
          />
        </div>
      </div>
    </section>
  )
}

function VehiclesSection() {
  return (
    <section id="vehicles" className="w-full py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal mb-12 text-center">
          <h2 className="mb-3 font-extrabold">Dòng xe nổi bật</h2>
          <p className="dim mx-auto max-w-xl">
            Mỗi dòng xe được kiểm tra pin, phanh, lốp và hệ thống điện trước khi bàn giao cho khách.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <article key={vehicle.name} className="veh-card neo-card reveal overflow-hidden">
              <img
                className="h-48 w-full object-cover"
                src={vehicle.image}
                alt={vehicle.name}
                loading="lazy"
              />

              <div className="p-6">
                <h3 className="mb-1 font-bold">{vehicle.name}</h3>
                <p className="dim mb-4 text-sm">{vehicle.spec}</p>

                <div className="battery mb-4">
                  <div className="battery-fill" />
                </div>

                <div className="mb-5 flex gap-4 text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <Route size={16} color="#39FF14" />
                    <b>{vehicle.range}</b>
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <BatteryCharging size={16} color="#00BFFF" />
                    <b>{vehicle.charge}</b>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="mono font-bold">{vehicle.price}</span>

                  <a href="#pricing" className="rounded-lg px-4 py-2 text-sm font-semibold gradient-btn">
                    Đặt xe
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section id="pricing" className="w-full py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="reveal mb-12 text-center">
          <h2 className="mb-3 font-extrabold">Bảng giá linh hoạt</h2>
          <p className="dim mx-auto max-w-xl">
            Chọn gói thuê theo nhu cầu. Giá có thể điều chỉnh theo khu vực, dòng xe và thời điểm nhận xe.
          </p>
        </div>

        <div className="grid items-stretch gap-6 md:grid-cols-3">
          {pricePlans.map((plan) => (
            <div
              key={plan.name}
              className={`glass reveal flex flex-col p-7 ${plan.featured ? 'cta-shine border-2' : ''}`}
              style={plan.featured ? { borderColor: '#00BFFF' } : undefined}
            >
              {plan.featured && (
                <span className="mb-3 self-start rounded-full px-3 py-1 text-xs font-bold gradient-btn">
                  Phổ biến
                </span>
              )}

              <h3 className="mb-2 font-bold">{plan.name}</h3>

              <div className="mb-1 flex items-end gap-1">
                <span className="mono text-[2rem] font-bold">{plan.amount}</span>
                <span className="dim mb-1 text-sm">{plan.period}</span>
              </div>

              <ul className="mt-4 flex-1 space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check size={18} color="#39FF14" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#signup"
                className={`mt-6 rounded-xl px-5 py-3 text-center font-semibold ${
                  plan.featured ? 'gradient-btn' : 'border'
                }`}
                style={!plan.featured ? { borderColor: 'var(--glass-border)' } : undefined}
              >
                Chọn gói
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServicesSection() {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        duration: `${7 + Math.random() * 8}s`,
        delay: `${Math.random() * 8}s`,
        size: `${4 + Math.random() * 8}px`
      })),
    []
  )

  return (
    <section id="services" className="relative w-full overflow-hidden py-16 md:py-20">
      <div className="particles">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="particle"
            style={{
              left: particle.left,
              animationDuration: particle.duration,
              animationDelay: particle.delay,
              width: particle.size,
              height: particle.size
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal mb-12 text-center">
          <h2 className="mb-3 font-extrabold">Dịch vụ đi kèm</h2>
          <p className="dim mx-auto max-w-xl">
            Không chỉ cho thuê xe, VOLTA Ride còn hỗ trợ vận hành để chuyến đi của bạn an toàn hơn.
          </p>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="neo-card reveal flex gap-4 p-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl gradient-btn">
                <LifeBuoy size={24} color="#0B0E11" />
              </span>
              <div>
                <h3 className="mb-1 font-bold">Cứu hộ 24/7</h3>
                <p className="dim text-sm">
                  Hỗ trợ khi xe hết pin, thủng lốp hoặc gặp sự cố kỹ thuật trong khu vực phục vụ.
                </p>
              </div>
            </div>

            <div className="neo-card reveal flex gap-4 p-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl purple-btn">
                <ShieldCheck size={24} color="#ffffff" />
              </span>
              <div>
                <h3 className="mb-1 font-bold">Bảo hiểm toàn diện</h3>
                <p className="dim text-sm">
                  Quy trình thuê rõ ràng, hợp đồng minh bạch, hạn chế rủi ro khi sử dụng xe.
                </p>
              </div>
            </div>

            <img
              className="reveal h-52 w-full rounded-2xl border object-cover"
              style={{ borderColor: 'var(--border)' }}
              src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80"
              alt="Khu vực hỗ trợ khách hàng VOLTA Ride"
              loading="lazy"
            />
          </div>

          <div className="glass reveal relative overflow-hidden p-6" style={{ minHeight: '22rem' }}>
            <h3 className="mb-1 font-bold">Bản đồ trạm đổi pin</h3>
            <p className="dim mb-4 text-sm">
              Các điểm sáng mô phỏng vị trí hỗ trợ và đổi pin trong thành phố.
            </p>

            <div
              className="relative h-60 overflow-hidden rounded-2xl border"
              style={{
                borderColor: 'var(--border)',
                background:
                  'radial-gradient(circle at 30% 40%, rgba(0,191,255,.18), transparent 45%), radial-gradient(circle at 70% 65%, rgba(57,255,20,.18), transparent 45%), linear-gradient(135deg, rgba(124,58,237,.12), rgba(0,191,255,.06))'
              }}
            >
              <div className="station-dot" style={{ left: '28%', top: '34%' }} />
              <div className="station-dot" style={{ left: '64%', top: '58%', animationDelay: '.8s' }} />
              <div className="station-dot" style={{ left: '46%', top: '72%', animationDelay: '1.6s' }} />
              <div className="station-dot" style={{ left: '78%', top: '26%', animationDelay: '2.2s' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function IntroSection() {
  return (
    <section id="intro" className="w-full py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        <h2 className="reveal mb-4 font-extrabold">Vì sao chọn VOLTA Ride?</h2>
        <p className="dim reveal mx-auto mb-12 max-w-2xl">
          Chúng tôi xây dựng dịch vụ thuê xe điện theo hướng hiện đại: đặt nhanh, giao xe đúng hẹn,
          chi phí rõ ràng và thân thiện với môi trường.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="glass reveal p-6">
              <div className="accent-grad mono text-[2rem] font-bold">{stat.num}</div>
              <div className="dim mt-1 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SignupSection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      toast.error('Vui lòng nhập email')
      return
    }

    setLoading(true)

    try {
      const currentList = JSON.parse(localStorage.getItem('volta_signups') || '[]')

      localStorage.setItem(
        'volta_signups',
        JSON.stringify([
          ...currentList,
          {
            email: trimmedEmail,
            createdAt: new Date().toISOString()
          }
        ])
      )

      toast.success('Đã ghi nhận email tư vấn!')
      setEmail('')
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="signup" className="w-full border-t py-16 md:py-20" style={{ borderColor: 'var(--border)' }}>
      <div className="reveal mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="mb-3 font-extrabold">Nhận tư vấn thuê xe</h2>

        <p className="dim mx-auto mb-8 max-w-xl">
          Để lại email, nhân viên VOLTA Ride sẽ liên hệ tư vấn gói thuê phù hợp với nhu cầu của bạn.
        </p>

        <form className="flex flex-col items-center justify-center gap-3 sm:flex-row" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="flex-1 rounded-xl border bg-white/10 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 sm:max-w-xs"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            placeholder="Email của bạn"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="whitespace-nowrap rounded-xl px-6 py-3 font-semibold gradient-btn disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Đang gửi...' : 'Gửi tư vấn'}
          </button>
        </form>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <>
      <footer className="w-full border-t py-10" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
          <span className="mono font-bold">VOLTA Ride</span>
          <span className="dim text-center text-sm">
            © 2026 VOLTA Ride. Thuê xe máy điện cao cấp, nhanh và an toàn.
          </span>
        </div>
      </footer>

      <a
        href="https://zalo.me"
        target="_blank"
        rel="noopener noreferrer"
        className="fab fixed right-6 bottom-6 z-50 grid h-14 w-14 place-items-center rounded-2xl purple-btn"
        aria-label="Chat hỗ trợ nhanh"
      >
        <Zap size={26} color="#ffffff" />
      </a>
    </>
  )
}

export default function App() {
  const [isDark, setIsDark] = useState(true)
  const [authMode, setAuthMode] = useState(null)

  const canvasRef = useRef(null)
  const heroImgRef = useRef(null)

  useEffect(() => {
    const root = document.documentElement

    root.classList.toggle('dark', isDark)
    root.classList.toggle('light', !isDark)
  }, [isDark])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY

      if (heroImgRef.current && y < 900) {
        heroImgRef.current.style.transform = `translateY(${y * 0.18}px) scale(1.04)`
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${(index % 3) * 90}ms`
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )

    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element))

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return undefined
    }

    const ctx = canvas.getContext('2d')
    let animationFrameId = 0
    let stars = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      stars = Array.from({ length: 130 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.2,
        s: Math.random() * 0.6 + 0.15,
        o: Math.random()
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star) => {
        star.y += star.s
        star.o += (Math.random() - 0.5) * 0.05

        if (star.y > canvas.height) {
          star.y = -2
          star.x = Math.random() * canvas.width
        }

        ctx.beginPath()
        ctx.fillStyle = `rgba(180,230,255,${Math.max(0.15, Math.min(1, star.o))})`
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    resize()
    draw()

    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="theme-bg" />
      <canvas ref={canvasRef} id="starfield" />

      <Header
        isDark={isDark}
        onToggleTheme={() => setIsDark((current) => !current)}
        onOpenAuth={setAuthMode}
      />

      <main id="top" className="relative z-0 w-full">
        <Hero heroImgRef={heroImgRef} />
        <VehiclesSection />
        <PricingSection />
        <ServicesSection />
        <IntroSection />
        <SignupSection />
      </main>

      <Footer />

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitchMode={setAuthMode}
        />
      )}
    </div>
  )
}