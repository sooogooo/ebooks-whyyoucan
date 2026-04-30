import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, X, Sparkles, Book, Lightbulb, HelpCircle } from 'lucide-react'
import { askAI } from '../lib/ai'

export default function AIReadingAssistant({ chapterContent, chapterTitle, session, isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `你好！我是《${chapterTitle}》的阅读助手。我可以帮你：\n\n• 解释文中的概念和技巧\n• 提供实际应用建议\n• 回答你的任何疑问\n\n请随时提问！`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages([...messages, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const apiMessages = [...messages, { role: 'user', content: userMessage }]
        .filter((m, i) => !(i === 0 && m.role === 'assistant'))
        .map((m) => ({ role: m.role, content: m.content }))
      const response = await askAI({
        messages: apiMessages,
        mode: 'reader',
        chapterTitle,
        chapterContent,
        persist: true,
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: response }])
    } catch (error) {
      console.error('Error generating response:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '抱歉，我现在无法回应。请稍后再试。',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { icon: <Book size={16} />, text: '总结要点', prompt: '请总结这一章的核心要点' },
    { icon: <Lightbulb size={16} />, text: '举个例子', prompt: '能举个实际例子说明如何应用吗？' },
    { icon: <HelpCircle size={16} />, text: '如何实践', prompt: '我该如何在日常生活中实践这些技巧？' },
  ]

  const handleQuickAction = (prompt) => {
    setInput(prompt)
  }

  if (!isOpen) return null

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sidebar} onClick={(e) => e.stopPropagation()} className="slide-in-right">
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <Sparkles size={20} color="var(--color-primary)" />
            <h3 style={styles.title}>AI阅读助手</h3>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.messagesArea}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                ...styles.messageWrapper,
                ...(message.role === 'user' ? styles.userMessageWrapper : styles.assistantMessageWrapper),
              }}
              className="fade-in"
            >
              <div
                style={{
                  ...styles.message,
                  ...(message.role === 'user' ? styles.userMessage : styles.assistantMessage),
                }}
              >
                {message.content.split('\n').map((line, i) => (
                  <p key={i} style={styles.messageLine}>
                    {line || '\u00A0'}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div style={styles.assistantMessageWrapper} className="fade-in">
              <div style={styles.assistantMessage}>
                <div style={styles.typing}>
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div style={styles.quickActions}>
            <p style={styles.quickActionsTitle}>快速操作：</p>
            <div style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.prompt)}
                  style={styles.quickActionButton}
                >
                  {action.icon}
                  <span>{action.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.inputArea}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="问我任何问题..."
            style={styles.input}
            disabled={loading}
          />
          <button
            type="submit"
            style={{
              ...styles.sendButton,
              ...(loading || !input.trim() ? styles.sendButtonDisabled : {}),
            }}
            disabled={loading || !input.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  sidebar: {
    width: '100%',
    maxWidth: '450px',
    backgroundColor: 'var(--color-bg)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-lg)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'calc(var(--spacing-unit) * 3)',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-secondary)',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1.5)',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: 700,
    margin: 0,
  },
  closeButton: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--border-radius-md)',
    color: 'var(--color-text-secondary)',
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: 'calc(var(--spacing-unit) * 3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing-unit) * 2)',
  },
  messageWrapper: {
    display: 'flex',
    width: '100%',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  assistantMessageWrapper: {
    justifyContent: 'flex-start',
  },
  message: {
    maxWidth: '85%',
    padding: 'calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 2.5)',
    borderRadius: 'var(--border-radius-lg)',
    lineHeight: 1.6,
    fontSize: '0.95rem',
  },
  userMessage: {
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    borderBottomRightRadius: 'var(--border-radius-sm)',
  },
  assistantMessage: {
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text)',
    borderBottomLeftRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--color-border)',
  },
  messageLine: {
    margin: 'calc(var(--spacing-unit) * 0.5) 0',
  },
  typing: {
    display: 'flex',
    gap: 'calc(var(--spacing-unit) * 0.5)',
    fontSize: '1.5rem',
  },
  quickActions: {
    padding: 'calc(var(--spacing-unit) * 3)',
    borderTop: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-secondary)',
  },
  quickActionsTitle: {
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
    marginBottom: 'calc(var(--spacing-unit) * 1.5)',
    fontWeight: 600,
  },
  quickActionsGrid: {
    display: 'grid',
    gap: 'calc(var(--spacing-unit) * 1.5)',
  },
  quickActionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1.5)',
    padding: 'calc(var(--spacing-unit) * 1.5)',
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '0.9rem',
    color: 'var(--color-text)',
    textAlign: 'left',
  },
  inputArea: {
    padding: 'calc(var(--spacing-unit) * 3)',
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    gap: 'calc(var(--spacing-unit) * 2)',
    backgroundColor: 'var(--color-bg)',
  },
  input: {
    flex: 1,
    padding: 'calc(var(--spacing-unit) * 2)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '0.95rem',
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text)',
  },
  sendButton: {
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    borderRadius: 'var(--border-radius-md)',
  },
  sendButtonDisabled: {
    backgroundColor: 'var(--color-text-tertiary)',
    cursor: 'not-allowed',
  },
}
