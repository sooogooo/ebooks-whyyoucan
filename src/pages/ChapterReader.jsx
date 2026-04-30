import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, Bookmark, CheckCircle, MessageSquare, Sparkles, Share2, Trash2 } from 'lucide-react'
import ShareModal from '../components/ShareModal'
import AIReadingAssistant from '../components/AIReadingAssistant'
import AITextSelection from '../components/AITextSelection'
import ScenarioSandbox from '../components/ScenarioSandbox'
import ReflectionBox from '../components/ReflectionBox'

export default function ChapterReader({ session }) {
  const { slug } = useParams()
  const [chapter, setChapter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [selectionPosition, setSelectionPosition] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [bookmarks, setBookmarks] = useState([])
  const [showBookmarks, setShowBookmarks] = useState(false)
  const contentRef = useRef(null)
  const positionSaveTimer = useRef(null)
  const hasRestoredPosition = useRef(false)

  useEffect(() => {
    loadChapter()
  }, [slug])

  useEffect(() => {
    if (chapter && session) loadBookmarks()
  }, [chapter, session])

  useEffect(() => {
    if (!chapter) return
    const originalTitle = document.title
    document.title = `${chapter.title} - 凭什么`
    setMetaTag('description', chapter.subtitle || chapter.content?.slice(0, 140) || '')
    setMetaTag('og:title', `${chapter.title} - 凭什么`, 'property')
    setMetaTag('og:description', chapter.subtitle || '', 'property')
    if (chapter.image_url) setMetaTag('og:image', chapter.image_url, 'property')
    return () => {
      document.title = originalTitle
    }
  }, [chapter])

  const loadBookmarks = async () => {
    if (!session || !chapter) return
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('chapter_id', chapter.id)
      .order('created_at', { ascending: false })
    if (data) setBookmarks(data)
  }

  const removeBookmark = async (id) => {
    await supabase.from('bookmarks').delete().eq('id', id)
    loadBookmarks()
  }

  const loadChapter = async () => {
    try {
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      if (chapterError) throw chapterError
      setChapter(chapterData)

      if (session && chapterData) {
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('chapter_id', chapterData.id)
          .maybeSingle()

        setProgress(progressData)
      }
    } catch (error) {
      console.error('Error loading chapter:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      const text = selection.toString().trim()

      if (text && text.length > 5 && text.length < 500) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        setSelectedText(text)
        setSelectionPosition({
          top: rect.bottom + window.scrollY + 10,
          left: rect.left + window.scrollX,
        })
      } else {
        setSelectedText('')
        setSelectionPosition(null)
      }
    }

    document.addEventListener('mouseup', handleSelection)
    document.addEventListener('touchend', handleSelection)
    return () => {
      document.removeEventListener('mouseup', handleSelection)
      document.removeEventListener('touchend', handleSelection)
    }
  }, [])

  useEffect(() => {
    if (!chapter || !session || hasRestoredPosition.current) return
    if (progress?.last_position && progress.last_position > 5) {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo({ top: (progress.last_position / 100) * scrollHeight, behavior: 'auto' })
    }
    hasRestoredPosition.current = true
  }, [chapter, progress, session])

  useEffect(() => {
    if (!chapter || !session) return
    const handleScroll = () => {
      if (positionSaveTimer.current) clearTimeout(positionSaveTimer.current)
      positionSaveTimer.current = setTimeout(() => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
        if (scrollHeight <= 0) return
        const percent = Math.min(100, Math.max(0, Math.round((window.scrollY / scrollHeight) * 100)))
        supabase.from('user_progress').upsert({
          user_id: session.user.id,
          chapter_id: chapter.id,
          last_position: percent,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,chapter_id' }).then(() => {})
      }, 1500)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (positionSaveTimer.current) clearTimeout(positionSaveTimer.current)
    }
  }, [chapter, session])

  const markAsComplete = async () => {
    if (!session || !chapter) return

    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: session.user.id,
          chapter_id: chapter.id,
          completed: true,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
      setProgress({ ...progress, completed: true })
    } catch (error) {
      console.error('Error marking as complete:', error)
    }
  }

  const handleCloseSelection = () => {
    setSelectedText('')
    setSelectionPosition(null)
  }

  const handleAskAI = (question) => {
    setShowAIAssistant(true)
  }

  if (loading) {
    return <div style={styles.loading}>加载中...</div>
  }

  if (!chapter) {
    return (
      <div style={styles.notFound}>
        <p>章节未找到</p>
        <Link to="/" style={styles.backLink}>返回首页</Link>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/" style={styles.backButton}>
          <ArrowLeft size={20} />
          <span>返回</span>
        </Link>
        <div style={styles.headerActions}>
          {session && (
            <button
              onClick={() => setShowBookmarks(!showBookmarks)}
              style={styles.shareBtn}
              title="我的书签"
            >
              <Bookmark size={18} />
              {bookmarks.length > 0 && (
                <span style={styles.badge}>{bookmarks.length}</span>
              )}
            </button>
          )}
          <button
            onClick={() => setShowShareModal(true)}
            style={styles.shareBtn}
            title="分享本章"
          >
            <Share2 size={18} />
          </button>
          <button
            onClick={() => setShowAIAssistant(true)}
            style={styles.aiButton}
            title="打开AI阅读助手"
          >
            <Sparkles size={18} />
            <span>AI助手</span>
          </button>
          {session && (
            <button
              onClick={markAsComplete}
              style={{
                ...styles.completeButton,
                ...(progress?.completed ? styles.completedButton : {}),
              }}
            >
              <CheckCircle size={18} />
              <span>{progress?.completed ? '已完成' : '标记为完成'}</span>
            </button>
          )}
        </div>
      </div>

      {showBookmarks && session && (
        <div style={styles.bookmarksPanel}>
          <h3 style={styles.bookmarksTitle}>本章书签 ({bookmarks.length})</h3>
          {bookmarks.length === 0 ? (
            <p style={styles.bookmarksEmpty}>
              还没有书签。选中文字后点击"加入书签"即可保存。
            </p>
          ) : (
            bookmarks.map((bm) => (
              <div key={bm.id} style={styles.bookmarkItem}>
                <p style={styles.bookmarkText}>{bm.content_excerpt}</p>
                <div style={styles.bookmarkMeta}>
                  <span style={styles.bookmarkDate}>
                    {new Date(bm.created_at).toLocaleDateString('zh-CN')}
                  </span>
                  <button onClick={() => removeBookmark(bm.id)} style={styles.bookmarkDelete} title="删除">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {chapter.image_url && (
        <img src={chapter.image_url} alt={chapter.title} style={styles.headerImage} loading="lazy" />
      )}

      <article key={slug} style={styles.article} className="paper page-flip">
        <header style={styles.articleHeader}>
          <h1 style={styles.title}>{chapter.title}</h1>
          {chapter.subtitle && (
            <p style={styles.subtitle}>{chapter.subtitle}</p>
          )}
          <div style={styles.meta}>
            <span>{chapter.reading_time} 分钟阅读</span>
          </div>
        </header>

        <div style={styles.content}>
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 style={styles.h1}>{children}</h1>,
              h2: ({ children }) => <h2 style={styles.h2}>{children}</h2>,
              h3: ({ children }) => <h3 style={styles.h3}>{children}</h3>,
              p: ({ children }) => <p style={styles.p}>{children}</p>,
              blockquote: ({ children }) => <blockquote style={styles.blockquote}>{children}</blockquote>,
              ul: ({ children }) => <ul style={styles.ul}>{children}</ul>,
              ol: ({ children }) => <ol style={styles.ol}>{children}</ol>,
              li: ({ children }) => <li style={styles.li}>{children}</li>,
              code: ({ children }) => <code style={styles.code}>{children}</code>,
              pre: ({ children }) => <pre style={styles.pre}>{children}</pre>,
              table: ({ children }) => <table style={styles.table}>{children}</table>,
              th: ({ children }) => <th style={styles.th}>{children}</th>,
              td: ({ children }) => <td style={styles.td}>{children}</td>,
            }}
          >
            {chapter.content}
          </ReactMarkdown>
        </div>

        <ScenarioSandbox chapterId={chapter.id} session={session} />
        <ReflectionBox chapterId={chapter.id} chapterTitle={chapter.title} session={session} />
      </article>

      <AITextSelection
        selectedText={selectedText}
        position={selectionPosition}
        onClose={handleCloseSelection}
        onAskAI={handleAskAI}
        chapterId={chapter?.id}
        session={session}
        onBookmarkSaved={loadBookmarks}
      />

      <AIReadingAssistant
        chapterContent={chapter?.content}
        chapterTitle={chapter?.title}
        session={session}
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />

      {showAIAssistant && (
        <button
          onClick={() => setShowAIAssistant(false)}
          style={styles.floatingCloseButton}
          title="关闭AI助手"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {showShareModal && chapter && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={chapter.title}
          content={chapter.subtitle || chapter.content?.slice(0, 200) || ''}
          category={chapter.chapter_type === 'rule' ? '反击铁律' : '反击心法'}
          theme="wisdom"
          chapterId={chapter.id}
        />
      )}
    </div>
  )
}

function setMetaTag(name, content, attr = 'name') {
  if (!content) return
  let tag = document.querySelector(`meta[${attr}="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
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
  notFound: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: 'calc(var(--spacing-unit) * 2)',
  },
  backLink: {
    color: 'var(--color-primary)',
    fontWeight: 600,
  },
  header: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: 'calc(var(--spacing-unit) * 3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1)',
    color: 'var(--color-text-secondary)',
    fontWeight: 500,
  },
  headerActions: {
    display: 'flex',
    gap: 'calc(var(--spacing-unit) * 2)',
    alignItems: 'center',
  },
  shareBtn: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    minWidth: '16px',
    height: '16px',
    padding: '0 4px',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'white',
    backgroundColor: 'var(--color-primary)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarksPanel: {
    maxWidth: '800px',
    margin: '0 auto calc(var(--spacing-unit) * 3)',
    padding: 'calc(var(--spacing-unit) * 3)',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-lg)',
  },
  bookmarksTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  bookmarksEmpty: {
    fontSize: '0.875rem',
    color: 'var(--color-text-tertiary)',
  },
  bookmarkItem: {
    padding: 'calc(var(--spacing-unit) * 2)',
    marginBottom: 'calc(var(--spacing-unit) * 1.5)',
    backgroundColor: 'var(--color-bg)',
    borderLeft: '3px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-sm)',
  },
  bookmarkText: {
    fontSize: '0.95rem',
    lineHeight: 1.6,
    margin: 0,
    color: 'var(--color-text)',
  },
  bookmarkMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
  },
  bookmarkDate: {
    fontSize: '0.75rem',
    color: 'var(--color-text-tertiary)',
  },
  bookmarkDelete: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    border: 'none',
    background: 'transparent',
    color: 'var(--color-text-tertiary)',
    cursor: 'pointer',
    borderRadius: 'var(--border-radius-sm)',
  },
  aiButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1)',
    padding: 'calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2)',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  completeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1)',
    padding: 'calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2)',
    backgroundColor: 'var(--color-success)',
    color: 'white',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  completedButton: {
    backgroundColor: 'var(--color-text-tertiary)',
  },
  floatingCloseButton: {
    position: 'fixed',
    bottom: 'calc(var(--spacing-unit) * 10)',
    right: 'calc(var(--spacing-unit) * 3)',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 999,
  },
  headerImage: {
    width: '100%',
    maxWidth: '800px',
    height: '400px',
    objectFit: 'cover',
    margin: '0 auto calc(var(--spacing-unit) * 4)',
    borderRadius: 'var(--border-radius-lg)',
  },
  article: {
    maxWidth: '760px',
    margin: 'calc(var(--spacing-unit) * 3) auto',
    padding: 'calc(var(--spacing-unit) * 6) calc(var(--spacing-unit) * 5)',
    borderRadius: 'var(--border-radius-lg)',
    boxShadow: '0 12px 40px var(--color-shadow)',
    border: '1px solid var(--color-border)',
  },
  articleHeader: {
    marginBottom: 'calc(var(--spacing-unit) * 6)',
    paddingBottom: 'calc(var(--spacing-unit) * 4)',
    borderBottom: '1px solid var(--color-border)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  meta: {
    display: 'flex',
    gap: 'calc(var(--spacing-unit) * 2)',
    fontSize: '0.875rem',
    color: 'var(--color-text-tertiary)',
  },
  content: {
    fontSize: '1.125rem',
    lineHeight: 2,
    color: 'var(--color-text)',
    fontFamily: 'var(--font-serif)',
    letterSpacing: '0.02em',
  },
  h1: {
    fontSize: '2rem',
    fontWeight: 600,
    marginTop: 'calc(var(--spacing-unit) * 6)',
    marginBottom: 'calc(var(--spacing-unit) * 3)',
    color: 'var(--color-primary)',
  },
  h2: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginTop: 'calc(var(--spacing-unit) * 5)',
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  h3: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginTop: 'calc(var(--spacing-unit) * 4)',
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  p: {
    marginBottom: 'calc(var(--spacing-unit) * 3)',
    lineHeight: 2,
    textIndent: '2em',
  },
  blockquote: {
    borderLeft: '3px solid var(--color-accent)',
    paddingLeft: 'calc(var(--spacing-unit) * 3)',
    paddingTop: 'calc(var(--spacing-unit) * 1)',
    paddingBottom: 'calc(var(--spacing-unit) * 1)',
    marginLeft: 0,
    marginRight: 0,
    marginTop: 'calc(var(--spacing-unit) * 4)',
    marginBottom: 'calc(var(--spacing-unit) * 4)',
    fontStyle: 'italic',
    color: 'var(--color-text-secondary)',
    backgroundColor: 'rgba(217, 162, 115, 0.06)',
    borderRadius: '0 8px 8px 0',
  },
  ul: {
    marginBottom: 'calc(var(--spacing-unit) * 3)',
    paddingLeft: 'calc(var(--spacing-unit) * 4)',
  },
  ol: {
    marginBottom: 'calc(var(--spacing-unit) * 3)',
    paddingLeft: 'calc(var(--spacing-unit) * 4)',
  },
  li: {
    marginBottom: 'calc(var(--spacing-unit) * 1)',
    lineHeight: 1.8,
  },
  code: {
    backgroundColor: 'var(--color-bg-secondary)',
    padding: 'calc(var(--spacing-unit) * 0.5) calc(var(--spacing-unit) * 1)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.9em',
    fontFamily: 'monospace',
  },
  pre: {
    backgroundColor: 'var(--color-bg-secondary)',
    padding: 'calc(var(--spacing-unit) * 3)',
    borderRadius: 'var(--border-radius-md)',
    overflow: 'auto',
    marginBottom: 'calc(var(--spacing-unit) * 3)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: 'calc(var(--spacing-unit) * 4)',
    fontSize: '0.95rem',
  },
  th: {
    backgroundColor: 'var(--color-bg-secondary)',
    padding: 'calc(var(--spacing-unit) * 2)',
    textAlign: 'left',
    borderBottom: '2px solid var(--color-border)',
    fontWeight: 600,
  },
  td: {
    padding: 'calc(var(--spacing-unit) * 2)',
    borderBottom: '1px solid var(--color-border)',
  },
}
