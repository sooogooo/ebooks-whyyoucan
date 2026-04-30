import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, Check, Map as MapIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ReadingMap({ session, chapters: chaptersProp }) {
  const [chapters, setChapters] = useState(chaptersProp || [])
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(!chaptersProp)

  useEffect(() => {
    if (!chaptersProp) loadChapters()
  }, [])

  useEffect(() => {
    if (session) loadProgress()
  }, [session])

  const loadChapters = async () => {
    const { data } = await supabase
      .from('chapters')
      .select('id, slug, title, chapter_type, chapter_order')
      .order('chapter_order')
    setChapters(data || [])
    setLoading(false)
  }

  const loadProgress = async () => {
    const { data } = await supabase
      .from('user_progress')
      .select('chapter_id, completed')
      .eq('user_id', session.user.id)
    const map = {}
    for (const p of data || []) map[p.chapter_id] = p.completed
    setProgress(map)
  }

  if (loading) return null
  if (chapters.length === 0) return null

  const completedCount = chapters.filter((c) => progress[c.id]).length

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <MapIcon size={20} color="var(--color-primary)" />
          <h3 style={styles.title}>修炼路径</h3>
        </div>
        <span style={styles.counter}>
          {completedCount} / {chapters.length}
        </span>
      </div>

      <div style={styles.map}>
        {chapters.map((ch, i) => {
          const done = !!progress[ch.id]
          const prevDone = i === 0 || progress[chapters[i - 1]?.id]
          const unlocked = i === 0 || prevDone || done
          const isLeft = i % 2 === 0
          return (
            <div key={ch.id} style={{ ...styles.node, justifyContent: isLeft ? 'flex-start' : 'flex-end' }}>
              {i > 0 && (
                <div
                  style={{
                    ...styles.connector,
                    background: done
                      ? 'var(--color-success)'
                      : unlocked
                      ? 'var(--color-primary)'
                      : 'var(--color-border)',
                  }}
                />
              )}
              <Link
                to={unlocked ? `/chapter/${ch.slug}` : '#'}
                style={{
                  ...styles.stone,
                  ...(done ? styles.stoneDone : unlocked ? styles.stoneOpen : styles.stoneLocked),
                }}
                onClick={(e) => { if (!unlocked) e.preventDefault() }}
              >
                <div
                  style={{
                    ...styles.stoneInner,
                    backgroundColor: done
                      ? 'var(--color-success)'
                      : unlocked
                      ? 'var(--color-primary-light)'
                      : 'var(--color-bg-tertiary)',
                  }}
                >
                  {done ? (
                    <Check size={22} color="white" />
                  ) : !unlocked ? (
                    <Lock size={18} color="var(--color-text-tertiary)" />
                  ) : (
                    <span style={styles.stoneNum}>{i + 1}</span>
                  )}
                </div>
                <span style={styles.stoneLabel}>{ch.title}</span>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: 'calc(var(--spacing-unit) * 3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1)',
  },
  title: { fontSize: '1.1rem', margin: 0 },
  counter: {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    backgroundColor: 'var(--color-bg-secondary)',
    padding: '4px 12px',
    borderRadius: '999px',
  },
  map: {
    position: 'relative',
    padding: 'calc(var(--spacing-unit) * 2) 0',
  },
  node: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    padding: 'calc(var(--spacing-unit) * 1.5) 0',
  },
  connector: {
    position: 'absolute',
    top: '-4px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '3px',
    height: '14px',
    borderRadius: '2px',
  },
  stone: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1.5)',
    padding: 'calc(var(--spacing-unit) * 1)',
    borderRadius: 'var(--border-radius-lg)',
    maxWidth: '80%',
    textDecoration: 'none',
    transition: 'all var(--transition-fast)',
  },
  stoneInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  stoneLabel: {
    fontSize: '0.9rem',
    color: 'var(--color-text)',
    fontWeight: 500,
  },
  stoneDone: {
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  stoneOpen: {
    backgroundColor: 'var(--color-bg-secondary)',
  },
  stoneLocked: {
    opacity: 0.45,
    cursor: 'not-allowed',
  },
  stoneNum: {
    fontWeight: 700,
    color: 'var(--color-primary)',
  },
}
