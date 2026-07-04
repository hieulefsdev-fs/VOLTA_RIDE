import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'

const TEXT = {
  title: 'Trang c\u00e1 nh\u00e2n',
  subtitle: 'Qu\u1ea3n l\u00fd th\u00f4ng tin t\u00e0i kho\u1ea3n VOLTA Ride c\u1ee7a b\u1ea1n.',
  changeAvatar: '\u0110\u1ed5i avatar',
  fullName: 'H\u1ecd t\u00ean',
  fullNamePlaceholder: 'Nh\u1eadp h\u1ecd t\u00ean',
  email: 'Email',
  phone: 'S\u1ed1 \u0111i\u1ec7n tho\u1ea1i',
  phonePlaceholder: 'Nh\u1eadp s\u1ed1 \u0111i\u1ec7n tho\u1ea1i',
  walletBalance: 'S\u1ed1 d\u01b0 v\u00ed hi\u1ec7n t\u1ea1i',
  depositTitle: 'N\u1ea1p ti\u1ec1n v\u00e0o v\u00ed',
  depositPlaceholder: 'Nh\u1eadp s\u1ed1 ti\u1ec1n mu\u1ed1n n\u1ea1p',
  depositVnpay: 'N\u1ea1p qua VNPay',
  walletNote: 'S\u1ed1 d\u01b0 v\u00ed v\u00e0 l\u1ecbch s\u1eed giao d\u1ecbch \u0111ang \u0111\u01b0\u1ee3c l\u01b0u trong database.',
  transactionTitle: 'L\u1ecbch s\u1eed n\u1ea1p ti\u1ec1n',
  emptyTransaction: 'Ch\u01b0a c\u00f3 giao d\u1ecbch n\u1ea1p ti\u1ec1n.',
  save: 'L\u01b0u th\u00f4ng tin',
  saving: '\u0110ang l\u01b0u...',
  chooseImage: 'Vui l\u00f2ng ch\u1ecdn file \u1ea3nh',
  avatarSelected: '\u0110\u00e3 ch\u1ecdn \u1ea3nh \u0111\u1ea1i di\u1ec7n',
  fullNameRequired: 'H\u1ecd t\u00ean kh\u00f4ng \u0111\u01b0\u1ee3c \u0111\u1ec3 tr\u1ed1ng',
  amountRequired: 'Vui l\u00f2ng nh\u1eadp s\u1ed1 ti\u1ec1n t\u1ed1i thi\u1ec3u 10.000 VN\u0110',
  updateSuccess: '\u0110\u00e3 c\u1eadp nh\u1eadt trang c\u00e1 nh\u00e2n',
  createPaymentError: 'Kh\u00f4ng t\u1ea1o \u0111\u01b0\u1ee3c thanh to\u00e1n VNPay'
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('vi-VN') + ' VN\u0110'
}

function normalizeTransaction(item) {
  return {
    id: item.id,
    txnRef: item.txn_ref || item.txnRef,
    type: item.provider || 'VNPAY',
    amount: Number(item.amount || 0),
    status: item.status,
    createdAt: item.created_at || item.createdAt,
    paidAt: item.paid_at || item.paidAt
  }
}

