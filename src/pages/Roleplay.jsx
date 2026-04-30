import { useEffect, useRef, useState } from 'react'
import { Swords, Send, RotateCcw, ClipboardCheck, User, Bot } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { askAI } from '../lib/ai'

const ROLES = [
  { id: 'strict_parent', label: '严厉父母', desc: '「我都是为你好」', emoji: '👨‍👩‍👧', opener: '你看看你现在这个样子，我当初就是怕你走弯路，你就是不听！' },
  { id: 'toxic_boss', label: '打压领导', desc: '「你态度有问题」', emoji: '💼', opener: '我跟你说，你这个人就是态度有问题，不配合。其他人怎么都行？' },
  { id: 'passive_coworker', label: '甩锅同事', desc: '「是你没沟通清楚」', emoji: '👔', opener: '@你 这次延期主要是因为你没沟通清楚，大家都看到了吧。' },
  { id: 'pua_partner', label: 'PUA 伴侣', desc: '「你根本不在乎我」', emoji: '💔', opener: '你根本不在乎我。你心里只有你自己和你那份破工作。' },
  { id: 'nosy_relative', label: '越界亲戚', desc: '「怎么还不结婚」', emoji: '🍵', opener: '你都三十了，工资多少？怎么还不结婚？是不是眼光太高？' },
]

