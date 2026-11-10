'use client'

/**
 * Study Buddy hero scene (same engine as Book Buddy's: pure CSS 3D driven by one rAF loop that writes
 * transforms straight to the DOM; mouse parallax; reduced motion freezes on the "answer" frame).
 *
 * A textbook opens, letters lift off the page and settle into a cited answer card that floats above it,
 * then everything folds back (9 s loop). Orbiting glossy dots give the scene depth.
 */

import { useEffect, useRef, useState } from 'react'

const PERIOD = 9
const GLYPHS = ['अ', 'S', 'क', 't', 'a', 'ब', 'u', 'd', 'प', 'y', 'ग', 'b']
const DOTS: [number, string][] = [
  [22, 'linear-gradient(160deg,#FFD9A8,#FF9933 60%,#C25E00)'],
  [14, 'linear-gradient(160deg,#FFF3C4,#FFB547 60%,#E89A00)'],
  [18, 'linear-gradient(160deg,#9DB2FF,#5B7CFF 60%,#1E3A8A)'],
  [12, 'linear-gradient(160deg,#FFE3A3,#FFB547 60%,#E8A200)'],
  [20, 'linear-gradient(160deg,#7D97FF,#3B5BDB 60%,#1E3A8A)'],
  [16, 'linear-gradient(160deg,#FFD9A8,#FF9933 60%,#C25E00)'],
]

