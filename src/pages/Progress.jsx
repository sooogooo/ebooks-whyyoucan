import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BookOpen, CheckCircle, Clock, TrendingUp, Bookmark as BookmarkIcon, Pencil, Trash2, Flame, Award, Target, Zap } from 'lucide-react'

export default function Progress({ session }) {
  const [stats, setStats] = useState({
    totalChapters: 0,
    completedChapters: 0,
    readingTime: 0,
    streak: 0,
  })
  const [progress, setProgress] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingBookmarkId, setEditingBookmarkId] = useState(null)
  const [noteDraft, setNoteDraft] = useState('')

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
      const completedChapters = userProgress?.filter((p) => p.completed && p.chapters) || []
      const readTimeSum = completedChapters.reduce((s, p) => s + (p.chapters.reading_time || 0), 0)
      const streak = computeStreak(userProgress || [])

      setStats({
        totalChapters: chapters?.length || 0,
        completedChapters: completed,
        readingTime: readTimeSum,
        streak,
      })

      setProgress(userProgress || [])
      setBookmarks(userBookmarks || [])
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const startEditNote = (bookmark) => {
    setEditingBookmarkId(bookmark.id)
    setNoteDraft(bookmark.note || '')
  }

  const saveNote = async (id) => {
    await supabase.from('bookmarks').update({ note: noteDraft }).eq('id', id)
    setEditingBookmarkId(null)
    setNoteDraft('')
    loadProgress()
  }

  const deleteBookmark = async (id) => {
    if (!confirm('确定要删除这条书签吗？')) return
    await supabase.from('bookmarks').delete().eq('id', id)
    loadProgress()
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
            label="已读时长"
            value={`${stats.readingTime} 分钟`}
            color="var(--color-warning)"
          />
          <StatCard
            icon={<Flame size={32} />}
            label="连续打卡"
            value={`${stats.streak} 天`}
            color="var(--color-error)"
          />
        </div>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Award size={24} />
            成就徽章
          </h2>
          <div style={styles.achievementsGrid}>
            {ACHIEVEMENTS.map((a) => {
              const unlocked = a.check(stats)
              return (
                <div
                  key={a.id}
                  style={{
                    ...styles.achievement,
                    ...(unlocked ? styles.achievementUnlocked : styles.achievementLocked),
                  }}
                  title={unlocked ? '已解锁' : '未解锁'}
                >
                  <div style={{ ...styles.achievementIcon, color: unlocked ? 'var(--color-warning)' : 'var(--color-text-tertiary)' }}>
                    {a.icon}
                  </div>
                  <div style={styles.achievementTextWrap}>
                    <p style={styles.achievementLabel}>{a.label}</p>
                    <p style={styles.achievementDesc}>{a.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

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
                    to={`/chapter/${bookmark.chapters?.slug || ''}`}
                    style={styles.bookmarkChapter}
                  >
                    {bookmark.chapters?.title || '章节'}
                  </Link>
                  <p style={styles.bookmarkExcerpt}>
                    "{bookmark.content_excerpt}"
                  </p>

                  {editingBookmarkId === bookmark.id ? (
                    <div style={styles.noteEditor}>
                      <textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="写下你的想法..."
                        style={styles.noteTextarea}
                        rows={3}
                      />
                      <div style={styles.noteActions}>
                        <button onClick={() => saveNote(bookmark.id)} style={styles.noteSaveBtn}>
                          保存
                        </button>
                        <button onClick={() => setEditingBookmarkId(null)} style={styles.noteCancelBtn}>
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {bookmark.note && (
                        <p style={styles.bookmarkNote}>
                          <strong>笔记：</strong>{bookmark.note}
                        </p>
                      )}
                    </>
                  )}

                  <div style={styles.bookmarkFooter}>
                    <p style={styles.bookmarkDate}>
                      {new Date(bookmark.created_at).toLocaleDateString('zh-CN')}
                    </p>
                    {editingBookmarkId !== bookmark.id && (
                      <div style={styles.bookmarkActions}>
                        <button onClick={() => startEditNote(bookmark)} style={styles.bookmarkActionBtn} title="编辑笔记">
                          <Pencil size={14} />
                          <span>{bookmark.note ? '编辑笔记' : '添加笔记'}</span>
                        </button>
                        <button onClick={() => deleteBookmark(bookmark.id)} style={styles.bookmarkActionBtn} title="删除">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
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

function computeStreak(progressRows) {
  const dates = new Set(
    progressRows
      .filter((p) => p.updated_at)
      .map((p) => new Date(p.updated_at).toISOString().slice(0, 10))
  )
  if (dates.size === 0) return 0
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (dates.has(key)) {
      streak++
    } else if (i === 0) {
      continue
    } else {
      break
    }
  }
  return streak
}

const ACHIEVEMENTS = [
  { id: 'first', label: '开卷有益', desc: '完成第一章', icon: <BookOpen size={24} />, check: (s) => s.completedChapters >= 1 },
  { id: 'five', label: '渐入佳境', desc: '完成 5 章', icon: <Target size={24} />, check: (s) => s.completedChapters >= 5 },
  { id: 'ten', label: '坚持不懈', desc: '完成 10 章', icon: <Zap size={24} />, check: (s) => s.completedChapters >= 10 },
  { id: 'all', label: '功成名就', desc: '读完全书', icon: <Award size={24} />, check: (s) => s.totalChapters > 0 && s.completedChapters >= s.totalChapters },
  { id: 'streak3', label: '三日连击', desc: '连续 3 天阅读', icon: <Flame size={24} />, check: (s) => s.streak >= 3 },
  { id: 'streak7', label: '一周习惯', desc: '连续 7 天阅读', icon: <Flame size={24} />, check: (s) => s.streak >= 7 },
]

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
  achievementsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 'calc(var(--spacing-unit) * 2)',
  },
  achievement: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 2)',
    padding: 'calc(var(--spacing-unit) * 2.5)',
    borderRadius: 'var(--border-radius-lg)',
    border: '1px solid var(--color-border)',
    transition: 'all var(--transition-fast)',
  },
  achievementUnlocked: {
    backgroundColor: 'var(--color-bg-secondary)',
    borderColor: 'var(--color-warning)',
  },
  achievementLocked: {
    backgroundColor: 'var(--color-bg-secondary)',
    opacity: 0.5,
  },
  achievementIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-bg)',
    flexShrink: 0,
  },
  achievementTextWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  achievementLabel: {
    fontSize: '0.95rem',
    fontWeight: 600,
    margin: 0,
    color: 'var(--color-text)',
  },
  achievementDesc: {
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
    margin: 0,
  },
  bookmarkFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'calc(var(--spacing-unit) * 1.5)',
  },
  bookmarkActions: {
    display: 'flex',
    gap: 'calc(var(--spacing-unit) * 1)',
  },
  bookmarkActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
  },
  noteEditor: {
    marginTop: 'calc(var(--spacing-unit) * 1.5)',
  },
  noteTextarea: {
    width: '100%',
    padding: 'calc(var(--spacing-unit) * 1.5)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    resize: 'vertical',
  },
  noteActions: {
    display: 'flex',
    gap: 'calc(var(--spacing-unit) * 1)',
    marginTop: 'calc(var(--spacing-unit) * 1)',
  },
  noteSaveBtn: {
    padding: '6px 14px',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    fontSize: '0.85rem',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
  },
  noteCancelBtn: {
    padding: '6px 14px',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    fontSize: '0.85rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
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
