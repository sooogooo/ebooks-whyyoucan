import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, Sparkles, Target, TrendingUp } from 'lucide-react'

export default function Navigation() {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/quick-guide', icon: BookOpen, label: '快速入门' },
    { path: '/practice', icon: Target, label: '实战练习' },
    { path: '/ai', icon: Sparkles, label: 'AI助手' },
    { path: '/progress', icon: TrendingUp, label: '我的进度' },
  ]

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
            >
              <Icon size={20} />
              <span style={styles.label}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    position: 'sticky',
    bottom: 0,
    backgroundColor: 'var(--color-bg)',
    borderTop: '1px solid var(--color-border)',
    boxShadow: '0 -2px 10px var(--color-shadow)',
    zIndex: 100,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 0.5)',
    padding: 'calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 1)',
    color: 'var(--color-text-secondary)',
    transition: 'all var(--transition-fast)',
  },
  navItemActive: {
    color: 'var(--color-primary)',
    backgroundColor: 'var(--color-primary-light)',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 500,
  },
}
