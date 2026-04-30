import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search as SearchIcon, X, BookOpen } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setSearched(false)
      return
    }
    const t = setTimeout(() => runSearch(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  const runSearch = async (q) => {
    setLoading(true)
    try {
      const pattern = `%${q}%`
      const { data, error } = await supabase
        .from('chapters')
        .select('id, slug, title, subtitle, content, chapter_type, chapter_order')
        .or(`title.ilike.${pattern},subtitle.ilike.${pattern},content.ilike.${pattern}`)
        .order('chapter_order', { ascending: true })
        .limit(30)
      if (error) throw error
      const enriched = (data || []).map((ch) => ({
        ...ch,
        snippet: buildSnippet(ch.content || '', q),
      }))
      setResults(enriched)
      setSearched(true)
    } catch (err) {
      console.error('search error', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.searchBar}>
        <SearchIcon size={20} color="var(--color-text-tertiary)" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索章节标题与内容..."
          style={styles.input}
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery('')} style={styles.clearBtn} title="清除">
            <X size={18} />
          </button>
        )}
      </div>

      <div style={styles.body}>
        {loading && <p style={styles.status}>搜索中...</p>}

        {!loading && !searched && !query && (
          <div style={styles.empty}>
            <SearchIcon size={40} color="var(--color-text-tertiary)" />
            <p style={styles.emptyText}>输入关键词搜索全书内容</p>
            <div style={styles.hints}>
              {['凭什么', '自证陷阱', '反问', '停顿3秒', '全称量词'].map((k) => (
                <button key={k} onClick={() => setQuery(k)} style={styles.hintChip}>
                  {k}
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <p style={styles.status}>未找到与「{query}」相关的内容</p>
        )}

        {!loading && results.length > 0 && (
          <>
            <p style={styles.resultCount}>共找到 {results.length} 条结果</p>
            <div style={styles.results}>
              {results.map((r) => (
                <Link key={r.id} to={`/chapter/${r.slug}`} style={styles.resultItem}>
                  <div style={styles.resultHeader}>
                    <BookOpen size={16} color="var(--color-primary)" />
                    <span style={styles.resultCategory}>
                      {r.chapter_type === 'rule' ? '反击铁律' : '反击心法'}
                    </span>
                  </div>
                  <h3 style={styles.resultTitle}>
                    {highlight(r.title, query)}
                  </h3>
                  {r.subtitle && (
                    <p style={styles.resultSubtitle}>{highlight(r.subtitle, query)}</p>
                  )}
                  {r.snippet && (
                    <p style={styles.resultSnippet}>{highlight(r.snippet, query)}</p>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function buildSnippet(content, query) {
  if (!content) return ''
  const idx = content.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return content.slice(0, 120) + (content.length > 120 ? '...' : '')
  const start = Math.max(0, idx - 40)
  const end = Math.min(content.length, idx + query.length + 80)
  return (start > 0 ? '...' : '') + content.slice(start, end) + (end < content.length ? '...' : '')
}

function highlight(text, query) {
  if (!query || !text) return text
  const parts = []
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  let last = 0
  let idx = lower.indexOf(q)
  let key = 0
  while (idx !== -1) {
    if (idx > last) parts.push(<span key={key++}>{text.slice(last, idx)}</span>)
    parts.push(<mark key={key++} style={{ backgroundColor: 'rgba(245,158,11,0.3)', color: 'inherit' }}>{text.slice(idx, idx + query.length)}</mark>)
    last = idx + query.length
    idx = lower.indexOf(q, last)
  }
  if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>)
  return parts
}

const styles = {
  container: {
    flex: 1,
    maxWidth: '800px',
    width: '100%',
    margin: '0 auto',
    padding: 'calc(var(--spacing-unit) * 3)',
    paddingBottom: 'calc(var(--spacing-unit) * 10)',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1.5)',
    padding: 'calc(var(--spacing-unit) * 2)',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-lg)',
    marginBottom: 'calc(var(--spacing-unit) * 3)',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '1rem',
    color: 'var(--color-text)',
  },
  clearBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    color: 'var(--color-text-tertiary)',
    cursor: 'pointer',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
  },
  status: {
    textAlign: 'center',
    color: 'var(--color-text-secondary)',
    padding: 'calc(var(--spacing-unit) * 4)',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 2)',
    padding: 'calc(var(--spacing-unit) * 8) calc(var(--spacing-unit) * 2)',
  },
  emptyText: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.95rem',
  },
  hints: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'calc(var(--spacing-unit) * 1)',
    justifyContent: 'center',
    marginTop: 'calc(var(--spacing-unit) * 2)',
  },
  hintChip: {
    padding: '6px 14px',
    fontSize: '0.85rem',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    borderRadius: '999px',
    cursor: 'pointer',
  },
  resultCount: {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  results: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing-unit) * 2)',
  },
  resultItem: {
    display: 'block',
    padding: 'calc(var(--spacing-unit) * 3)',
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-lg)',
    transition: 'all var(--transition-fast)',
    color: 'var(--color-text)',
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: 'calc(var(--spacing-unit) * 1)',
  },
  resultCategory: {
    fontSize: '0.75rem',
    color: 'var(--color-primary)',
    fontWeight: 500,
  },
  resultTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: 'calc(var(--spacing-unit) * 1)',
  },
  resultSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--color-text-secondary)',
    marginBottom: 'calc(var(--spacing-unit) * 1)',
  },
  resultSnippet: {
    fontSize: '0.85rem',
    color: 'var(--color-text-tertiary)',
    lineHeight: 1.6,
    margin: 0,
  },
}
