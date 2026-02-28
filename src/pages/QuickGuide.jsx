import { AlertCircle, CheckCircle, Zap } from 'lucide-react'

export default function QuickGuide() {
  return (
    <div style={styles.container}>
      <img
        src="https://images.pexels.com/photos/6147276/pexels-photo-6147276.jpeg?auto=compress&cs=tinysrgb&w=1200"
        alt="Quick Guide"
        style={styles.headerImage}
      />

      <div style={styles.content}>
        <h1 style={styles.title}>快速入门作战卡</h1>

        <section style={styles.section}>
          <div style={styles.formula}>
            <h2 style={styles.formulaTitle}>核心公式</h2>
            <div style={styles.formulaBox}>
              <p style={styles.formulaText}>
                攻击 → 停顿3秒 → 反问"凭什么？" → 把球踢回去
              </p>
            </div>
            <p style={styles.formulaNote}>
              就这么简单。不解释，不辩护，不自证。把论证的负担还给对方。
            </p>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>三条铁律</h2>
          <div style={styles.rulesGrid}>
            <RuleCard
              number="1"
              title="不解释"
              description="解释=认输。你一解释，就承认了对方有审判你的权力"
              consequence="陷入自证陷阱，越解释越输"
            />
            <RuleCard
              number="2"
              title="不接球"
              description="对方扔过来的攻击，不要接。直接砸一个新球回去"
              consequence="被牵着鼻子走，疲于应对"
            />
            <RuleCard
              number="3"
              title="不自证"
              description="让他出示证据，让他定义标准，让他来说明凭什么"
              consequence="能量消耗逆转，你累他轻松"
            />
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>万能起手式</h2>

          <div style={styles.starterBox}>
            <div style={styles.starterMain}>
              <Zap size={32} color="var(--color-warning)" />
              <h3 style={styles.starterTitle}>基础版</h3>
              <p style={styles.starterPhrase}>"凭什么？"</p>
            </div>

            <div style={styles.starterAdvanced}>
              <h4 style={styles.advancedTitle}>进阶版</h4>
              <ul style={styles.phraseList}>
                <li>"你的依据是什么？"</li>
                <li>"谁给你的权力？"</li>
                <li>"你的标准是什么？"</li>
                <li>"你来定义一下？"</li>
                <li>""从来"是指一次都没有吗？"</li>
              </ul>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>适用场景</h2>
          <div style={styles.scenariosGrid}>
            <ScenarioCard
              title="伴侣"
              attack="你从来不关心我、你太自私了"
              strategy="拆解全称量词、反问定义"
              isApplicable={true}
            />
            <ScenarioCard
              title="父母"
              attack="我是为你好、你怎么不孝"
              strategy="谈感受不谈对错、课题分离"
              isApplicable={true}
            />
            <ScenarioCard
              title="同事"
              attack="甩锅、推卸责任"
              strategy="陈述流程、用规则说话"
              isApplicable={true}
            />
            <ScenarioCard
              title="领导"
              attack="你态度有问题、不够努力"
              strategy="把形容词还原为数据、要求具体指标"
              isApplicable={true}
            />
            <ScenarioCard
              title="网友"
              attack="杠精、人身攻击"
              strategy="沉默/复读机、降维打击"
              isApplicable={true}
            />
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.warningBox}>
            <h2 style={styles.warningTitle}>
              <AlertCircle size={24} />
              不适用场景
            </h2>
            <div style={styles.warningContent}>
              <h3 style={styles.warningSubtitle}>红色区域：快速撤离</h3>
              <ul style={styles.warningList}>
                <li><strong>垃圾人：</strong>浑身负能量、见谁骂谁 → 不眼神接触、快速离开</li>
                <li><strong>醉汉/疯子：</strong>神志不清、可能失控 → 保持距离、必要时报警</li>
                <li><strong>暴力倾向者：</strong>威胁动手、肢体冲突 → 立即撤离、不口头纠缠</li>
              </ul>
              <blockquote style={styles.warningQuote}>
                只打值得打的仗。你的时间、情绪和生命，比证明他是错的要宝贵一万倍。
              </blockquote>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>急救话术</h2>
          <div style={styles.phrasesGrid}>
            <PhraseCard
              number="1"
              title="万能起手式"
              phrase="凭什么？"
            />
            <PhraseCard
              number="2"
              title="要求具体化"
              phrase="你说我不___，能具体说说吗？是什么时候、什么场景？"
            />
            <PhraseCard
              number="3"
              title="反问标准"
              phrase="你说的'从来不''总是'是什么意思？能举个具体的例子吗？"
            />
          </div>
        </section>
      </div>
    </div>
  )
}

function RuleCard({ number, title, description, consequence }) {
  return (
    <div style={styles.ruleCard}>
      <div style={styles.ruleNumber}>{number}</div>
      <h3 style={styles.ruleTitle}>{title}</h3>
      <p style={styles.ruleDescription}>{description}</p>
      <div style={styles.ruleConsequence}>
        <AlertCircle size={16} />
        <span>违背后果：{consequence}</span>
      </div>
    </div>
  )
}

