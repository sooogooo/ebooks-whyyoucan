import { useEffect, useState } from 'react'
import { Lightbulb, Send, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'

const CHAPTER_QUESTIONS = {
  default: [
    '回想最近一次让你委屈的对话，对方使用了哪种「陷阱」？',
    '如果时光倒流，你会如何用本章学到的方法回应？',
  ],
}

export default function ReflectionBox({ chapterId, chapterTitle, session }) {
  const [answer, setAnswer] = useState('')
  const [saved, setSaved] = useState(false)
  const [existing, setExisting] = useState(null)
  const [saving, setSaving] = useState(false)
  const questions = CHAPTER_QUESTIONS.default
  const [qIdx, setQIdx] = useState(0)
  const question = questions[qIdx]

  useEffect(() => {
    if (session && chapterId) loadExisting()
  }, [session, chapterId, qIdx])

  const loadExisting = async () => {
    const { data } = await supabase
      .from('reflections')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('chapter_id', chapterId)
      .eq('question', question)
      .maybeSingle()
    if (data) {
      setAnswer(data.answer || '')
      setExisting(data)
      setSaved(true)
    } else {
      setAnswer('')
      setExisting(null)
      setSaved(false)
    }
  }

  const save = async () => {
    if (!session) {
      alert('登录后可保存反思日记')
      return
    }
    if (!answer.trim()) return
    setSaving(true)
    try {
      if (existing) {
        await supabase
          .from('reflections')
          .update({ answer, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
      } else {
        const { data } = await supabase
          .from('reflections')
          .insert({ user_id: session.user.id, chapter_id: chapterId, question, answer })
          .select()
          .maybeSingle()
        setExisting(data)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <Lightbulb size={20} color="var(--color-warning)" />
        <h3 style={styles.title}>反思时刻</h3>
        {questions.length > 1 && (
          <div style={styles.tabs}>
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setQIdx(i)}
                style={{
                  ...styles.tab,
                  ...(i === qIdx ? styles.tabActive : {}),
                }}
              >
                问题 {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <p style={styles.question}>{question}</p>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="写下你的答案，只有你自己能看到..."
        style={styles.textarea}
        rows={4}
      />

      <div style={styles.actions}>
        <span style={styles.privateNote}>仅你自己可见</span>
        <button
          onClick={save}
          disabled={saving || !answer.trim()}
          style={{
            ...styles.saveBtn,
            ...(saved ? styles.saveBtnSaved : {}),
            ...(saving || !answer.trim() ? styles.saveBtnDisabled : {}),
          }}
        >
          {saved ? <Check size={16} /> : <Send size={16} />}
          <span>{saved ? '已保存' : saving ? '保存中...' : '保存'}</span>
        </button>
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    margin: 'calc(var(--spacing-unit) * 4) 0',
    padding: 'calc(var(--spacing-unit) * 3)',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    borderRadius: 'var(--border-radius-lg)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1.5)',
    marginBottom: 'calc(var(--spacing-unit) * 2)',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '1.1rem',
    margin: 0,
    color: 'var(--color-text)',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    marginLeft: 'auto',
  },
  tab: {
    padding: '4px 12px',
    fontSize: '0.75rem',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: '999px',
    cursor: 'pointer',
  },
  tabActive: {
    backgroundColor: 'var(--color-warning)',
    color: 'white',
    borderColor: 'var(--color-warning)',
  },
  question: {
    fontSize: '1rem',
    color: 'var(--color-text)',
    fontWeight: 500,
    lineHeight: 1.6,
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  textarea: {
    width: '100%',
    padding: 'calc(var(--spacing-unit) * 2)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    lineHeight: 1.6,
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'calc(var(--spacing-unit) * 1.5)',
  },
  privateNote: {
    fontSize: '0.75rem',
    color: 'var(--color-text-tertiary)',
  },
  saveBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: 'var(--color-warning)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  saveBtnSaved: {
    backgroundColor: 'var(--color-success)',
  },
  saveBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}
