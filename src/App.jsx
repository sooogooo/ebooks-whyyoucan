import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import Home from './pages/Home'
import ChapterReader from './pages/ChapterReader'
import QuickGuide from './pages/QuickGuide'
import AIAssistant from './pages/AIAssistant'
import Practice from './pages/Practice'
import Progress from './pages/Progress'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

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
      <Routes>
        <Route path="/" element={<Layout session={session} />}>
          <Route index element={<Home />} />
          <Route path="chapter/:slug" element={<ChapterReader session={session} />} />
          <Route path="quick-guide" element={<QuickGuide />} />
          <Route path="ai" element={<AIAssistant session={session} />} />
          <Route path="practice" element={<Practice session={session} />} />
          <Route path="progress" element={<Progress session={session} />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
