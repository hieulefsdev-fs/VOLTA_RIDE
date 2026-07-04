import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'

export default function AuthModal({ mode, onClose, onSwitchMode, onLoginSuccess }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('form')
  const [loading, setLoading] = useState(false)

  const isRegister = mode === 'register'

  async function handleSubmit(e) {
    e.preventDefault()

    if (isRegister && !fullName.trim()) {
      toast.error('Họ tên không được để trống')
      return
    }

    if (!email.trim()) {
      toast.error('Email không được để trống')
      return
    }

    if (!password.trim()) {
      toast.error('Mật khẩu không được để trống')
      return
    }

    try {
      setLoading(true)

      if (isRegister) {
        await api.post('/auth/register', {
          fullName: fullName.trim(),
          email: email.trim(),
          password: password.trim()
        })

        await api.post('/auth/otp/send', {
          email: email.trim()
        })

        toast.success('Đã gửi mã OTP về email')
        setStep('otp')
      } else {
        const res = await api.post('/auth/login', {
          email: email.trim(),
          password: password.trim()
        })

        const responseData = res.data || {}

        const userData = responseData.user || {
          id: responseData.id,
          fullName: responseData.fullName,
          name: responseData.name,
          email: responseData.email,
          role: responseData.role
        }

        const savedUser = {
          ...userData,
          email: userData.email || email.trim()
        }

        if (responseData.accessToken) {
          localStorage.setItem('accessToken', responseData.accessToken)
        }

        if (responseData.refreshToken) {
          localStorage.setItem('refreshToken', responseData.refreshToken)
        }

        localStorage.setItem('user', JSON.stringify(savedUser))

        toast.success('Đăng nhập thành công')

        if (onLoginSuccess) {
          onLoginSuccess(savedUser)
        }

        onClose()
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Có lỗi xảy ra, vui lòng thử lại'

      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()

    if (!otp.trim()) {
      toast.error('Vui lòng nhập mã OTP')
      return
    }

    try {
      setLoading(true)

      await api.post('/auth/otp/verify', {
        email: email.trim(),
        otp: otp.trim()
      })

      toast.success('Đăng ký thành công, vui lòng đăng nhập')
      setStep('form')
      setOtp('')
      setPassword('')
      onSwitchMode('login')
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Mã OTP không đúng hoặc đã hết hạn'

      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div
        className="glass relative w-full max-w-md p-7"
        style={{ color: 'var(--text)' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-xl opacity-70 hover:opacity-100"
        >
          ×
        </button>

        {step === 'form' && (
          <>
            <h2 className="mb-2 text-4xl font-extrabold">
              {isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập'}
            </h2>

            <p className="dim mb-6 text-sm">
              {isRegister
                ? 'Nhập thông tin để nhận mã OTP xác thực.'
                : 'Đăng nhập bằng email đã đăng ký.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <input
                  type="text"
                  placeholder="Họ tên"
                  className="w-full rounded-xl border bg-white/10 px-5 py-3 outline-none"
                  style={{ borderColor: 'var(--border)' }}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              )}

              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-xl border bg-white/10 px-5 py-3 outline-none"
                style={{ borderColor: 'var(--border)' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Mật khẩu"
                className="w-full rounded-xl border bg-white/10 px-5 py-3 outline-none"
                style={{ borderColor: 'var(--border)' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl px-5 py-3 font-bold gradient-btn disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? 'Đang xử lý...'
                  : isRegister
                    ? 'Gửi mã OTP'
                    : 'Đăng nhập'}
              </button>
            </form>

            <div className="dim mt-5 text-center text-sm">
              {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
              <button
                type="button"
                className="font-bold accent-grad"
                onClick={() => {
                  setStep('form')
                  setOtp('')
                  onSwitchMode(isRegister ? 'login' : 'register')
                }}
              >
                {isRegister ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            </div>
          </>
        )}

        {step === 'otp' && (
          <>
            <h2 className="mb-2 text-4xl font-extrabold">Xác thực OTP</h2>

            <p className="dim mb-6 text-sm">
              Mã OTP đã được gửi về email: <b>{email}</b>
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                placeholder="Nhập mã OTP 6 số"
                maxLength="6"
                className="w-full rounded-xl border bg-white/10 px-5 py-3 text-center tracking-[0.4em] outline-none"
                style={{ borderColor: 'var(--border)' }}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl px-5 py-3 font-bold gradient-btn disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Đang xác thực...' : 'Xác nhận OTP'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
