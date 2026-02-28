import { useCallback } from 'react'

const CARD_THEMES = {
  wisdom: {
    bg: 'linear-gradient(135deg, #1e3a5f 0%, #0f2942 100%)',
    accent: '#4da6ff',
    text: '#e8f4ff',
    secondary: '#8ec5ff',
    badge: 'rgba(77, 166, 255, 0.15)',
    border: 'rgba(77, 166, 255, 0.3)',
    bgStops: ['#1e3a5f', '#0f2942'],
  },
  warm: {
    bg: 'linear-gradient(135deg, #4a2c17 0%, #2d1a0e 100%)',
    accent: '#f5a623',
    text: '#fff5e6',
    secondary: '#f5c871',
    badge: 'rgba(245, 166, 35, 0.15)',
    border: 'rgba(245, 166, 35, 0.3)',
    bgStops: ['#4a2c17', '#2d1a0e'],
  },
  calm: {
    bg: 'linear-gradient(135deg, #1a3a2a 0%, #0f2318 100%)',
    accent: '#34d399',
    text: '#e6fff5',
    secondary: '#7ee8be',
    badge: 'rgba(52, 211, 153, 0.15)',
    border: 'rgba(52, 211, 153, 0.3)',
    bgStops: ['#1a3a2a', '#0f2318'],
  },
  bold: {
    bg: 'linear-gradient(135deg, #3d1f1f 0%, #2a1010 100%)',
    accent: '#f87171',
    text: '#ffe8e8',
    secondary: '#fca5a5',
    badge: 'rgba(248, 113, 113, 0.15)',
    border: 'rgba(248, 113, 113, 0.3)',
    bgStops: ['#3d1f1f', '#2a1010'],
  },
}

export default function ShareCard({ title, content, category, theme = 'wisdom' }) {
  const colors = CARD_THEMES[theme] || CARD_THEMES.wisdom
  const contentLines = content.split('\n').filter(Boolean)

  return (
    <div style={{ ...cardStyles.card, background: colors.bg, borderColor: colors.border }}>
      <div style={cardStyles.inner}>
        {category && (
          <div style={{ ...cardStyles.badge, backgroundColor: colors.badge, color: colors.accent }}>
            {category}
          </div>
        )}
        <h3 style={{ ...cardStyles.title, color: colors.text }}>{title}</h3>
        <div style={{ ...cardStyles.divider, backgroundColor: colors.border }} />
        <div style={cardStyles.contentArea}>
          {contentLines.slice(0, 8).map((line, i) => (
            <p key={i} style={{ ...cardStyles.line, color: colors.secondary }}>{line}</p>
          ))}
          {contentLines.length > 8 && (
            <p style={{ ...cardStyles.line, color: colors.secondary }}>...</p>
          )}
        </div>
        <div style={{ ...cardStyles.footer, borderTopColor: colors.border }}>
          <span style={{ ...cardStyles.brand, color: colors.accent }}>凭什么 - 反击心法</span>
          <span style={{ ...cardStyles.hint, color: colors.secondary + '80' }}>长按识别分享</span>
        </div>
      </div>
    </div>
  )
}

function wrapText(ctx, text, maxWidth) {
  const lines = []
  let currentLine = ''
  for (const char of text) {
    const testLine = currentLine + char
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = char
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

export function useShareCard() {
  const generateImage = useCallback(async (title, content, category, theme = 'wisdom') => {
    const colors = CARD_THEMES[theme] || CARD_THEMES.wisdom
    const canvas = document.createElement('canvas')
    const scale = 2
    const width = 360

    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')

    let estimatedHeight = 80
    if (category) estimatedHeight += 40
    tempCtx.font = '700 22px serif'
    const titleLines = wrapText(tempCtx, title, width - 48)
    estimatedHeight += titleLines.length * 30 + 32
    tempCtx.font = '400 15px sans-serif'
    const contentText = content.replace(/\n/g, ' ')
    const contentLines = wrapText(tempCtx, contentText, width - 48)
    estimatedHeight += Math.min(contentLines.length, 8) * 24 + 56

    const height = Math.max(estimatedHeight, 240)
    canvas.width = width * scale
    canvas.height = height * scale
    const ctx = canvas.getContext('2d')
    ctx.scale(scale, scale)

    const grad = ctx.createLinearGradient(0, 0, width, height)
    grad.addColorStop(0, colors.bgStops[0])
    grad.addColorStop(1, colors.bgStops[1])
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(0, 0, width, height, 16)
    ctx.fill()

    ctx.strokeStyle = colors.border
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(0, 0, width, height, 16)
    ctx.stroke()

    let y = 32

    if (category) {
      ctx.font = '600 13px -apple-system, BlinkMacSystemFont, sans-serif'
      const catWidth = ctx.measureText(category).width + 20
      ctx.fillStyle = colors.badge
      ctx.beginPath()
      ctx.roundRect(24, y - 4, catWidth, 26, 6)
      ctx.fill()
      ctx.fillStyle = colors.accent
      ctx.fillText(category, 34, y + 13)
      y += 40
    }

    ctx.font = '700 22px "Noto Serif SC", Georgia, serif'
    ctx.fillStyle = colors.text
    const finalTitleLines = wrapText(ctx, title, width - 48)
    finalTitleLines.forEach((line) => {
      ctx.fillText(line, 24, y + 22)
      y += 30
    })
    y += 12

    ctx.fillStyle = colors.border
    ctx.fillRect(24, y, 40, 3)
    y += 20

    ctx.font = '400 15px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillStyle = colors.secondary
    const finalContentLines = wrapText(ctx, contentText, width - 48)
    finalContentLines.slice(0, 8).forEach((line) => {
      ctx.fillText(line, 24, y + 15)
      y += 24
    })

    const footerY = height - 40
    ctx.fillStyle = colors.border
    ctx.fillRect(24, footerY - 16, width - 48, 1)
    ctx.font = '600 14px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillStyle = colors.accent
    ctx.fillText('凭什么 - 反击心法', 24, footerY + 6)
    ctx.font = '400 12px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillStyle = colors.secondary + '80'
    ctx.textAlign = 'right'
    ctx.fillText('长按识别分享', width - 24, footerY + 6)

    return canvas.toDataURL('image/png')
  }, [])

  return { generateImage }
}

const cardStyles = {
  card: {
    borderRadius: '16px',
    border: '1px solid',
    overflow: 'hidden',
    width: '100%',
    maxWidth: '360px',
    margin: '0 auto',
  },
  inner: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '200px',
  },
  badge: {
    display: 'inline-block',
    alignSelf: 'flex-start',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: '16px',
  },
  title: {
    fontSize: '1.35rem',
    fontWeight: 700,
    lineHeight: 1.3,
    margin: '0 0 12px 0',
    fontFamily: '"Noto Serif SC", Georgia, serif',
  },
  divider: {
    width: '40px',
    height: '3px',
    borderRadius: '2px',
    marginBottom: '16px',
  },
  contentArea: {
    flex: 1,
    marginBottom: '16px',
  },
  line: {
    fontSize: '0.95rem',
    lineHeight: 1.7,
    margin: '0 0 4px 0',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid',
    marginTop: 'auto',
  },
  brand: {
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  hint: {
    fontSize: '0.75rem',
  },
}
