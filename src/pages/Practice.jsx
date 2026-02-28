import { useState } from 'react'
import { MessageCircle, RefreshCw, Sparkles } from 'lucide-react'

const scenarios = [
  {
    id: 1,
    category: '伴侣',
    situation: '你伴侣对你说："你从来不关心我的感受，你太自私了！"',
    attack: '你从来不关心我',
    image: 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=800',
    hints: [
      '拆解"从来"这个全称量词',
      '反问具体的标准和例子',
      '不要陷入自证',
    ],
    goodResponses: [
      '"从来"是指一次都没有吗？能举个具体的例子吗？',
      '你说的"关心"标准是什么？我想了解具体指的是哪些行为。',
      '我听到你现在不开心，你能告诉我具体是什么事情让你有这种感受吗？',
    ],
    badResponses: [
      '我怎么不关心你了？我每天都...（开始自证）',
      '我不自私！你才自私呢！（反击人身）',
      '你为什么总是这样说我？（被动防守）',
    ],
  },
  {
    id: 2,
    category: '同事',
    situation: '同事在会议上说："这个项目出问题，都是因为你没有做好沟通协调。"',
    attack: '项目问题归咎于你',
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    hints: [
      '要求明确具体的流程和责任',
      '用事实和规则说话',
      '不接受模糊的指责',
    ],
    goodResponses: [
      '能具体说明是哪个环节的沟通出了问题吗？',
      '我们可以回顾一下项目流程，看看每个人的职责范围是什么。',
      '你指的沟通协调具体包括哪些工作？根据项目分工，这部分的负责人是谁？',
    ],
    badResponses: [
      '我已经发过邮件了啊！我做了很多沟通工作！（慌乱解释）',
      '不是我的问题，是XX没有配合！（甩锅）',
      '对不起，我下次会注意...（直接认错）',
    ],
  },
  {
    id: 3,
    category: '父母',
    situation: '父母说："我们都是为你好，你怎么就不听话呢？"',
    attack: '用"为你好"进行道德绑架',
    image: 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=800',
    hints: [
      '承认情感，但坚守边界',
      '区分课题归属',
      '表达自己的感受',
    ],
    goodResponses: [
      '我理解你们的出发点是好的，但这件事的结果主要由我承担，我想自己做决定。',
      '我感受到了你们的关心，同时我也需要为自己的人生负责。',
      '"听话"的定义是什么？是完全按照你们说的做，还是可以有讨论的空间？',
    ],
    badResponses: [
      '你们根本不是为我好，你们只是想控制我！（对抗）',
      '好好好，我听你们的...（假性顺从，内心抗拒）',
      '为什么别人的父母就不这样？（比较）',
    ],
  },
  {
    id: 4,
    category: '领导',
    situation: '领导说："你这个态度有问题，工作不够积极主动。"',
    attack: '使用模糊的形容词批评',
    image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
    hints: [
      '要求具体化',
      '把形容词转化为可衡量的指标',
      '了解期望标准',
    ],
    goodResponses: [
      '您能具体说明一下是哪些方面的表现让您觉得我不够积极主动吗？',
      '我想了解一下，"积极主动"的具体标准是什么？比如在哪些场景下，您期望看到什么样的行为？',
      '能否给我举个例子，说明什么样的表现算是态度好、积极主动？',
    ],
    badResponses: [
      '我已经很努力了！我每天加班到很晚！（情绪化防守）',
      '对不起领导，我一定改...（不知道改什么）',
      '是不是XX在背后说我坏话？（猜测动机）',
    ],
  },
  {
    id: 5,
    category: '网络',
    situation: '网友评论："你这种观点就是典型的XX思维，太low了。"',
    attack: '贴标签+人身攻击',
    image: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=800',
    hints: [
      '可以选择不回应',
      '如果回应，降维打击',
      '不陷入泥潭',
    ],
    goodResponses: [
      '（不回应，直接屏蔽/忽略）',
      '"XX思维"具体指什么？能说清楚吗？',
      '谢谢你的意见，祝你开心。（礼貌结束）',
    ],
    badResponses: [
      '我不是XX思维！我的意思是...（长篇解释）',
      '你才low！你懂什么！（对骂）',
      '为什么你要这么说我？我哪里得罪你了？（讨好）',
    ],
  },
]

