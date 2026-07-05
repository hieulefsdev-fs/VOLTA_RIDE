import { useState } from 'react'
import { Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react'
import api from '../services/api'

const TEXT = {
  title: 'Tr\u1ee3 l\u00fd AI VOLTA Ride',
  subtitle: 'H\u1ecfi nhanh v\u1ec1 gi\u00e1 thu\u00ea, pin, VNPay, t\u00e0i kho\u1ea3n v\u00e0 d\u1ecbch v\u1ee5.',
  placeholder: 'Nh\u1eadp c\u00e2u h\u1ecfi c\u1ee7a b\u1ea1n...',
  welcome: 'Xin ch\u00e0o! M\u00ecnh l\u00e0 tr\u1ee3 l\u00fd AI c\u1ee7a VOLTA Ride. B\u1ea1n c\u00f3 th\u1ec3 h\u1ecfi v\u1ec1 gi\u00e1 thu\u00ea xe, pin, n\u1ea1p v\u00ed VNPay ho\u1eb7c t\u00e0i kho\u1ea3n.',
  quickPrice: 'B\u1ea3ng gi\u00e1 thu\u00ea xe?',
  quickVnpay: 'N\u1ea1p v\u00ed VNPay th\u1ebf n\u00e0o?',
  quickBattery: 'Xe \u0111i \u0111\u01b0\u1ee3c bao xa?',
  quickAccount: 'T\u00f4i mu\u1ed1n \u0111\u1ed5i avatar',
  error: 'Hi\u1ec7n t\u1ea1i AI ch\u01b0a ph\u1ea3n h\u1ed3i \u0111\u01b0\u1ee3c. B\u1ea1n ki\u1ec3m tra backend \u0111ang ch\u1ea1y ch\u01b0a nh\u00e9.'
}

const quickQuestions = [
  TEXT.quickPrice,
  TEXT.quickVnpay,
  TEXT.quickBattery,
  TEXT.quickAccount
]

export default function AiChatBox() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      content: TEXT.welcome
    }
  ])

  async function sendMessage(customMessage) {
    const messageText = (customMessage || input).trim()

    if (!messageText || loading) {
      return
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText
    }

    setMessages((current) => [...current, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/ai/chat', {
        message: messageText
      })

      const botMessage = {
        id: Date.now() + 1,
        role: 'bot',
        content: res.data?.reply || TEXT.error
      }

      setMessages((current) => [...current, botMessage])
    } catch {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'bot',
        content: TEXT.error
      }

      setMessages((current) => [...current, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed right-6 bottom-24 z-[90] grid h-14 w-14 place-items-center rounded-2xl shadow-xl gradient-btn"
          aria-label="M\u1edf chat AI"
        >
          <MessageCircle size={26} color="#0B0E11" />
        </button>
      )}

      {open && (
        <div
          className="fixed right-4 bottom-24 z-[100] w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-3xl border bg-[#0B0E11]/95 shadow-2xl backdrop-blur-xl"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          <div
            className="flex items-center justify-between border-b p-4"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl gradient-btn">
                <Bot size={24} color="#0B0E11" />
              </div>

              <div>
                <h3 className="font-bold">{TEXT.title}</h3>
                <p className="text-xs text-gray-300">{TEXT.subtitle}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-xl border"
              style={{ borderColor: 'var(--border)' }}
            aria-label="close">
              <X size={18} className="text-gray-300" />
            </button>
          </div>

          <div className="max-h-[22rem] space-y-3 overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-green-400 to-cyan-400 text-gray-900 font-medium'
                      : 'border bg-white/5 text-white'
                  }`}
                  style={message.role === 'bot' ? { borderColor: 'var(--border)' } : undefined}
                >
                  {message.role === 'bot' && (
                    <div className="mb-1 flex items-center gap-1 text-xs font-bold">
                      <Sparkles size={13} color="#39FF14" />
                      VOLTA AI
                    </div>
                  )}
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div
                  className="max-w-[82%] rounded-2xl border bg-white/5 px-4 py-3 text-sm text-white"
                  style={{ borderColor: 'var(--border)' }}
                >
                  VOLTA AI đang trả lời...
                </div>
              </div>
            )}
          </div>

          <div className="border-t p-4" style={{ borderColor: 'var(--border)' }}>
            <div className="mb-3 flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => sendMessage(question)}
                  className="rounded-full border px-3 py-1.5 text-xs hover:opacity-80"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {question}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    sendMessage()
                  }
                }}
                placeholder={TEXT.placeholder}
                className="flex-1 rounded-xl border bg-white/10 px-4 py-3 text-sm outline-none text-white placeholder-gray-500"
                style={{ borderColor: 'var(--border)' }}
              />

              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={loading}
                className="grid h-12 w-12 place-items-center rounded-xl gradient-btn disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={19} color="#0B0E11" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}