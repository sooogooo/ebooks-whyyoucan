import { useEffect, useState } from 'react'
import { Heart, Share2, RotateCw, Quote as QuoteIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function DailyQuote({ session }) {
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [collected, setCollected] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [allQuotes, setAllQuotes] = useState([])

  useEffect(() => {
    loadQuote()
  }, [])

  useEffect(() => {
    if (session && quote) checkCollected()
  }, [session, quote])

  const loadQuote = async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('quotes').select('*, chapters(title, slug)')
      if (!data || data.length === 0) {
        setLoading(false)
        return
      }
      setAllQuotes(data)
      const seed = new Date().toISOString().slice(0, 10)
      const hash = [...seed].reduce((s, c) => s + c.charCodeAt(0), 0)
      setQuote(data[hash % data.length])
    } finally {
      setLoading(false)
    }
  }

  const pickRandom = () => {
    setFlipped(false)
    if (allQuotes.length === 0) return
    const next = allQuotes[Math.floor(Math.random() * allQuotes.length)]
    setQuote(next)
  }

  const checkCollected = async () => {
    const { data } = await supabase
      .from('quote_collects')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('quote_id', quote.id)
      .maybeSingle()
    setCollected(!!data)
  }

  const toggleCollect = async () => {
    if (!session) {
      alert('登录后可收藏金句，解锁打卡徽章')
      return
    }
    if (collected) {
      await supabase
        .from('quote_collects')
        .delete()
        .eq('user_id', session.user.id)
        .eq('quote_id', quote.id)
      setCollected(false)
    } else {
      await supabase.from('quote_collects').insert({ user_id: session.user.id, quote_id: quote.id })
      setCollected(true)
    }
  }

  const share = async () => {
    const text = `${quote.text}\n\n——《凭什么》`
    if (navigator.share) {
      try {
        await navigator.share({ text, title: '凭什么 · 今日金句' })
        return
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(text)
      alert('金句已复制到剪贴板')
    } catch {}
  }

  if (loading || !quote) return null

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <QuoteIcon size={18} color="var(--color-primary)" />
          <span style={styles.title}>今日金句</span>
        </div>
        <button onClick={pickRandom} style={styles.rotateBtn} title="换一条">
          <RotateCw size={16} />
        </button>
      </div>

      <div
        style={{ ...styles.card, ...(flipped ? styles.cardFlipped : {}) }}
        onClick={() => setFlipped(!flipped)}
      >
        {!flipped ? (
          <>
            <p style={styles.quoteText}>“{quote.text}”</p>
            {quote.author_note && <p style={styles.note}>— {quote.author_note}</p>}
            {quote.chapters?.title && (
              <p style={styles.source}>出自 《{quote.chapters.title}》</p>
            )}
            <p style={styles.hint}>点击卡片翻转 · 获取解读</p>
          </>
        ) : (
          <>
            <h3 style={styles.flippedTitle}>为什么这句话重要？</h3>
            <p style={styles.flippedBody}>
              {quote.author_note || '每一条金句背后，都是一次被审问、被操控、被委屈时的真实顿悟。'}
            </p>
            <p style={styles.flippedHint}>再次点击返回</p>
          </>
        )}
      </div>

      <div style={styles.actions}>
        <button
          onClick={toggleCollect}
          style={{ ...styles.actionBtn, ...(collected ? styles.actionBtnActive : {}) }}
        >
          <Heart size={16} fill={collected ? 'currentColor' : 'none'} />
          <span>{collected ? '已收藏' : '收藏打卡'}</span>
        </button>
        <button onClick={share} style={styles.actionBtn}>
          <Share2 size={16} />
          <span>分享</span>
        </button>
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    maxWidth: '720px',
    width: '100%',
    margin: '0 auto',
    padding: 'calc(var(--spacing-unit) * 3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1)',
  },
  title: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  rotateBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  card: {
    position: 'relative',
    padding: 'calc(var(--spacing-unit) * 4)',
    background: 'linear-gradient(135deg, #fefae0 0%, #f8f3d6 100%)',
    borderRadius: 'var(--border-radius-lg)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
    cursor: 'pointer',
    transition: 'transform 0.4s ease',
    minHeight: '180px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  cardFlipped: {
    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
  },
  quoteText: {
    fontSize: '1.35rem',
    lineHeight: 1.6,
    color: '#3d2f00',
    fontFamily: 'var(--font-serif)',
    fontWeight: 600,
    margin: 0,
  },
  note: {
    marginTop: 'calc(var(--spacing-unit) * 2)',
    fontSize: '0.9rem',
    color: '#6b5e00',
    margin: 'calc(var(--spacing-unit) * 2) 0 0 0',
  },
  source: {
    marginTop: 'calc(var(--spacing-unit) * 1)',
    fontSize: '0.8rem',
    color: '#8b7e3c',
  },
  hint: {
    position: 'absolute',
    bottom: 'calc(var(--spacing-unit) * 1.5)',
    right: 'calc(var(--spacing-unit) * 2)',
    fontSize: '0.7rem',
    color: '#a8994a',
    margin: 0,
  },
  flippedTitle: {
    color: '#1e3a8a',
    fontSize: '1.1rem',
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  flippedBody: {
    color: '#1e40af',
    fontSize: '1rem',
    lineHeight: 1.7,
    margin: 0,
  },
  flippedHint: {
    position: 'absolute',
    bottom: 'calc(var(--spacing-unit) * 1.5)',
    right: 'calc(var(--spacing-unit) * 2)',
    fontSize: '0.7rem',
    color: '#1e3a8a99',
  },
  actions: {
    display: 'flex',
    gap: 'calc(var(--spacing-unit) * 2)',
    marginTop: 'calc(var(--spacing-unit) * 2)',
  },
  actionBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: 'calc(var(--spacing-unit) * 1.5)',
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  actionBtnActive: {
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    borderColor: 'var(--color-primary)',
  },
}
