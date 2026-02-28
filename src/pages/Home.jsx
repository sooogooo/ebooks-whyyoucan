import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowRight, BookOpen, Zap, Target } from 'lucide-react'

export default function Home() {
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChapters()
  }, [])

  const loadChapters = async () => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .order('chapter_order')

      if (error) throw error
      setChapters(data || [])
    } catch (error) {
      console.error('Error loading chapters:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <img
            src="https://images.pexels.com/photos/5940841/pexels-photo-5940841.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Hero"
            style={styles.heroImage}
          />
          <div style={styles.heroText}>
            <h1 style={styles.heroTitle}>凭什么</h1>
            <p style={styles.heroSubtitle}>一句话终结无效争吵的反击心法</p>
            <p style={styles.heroDescription}>
              从你开口说出"你听我解释"那五个字的那一刻起，你就已经输了。
            </p>
            <div style={styles.heroActions}>
              <Link to="/quick-guide" style={styles.primaryButton}>
                <Zap size={18} />
                快速入门
              </Link>
              <Link to="/practice" style={styles.secondaryButton}>
                <Target size={18} />
                开始练习
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.features}>
        <div style={styles.featuresGrid}>
          <FeatureCard
            icon={<BookOpen size={32} />}
            title="系统学习"
            description="从底层逻辑到实战技术，完整掌握反击心法"
            color="var(--color-primary)"
          />
          <FeatureCard
            icon={<Target size={32} />}
            title="场景练习"
            description="家庭、职场、网络等多场景实战演练"
            color="var(--color-success)"
          />
          <FeatureCard
            icon={<Zap size={32} />}
            title="AI助手"
            description="智能分析你的情况，提供个性化建议"
            color="var(--color-warning)"
          />
        </div>
      </section>

      <section style={styles.chapters}>
        <h2 style={styles.sectionTitle}>开始阅读</h2>

        {loading ? (
          <div style={styles.loading}>加载中...</div>
        ) : chapters.length > 0 ? (
          <div style={styles.chapterList}>
            {chapters.map((chapter) => (
              <ChapterCard key={chapter.id} chapter={chapter} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      <section style={styles.quote}>
        <blockquote style={styles.blockquote}>
          <p style={styles.quoteText}>
            "愿你的善良，从此带点锋芒。"
          </p>
        </blockquote>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description, color }) {
  return (
    <div style={styles.featureCard}>
      <div style={{ ...styles.featureIcon, color }}>{icon}</div>
      <h3 style={styles.featureTitle}>{title}</h3>
      <p style={styles.featureDescription}>{description}</p>
    </div>
  )
}

function ChapterCard({ chapter }) {
  return (
    <Link to={`/chapter/${chapter.slug}`} style={styles.chapterCard}>
      {chapter.image_url && (
        <img src={chapter.image_url} alt={chapter.title} style={styles.chapterImage} />
      )}
      <div style={styles.chapterContent}>
        <div>
          <h3 style={styles.chapterTitle}>{chapter.title}</h3>
          {chapter.subtitle && (
            <p style={styles.chapterSubtitle}>{chapter.subtitle}</p>
          )}
        </div>
        <div style={styles.chapterMeta}>
          <span style={styles.readingTime}>{chapter.reading_time} 分钟阅读</span>
          <ArrowRight size={18} style={styles.arrow} />
        </div>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div style={styles.emptyState}>
      <BookOpen size={48} color="var(--color-text-tertiary)" />
      <p style={styles.emptyText}>内容正在加载...</p>
      <p style={styles.emptyHint}>请稍后刷新页面查看章节内容</p>
    </div>
  )
}

const styles = {
  container: {
    flex: 1,
    paddingBottom: 'calc(var(--spacing-unit) * 10)',
  },
  hero: {
    backgroundColor: 'var(--color-bg-secondary)',
  },
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 'calc(var(--spacing-unit) * 4)',
    padding: 'calc(var(--spacing-unit) * 6) calc(var(--spacing-unit) * 3)',
  },
  heroImage: {
    width: '100%',
    height: '300px',
    objectFit: 'cover',
    borderRadius: 'var(--border-radius-lg)',
  },
  heroText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing-unit) * 2)',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: 700,
    margin: 0,
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    color: 'var(--color-text-secondary)',
    margin: 0,
  },
  heroDescription: {
    fontSize: '1rem',
    lineHeight: 1.8,
    color: 'var(--color-text-secondary)',
    fontStyle: 'italic',
  },
  heroActions: {
    display: 'flex',
    gap: 'calc(var(--spacing-unit) * 2)',
    marginTop: 'calc(var(--spacing-unit) * 2)',
    flexWrap: 'wrap',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1)',
    padding: 'calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 4)',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    borderRadius: 'var(--border-radius-md)',
    fontWeight: 600,
    fontSize: '1rem',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1)',
    padding: 'calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 4)',
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    border: '2px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-md)',
    fontWeight: 600,
    fontSize: '1rem',
  },
  features: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: 'calc(var(--spacing-unit) * 8) calc(var(--spacing-unit) * 3)',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 'calc(var(--spacing-unit) * 3)',
  },
  featureCard: {
    padding: 'calc(var(--spacing-unit) * 4)',
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--border-radius-lg)',
    textAlign: 'center',
  },
  featureIcon: {
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: 'calc(var(--spacing-unit) * 1)',
  },
  featureDescription: {
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
  },
  chapters: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 calc(var(--spacing-unit) * 3) calc(var(--spacing-unit) * 6)',
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: 'calc(var(--spacing-unit) * 4)',
  },
  loading: {
    textAlign: 'center',
    padding: 'calc(var(--spacing-unit) * 8)',
    color: 'var(--color-text-secondary)',
  },
  chapterList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 'calc(var(--spacing-unit) * 3)',
  },
  chapterCard: {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-lg)',
    overflow: 'hidden',
    transition: 'all var(--transition-normal)',
    display: 'flex',
    flexDirection: 'column',
  },
  chapterImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
  },
  chapterContent: {
    padding: 'calc(var(--spacing-unit) * 3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing-unit) * 2)',
    flex: 1,
  },
  chapterTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    marginBottom: 'calc(var(--spacing-unit) * 1)',
  },
  chapterSubtitle: {
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.5,
  },
  chapterMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  readingTime: {
    fontSize: '0.875rem',
    color: 'var(--color-text-tertiary)',
  },
  arrow: {
    color: 'var(--color-primary)',
  },
  quote: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: 'calc(var(--spacing-unit) * 8) calc(var(--spacing-unit) * 3)',
  },
  blockquote: {
    borderLeft: '4px solid var(--color-primary)',
    paddingLeft: 'calc(var(--spacing-unit) * 4)',
    margin: 0,
  },
  quoteText: {
    fontSize: '1.5rem',
    fontStyle: 'italic',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
  },
  emptyState: {
    textAlign: 'center',
    padding: 'calc(var(--spacing-unit) * 8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 2)',
  },
  emptyText: {
    fontSize: '1.125rem',
    color: 'var(--color-text-secondary)',
  },
  emptyHint: {
    fontSize: '0.875rem',
    color: 'var(--color-text-tertiary)',
  },
}