function ScenarioCard({ title, attack, strategy, isApplicable }) {
  return (
    <div style={styles.scenarioCard}>
      <div style={styles.scenarioHeader}>
        <h3 style={styles.scenarioTitle}>{title}</h3>
        {isApplicable ? (
          <CheckCircle size={20} color="var(--color-success)" />
        ) : (
          <AlertCircle size={20} color="var(--color-error)" />
        )}
      </div>
      <p style={styles.scenarioAttack}>{attack}</p>
      <p style={styles.scenarioStrategy}>
        <strong>应对：</strong>{strategy}
      </p>
    </div>
  )
}

function PhraseCard({ number, title, phrase }) {
  return (
    <div style={styles.phraseCard}>
      <div style={styles.phraseNumber}>{number}</div>
      <h3 style={styles.phraseTitle}>{title}</h3>
      <p style={styles.phraseText}>{phrase}</p>
    </div>
  )
}

const styles = {
  container: {
    flex: 1,
    paddingBottom: 'calc(var(--spacing-unit) * 10)',
  },
  headerImage: {
    width: '100%',
    height: '300px',
    objectFit: 'cover',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: 'calc(var(--spacing-unit) * 4) calc(var(--spacing-unit) * 3)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 'calc(var(--spacing-unit) * 6)',
  },
  section: {
    marginBottom: 'calc(var(--spacing-unit) * 8)',
  },
  sectionTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: 'calc(var(--spacing-unit) * 4)',
  },
  formula: {
    textAlign: 'center',
  },
  formulaTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: 'calc(var(--spacing-unit) * 3)',
  },
  formulaBox: {
    backgroundColor: 'var(--color-primary-light)',
    padding: 'calc(var(--spacing-unit) * 4)',
    borderRadius: 'var(--border-radius-lg)',
    marginBottom: 'calc(var(--spacing-unit) * 3)',
  },
  formulaText: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
    margin: 0,
  },
  formulaNote: {
    fontSize: '1rem',
    color: 'var(--color-text-secondary)',
    fontWeight: 500,
  },
  rulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 'calc(var(--spacing-unit) * 3)',
  },
  ruleCard: {
    backgroundColor: 'var(--color-bg-secondary)',
    padding: 'calc(var(--spacing-unit) * 4)',
    borderRadius: 'var(--border-radius-lg)',
    border: '2px solid var(--color-border)',
  },
  ruleNumber: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  ruleTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  ruleDescription: {
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  ruleConsequence: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1)',
    fontSize: '0.875rem',
    color: 'var(--color-error)',
    fontWeight: 500,
  },
  starterBox: {
    backgroundColor: 'var(--color-bg-secondary)',
    padding: 'calc(var(--spacing-unit) * 4)',
    borderRadius: 'var(--border-radius-lg)',
  },
  starterMain: {
    textAlign: 'center',
    marginBottom: 'calc(var(--spacing-unit) * 4)',
    paddingBottom: 'calc(var(--spacing-unit) * 4)',
    borderBottom: '1px solid var(--color-border)',
  },
  starterTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginTop: 'calc(var(--spacing-unit) * 2)',
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  starterPhrase: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
    margin: 0,
  },
  starterAdvanced: {},
  advancedTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  phraseList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing-unit) * 1.5)',
  },
  scenariosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 'calc(var(--spacing-unit) * 3)',
  },
  scenarioCard: {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    padding: 'calc(var(--spacing-unit) * 3)',
    borderRadius: 'var(--border-radius-md)',
  },
  scenarioHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  scenarioTitle: {
    fontSize: '1.125rem',
    fontWeight: 700,
    margin: 0,
  },
  scenarioAttack: {
    fontSize: '0.9rem',
    color: 'var(--color-text-secondary)',
    fontStyle: 'italic',
    marginBottom: 'calc(var(--spacing-unit) * 1.5)',
  },
  scenarioStrategy: {
    fontSize: '0.9rem',
    lineHeight: 1.6,
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    border: '2px solid var(--color-warning)',
    borderRadius: 'var(--border-radius-lg)',
    padding: 'calc(var(--spacing-unit) * 4)',
  },
  warningTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 2)',
    color: '#b45309',
    marginBottom: 'calc(var(--spacing-unit) * 3)',
  },
  warningContent: {},
  warningSubtitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    marginBottom: 'calc(var(--spacing-unit) * 2)',
    color: '#b45309',
  },
  warningList: {
    paddingLeft: 'calc(var(--spacing-unit) * 3)',
    marginBottom: 'calc(var(--spacing-unit) * 3)',
    lineHeight: 1.8,
  },
  warningQuote: {
    borderLeft: '4px solid #b45309',
    paddingLeft: 'calc(var(--spacing-unit) * 3)',
    fontStyle: 'italic',
    fontWeight: 600,
    color: '#b45309',
    margin: 0,
  },
  phrasesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 'calc(var(--spacing-unit) * 3)',
  },
  phraseCard: {
    backgroundColor: 'var(--color-bg-secondary)',
    padding: 'calc(var(--spacing-unit) * 4)',
    borderRadius: 'var(--border-radius-lg)',
    border: '2px solid var(--color-primary)',
  },
  phraseNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.125rem',
    fontWeight: 700,
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  phraseTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  phraseText: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
    fontStyle: 'italic',
    lineHeight: 1.6,
  },
}
