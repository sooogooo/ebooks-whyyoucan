import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, X, Sparkles, Book, Lightbulb, HelpCircle } from 'lucide-react'

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
      const response = await generateAIResponse(userMessage, chapterContent, chapterTitle)
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

async function generateAIResponse(userMessage, chapterContent, chapterTitle) {
  await new Promise((resolve) => setTimeout(resolve, 800))

  const lowerMessage = userMessage.toLowerCase()

  if (lowerMessage.includes('总结') || lowerMessage.includes('要点') || lowerMessage.includes('核心')) {
    return `基于《${chapterTitle}》的内容，我为你总结核心要点：\n\n1. **核心原则**：不解释、不接球、不自证。当对方攻击时，不要急于辩护。\n\n2. **反击技巧**：用"凭什么？"反问对方的依据，把论证责任还给攻击者。\n\n3. **具体方法**：要求对方具体化指责，把抽象的评判转化为可验证的事实。\n\n4. **心态调整**：记住你不需要证明自己是对的，只需要让对方证明他的指责是有依据的。\n\n这些技巧的关键在于转换攻守态势，让自己从被动防守转为主动反问。`
  }

  if (lowerMessage.includes('例子') || lowerMessage.includes('举例') || lowerMessage.includes('实际')) {
    return `让我给你一个实际例子：\n\n**场景**：伴侣说"你从来不关心我的感受"\n\n**传统做法（会输）**：\n"我怎么不关心了？我每天都问你..."\n→ 陷入自证陷阱\n\n**反击心法（会赢）**：\n1. 停顿3秒，深呼吸\n2. 平静反问："从来是指一次都没有吗？"\n3. 继续："你说的'关心感受'具体指什么行为？"\n4. 进一步："能举个具体例子吗？是什么时候、什么场景？"\n\n**结果**：对方需要具体化指责，而具体化后的指责往往站不住脚。攻守易势，你掌握主动权。\n\n记住：不是证明你有关心，而是要求对方证明"从来不"的指控。`
  }

  if (lowerMessage.includes('实践') || lowerMessage.includes('应用') || lowerMessage.includes('日常')) {
    return `在日常生活中实践这些技巧，我建议分三步走：\n\n**第一步：观察期（1周）**\n• 记录每次被攻击的场景\n• 注意自己的第一反应是什么\n• 不要急于反击，先培养觉察力\n\n**第二步：练习期（2-3周）**\n• 从小事开始练习\n• 每次被攻击后停顿3秒\n• 用"能具体说说吗？"代替解释\n• 晚上复盘，思考哪里可以改进\n\n**第三步：应用期（持续）**\n• 逐步应用到重要关系中\n• 记住：不是每次都要反击\n• 选择值得打的仗\n• 保持冷静和界限感\n\n**小提示**：\n在练习初期，可能会不习惯。这很正常。坚持下来，你会发现自己的自信和界限感都提升了。`
  }

  if (lowerMessage.includes('凭什么') || lowerMessage.includes('反问')) {
    return `"凭什么？"这三个字的威力在于：\n\n**1. 转换举证责任**\n• 不再是你证明"我不是"\n• 而是对方证明"你就是"\n\n**2. 要求具体化**\n• 抽象的指责无法成立\n• 具体的事实容易验证\n\n**3. 暴露对方逻辑**\n• 很多攻击没有依据\n• 只是情绪发泄\n\n**使用变体**：\n• "你的依据是什么？"\n• "谁给你的权力这么说？"\n• "你的标准是什么？"\n• "你来定义一下？"\n\n**注意事项**：\n不是每次都适用。面对垃圾人、醉汉、有暴力倾向者，直接撤离才是上策。只在值得的关系中使用这个技巧。`
  }

  return `关于"${userMessage}"这个问题：\n\n这是一个很好的问题。基于本章内容，我的建议是：\n\n1. **理解核心**：首先要明白，真正的反击不是争吵，而是建立界限。\n\n2. **实际应用**：当面对指责时，记住三原则：不解释、不接球、不自证。\n\n3. **关键技巧**：用反问代替辩解。"凭什么？""你的依据是什么？"这些问题把论证责任还给对方。\n\n4. **心态调整**：你不需要让所有人满意，只需要为自己的选择负责。\n\n如果你能提供更具体的场景，我可以给出更精准的建议。你也可以问我关于本章任何内容的问题！`
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
