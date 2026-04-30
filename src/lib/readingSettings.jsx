import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'

const KEY = 'pingshenme_reading_settings_v1'
const DEFAULTS = { theme: 'warm', ambient: 'off', fontScale: 1.0 }

const ReadingSettingsContext = createContext(null)

export function useReadingSettings() {
  const ctx = useContext(ReadingSettingsContext)
  if (!ctx) throw new Error('useReadingSettings must be used within provider')
  return ctx
}

export function ReadingSettingsProvider({ session, children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) return { ...DEFAULTS, ...JSON.parse(raw) }
    } catch {}
    return DEFAULTS
  })
  const loadedFor = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
    document.documentElement.style.setProperty('--font-scale', String(settings.fontScale))
    try { localStorage.setItem(KEY, JSON.stringify(settings)) } catch {}
  }, [settings])

  useEffect(() => {
    if (!session?.user?.id) return
    if (loadedFor.current === session.user.id) return
    loadedFor.current = session.user.id
    ;(async () => {
      const { data } = await supabase
        .from('user_reading_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()
      if (data) {
        setSettings({
          theme: data.theme || DEFAULTS.theme,
          ambient: data.ambient || DEFAULTS.ambient,
          fontScale: Number(data.font_scale) || DEFAULTS.fontScale,
        })
      }
    })()
  }, [session?.user?.id])

  const update = async (patch) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    if (session?.user?.id) {
      await supabase.from('user_reading_settings').upsert({
        user_id: session.user.id,
        theme: next.theme,
        ambient: next.ambient,
        font_scale: next.fontScale,
        updated_at: new Date().toISOString(),
      })
    }
  }

  return (
    <ReadingSettingsContext.Provider value={{ settings, update }}>
      {children}
    </ReadingSettingsContext.Provider>
  )
}