export default function Roleplay({ session }) {
  const [role, setRole] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState('')
  const [reporting, setReporting] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const startRole = async (r) => {
    setRole(r)
    const opener = [{ role: 'assistant', content: r.opener }]
    setMessages(opener)
    setReport('')
    setSessionId(null)
    if (session) {
      const { data } = await supabase
        .from('roleplay_sessions')
        .insert({ user_id: session.user.id, role: r.id, transcript: opener })
        .select()
        .maybeSingle()
      if (data) setSessionId(data.id)
    }
  }

  const send = async () => {
    if (!input.trim() || !role) return
    const userMsg = { role: 'user', content: input.trim() }
    const nextMsgs = [...messages, userMsg]
    setMessages(nextMsgs)
    setInput('')
    setLoading(true)
    try {
      const reply = await askAI({
        messages: nextMsgs,
        mode: 'roleplay',
        role: role.id,
        persist: false,
      })
      const final = [...nextMsgs, { role: 'assistant', content: reply }]
      setMessages(final)
      if (sessionId) {
        await supabase.from('roleplay_sessions').update({ transcript: final, updated_at: new Date().toISOString() }).eq('id', sessionId)
      }
    } catch (e) {
      setMessages([...nextMsgs, { role: 'assistant', content: '（AI 暂时无法回复，请稍后重试）' }])
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    if (messages.length < 3) {
      alert('至少对话 2 轮再来复盘')
      return
    }
    setReporting(true)
    try {
      const transcript = messages
        .map((m) => `${m.role === 'user' ? '你' : '对方'}：${m.content}`)
        .join('\n')
      const text = await askAI({
        messages: [{ role: 'user', content: `请对以下对话进行复盘：\n\n${transcript}` }],
        mode: 'roleplay_report',
        persist: false,
      })
      setReport(text)
      if (sessionId) {
        await supabase.from('roleplay_sessions').update({ report: text }).eq('id', sessionId)
      }
    } catch (e) {
      setReport('复盘生成失败，请稍后重试')
    } finally {
      setReporting(false)
    }
  }

  const reset = () => {
    setRole(null)
    setMessages([])
    setReport('')
    setSessionId(null)
  }

  if (!role) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <Swords size={28} color="var(--color-primary)" />
          <h1 style={styles.title}>AI 角色扮演 · 反击实战</h1>
          <p style={styles.subtitle}>选一个对手，和他过几招。练习不解释、不接球、不自证。</p>
        </div>

        <div style={styles.roleGrid}>
          {ROLES.map((r) => (
            <button key={r.id} onClick={() => startRole(r)} style={styles.roleCard}>
              <div style={styles.roleEmoji}>{r.emoji}</div>
              <div style={styles.roleLabel}>{r.label}</div>
              <div style={styles.roleDesc}>{r.desc}</div>
            </button>
          ))}
        </div>

        {!session && (
          <p style={styles.tip}>提示：登录后对话记录会保存到你的档案，可随时回看和复盘。</p>
        )}
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.chatHeader}>
        <button onClick={reset} style={styles.resetBtn} title="换个对手">
          <RotateCcw size={16} />
        </button>
        <div>
          <div style={styles.chatTitle}>
            {role.emoji} {role.label}
          </div>
          <div style={styles.chatSub}>{role.desc}</div>
        </div>
        <button onClick={generateReport} disabled={reporting} style={styles.reportBtn}>
          <ClipboardCheck size={16} />
          {reporting ? '分析中...' : '复盘'}
        </button>
      </div>

      <div ref={scrollRef} style={styles.chat}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.bubble,
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: m.role === 'user' ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
              color: m.role === 'user' ? 'white' : 'var(--color-text)',
            }}
          >
            <div style={styles.bubbleHead}>
              {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              <span style={styles.bubbleName}>{m.role === 'user' ? '你' : role.label}</span>
            </div>
            <div style={styles.bubbleContent}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ ...styles.bubble, alignSelf: 'flex-start', backgroundColor: 'var(--color-bg-secondary)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>对方正在回复...</span>
          </div>
        )}

        {report && (
          <div style={styles.reportBox}>
            <div style={styles.reportHeader}>
              <ClipboardCheck size={16} color="var(--color-primary)" />
              <strong>复盘报告</strong>
            </div>
            <div style={styles.reportContent}>
              {report.split('\n').map((line, i) => (
                <p key={i} style={{ margin: '4px 0' }}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={styles.inputBar}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="你的回应..."
          style={styles.input}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={styles.sendBtn}>
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    flex: 1,
    maxWidth: '820px',
    width: '100%',
    margin: '0 auto',
    padding: 'calc(var(--spacing-unit) * 3)',
    paddingBottom: 'calc(var(--spacing-unit) * 10)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    textAlign: 'center',
    marginBottom: 'calc(var(--spacing-unit) * 4)',
  },
  title: {
    fontSize: '1.5rem',
    marginTop: 'calc(var(--spacing-unit) * 2)',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: 'var(--color-text-secondary)',
  },
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 'calc(var(--spacing-unit) * 2)',
  },
  roleCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: 'calc(var(--spacing-unit) * 3)',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '2px solid var(--color-border)',
    borderRadius: 'var(--border-radius-lg)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    color: 'var(--color-text)',
  },
  roleEmoji: { fontSize: '2rem' },
  roleLabel: { fontWeight: 600, fontSize: '1rem' },
  roleDesc: { fontSize: '0.8rem', color: 'var(--color-text-secondary)' },
  tip: {
    marginTop: 'calc(var(--spacing-unit) * 4)',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: 'var(--color-text-tertiary)',
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 2)',
    padding: 'calc(var(--spacing-unit) * 2)',
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--border-radius-lg)',
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
  },
  chatTitle: { fontWeight: 600 },
  chatSub: { fontSize: '0.8rem', color: 'var(--color-text-secondary)' },
  reportBtn: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  chat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing-unit) * 1.5)',
    padding: 'calc(var(--spacing-unit) * 2)',
    minHeight: '400px',
    maxHeight: '60vh',
    overflowY: 'auto',
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--border-radius-lg)',
    border: '1px solid var(--color-border)',
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  bubble: {
    maxWidth: '80%',
    padding: 'calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2)',
    borderRadius: 'var(--border-radius-lg)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
  },
  bubbleHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.7rem',
    opacity: 0.7,
    marginBottom: '4px',
  },
  bubbleName: {},
  bubbleContent: { whiteSpace: 'pre-wrap' },
  reportBox: {
    alignSelf: 'stretch',
    marginTop: 'calc(var(--spacing-unit) * 2)',
    padding: 'calc(var(--spacing-unit) * 2)',
    backgroundColor: 'var(--color-primary-light)',
    borderRadius: 'var(--border-radius-md)',
  },
  reportHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: 'calc(var(--spacing-unit) * 1)',
    color: 'var(--color-primary)',
  },
  reportContent: {
    fontSize: '0.9rem',
    lineHeight: 1.6,
    color: 'var(--color-text)',
  },
  inputBar: {
    display: 'flex',
    gap: 'calc(var(--spacing-unit) * 1)',
  },
  input: {
    flex: 1,
    padding: 'calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontSize: '0.95rem',
  },
  sendBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--border-radius-md)',
    cursor: 'pointer',
  },
}
