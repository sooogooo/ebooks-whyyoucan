import { useState, useCallback, useEffect } from 'react'
import { X, Download, Copy, Check, MessageCircle, Users } from 'lucide-react'
import ShareCard, { useShareCard } from './ShareCard'

export default function ShareModal({ isOpen, onClose, title, content, category, theme = 'wisdom' }) {
  const [activeTab, setActiveTab] = useState('card')
  const [copied, setCopied] = useState(false)
  const [savedImage, setSavedImage] = useState(null)
  const [saving, setSaving] = useState(false)
  const { generateImage } = useShareCard()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setSavedImage(null)
      setCopied(false)
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleSaveImage = useCallback(async () => {
    setSaving(true)
    try {
      const dataUrl = await generateImage(title, content, category, theme)
      setSavedImage(dataUrl)
      const link = document.createElement('a')
      link.download = `凭什么-${title.slice(0, 10)}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Save image failed:', err)
    } finally {
      setSaving(false)
    }
  }, [title, content, category, theme, generateImage])

  const handleCopyText = useCallback(async () => {
    const shareText = `【${title}】\n\n${content}\n\n—— 来自《凭什么》反击心法`
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = shareText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [title, content])

  const handleShareWeChat = useCallback(() => {
    const shareText = `【${title}】\n${content.slice(0, 100)}...\n\n来自《凭什么》反击心法`

    if (isWeChatBrowser() && window.wx) {
      try {
        window.wx.updateAppMessageShareData({
          title: title,
          desc: content.slice(0, 60),
          link: window.location.href,
          imgUrl: window.location.origin + '/logo.svg',
        })
        window.wx.updateTimelineShareData({
          title: `${title} - 凭什么`,
          link: window.location.href,
          imgUrl: window.location.origin + '/logo.svg',
        })
      } catch {
        // fallback
      }
    }

    if (/Android|iPhone|iPad/i.test(navigator.userAgent) && navigator.share) {
      navigator.share({
        title: `${title} - 凭什么`,
        text: shareText,
        url: window.location.href,
      }).catch(() => {})
      return
    }

    handleCopyText()
  }, [title, content, handleCopyText])

  const handleShareFriendCircle = useCallback(async () => {
    setSaving(true)
    try {
      const dataUrl = await generateImage(title, content, category, theme)
      setSavedImage(dataUrl)

      if (/Android|iPhone|iPad/i.test(navigator.userAgent) && navigator.share) {
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        const file = new File([blob], '凭什么分享.png', { type: 'image/png' })
        await navigator.share({ title: `${title} - 凭什么`, files: [file] })
      } else {
        const link = document.createElement('a')
        link.download = `凭什么-${title.slice(0, 10)}.png`
        link.href = dataUrl
        link.click()
      }
    } catch {
      // user cancelled or not supported
    } finally {
      setSaving(false)
    }
  }, [title, content, category, theme, generateImage])

  if (!isOpen) return null

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.headerTitle}>分享内容</h3>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('card')}
            style={{ ...styles.tab, ...(activeTab === 'card' ? styles.tabActive : {}) }}
          >
            卡片分享
          </button>
          <button
            onClick={() => setActiveTab('text')}
            style={{ ...styles.tab, ...(activeTab === 'text' ? styles.tabActive : {}) }}
          >
            文字分享
          </button>
        </div>

        <div style={styles.body}>
          {activeTab === 'card' ? (
            <div style={styles.cardPreview}>
              <ShareCard title={title} content={content} category={category} theme={theme} />

              {savedImage && (
                <div style={styles.savedNotice}>图片已生成，长按可保存到相册</div>
              )}

              <div style={styles.shareActions}>
                <button onClick={handleShareWeChat} style={styles.shareOption}>
                  <div style={styles.shareIcon}>
                    <MessageCircle size={24} color="#07c160" />
                  </div>
                  <span style={styles.shareLabel}>微信好友</span>
                </button>
                <button onClick={handleShareFriendCircle} style={styles.shareOption}>
                  <div style={styles.shareIcon}>
                    <Users size={24} color="#07c160" />
                  </div>
                  <span style={styles.shareLabel}>朋友圈</span>
                </button>
                <button onClick={handleSaveImage} style={styles.shareOption} disabled={saving}>
                  <div style={styles.shareIcon}>
                    <Download size={24} color="var(--color-primary)" />
                  </div>
                  <span style={styles.shareLabel}>{saving ? '生成中...' : '保存图片'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.textPreview}>
              <div style={styles.textBox}>
                <p style={styles.textTitle}>【{title}】</p>
                <p style={styles.textContent}>{content}</p>
                <p style={styles.textFooter}>—— 来自《凭什么》反击心法</p>
              </div>
              <div style={styles.shareActions}>
                <button onClick={handleShareWeChat} style={styles.shareOption}>
                  <div style={styles.shareIcon}>
                    <MessageCircle size={24} color="#07c160" />
                  </div>
                  <span style={styles.shareLabel}>微信好友</span>
                </button>
                <button onClick={handleCopyText} style={styles.shareOption}>
                  <div style={styles.shareIcon}>
                    {copied ? <Check size={24} color="var(--color-success)" /> : <Copy size={24} color="var(--color-primary)" />}
                  </div>
                  <span style={styles.shareLabel}>{copied ? '已复制' : '复制文字'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={styles.tip}>在微信中打开本页面，可直接分享到好友或朋友圈</div>
      </div>
    </div>
  )
}

function isWeChatBrowser() {
  return /MicroMessenger/i.test(navigator.userAgent)
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1100,
    animation: 'fadeIn 0.2s ease',
  },
  modal: {
    backgroundColor: 'var(--color-bg)',
    borderRadius: '20px 20px 0 0',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '85vh',
    overflow: 'auto',
    animation: 'slideUp 0.3s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 20px 12px',
    position: 'sticky',
    top: 0,
    backgroundColor: 'var(--color-bg)',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: '1.125rem',
    fontWeight: 700,
    margin: 0,
  },
  closeButton: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
  },
  tabs: {
    display: 'flex',
    padding: '0 20px',
    borderBottom: '1px solid var(--color-border)',
  },
  tab: {
    flex: 1,
    padding: '12px',
    textAlign: 'center',
    fontSize: '0.95rem',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    borderBottom: '2px solid transparent',
    transition: 'all var(--transition-fast)',
    cursor: 'pointer',
  },
  tabActive: {
    color: 'var(--color-primary)',
    borderBottomColor: 'var(--color-primary)',
  },
  body: {
    padding: '20px',
  },
  cardPreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  savedNotice: {
    textAlign: 'center',
    fontSize: '0.875rem',
    color: 'var(--color-success)',
    fontWeight: 500,
    padding: '8px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 'var(--border-radius-md)',
  },
  shareActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    padding: '8px 0',
  },
  shareOption: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
  },
  shareIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    backgroundColor: 'var(--color-bg-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
  },
  shareLabel: {
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
    fontWeight: 500,
  },
  textPreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  textBox: {
    padding: '20px',
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--border-radius-lg)',
    border: '1px solid var(--color-border)',
  },
  textTitle: {
    fontSize: '1.05rem',
    fontWeight: 700,
    marginBottom: '12px',
  },
  textContent: {
    fontSize: '0.95rem',
    lineHeight: 1.7,
    color: 'var(--color-text-secondary)',
    marginBottom: '12px',
    whiteSpace: 'pre-wrap',
  },
  textFooter: {
    fontSize: '0.85rem',
    color: 'var(--color-text-tertiary)',
    fontStyle: 'italic',
    margin: 0,
  },
  tip: {
    textAlign: 'center',
    fontSize: '0.8rem',
    color: 'var(--color-text-tertiary)',
    padding: '12px 20px 24px',
  },
}
