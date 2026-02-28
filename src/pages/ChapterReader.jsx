import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, Bookmark, CheckCircle, MessageSquare, Sparkles } from 'lucide-react'
import AIReadingAssistant from '../components/AIReadingAssistant'
import AITextSelection from '../components/AITextSelection'

export default function ChapterReader({ session }) {
  const { slug } = useParams()
  const [chapter, setChapter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [selectionPosition, setSelectionPosition] = useState(null)
  const contentRef = useRef(null)

  useEffect(() => {
    loadChapter()
  }, [slug])

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
    return () => {
      document.removeEventListener('mouseup', handleSelection)
    }
  }, [])

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

      {chapter.image_url && (
        <img src={chapter.image_url} alt={chapter.title} style={styles.headerImage} />
      )}

      <article style={styles.article}>
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
      </article>

      <AITextSelection
        selectedText={selectedText}
        position={selectionPosition}
        onClose={handleCloseSelection}
        onAskAI={handleAskAI}
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
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 calc(var(--spacing-unit) * 3)',
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
    lineHeight: 1.8,
    color: 'var(--color-text)',
  },
  h1: {
    fontSize: '2rem',
    fontWeight: 700,
    marginTop: 'calc(var(--spacing-unit) * 6)',
    marginBottom: 'calc(var(--spacing-unit) * 3)',
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
    lineHeight: 1.8,
  },
  blockquote: {
    borderLeft: '4px solid var(--color-primary)',
    paddingLeft: 'calc(var(--spacing-unit) * 3)',
    marginLeft: 0,
    marginRight: 0,
    marginTop: 'calc(var(--spacing-unit) * 4)',
    marginBottom: 'calc(var(--spacing-unit) * 4)',
    fontStyle: 'italic',
    color: 'var(--color-text-secondary)',
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