const C = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const E = (x: number) => { x = C(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2 }

const pageEdge = 'repeating-linear-gradient(90deg,#FFFFFF 0 2px,#DCE1EA 2px 3px)'
const pageEdgeH = 'repeating-linear-gradient(0deg,#FFFFFF 0 2px,#DCE1EA 2px 3px)'

export function StudyBuddyHero3D({ className }: { className?: string }) {
  const outer = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const rig = useRef<HTMLDivElement>(null)
  const cover = useRef<HTMLDivElement>(null)
  const sheen = useRef<HTMLDivElement>(null)
  const lines = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const shadow = useRef<HTMLDivElement>(null)
  const leaves = useRef<(HTMLDivElement | null)[]>([])
  const glyphEls = useRef<(HTMLSpanElement | null)[]>([])
  const dotEls = useRef<(HTMLDivElement | null)[]>([])
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 })

  useEffect(() => {
    const el = outer.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / 620)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const t0 = performance.now()
    let raf = 0
    const onMove = (e: MouseEvent) => { mouse.current.tx = (e.clientX / window.innerWidth - 0.5) * 2; mouse.current.ty = (e.clientY / window.innerHeight - 0.5) * 2 }
    const onLeave = () => { mouse.current.tx = 0; mouse.current.ty = 0 }
    if (!reduced) { window.addEventListener('mousemove', onMove, { passive: true }); document.addEventListener('mouseleave', onLeave) }
    const set = (el: HTMLElement | null, k: string, v: string) => { if (el) (el.style as unknown as Record<string, string>)[k] = v }

    const tick = (now: number) => {
      const t = reduced ? 5 : (now - t0) / 1000
      const p = reduced ? 5 : t % PERIOD
      const m = mouse.current
      m.x += (m.tx - m.x) * 0.06
      m.y += (m.ty - m.y) * 0.06
      const open = E((p - 1.6) / 1.1) * (1 - E((p - 7.6) / 1.1))
      const answer = E((p - 3.8) / 0.9) * (1 - E((p - 7.0) / 0.7))
      const ry = -30 + 26 * open + Math.sin(t * 0.7) * 7 + m.x * 16
      const rx = 12 + 16 * open - m.y * 9
      const fy = Math.sin(t * 1.3) * 9
      set(rig.current, 'transform', `translateY(${fy}px) rotateX(${rx}deg) rotateY(${ry}deg)`)
      set(shadow.current, 'transform', `scale(${1 - fy / 120}, 1)`)
      set(shadow.current, 'opacity', String(0.8 - fy / 60))
      set(cover.current, 'transform', `translateZ(22px) rotateY(${-170 * open}deg)`)
      set(sheen.current, 'backgroundPosition', `${50 + ry * 2.2}% 0`)
      leaves.current.forEach((el, i) => {
        const lo = E((p - 1.8 - i * 0.16) / 1.1) * (1 - E((p - 7.3 + i * 0.12) / 1.0))
        const a = -lo * (160 - i * 24) + Math.sin(t * 3 + i) * 4 * answer
        set(el, 'transform', `translateZ(${20 - i * 2}px) rotateY(${a}deg)`)
      })
      set(lines.current, 'opacity', String(1 - answer * 0.8))
      set(card.current, 'opacity', String(answer))
      set(card.current, 'transform', `translate3d(0,${(1 - answer) * 40}px,60px) rotateY(${-ry * 0.4}deg) scale(${0.85 + 0.15 * answer})`)
      glyphEls.current.forEach((el, j) => {
        const f = C((p - 3.2 - j * 0.07) / 1.3)
        const x0 = 34 + (j % 4) * 50, y0 = 120 + Math.floor(j / 4) * 40
        const x1 = 12 + j * 20, y1 = -90
        const x = x0 + (x1 - x0) * f
        const y = y0 + (y1 - y0) * f - Math.sin(f * Math.PI) * 40
        set(el, 'opacity', String(f > 0 && f < 1 ? Math.sin(f * Math.PI) : 0))
        set(el, 'transform', `translate3d(${x}px,${y}px,${30 + f * 40}px) scale(${1 - f * 0.4})`)
      })
      dotEls.current.forEach((el, k) => {
        const ang = t * 0.55 + k * ((Math.PI * 2) / DOTS.length)
        set(el, 'transform', `translate3d(${120 + Math.cos(ang) * 250}px,${170 + Math.sin(ang * 2 + k) * 70}px,${Math.sin(ang) * 220}px)`)
      })
      if (!reduced) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove); document.removeEventListener('mouseleave', onLeave) }
  }, [])

  return (
    <div ref={outer} className={className} style={{ width: '100%', maxWidth: 620, height: 640 * scale }} aria-hidden="true">
      <div style={{ position: 'relative', width: 620, height: 640, transformOrigin: 'top left', transform: `scale(${scale})`, perspective: 1700, perspectiveOrigin: '50% 38%' }}>
        <div ref={shadow} style={{ position: 'absolute', left: 150, top: 560, width: 320, height: 46, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(0,0,0,0.6) 0%,transparent 70%)' }} />
        <div ref={rig} style={{ position: 'absolute', left: 180, top: 190, width: 260, height: 360, transformStyle: 'preserve-3d', transform: 'rotateX(14deg) rotateY(-28deg)' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '4px 14px 14px 4px', background: 'linear-gradient(135deg,#1E3A8A,#0A0F24)', transform: 'translateZ(-22px)' }} />
          <div style={{ position: 'absolute', left: -22, top: 0, width: 44, height: 360, borderRadius: 4, background: 'linear-gradient(90deg,#C25E00 0%,#FFB45C 45%,#FF9933 100%)', transform: 'rotateY(-90deg)' }} />
          <div style={{ position: 'absolute', left: 236, top: 6, width: 40, height: 348, background: pageEdge, transform: 'rotateY(90deg)' }} />
          <div style={{ position: 'absolute', left: 0, top: -14, width: 252, height: 40, background: pageEdgeH, transform: 'rotateX(90deg)' }} />
          <div style={{ position: 'absolute', left: 0, top: 334, width: 252, height: 40, background: pageEdgeH, transform: 'rotateX(90deg)' }} />
          {/* first page */}
          <div style={{ position: 'absolute', left: 0, top: 6, width: 252, height: 348, background: '#FFFFFF', borderRadius: '2px 8px 8px 2px', transform: 'translateZ(10px)', padding: '36px 30px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div ref={lines} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontFamily: 'var(--sb-font-display)', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#0A0F24' }}>Chapter 10</div>
              {[100, 92, 80, 96, 70, 88, 94, 60].map((w, i) => (
                <div key={i} style={{ height: 6, borderRadius: 3, width: `${w}%`, background: i === 2 ? '#FFD9A8' : '#DCE1EA' }} />
              ))}
            </div>
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} ref={(el) => { leaves.current[i] = el }} style={{ position: 'absolute', left: 0, top: 6, width: 252, height: 348, borderRadius: '2px 8px 8px 2px', transformOrigin: 'left center', background: 'linear-gradient(90deg,#E6EAF1 0%,#FFFFFF 18%,#FFFFFF 100%)', boxShadow: 'inset 0 0 0 1px #E6EAF1' }} />
          ))}
          {/* front cover */}
          <div ref={cover} style={{ position: 'absolute', inset: 0, transformOrigin: 'left center', transformStyle: 'preserve-3d', transform: 'translateZ(22px)' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '4px 14px 14px 4px', overflow: 'hidden', backfaceVisibility: 'hidden', background: 'linear-gradient(135deg,#2B4FD0 0%,#1E3A8A 35%,#0F1F5C 70%,#0A0F24 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)', padding: '30px 26px 28px 34px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, background: 'linear-gradient(90deg,rgba(0,0,0,0.35),rgba(255,255,255,0.08))' }} />
              <div ref={sheen} style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg,transparent 35%,rgba(255,255,255,0.32) 47%,transparent 58%)', backgroundSize: '260% 100%', backgroundPosition: '50% 0', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ position: 'relative', width: 46, height: 30 }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(160deg,#9DB2FF,#3B5BDB)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)' }} />
                  <div style={{ position: 'absolute', left: 16, top: 0, width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(180deg,#FFC067,#FF9933 55%,#EE7A0C)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)' }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#0A0F24', background: '#FFE3A3', borderRadius: 999, padding: '4px 9px' }}>ASK · PROVE</span>
              </div>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontFamily: 'var(--sb-font-display)', fontSize: 46, fontWeight: 800, lineHeight: 0.92, letterSpacing: '-0.04em', color: '#FFFFFF' }}>Study<br />Buddy</div>
                <div style={{ width: 44, height: 5, borderRadius: 3, background: '#FF9933' }} />
              </div>
            </div>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '14px 4px 4px 14px', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: '#E6EAF1', backgroundImage: 'radial-gradient(#C3CBDB 1.2px,transparent 1.2px)', backgroundSize: '14px 14px' }} />
          </div>
          {/* the cited answer, floating above the open book */}
          <div ref={card} style={{ position: 'absolute', left: -10, top: -170, width: 280, opacity: 0, transform: 'translateZ(60px)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ alignSelf: 'flex-end', background: 'linear-gradient(160deg,#1E2B57,#0A0F24)', color: '#fff', padding: '8px 13px', borderRadius: '16px 16px 4px 16px', fontSize: 13, fontWeight: 600, boxShadow: '0 12px 28px -10px rgba(0,0,0,.6)' }}>Why does ice float?</div>
            <div style={{ background: 'rgba(255,255,255,.96)', color: '#0A0F24', padding: '12px 14px', borderRadius: '4px 18px 18px 18px', fontSize: 13, lineHeight: 1.5, boxShadow: '0 24px 50px -16px rgba(255,153,51,.55), 0 0 0 1px rgba(255,255,255,.5)' }}>
              Water expands as it freezes, so ice is <b style={{ background: 'linear-gradient(#FFD199,#FFD199) no-repeat 0 85%', backgroundSize: '100% 45%' }}>less dense</b> than water.
              <div style={{ display: 'inline-flex', marginTop: 8, padding: '3px 9px', borderRadius: 999, background: '#E8E5FB', color: '#4636B0', fontSize: 11, fontWeight: 700 }}>NCERT Science IX · p.132</div>
            </div>
          </div>
          {GLYPHS.map((ch, j) => (
            <span key={j} ref={(el) => { glyphEls.current[j] = el }} style={{ position: 'absolute', left: 0, top: 0, fontFamily: "'Noto Sans Devanagari',var(--sb-font-display)", fontSize: 26, fontWeight: 600, color: '#FFD9A8', textShadow: '0 0 16px rgba(255,153,51,0.75)', opacity: 0 }}>{ch}</span>
          ))}
          {DOTS.map(([size, bg], k) => (
            <div key={k} ref={(el) => { dotEls.current[k] = el }} style={{ position: 'absolute', left: 0, top: 0, width: size, height: size, borderRadius: '50%', background: bg, boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.6),0 8px 20px -6px rgba(0,0,0,0.5)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default StudyBuddyHero3D
