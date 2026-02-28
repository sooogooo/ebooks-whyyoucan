import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BookOpen, CheckCircle, Clock, TrendingUp, Bookmark as BookmarkIcon } from 'lucide-react'

export default function Progress({ session }) {
  const [stats, setStats] = useState({
    totalChapters: 0,
    completedChapters: 0,
    readingTime: 0,
  })
  const [progress, setProgress] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      loadProgress()
    } else {
      setLoading(false)
    }
  }, [session])

  const loadProgress = async () => {
    try {
      const { data: chapters } = await supabase
        .from('chapters')
        .select('*')
        .order('chapter_order')

      const { data: userProgress } = await supabase
        .from('user_progress')
        .select('*, chapters(*)')
        .eq('user_id', session.user.id)

      const { data: userBookmarks } = await supabase
        .from('bookmarks')
        .select('*, chapters(title, slug)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      const completed = userProgress?.filter((p) => p.completed).length || 0
      const totalTime = chapters?.reduce((sum, ch) => sum + (ch.reading_time || 0), 0) || 0

      setStats({
        totalChapters: chapters?.length || 0,
        completedChapters: completed,
        readingTime: totalTime,
      })

      setProgress(userProgress || [])
      setBookmarks(userBookmarks || [])
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div style={styles.container}>
        <div style={styles.loginPrompt}>
          <TrendingUp size={48} color="var(--color-primary)" />
          <h2 style={styles.loginTitle}>登录后查看学习进度</h2>
          <p style={styles.loginText}>
            登录后，你可以：<br />
            • 跟踪阅读进度<br />
            • 保存书签和笔记<br />
            • 查看学习统计
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={styles.loading}>加载中...</div>
    )
  }

  const progressPercentage = stats.totalChapters > 0
    ? Math.round((stats.completedChapters / stats.totalChapters) * 100)
    : 0

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>我的学习进度</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.statsGrid}>
          <StatCard
            icon={<BookOpen size={32} />}
            label="章节进度"
            value={`${stats.completedChapters} / ${stats.totalChapters}`}
            color="var(--color-primary)"
          />
          <StatCard
            icon={<CheckCircle size={32} />}
            label="完成度"
            value={`${progressPercentage}%`}
            color="var(--color-success)"
          />
          <StatCard
            icon={<Clock size={32} />}
            label="总阅读时长"
            value={`${stats.readingTime} 分钟`}
            color="var(--color-warning)"
          />
        </div>

        <div style={styles.progressBar}>
          <div style={styles.progressBarLabel}>
            <span>学习进度</span>
            <span>{progressPercentage}%</span>
          </div>
          <div style={styles.progressBarTrack}>
            <div
              style={{
                ...styles.progressBarFill,
                width: `${progressPercentage}%`,
              }}
            />
          </div>
        </div>

        {progress.length > 0 && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>已完成章节</h2>
            <div style={styles.chapterList}>
              {progress
                .filter((p) => p.completed && p.chapters)
                .map((p) => (
                  <Link
                    key={p.id}
                    to={`/chapter/${p.chapters.slug}`}
                    style={styles.chapterItem}
                  >
                    <CheckCircle size={20} color="var(--color-success)" />
                    <span style={styles.chapterTitle}>{p.chapters.title}</span>
                  </Link>
                ))}
            </div>
          </section>
        )}

        {bookmarks.length > 0 && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <BookmarkIcon size={24} />
              我的书签
            </h2>
            <div style={styles.bookmarksList}>
              {bookmarks.map((bookmark) => (
                <div key={bookmark.id} style={styles.bookmarkItem}>
                  <Link
                    to={`/chapter/${bookmark.chapters.slug}`}
                    style={styles.bookmarkChapter}
                  >
                    {bookmark.chapters.title}
                  </Link>
                  <p style={styles.bookmarkExcerpt}>
                    "{bookmark.content_excerpt}"
                  </p>
                  {bookmark.note && (
                    <p style={styles.bookmarkNote}>
                      <strong>笔记：</strong>{bookmark.note}
                    </p>
                  )}
                  <p style={styles.bookmarkDate}>
                    {new Date(bookmark.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {progress.length === 0 && bookmarks.length === 0 && (
          <div style={styles.emptyState}>
            <BookOpen size={48} color="var(--color-text-tertiary)" />
            <p style={styles.emptyText}>开始阅读来跟踪你的进度</p>
            <Link to="/" style={styles.startButton}>
              开始阅读
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIcon, color }}>{icon}</div>
      <div style={styles.statContent}>
        <p style={styles.statLabel}>{label}</p>
        <p style={styles.statValue}>{value}</p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    flex: 1,
    paddingBottom: 'calc(var(--spacing-unit) * 10)',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    color: 'var(--color-text-secondary)',
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
    minHeight: '60vh',
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
    backgroundColor: 'var(--color-bg-secondary)',
    padding: 'calc(var(--spacing-unit) * 6) calc(var(--spacing-unit) * 3)',
    textAlign: 'center',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: 'calc(var(--spacing-unit) * 4) calc(var(--spacing-unit) * 3)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'calc(var(--spacing-unit) * 3)',
    marginBottom: 'calc(var(--spacing-unit) * 6)',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 2)',
    padding: 'calc(var(--spacing-unit) * 3)',
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--border-radius-lg)',
  },
  statIcon: {},
  statContent: {},
  statLabel: {
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
    marginBottom: 'calc(var(--spacing-unit) * 0.5)',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    margin: 0,
  },
  progressBar: {
    marginBottom: 'calc(var(--spacing-unit) * 6)',
  },
  progressBarLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 'calc(var(--spacing-unit) * 1)',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  progressBarTrack: {
    height: '12px',
    backgroundColor: 'var(--color-bg-tertiary)',
    borderRadius: 'var(--border-radius-md)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--color-success)',
    transition: 'width var(--transition-normal)',
  },
  section: {
    marginBottom: 'calc(var(--spacing-unit) * 6)',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: 'calc(var(--spacing-unit) * 3)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 2)',
  },
  chapterList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing-unit) * 1.5)',
  },
  chapterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 2)',
    padding: 'calc(var(--spacing-unit) * 2)',
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--border-radius-md)',
    transition: 'all var(--transition-fast)',
  },
  chapterTitle: {
    flex: 1,
    fontWeight: 500,
  },
  bookmarksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing-unit) * 3)',
  },
  bookmarkItem: {
    padding: 'calc(var(--spacing-unit) * 3)',
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--border-radius-lg)',
    borderLeft: '4px solid var(--color-primary)',
  },
  bookmarkChapter: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
    marginBottom: 'calc(var(--spacing-unit) * 1.5)',
  },
  bookmarkExcerpt: {
    fontSize: '1rem',
    fontStyle: 'italic',
    color: 'var(--color-text)',
    lineHeight: 1.6,
    marginBottom: 'calc(var(--spacing-unit) * 1)',
  },
  bookmarkNote: {
    fontSize: '0.9rem',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
    marginBottom: 'calc(var(--spacing-unit) * 1)',
  },
  bookmarkDate: {
    fontSize: '0.75rem',
    color: 'var(--color-text-tertiary)',
    margin: 0,
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
  startButton: {
    padding: 'calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 4)',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    borderRadius: 'var(--border-radius-md)',
    fontWeight: 600,
    fontSize: '1rem',
  },
}
