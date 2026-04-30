import { useState } from 'react'
import { Sparkles, MessageSquare, Lightbulb, Bookmark, Check } from 'lucide-react'
import { askAI } from '../lib/ai'
import { supabase } from '../lib/supabase'

export default function AITextSelection({ selectedText, position, onClose, onAskAI, chapterId, session, onBookmarkSaved }) {
  const [explanation, setExplanation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!selectedText || !position) return null

  const handleExplain = async () => {
    setLoading(true)
    try {
      const result = await generateExplanation(selectedText)
      setExplanation(result)
    } catch (error) {
      console.error('Error generating explanation:', error)
      setExplanation('解释失败，请稍后重试。')
    } finally {
      setLoading(false)
    }
  }

  const handleBookmark = async () => {
    if (!session) {
      alert('请先登录以保存书签')
      return
    }
    if (!chapterId) return
    setSaving(true)
    try {
      const { error } = await supabase.from('bookmarks').insert({
        user_id: session.user.id,
        chapter_id: chapterId,
        content_excerpt: selectedText,
      })
      if (error) throw error
      setSaved(true)
      if (onBookmarkSaved) onBookmarkSaved()
      setTimeout(onClose, 800)
    } catch (err) {
      console.error('bookmark error', err)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleAskAI = () => {
    onAskAI(`请解释这段话：「${selectedText}」`)
    onClose()
  }

  return (
    <div
      style={{
        ...styles.popup,
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      className="fade-in"
    >
      {!explanation ? (
        <div style={styles.actions}>
          <button onClick={handleExplain} style={styles.actionButton} disabled={loading}>
            <Sparkles size={16} />
            <span>{loading ? '分析中...' : '解释这段话'}</span>
          </button>
          <button onClick={handleAskAI} style={styles.actionButton}>
            <MessageSquare size={16} />
            <span>问AI助手</span>
          </button>
          {chapterId && (
            <button onClick={handleBookmark} style={styles.actionButton} disabled={saving || saved}>
              {saved ? <Check size={16} color="var(--color-success)" /> : <Bookmark size={16} />}
              <span>{saved ? '已收藏' : saving ? '保存中...' : '加入书签'}</span>
            </button>
          )}
        </div>
      ) : (
        <div style={styles.explanation}>
          <div style={styles.explanationHeader}>
            <Lightbulb size={18} color="var(--color-warning)" />
            <h4 style={styles.explanationTitle}>AI解释</h4>
          </div>
          <p style={styles.explanationText}>{explanation}</p>
          <div style={styles.explanationActions}>
            <button onClick={handleAskAI} style={styles.smallButton}>
              继续提问
            </button>
            <button onClick={onClose} style={styles.smallButton}>
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

async function generateExplanation(text) {
  return askAI({
    messages: [{ role: 'user', content: `请用简洁的中文解释下面这段文字的核心含义，并结合《凭什么》的反击心法给出应用方法：\n\n"${text}"` }],
    mode: 'explain',
    selectedText: text,
    persist: false,
  })
}

const styles = {
  popup: {
    position: 'absolute',
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 100,
    minWidth: '280px',
    maxWidth: '400px',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing-unit) * 1)',
    padding: 'calc(var(--spacing-unit) * 2)',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1.5)',
    padding: 'calc(var(--spacing-unit) * 2)',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '0.9rem',
    color: 'var(--color-text)',
    textAlign: 'left',
    width: '100%',
  },
  explanation: {
    padding: 'calc(var(--spacing-unit) * 3)',
  },
  explanationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1.5)',
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  explanationTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    margin: 0,
  },
  explanationText: {
    fontSize: '0.9rem',
    lineHeight: 1.6,
    color: 'var(--color-text-secondary)',
    marginBottom: 'calc(var(--spacing-unit) * 3)',
  },
  explanationActions: {
    display: 'flex',
    gap: 'calc(var(--spacing-unit) * 2)',
    justifyContent: 'flex-end',
  },
  smallButton: {
    padding: 'calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2)',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
}
