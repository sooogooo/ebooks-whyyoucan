import { X, Sun, Moon, Feather, CloudRain, Coffee, TreePine, VolumeX, Type } from 'lucide-react'
import { useReadingSettings } from '../lib/readingSettings'

const THEMES = [
  { id: 'warm', label: '暖光', desc: '米黄 · 陶土', icon: Sun },
  { id: 'night', label: '夜读', desc: '烛光 · 温暖暗色', icon: Moon },
  { id: 'minimal', label: '极简', desc: '云白 · 纯净', icon: Feather },
]

const AMBIENTS = [
  { id: 'off', label: '静谧', icon: VolumeX },
  { id: 'rain', label: '雨声', icon: CloudRain },
  { id: 'cafe', label: '咖啡馆', icon: Coffee },
  { id: 'forest', label: '森林', icon: TreePine },
]

export default function ReadingSettingsPanel({ onClose }) {
  const { settings, update } = useReadingSettings()

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>阅读氛围</h2>
          <button onClick={onClose} style={styles.closeBtn} aria-label="关闭">
            <X size={20} />
          </button>
        </div>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>主题</h3>
          <div style={styles.themeGrid}>
            {THEMES.map((t) => {
              const Icon = t.icon
              const active = settings.theme === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => update({ theme: t.id })}
                  style={{ ...styles.themeCard, ...(active ? styles.themeCardActive : {}) }}
                >
                  <Icon size={22} />
                  <div style={styles.themeLabel}>{t.label}</div>
                  <div style={styles.themeDesc}>{t.desc}</div>
                </button>
              )
            })}
          </div>
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>背景音</h3>
          <div style={styles.ambientGrid}>
            {AMBIENTS.map((a) => {
              const Icon = a.icon
              const active = settings.ambient === a.id
              return (
                <button
                  key={a.id}
                  onClick={() => update({ ambient: a.id })}
                  style={{ ...styles.ambientBtn, ...(active ? styles.ambientBtnActive : {}) }}
                >
                  <Icon size={18} />
                  <span>{a.label}</span>
                </button>
              )
            })}
          </div>
          <p style={styles.hint}>通过 Web Audio 合成，无需下载。</p>
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <Type size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: '-3px' }} />
            字号
          </h3>
          <div style={styles.fontRow}>
            <button onClick={() => update({ fontScale: Math.max(0.85, settings.fontScale - 0.05) })} style={styles.fontBtn}>A-</button>
            <div style={styles.fontValue}>{Math.round(settings.fontScale * 100)}%</div>
            <button onClick={() => update({ fontScale: Math.min(1.4, settings.fontScale + 0.05) })} style={styles.fontBtn}>A+</button>
            <button onClick={() => update({ fontScale: 1.0 })} style={styles.fontReset}>重置</button>
          </div>
          <div style={styles.preview}>
            <p style={{ margin: 0, lineHeight: 1.9 }}>
              愿你温柔，也有锋芒。<br />
              愿你走过山河，依然眼中有光。
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(45, 30, 20, 0.45)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease',
  },
  panel: {
    width: '100%',
    maxWidth: '520px',
    maxHeight: '90vh',
    overflowY: 'auto',
    backgroundColor: 'var(--color-bg)',
    borderRadius: '24px 24px 0 0',
    padding: 'calc(var(--spacing-unit) * 4)',
    boxShadow: '0 -12px 48px rgba(0,0,0,0.2)',
    animation: 'slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'calc(var(--spacing-unit) * 3)',
  },
  title: {
    fontSize: '1.3rem',
    margin: 0,
    fontFamily: 'var(--font-serif)',
  },
  closeBtn: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-secondary)',
  },
  section: {
    marginBottom: 'calc(var(--spacing-unit) * 3)',
  },
  sectionTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    marginBottom: 'calc(var(--spacing-unit) * 1.5)',
  },
  themeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 'calc(var(--spacing-unit) * 1.5)',
  },
  themeCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: 'calc(var(--spacing-unit) * 2)',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '2px solid transparent',
    borderRadius: 'var(--border-radius-md)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  themeCardActive: {
    borderColor: 'var(--color-primary)',
    backgroundColor: 'var(--color-primary-light)',
  },
  themeLabel: { fontSize: '0.9rem', fontWeight: 600, marginTop: '4px' },
  themeDesc: { fontSize: '0.7rem', color: 'var(--color-text-secondary)' },
  ambientGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 'calc(var(--spacing-unit) * 1)',
  },
  ambientBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: 'calc(var(--spacing-unit) * 1.5)',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '2px solid transparent',
    borderRadius: 'var(--border-radius-md)',
    color: 'var(--color-text)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  ambientBtnActive: {
    borderColor: 'var(--color-primary)',
    backgroundColor: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
  },
  hint: {
    fontSize: '0.75rem',
    color: 'var(--color-text-tertiary)',
    marginTop: '8px',
  },
  fontRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing-unit) * 1.5)',
    marginBottom: 'calc(var(--spacing-unit) * 2)',
  },
  fontBtn: {
    width: '44px',
    height: '44px',
    fontSize: '1rem',
    fontWeight: 600,
    borderRadius: 'var(--border-radius-md)',
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text)',
  },
  fontValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
  },
  fontReset: {
    padding: '8px 14px',
    fontSize: '0.8rem',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
  },
  preview: {
    padding: 'calc(var(--spacing-unit) * 2)',
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--border-radius-md)',
    fontFamily: 'var(--font-serif)',
    fontSize: '1rem',
    color: 'var(--color-text)',
  },
}
