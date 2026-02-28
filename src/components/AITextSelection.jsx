import { useState, useEffect } from 'react'
import { Sparkles, MessageSquare, Lightbulb, BookOpen } from 'lucide-react'

export default function AITextSelection({ selectedText, position, onClose, onAskAI }) {
  const [explanation, setExplanation] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!selectedText || !position) return null

  const handleExplain = async () => {
    setLoading(true)
    try {
      const result = await generateExplanation(selectedText)
      setExplanation(result)
    } catch (error) {
      console.error('Error generating explanation:', error)
    } finally {
      setLoading(false)
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
  await new Promise((resolve) => setTimeout(resolve, 600))

  if (text.includes('凭什么') || text.includes('反问')) {
    return '这是核心反击技巧：「凭什么？」通过反问，你把举证责任从自己身上转移到对方身上，让对方来证明他的指责是有依据的。'
  }

  if (text.includes('不解释') || text.includes('不接球') || text.includes('不自证')) {
    return '这是三大核心原则。「不解释」意味着不要急于辩护；「不接球」是不要接对方扔过来的攻击；「不自证」是不要主动证明自己是清白的。违背这些原则会让你陷入被动。'
  }

  if (text.includes('从来') || text.includes('总是') || text.includes('全称')) {
    return '这是全称量词的拆解技巧。「从来」「总是」「每次」这些词语很容易被反驳，只要有一个反例就能推翻。通过反问「从来是指一次都没有吗？」来要求对方具体化指责。'
  }

  if (text.includes('停顿') || text.includes('3秒')) {
    return '停顿3秒是给自己思考的时间，避免情绪化反应。这个短暂的停顿可以让你从自动防御模式切换到主动反问模式，是攻守转换的关键时刻。'
  }

  return `这段话的核心含义是：${text.length > 50 ? '通过理性反问和界限设定，你可以在冲突中保护自己的立场，而不是陷入无休止的争吵。' : '建立清晰的界限，用反问代替辩解，把论证责任还给对方。'}`
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
