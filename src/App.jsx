import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import Home from './pages/Home'

const ChapterReader = lazy(() => import('./pages/ChapterReader'))
const QuickGuide = lazy(() => import('./pages/QuickGuide'))
const AIAssistant = lazy(() => import('./pages/AIAssistant'))
const Practice = lazy(() => import('./pages/Practice'))
const Progress = lazy(() => import('./pages/Progress'))
const Search = lazy(() => import('./pages/Search'))

function PageLoading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      color: 'var(--color-text-secondary)',
      fontSize: '1rem',
    }}>
      加载中...
    </div>
  )
}

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: 'var(--color-text-secondary)'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <Router>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Layout session={session} theme={theme} onToggleTheme={toggleTheme} />}>
            <Route index element={<Home />} />
            <Route path="chapter/:slug" element={<ChapterReader session={session} />} />
            <Route path="quick-guide" element={<QuickGuide />} />
            <Route path="ai-assistant" element={<AIAssistant session={session} />} />
            <Route path="practice" element={<Practice session={session} />} />
            <Route path="progress" element={<Progress session={session} />} />
            <Route path="search" element={<Search />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
