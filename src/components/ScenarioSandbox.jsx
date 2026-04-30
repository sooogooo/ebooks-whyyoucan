import { useEffect, useState } from 'react'
import { Swords, CheckCircle2, XCircle, Sparkles, RotateCw } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ScenarioSandbox({ chapterId, session, variant = 'inline' }) {
  const [scenarios, setScenarios] = useState([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [chapterId])

  const load = async () => {
    setLoading(true)
    try {
      let q = supabase.from('scenarios').select('*').order('display_order', { ascending: true })
      if (chapterId) q = q.eq('chapter_id', chapterId)
      const { data } = await q
      setScenarios(data || [])
      setIdx(0)
      setSelected(null)
    } finally {
      setLoading(false)
    }
  }

  const choose = async (i) => {
    setSelected(i)
    const s = scenarios[idx]
    if (session && s) {
      const score = s.options?.[i]?.score || 0
      await supabase.from('scenario_attempts').insert({
        user_id: session.user.id,
        scenario_id: s.id,
        choice_index: i,
        score,
      })
    }
  }

  const next = () => {
    setSelected(null)
    setIdx((n) => (n + 1) % scenarios.length)
  }

  if (loading) return null
  if (scenarios.length === 0) return null

  const s = scenarios[idx]
  const chosen = selected !== null ? s.options[selected] : null

  return (
    <div style={variant === 'inline' ? styles.inlineWrap : styles.pageWrap}>
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <Swords size={20} color="var(--color-primary)" />
          <h3 style={styles.title}>情景沙盘</h3>
          <span style={styles.badge}>{s.difficulty === 'easy' ? '入门' : s.difficulty === 'medium' ? '进阶' : '高阶'}</span>
        </div>
        {scenarios.length > 1 && (
          <span style={styles.counter}>{idx + 1} / {scenarios.length}</span>
        )}
      </div>

      <h4 style={styles.scenarioTitle}>{s.title}</h4>
      <div style={styles.setup}>
        <p style={styles.setupText}>{s.setup}</p>
      </div>

      <div style={styles.options}>
        {s.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect = opt.score >= 75
          return (
            <button
              key={i}
              onClick={() => selected === null && choose(i)}
              disabled={selected !== null}
              style={{
                ...styles.option,
                ...(isSelected && isCorrect ? styles.optionCorrect : {}),
                ...(isSelected && !isCorrect ? styles.optionWrong : {}),
                ...(selected !== null && !isSelected ? styles.optionDim : {}),
              }}
            >
              <span style={styles.optionText}>{opt.text}</span>
              {isSelected && (
                <span style={styles.optionIcon}>
                  {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {chosen && (
        <div
          style={{
            ...styles.feedback,
            borderLeftColor: chosen.score >= 75 ? 'var(--color-success)' : chosen.score >= 50 ? 'var(--color-warning)' : 'var(--color-error)',
          }}
        >
          <div style={styles.feedbackHeader}>
            <Sparkles size={16} color="var(--color-primary)" />
            <span style={styles.feedbackLabel}>得分 {chosen.score}</span>
          </div>
          <p style={styles.feedbackText}>{chosen.feedback}</p>
          {scenarios.length > 1 && (
            <button onClick={next} style={styles.nextBtn}>
              <RotateCw size={14} />
              下一个情景
            </button>
          )}
          {scenarios.length === 1 && (
            <button onClick={() => { setSelected(null) }} style={styles.nextBtn}>
              <RotateCw size={14} />
              再试一次
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  inlineWrap: {
    margin: 'calc(var(--spacing-unit) * 4) 0',
    padding: 'calc(var(--spacing-unit) * 3)',
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--border-radius-lg)',
    border: '1px solid var(--color-border)',
  },
  pageWrap: {
    maxWidth: '720px',
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
    gap: 'calc(var(--spacing-unit) * 1.5)',
  },
  title: {
    fontSize: '1.1rem',
    margin: 0,
    color: 'var(--color-text)',
  },
  badge: {
    fontSize: '0.7rem',
    padding: '2px 8px',
    borderRadius: '999px',
    backgroundColor: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
  },
  counter: {
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
  },
  scenarioTitle: {
    fontSize: '1.05rem',
    marginBottom: 'calc(var(--spacing-unit) * 1.5)',
    color: 'var(--color-text)',
  },
  setup: {
    padding: 'calc(var(--spacing-unit) * 2)',
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--border-radius-md)',
    marginBottom: 'calc(var(--spacing-unit) * 2)',
    borderLeft: '3px solid var(--color-primary)',
  },
  setupText: {
    fontSize: '0.95rem',
    lineHeight: 1.7,
    color: 'var(--color-text)',
    margin: 0,
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing-unit) * 1.5)',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(var(--spacing-unit) * 2)',
    padding: 'calc(var(--spacing-unit) * 2)',
    backgroundColor: 'var(--color-bg)',
    border: '2px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.95rem',
    color: 'var(--color-text)',
    transition: 'all var(--transition-fast)',
    lineHeight: 1.5,
  },
  optionText: { flex: 1 },
  optionIcon: { display: 'flex', alignItems: 'center' },
  optionCorrect: {
    borderColor: 'var(--color-success)',
    backgroundColor: 'rgba(16,185,129,0.08)',
    color: 'var(--color-success)',
  },
  optionWrong: {
    borderColor: 'var(--color-error)',
    backgroundColor: 'rgba(239,68,68,0.08)',
    color: 'var(--color-error)',
  },
  optionDim: {
    opacity: 0.4,
  },
  feedback: {
    marginTop: 'calc(var(--spacing-unit) * 2.5)',
    padding: 'calc(var(--spacing-unit) * 2)',
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--border-radius-md)',
    borderLeft: '4px solid var(--color-primary)',
  },
  feedbackHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: 'calc(var(--spacing-unit) * 1)',
  },
  feedbackLabel: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
  },
  feedbackText: {
    fontSize: '0.95rem',
    lineHeight: 1.7,
    color: 'var(--color-text)',
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  nextBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
}
