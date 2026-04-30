import { useEffect, useRef, useState } from 'react'
import { useReadingSettings } from '../lib/readingSettings'

function createRain(ctx, destination) {
  const bufferSize = 2 * ctx.sampleRate
  const noise = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const src = ctx.createBufferSource()
  src.buffer = noise
  src.loop = true

  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 1200
  lp.Q.value = 0.6

  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 180

  const gain = ctx.createGain()
  gain.gain.value = 0.0

  src.connect(hp).connect(lp).connect(gain).connect(destination)
  src.start()

  return {
    nodes: [src, hp, lp, gain],
    fadeIn: (target = 0.25, time = 1.5) => gain.gain.linearRampToValueAtTime(target, ctx.currentTime + time),
    fadeOut: (time = 1.0) => gain.gain.linearRampToValueAtTime(0, ctx.currentTime + time),
    stop: () => { try { src.stop() } catch {} },
  }
}

function createCafe(ctx, destination) {
  const bufferSize = 2 * ctx.sampleRate
  const noise = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = noise.getChannelData(0)
  // pink-ish noise
  let b0 = 0, b1 = 0, b2 = 0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99765 * b0 + white * 0.099046
    b1 = 0.96300 * b1 + white * 0.2965164
    b2 = 0.57000 * b2 + white * 1.0526913
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.11
  }

  const src = ctx.createBufferSource()
  src.buffer = noise
  src.loop = true

  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 600
  bp.Q.value = 0.4

  const gain = ctx.createGain()
  gain.gain.value = 0.0

  src.connect(bp).connect(gain).connect(destination)
  src.start()

  // occasional spoon-on-cup ping
  const pingInterval = setInterval(() => {
    if (Math.random() > 0.7) {
      const osc = ctx.createOscillator()
      const og = ctx.createGain()
      osc.frequency.value = 1800 + Math.random() * 400
      og.gain.value = 0
      og.gain.setValueAtTime(0, ctx.currentTime)
      og.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.01)
      og.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5)
      osc.connect(og).connect(destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.6)
    }
  }, 4000)

  return {
    fadeIn: (target = 0.2, time = 1.5) => gain.gain.linearRampToValueAtTime(target, ctx.currentTime + time),
    fadeOut: (time = 1.0) => gain.gain.linearRampToValueAtTime(0, ctx.currentTime + time),
    stop: () => { clearInterval(pingInterval); try { src.stop() } catch {} },
  }
}

function createForest(ctx, destination) {
  const bufferSize = 2 * ctx.sampleRate
  const noise = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const src = ctx.createBufferSource()
  src.buffer = noise
  src.loop = true

  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 500

  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 3500

  // LFO on lowpass for wind
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 0.12
  lfoGain.gain.value = 1500
  lfo.connect(lfoGain).connect(lp.frequency)
  lfo.start()

  const gain = ctx.createGain()
  gain.gain.value = 0.0

  src.connect(hp).connect(lp).connect(gain).connect(destination)
  src.start()

  // occasional bird chirp
  const chirp = setInterval(() => {
    if (Math.random() > 0.6) {
      const osc = ctx.createOscillator()
      const og = ctx.createGain()
      const f = 2400 + Math.random() * 800
      osc.frequency.setValueAtTime(f, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(f * 1.3, ctx.currentTime + 0.08)
      og.gain.value = 0
      og.gain.setValueAtTime(0, ctx.currentTime)
      og.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.02)
      og.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2)
      osc.connect(og).connect(destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.25)
    }
  }, 5000)

  return {
    fadeIn: (target = 0.18, time = 1.5) => gain.gain.linearRampToValueAtTime(target, ctx.currentTime + time),
    fadeOut: (time = 1.0) => gain.gain.linearRampToValueAtTime(0, ctx.currentTime + time),
    stop: () => { clearInterval(chirp); try { src.stop(); lfo.stop() } catch {} },
  }
}

const BUILDERS = { rain: createRain, cafe: createCafe, forest: createForest }

export default function AmbientAudio() {
  const { settings } = useReadingSettings()
  const ctxRef = useRef(null)
  const currentRef = useRef(null)
  const [needsGesture, setNeedsGesture] = useState(false)

  const ensureCtx = () => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return null
      ctxRef.current = new Ctx()
    }
    return ctxRef.current
  }

  useEffect(() => {
    const ambient = settings.ambient
    if (ambient === 'off') {
      if (currentRef.current) {
        currentRef.current.fadeOut(1.0)
        const cur = currentRef.current
        setTimeout(() => cur.stop(), 1200)
        currentRef.current = null
      }
      setNeedsGesture(false)
      return
    }

    const ctx = ensureCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') {
      setNeedsGesture(true)
      return
    }

    if (currentRef.current) {
      currentRef.current.fadeOut(0.6)
      const cur = currentRef.current
      setTimeout(() => cur.stop(), 800)
    }

    const builder = BUILDERS[ambient]
    if (builder) {
      const master = ctx.createGain()
      master.gain.value = 1
      master.connect(ctx.destination)
      const instance = builder(ctx, master)
      instance.fadeIn()
      currentRef.current = instance
    }
  }, [settings.ambient])

  const resume = async () => {
    const ctx = ensureCtx()
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume()
      setNeedsGesture(false)
      // re-trigger effect by toggling via timeout
      const amb = settings.ambient
      if (amb !== 'off') {
        const builder = BUILDERS[amb]
        if (builder) {
          const master = ctx.createGain()
          master.connect(ctx.destination)
          const instance = builder(ctx, master)
          instance.fadeIn()
          currentRef.current = instance
        }
      }
    }
  }

  if (!needsGesture) return null

  return (
    <button
      onClick={resume}
      style={{
        position: 'fixed',
        bottom: '88px',
        right: '16px',
        padding: '10px 16px',
        borderRadius: '999px',
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        fontSize: '0.8rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        zIndex: 200,
      }}
    >
      点此启动背景音
    </button>
  )
}