export default function Practice({ session }) {
  const [currentScenario, setCurrentScenario] = useState(scenarios[0])
  const [showHints, setShowHints] = useState(false)
  const [showAnswers, setShowAnswers] = useState(false)
  const [userResponse, setUserResponse] = useState('')

  const handleNewScenario = () => {
    const randomIndex = Math.floor(Math.random() * scenarios.length)
    setCurrentScenario(scenarios[randomIndex])
    setShowHints(false)
    setShowAnswers(false)
    setUserResponse('')
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>实战练习</h1>
        <p style={styles.subtitle}>在安全的环境中练习反击技巧</p>
      </div>

      <div style={styles.content}>
        <div style={styles.scenarioCard}>
          <img
            src={currentScenario.image}
            alt={currentScenario.category}
            style={styles.scenarioImage}
          />

          <div style={styles.scenarioContent}>
            <div style={styles.categoryBadge}>
              {currentScenario.category}
            </div>

            <div style={styles.situationBox}>
              <MessageCircle size={24} color="var(--color-primary)" />
              <p style={styles.situation}>{currentScenario.situation}</p>
            </div>

            <div style={styles.responseArea}>
              <label style={styles.label}>你会如何回应？</label>
              <textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="在这里输入你的回应..."
                style={styles.textarea}
                rows={4}
              />
            </div>

            <div style={styles.actions}>
              <button
                onClick={() => setShowHints(!showHints)}
                style={styles.hintButton}
              >
                <Sparkles size={18} />
                {showHints ? '隐藏提示' : '显示提示'}
              </button>

              <button
                onClick={() => setShowAnswers(!showAnswers)}
                style={styles.answerButton}
              >
                查看参考答案
              </button>

              <button
                onClick={handleNewScenario}
                style={styles.newButton}
              >
                <RefreshCw size={18} />
                换一个场景
              </button>
            </div>

            {showHints && (
              <div style={styles.hintsBox}>
                <h3 style={styles.hintsTitle}>思考提示</h3>
                <ul style={styles.hintsList}>
                  {currentScenario.hints.map((hint, index) => (
                    <li key={index} style={styles.hintItem}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}

            {showAnswers && (
              <div style={styles.answersBox}>
                <div style={styles.goodAnswers}>
                  <h3 style={styles.answersTitle}>推荐回应</h3>
                  <ul style={styles.answersList}>
                    {currentScenario.goodResponses.map((response, index) => (
                      <li key={index} style={styles.answerItem}>{response}</li>
                    ))}
                  </ul>
                </div>

                <div style={styles.badAnswers}>
                  <h3 style={styles.answersTitle}>避免这样回应</h3>
                  <ul style={styles.answersList}>
                    {currentScenario.badResponses.map((response, index) => (
                      <li key={index} style={styles.answerItem}>{response}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={styles.tipBox}>
          <h3 style={styles.tipTitle}>练习建议</h3>
          <ul style={styles.tipList}>
            <li>先尝试自己思考回应，再查看提示和答案</li>
            <li>重点理解回应背后的原理，而不是死记硬背</li>
            <li>在真实场景中，停顿3秒思考再回应</li>
            <li>记住：不是每次都要回应，选择值得打的仗</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    flex: 1,
    paddingBottom: 'calc(var(--spacing-unit) * 10)',
  },
  header: {
    backgroundColor: 'var(--color-bg-secondary)',
    padding: 'calc(var(--spacing-unit) * 6) calc(var(--spacing-unit) * 3)',
    textAlign: 'center',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: 'var(--color-text-secondary)',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: 'calc(var(--spacing-unit) * 4) calc(var(--spacing-unit) * 3)',
  },
  scenarioCard: {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-lg)',
    overflow: 'hidden',
    marginBottom: 'calc(var(--spacing-unit) * 4)',
  },
  scenarioImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  scenarioContent: {
    padding: 'calc(var(--spacing-unit) * 4)',
  },
  categoryBadge: {
    display: 'inline-block',
    padding: 'calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 2)',
    backgroundColor: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: 'calc(var(--spacing-unit) * 3)',
  },
  situationBox: {
    display: 'flex',
    gap: 'calc(var(--spacing-unit) * 2)',
    padding: 'calc(var(--spacing-unit) * 3)',
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--border-radius-md)',
    marginBottom: 'calc(var(--spacing-unit) * 4)',
  },
  situation: {
    fontSize: '1.125rem',
    lineHeight: 1.6,
    margin: 0,
    flex: 1,
  },
  responseArea: {
    marginBottom: 'calc(var(--spacing-unit) * 4)',
  },
  label: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  textarea: {
    width: '100%',
    padding: 'calc(var(--spacing-unit) * 2)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
  },
  actions: {
    display: 'flex',
    gap: 'calc(var(--spacing-unit) * 2)',
    flexWrap: 'wrap',
    marginBottom: 'calc(var(--spacing-unit) * 4)',
  },
  hintButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1)',
    padding: 'calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 3)',
    backgroundColor: 'var(--color-warning)',
    color: 'white',
    borderRadius: 'var(--border-radius-md)',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  answerButton: {
    padding: 'calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 3)',
    backgroundColor: 'var(--color-success)',
    color: 'white',
    borderRadius: 'var(--border-radius-md)',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  newButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1)',
    padding: 'calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 3)',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    borderRadius: 'var(--border-radius-md)',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  hintsBox: {
    padding: 'calc(var(--spacing-unit) * 3)',
    backgroundColor: '#fef3c7',
    borderRadius: 'var(--border-radius-md)',
    marginBottom: 'calc(var(--spacing-unit) * 3)',
  },
  hintsTitle: {
    fontSize: '1.125rem',
    fontWeight: 700,
    marginBottom: 'calc(var(--spacing-unit) * 2)',
    color: '#b45309',
  },
  hintsList: {
    paddingLeft: 'calc(var(--spacing-unit) * 3)',
    margin: 0,
  },
  hintItem: {
    marginBottom: 'calc(var(--spacing-unit) * 1)',
    lineHeight: 1.6,
  },
  answersBox: {
    display: 'grid',
    gap: 'calc(var(--spacing-unit) * 3)',
  },
  goodAnswers: {
    padding: 'calc(var(--spacing-unit) * 3)',
    backgroundColor: '#d1fae5',
    borderRadius: 'var(--border-radius-md)',
  },
  badAnswers: {
    padding: 'calc(var(--spacing-unit) * 3)',
    backgroundColor: '#fee2e2',
    borderRadius: 'var(--border-radius-md)',
  },
  answersTitle: {
    fontSize: '1.125rem',
    fontWeight: 700,
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  answersList: {
    paddingLeft: 'calc(var(--spacing-unit) * 3)',
    margin: 0,
  },
  answerItem: {
    marginBottom: 'calc(var(--spacing-unit) * 2)',
    lineHeight: 1.6,
  },
  tipBox: {
    padding: 'calc(var(--spacing-unit) * 4)',
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--border-radius-lg)',
    border: '2px solid var(--color-primary)',
  },
  tipTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: 'calc(var(--spacing-unit) * 2)',
    color: 'var(--color-primary)',
  },
  tipList: {
    paddingLeft: 'calc(var(--spacing-unit) * 3)',
    margin: 0,
    lineHeight: 1.8,
  },
}
