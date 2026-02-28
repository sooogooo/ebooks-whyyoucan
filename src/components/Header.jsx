import { Link } from 'react-router-dom'
import { User, LogOut, LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useState } from 'react'

export default function Header({ session }) {
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <>
      <header style={styles.header}>
        <div style={styles.container}>
          <Link to="/" style={styles.logo}>
            <h1 style={styles.logoText}>凭什么</h1>
            <span style={styles.subtitle}>反击心法</span>
          </Link>

          <div style={styles.actions}>
            {session ? (
              <div style={styles.userMenu}>
                <Link to="/progress" style={styles.iconButton}>
                  <User size={20} />
                </Link>
                <button onClick={handleSignOut} style={styles.iconButton}>
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} style={styles.loginButton}>
                <LogIn size={18} />
                <span>登录</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  )
}

function AuthModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      }
      onClose()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>{isLogin ? '登录' : '注册'}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </button>
        </form>

        <p style={styles.switchText}>
          {isLogin ? '还没有账号？' : '已有账号？'}
          <button onClick={() => setIsLogin(!isLogin)} style={styles.switchButton}>
            {isLogin ? '注册' : '登录'}
          </button>
        </p>
      </div>
    </div>
  )
}

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: 'var(--color-bg)',
    borderBottom: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-sm)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: 'calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing-unit) * 0.5)',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
    letterSpacing: '0.05em',
  },
  actions: {
    display: 'flex',
    gap: 'calc(var(--spacing-unit) * 2)',
  },
  userMenu: {
    display: 'flex',
    gap: 'calc(var(--spacing-unit) * 1)',
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: 'var(--border-radius-md)',
    color: 'var(--color-text-secondary)',
    backgroundColor: 'transparent',
    transition: 'all var(--transition-fast)',
  },
  loginButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1)',
    padding: 'calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 3)',
    borderRadius: 'var(--border-radius-md)',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    fontWeight: 500,
    fontSize: '0.9rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 'calc(var(--spacing-unit) * 2)',
  },
  modal: {
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--border-radius-lg)',
    padding: 'calc(var(--spacing-unit) * 4)',
    maxWidth: '400px',
    width: '100%',
    boxShadow: 'var(--shadow-lg)',
  },
  modalTitle: {
    marginBottom: 'calc(var(--spacing-unit) * 3)',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing-unit) * 2)',
  },
  input: {
    padding: 'calc(var(--spacing-unit) * 2)',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--color-border)',
    fontSize: '1rem',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
  },
  submitButton: {
    padding: 'calc(var(--spacing-unit) * 2)',
    borderRadius: 'var(--border-radius-md)',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    fontWeight: 600,
    fontSize: '1rem',
  },
  error: {
    color: 'var(--color-error)',
    fontSize: '0.875rem',
    margin: 0,
  },
  switchText: {
    marginTop: 'calc(var(--spacing-unit) * 3)',
    textAlign: 'center',
    color: 'var(--color-text-secondary)',
  },
  switchButton: {
    marginLeft: 'calc(var(--spacing-unit) * 1)',
    color: 'var(--color-primary)',
    fontWeight: 500,
  },
}