export default function UserProfileModal({ user, onClose, onUserChange }) {
  const [fullName, setFullName] = useState(user?.fullName || user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || user?.avatar_url || '')
  const [walletBalance, setWalletBalance] = useState(Number(user?.walletBalance || 0))
  const [depositAmount, setDepositAmount] = useState('')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [paying, setPaying] = useState(false)

  async function loadWallet() {
    if (!user?.email) {
      return
    }

    try {
      const walletRes = await api.get('/wallet/me', {
        params: {
          email: user.email
        }
      })

      const nextBalance = Number(walletRes.data?.walletBalance || 0)
      setWalletBalance(nextBalance)

      const transactionRes = await api.get('/wallet/transactions', {
        params: {
          email: user.email
        }
      })

      setTransactions((transactionRes.data || []).map(normalizeTransaction))

      const updatedUser = {
        ...user,
        walletBalance: nextBalance
      }

      localStorage.setItem('user', JSON.stringify(updatedUser))

      if (onUserChange) {
        onUserChange(updatedUser)
      }
    } catch {
      toast.error('Kh\u00f4ng t\u1ea3i \u0111\u01b0\u1ee3c th\u00f4ng tin v\u00ed')
    }
  }

  useEffect(() => {
    loadWallet()
  }, [])

  function handleAvatarChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error(TEXT.chooseImage)
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setAvatarUrl(reader.result)
      toast.success(TEXT.avatarSelected)
    }

    reader.readAsDataURL(file)
  }

  function updateUser() {
    const updatedUser = {
      ...user,
      fullName: fullName.trim(),
      name: fullName.trim(),
      phone: phone.trim(),
      avatarUrl,
      walletBalance
    }

    localStorage.setItem('user', JSON.stringify(updatedUser))

    if (onUserChange) {
      onUserChange(updatedUser)
    }

    return updatedUser
  }

  async function handleVnpayDeposit() {
    const amount = Number(String(depositAmount).replace(/\D/g, ''))

    if (!amount || amount < 10000) {
      toast.error(TEXT.amountRequired)
      return
    }

    try {
      setPaying(true)
      updateUser()

      const res = await api.post('/payment/vnpay/create', {
        amount,
        email: user?.email
      })

      const paymentUrl = res.data?.paymentUrl

      if (!paymentUrl) {
        toast.error(TEXT.createPaymentError)
        setPaying(false)
        return
      }

      window.location.href = paymentUrl
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        TEXT.createPaymentError

      toast.error(message)
      setPaying(false)
    }
  }

  function handleSave(event) {
    event.preventDefault()

    if (!fullName.trim()) {
      toast.error(TEXT.fullNameRequired)
      return
    }

    setLoading(true)
    updateUser()
    toast.success(TEXT.updateSuccess)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div
        className="glass relative max-h-[92vh] w-full max-w-lg overflow-y-auto p-7"
        style={{ color: 'var(--text)' }}
      >
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-xl opacity-70 hover:opacity-100">
          x
        </button>

        <h2 className="mb-2 text-3xl font-extrabold">{TEXT.title}</h2>
        <p className="dim mb-6 text-sm">{TEXT.subtitle}</p>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex flex-col items-center gap-3">
            <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border bg-white/10" style={{ borderColor: 'var(--border)' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl font-bold accent-grad">
                  {(fullName || user?.email || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <label className="cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold hover:opacity-80" style={{ borderColor: 'var(--border)' }}>
              {TEXT.changeAvatar}
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">{TEXT.fullName}</label>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-xl border bg-white/10 px-5 py-3 outline-none"
              style={{ borderColor: 'var(--border)' }}
              placeholder={TEXT.fullNamePlaceholder}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">{TEXT.email}</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full rounded-xl border bg-white/5 px-5 py-3 opacity-70 outline-none"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">{TEXT.phone}</label>
            <input
              type="text"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-xl border bg-white/10 px-5 py-3 outline-none"
              style={{ borderColor: 'var(--border)' }}
              placeholder={TEXT.phonePlaceholder}
            />
          </div>

          <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)' }}>
            <div className="dim text-sm">{TEXT.walletBalance}</div>

            <div className="mono mt-1 text-2xl font-bold accent-grad">
              {formatMoney(walletBalance)}
            </div>

            <p className="dim mt-2 text-xs">{TEXT.walletNote}</p>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-semibold">{TEXT.depositTitle}</label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={depositAmount}
                  onChange={(event) => setDepositAmount(event.target.value)}
                  className="flex-1 rounded-xl border bg-white/10 px-5 py-3 outline-none"
                  style={{ borderColor: 'var(--border)' }}
                  placeholder={TEXT.depositPlaceholder}
                />

                <button
                  type="button"
                  onClick={handleVnpayDeposit}
                  disabled={paying}
                  className="whitespace-nowrap rounded-xl px-5 py-3 font-bold gradient-btn disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paying ? '\u0110ang chuy\u1ec3n...' : TEXT.depositVnpay}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)' }}>
            <h3 className="mb-3 text-sm font-bold">{TEXT.transactionTitle}</h3>

            {transactions.length === 0 ? (
              <p className="dim text-sm">{TEXT.emptyTransaction}</p>
            ) : (
              <div className="space-y-2">
                {transactions.slice(0, 8).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm">
                    <div>
                      <div className="font-semibold">{TEXT.depositVnpay}</div>
                      <div className="dim text-xs">
                        {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString('vi-VN') : ''}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold accent-grad">+{formatMoney(transaction.amount)}</div>
                      <div className="dim text-xs">{transaction.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl px-5 py-3 font-bold gradient-btn disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? TEXT.saving : TEXT.save}
          </button>
        </form>
      </div>
    </div>
  )
}