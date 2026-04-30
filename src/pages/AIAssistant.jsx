import { useState, useEffect } from 'react'
import { Send, Sparkles, MessageSquare, Share2, History } from 'lucide-react'
import ShareModal from '../components/ShareModal'
import { askAI } from '../lib/ai'
import { supabase } from '../lib/supabase'

const WELCOME = {
  role: 'assistant',
  content: '你好！我是《凭什么》AI助手。我可以帮你：\n\n• 分析具体场景，提供应对建议\n• 解答关于反击技巧的问题\n• 模拟对话练习\n\n请告诉我你遇到的情况，或者问我任何关于反击心法的问题。',
}

export default function AIAssistant({ session }) {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [shareData, setShareData] = useState(null)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (session) loadHistory()
  }, [session])

  const loadHistory = async () => {
    const { data } = await supabase
      .from('ai_conversations')
      .select('id, question, answer, created_at')
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setHistory(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    const nextMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(nextMessages)
    setLoading(true)

    try {
      const apiMessages = nextMessages
        .filter((m) => m !== WELCOME)
        .map((m) => ({ role: m.role, content: m.content }))
      const response = await askAI({ messages: apiMessages, mode: 'chat', persist: true })
      setMessages((prev) => [...prev, { role: 'assistant', content: response }])
      if (session) loadHistory()
    } catch (error) {
      console.error('Error generating response:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '抱歉，我现在无法回应。请稍后重试。\n\n通用建议：\n\n1. 停顿3秒，不要立即反应\n2. 用「凭什么？」反问对方的依据\n3. 要求对方具体化指责\n4. 不要陷入自证陷阱',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadConversation = (item) => {
    setMessages([
      WELCOME,
      { role: 'user', content: item.question },
      { role: 'assistant', content: item.answer },
    ])
    setShowHistory(false)
  }

  const quickQuestions = [
    '如何应对伴侣的指责？',
    '同事甩锅给我怎么办？',
    '父母总说「为你好」怎么回应？',
    '领导说我态度有问题怎么办？',
  ]

  const handleQuickQuestion = (question) => {
    setInput(question)
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(var(--spacing-unit) * 2)' }}>
          <Sparkles size={24} color="var(--color-primary)" />
          <h1 style={styles.title}>AI助手</h1>
        </div>
        {session && (
          <button onClick={() => setShowHistory(!showHistory)} style={styles.historyBtn} title="历史对话">
            <History size={18} />
            <span>历史</span>
          </button>
        )}
      </div>

      {showHistory && session && (
        <div style={styles.historyPanel}>
          <p style={styles.historyTitle}>最近对话</p>
          {history.length === 0 ? (
            <p style={styles.historyEmpty}>暂无历史对话</p>
          ) : (
            history.map((item) => (
              <button key={item.id} onClick={() => loadConversation(item)} style={styles.historyItem}>
                <p style={styles.historyQ}>{item.question}</p>
                <p style={styles.historyDate}>{new Date(item.created_at).toLocaleString('zh-CN')}</p>
              </button>
            ))
          )}
        </div>
      )}

      <div style={styles.chatContainer}>
        <div style={styles.messagesArea}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                ...styles.messageWrapper,
                ...(message.role === 'user' ? styles.userMessageWrapper : styles.assistantMessageWrapper),
              }}
            >
              <div
                style={{
                  ...styles.message,
                  ...(message.role === 'user' ? styles.userMessage : styles.assistantMessage),
                }}
              >
                {message.content.split('\n').map((line, i) => (
                  <p key={i} style={styles.messageLine}>
                    {line}
                  </p>
                ))}
                {message.role === 'assistant' && index > 0 && (
                  <button
                    onClick={() => setShareData({
                      title: 'AI助手建议',
                      content: message.content,
                      category: 'AI问答',
                      theme: 'wisdom',
                    })}
                    style={styles.shareInlineBtn}
                  >
                    <Share2 size={14} />
                    <span>分享</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={styles.assistantMessageWrapper}>
              <div style={styles.assistantMessage}>
                <div style={styles.typing}>
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              </div>
            </div>
          )}

          {messages.length === 1 && !loading && (
            <div style={styles.quickQuestionsArea}>
              <p style={styles.quickQuestionsTitle}>快速开始：</p>
              <div style={styles.quickQuestions}>
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    style={styles.quickQuestion}
                  >
                    <MessageSquare size={16} />
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={styles.inputArea}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="描述你的情况或提问..."
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
            <Send size={20} />
          </button>
        </form>
      </div>

      {shareData && (
        <ShareModal
          isOpen={!!shareData}
          onClose={() => setShareData(null)}
          title={shareData.title}
          content={shareData.content}
          category={shareData.category}
          theme={shareData.theme}
        />
      )}
    </div>
  )
}

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-bg-secondary)',
  },
  historyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text)',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  historyPanel: {
    maxWidth: '900px',
    width: '100%',
    margin: '0 auto',
    padding: 'calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 3)',
    backgroundColor: 'var(--color-bg)',
    borderBottom: '1px solid var(--color-border)',
    maxHeight: '40vh',
    overflowY: 'auto',
  },
  historyTitle: {
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
    marginBottom: '8px',
    fontWeight: 600,
  },
  historyEmpty: {
    fontSize: '0.875rem',
    color: 'var(--color-text-tertiary)',
    padding: '12px 0',
  },
  historyItem: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '10px 12px',
    marginBottom: '6px',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    cursor: 'pointer',
  },
  historyQ: {
    fontSize: '0.9rem',
    color: 'var(--color-text)',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  historyDate: {
    fontSize: '0.75rem',
    color: 'var(--color-text-tertiary)',
    margin: '4px 0 0 0',
  },
  loginPrompt: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'calc(var(--spacing-unit) * 4)',
    textAlign: 'center',
    gap: 'calc(var(--spacing-unit) * 3)',
  },
  loginTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  loginText: {
    fontSize: '1rem',
    lineHeight: 1.8,
    color: 'var(--color-text-secondary)',
    maxWidth: '400px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(var(--spacing-unit) * 2)',
    padding: 'calc(var(--spacing-unit) * 3)',
    backgroundColor: 'var(--color-bg)',
    borderBottom: '1px solid var(--color-border)',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    margin: 0,
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '900px',
    width: '100%',
    margin: '0 auto',
    backgroundColor: 'var(--color-bg)',
  },
  messagesArea: {
    flex: 1,
    padding: 'calc(var(--spacing-unit) * 3)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing-unit) * 2)',
    marginBottom: 'calc(var(--spacing-unit) * 10)',
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
    maxWidth: '80%',
    padding: 'calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 3)',
    borderRadius: 'var(--border-radius-lg)',
    lineHeight: 1.6,
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
  },
  messageLine: {
    margin: 'calc(var(--spacing-unit) * 1) 0',
  },
  typing: {
    display: 'flex',
    gap: 'calc(var(--spacing-unit) * 0.5)',
  },
  quickQuestionsArea: {
    marginTop: 'calc(var(--spacing-unit) * 4)',
  },
  quickQuestionsTitle: {
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  quickQuestions: {
    display: 'grid',
    gap: 'calc(var(--spacing-unit) * 2)',
  },
  quickQuestion: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1.5)',
    padding: 'calc(var(--spacing-unit) * 2)',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    textAlign: 'left',
    fontSize: '0.95rem',
    color: 'var(--color-text)',
    transition: 'all var(--transition-fast)',
  },
  inputArea: {
    position: 'fixed',
    bottom: 'calc(var(--spacing-unit) * 8)',
    left: 0,
    right: 0,
    padding: 'calc(var(--spacing-unit) * 3)',
    backgroundColor: 'var(--color-bg)',
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    gap: 'calc(var(--spacing-unit) * 2)',
    maxWidth: '900px',
    margin: '0 auto',
  },
  input: {
    flex: 1,
    padding: 'calc(var(--spacing-unit) * 2)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '1rem',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
  },
  sendButton: {
    width: '48px',
    height: '48px',
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
  shareInlineBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: 'calc(var(--spacing-unit) * 1.5)',
    padding: '4px 10px',
    fontSize: '0.75rem',
    color: 'var(--color-text-tertiary)',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    alignSelf: 'flex-start',
  },
}
