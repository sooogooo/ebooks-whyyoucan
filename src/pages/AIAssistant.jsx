import { useState } from 'react'
import { Send, Sparkles, MessageSquare } from 'lucide-react'

export default function AIAssistant({ session }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '你好！我是《凭什么》AI助手。我可以帮你：\n\n• 分析具体场景，提供应对建议\n• 解答关于反击技巧的问题\n• 模拟对话练习\n\n请告诉我你遇到的情况，或者问我任何关于反击心法的问题。',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages([...messages, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await generateAIResponse(userMessage, messages)
      setMessages((prev) => [...prev, { role: 'assistant', content: response }])

      if (session) {
        await saveConversation(userMessage, response)
      }
    } catch (error) {
      console.error('Error generating response:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '抱歉，我现在无法回应。这是一个演示版本，完整的AI功能需要配置AI服务。\n\n不过，我可以给你一些通用建议：\n\n1. 停顿3秒，不要立即反应\n2. 用「凭什么？」反问对方的依据\n3. 要求对方具体化指责\n4. 不要陷入自证陷阱\n\n请描述具体场景，我会尽力提供建议。',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const saveConversation = async (question, answer) => {
    if (!session) return
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
        <Sparkles size={24} color="var(--color-primary)" />
        <h1 style={styles.title}>AI助手</h1>
      </div>

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
    </div>
  )
}

async function generateAIResponse(userMessage, history) {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const responses = {
    伴侣: '当伴侣对你进行指责时：\n\n1. 停顿3秒，不要立即防守\n2. 拆解「从来」「总是」等全称量词\n3. 反问：「从来是指一次都没有吗？能举个具体例子吗？」\n4. 关注具体事件，不接受笼统的人格评判\n\n记住：不要陷入「我不是那样的人」的自证陷阱。',
    同事: '面对同事甩锅：\n\n1. 保持冷静，用事实说话\n2. 陈述项目流程和每个人的职责\n3. 反问：「能具体说明是哪个环节出了问题吗？」\n4. 必要时拿出邮件、文档等证据\n\n职场上，规则和流程是你最好的保护。',
    父母: '应对父母的「为你好」：\n\n1. 承认情感，但坚守边界\n2. 使用「我理解你的出发点，同时我需要...」\n3. 明确课题归属：「这件事的后果主要由我承担」\n4. 表达感受而非对错\n\n不要试图说服父母，而是表明你的立场。',
    领导: '当领导使用模糊批评：\n\n1. 要求具体化：「能举个具体的例子吗？」\n2. 反问标准：「您期望看到什么样的表现？」\n3. 把形容词转化为可衡量的指标\n4. 了解改进方向\n\n让领导说清楚具体要求，而不是接受笼统的「态度不好」。',
  }

  for (const [key, response] of Object.entries(responses)) {
    if (userMessage.includes(key)) {
      return response
    }
  }

  return '基于你的情况，我建议：\n\n1. **停顿3秒** - 给自己时间思考，不要立即反应\n\n2. **反问依据** - 用「凭什么？」「你的依据是什么？」让对方出示证据\n\n3. **要求具体化** - 把对方的指责从抽象转为具体事例\n\n4. **不自证** - 不要急于证明自己不是对方说的那样\n\n记住核心原则：不解释、不接球、不自证。\n\n如果你能提供更具体的场景细节，我可以给出更精准的建议。'
}

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-bg-secondary)',
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
}
