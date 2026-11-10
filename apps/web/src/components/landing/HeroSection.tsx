/* eslint-disable react/no-unescaped-entities */
'use client'

/**
 * Study Buddy hero — a faithful port of the updated "Study Buddy Landing" design.
 *
 * A 3D tablet shows the NCERT page and a live Gyankosh chat; a phone then slides in, snaps a handwritten answer,
 * InkBuddy reads and marks it, and a thread ties "Revise p.132" back to the highlighted line. The scene clock
 * (14.4 s loop, act 2 starts at 6.6 s) is the design's own timeline, driven by one rAF loop writing styles
 * straight to the DOM. The two product cards on the left follow the scene and jump it when tapped.
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@/components/ui/Icon'

const PRODUCTS = [
  { name: 'Virat Gyankosh', line: 'Ask any doubt. See the page.', icon: 'sparkle' },
  { name: 'InkBuddy', line: 'Write by hand. Get marked.', icon: 'pen-nib' },
]

export function HeroSection() {
  const secRef = useRef<HTMLElement>(null)
  const deviceRoot = useRef<HTMLDivElement>(null)
  const [act, setAct] = useState(0)
  const actRef = useRef(0)
  const goRef = useRef<((i: number) => void) | null>(null)

  // ── the scene clock (ported 1:1 from the design's _heroStart) ──────────────────────────────
  useEffect(() => {
    const sec = secRef.current
    if (!sec) return
    const all = (s: string) => Array.prototype.slice.call(sec.querySelectorAll(s)) as HTMLElement[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = () => { const m: any = {}; all('[data-h]').forEach((e) => { m[e.getAttribute('data-h') as string] = e }); m.words = all('[data-w]'); m.lines = all('[data-l]'); m.marks = all('[data-m]'); m.rub = all('[data-r]'); m.corners = all('[data-c]'); m.bars = all('[data-hbar]'); return m }
    let H = q()
    const T = 14.4, A2 = 6.6, Q = 'Why does ice float on water?'
    const cl = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
    const seg = (p: number, a: number, b: number) => cl((p - a) / (b - a))
    const ease = (x: number) => { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2 }
    const back = (x: number) => { x = cl(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2) }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const S = (el: any, k: string, v: string) => { if (el && el.style[k] !== v) el.style[k] = v }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const off = (el: any, root: any) => { let x = 0, y = 0; while (el && el !== root) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent }; return { x, y } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geo: any = { lw: [0, 0, 0], lp: [] }
    const measure = () => {
      if (!H.scr || !H.chip || !H.hl || !H.rev) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      H.lines.forEach((l: any, i: number) => { geo.lw[i] = l.offsetWidth; geo.lp[i] = off(l, H.nb) })
    }
    const fit = () => { if (!H.outer || !H.stage) return; const s = Math.min(1, H.outer.clientWidth / 640); S(H.stage, 'transform', 'scale(' + s + ')'); S(H.outer, 'height', (600 * s) + 'px') }
    let ro: ResizeObserver | undefined, io: IntersectionObserver | undefined
    if (window.ResizeObserver && H.outer) { ro = new ResizeObserver(fit); ro.observe(H.outer) }
    let vis = true
    if (window.IntersectionObserver && H.outer) { io = new IntersectionObserver((es) => { vis = es[0].isIntersecting }); io.observe(H.outer) }
    fit()
    const timers = [window.setTimeout(measure, 300), window.setTimeout(measure, 1500), window.setTimeout(measure, 3500)]
    const clock = { t0: performance.now() }
    goRef.current = (i: number) => { clock.t0 = performance.now() - (i ? A2 : 0) * 1000 }
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
    const mm = (e: MouseEvent) => { mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2; mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2 }
    if (!reduced) window.addEventListener('mousemove', mm, { passive: true })
    let lastTxt: string | null = null, lastScore = '', cur: string | null = null, len = 0, raf = 0
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!H.tab || !H.tab.isConnected) { H = q(); fit(); measure(); cur = null }
      if (!vis || !H.tab) return
      const t = reduced ? 13.4 : (now - clock.t0) / 1000, p = ((t % T) + T) % T
      mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06
      const act = p < A2 ? 0 : 1, end = ease(seg(p, 13.9, 14.4))
      if (act !== actRef.current) { actRef.current = act; setAct(act) }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      H.bars.forEach((b: any, i: number) => S(b, 'width', (i === act ? (act ? seg(p, A2, T) : seg(p, 0, A2)) * 100 : 0) + '%'))
      ;['pIA', 'hIA', 'pTA', 'hTA'].forEach((k) => S(H[k], 'opacity', act ? '0' : '1'))
      ;['pIB', 'hIB', 'pTB', 'hTB'].forEach((k) => S(H[k], 'opacity', act ? '1' : '0'))
      S(H.rig, 'transform', 'rotateX(' + (4 - mouse.y * 5) + 'deg) rotateY(' + (-6 + mouse.x * 9) + 'deg)')
      const sh = ease(seg(p, A2, A2 + 0.7)) * (1 - end)
      S(H.tab, 'transform', 'translate3d(' + (24 * sh) + 'px,' + (Math.sin(t * 0.8) * 4) + 'px,0) rotateY(' + (-sh * 5) + 'deg)')
      // act 1: Gyankosh
      const typing = p > 0.4 && p < 1.6, txt = typing ? Q.slice(0, Math.round(seg(p, 0.4, 1.4) * Q.length)) : ''
      if (txt !== lastTxt) { lastTxt = txt; H.inp.textContent = txt ? txt + '|' : 'Ask about any chapter…'; H.inp.style.color = txt ? '#0A0F24' : '#8A8FA6' }
      S(H.send, 'transform', 'scale(' + (1 - 0.25 * Math.sin(seg(p, 1.5, 1.75) * Math.PI)) + ')')
      S(H.q, 'opacity', String(cl(seg(p, 1.6, 1.75)))); S(H.q, 'transform', 'scale(' + (0.6 + 0.4 * back(seg(p, 1.6, 2))) + ')')
      S(H.dots, 'opacity', String(seg(p, 1.9, 2.1) * (1 - seg(p, 3, 3.15))))
      const sw = seg(p, 1.9, 3); S(H.sweep, 'opacity', String(Math.sin(sw * Math.PI))); S(H.sweep, 'top', (6 + sw * 84) + '%')
      S(H.ans, 'opacity', String(cl(seg(p, 3, 3.2)))); S(H.ans, 'transform', 'translateY(' + ((1 - ease(seg(p, 3, 3.3))) * 10) + 'px)')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      H.words.forEach((w: any, i: number) => S(w, 'opacity', String(cl(seg(p, 3.1 + i * 0.065, 3.25 + i * 0.065)))))
      S(H.chip, 'opacity', String(cl(seg(p, 4.1, 4.2)))); S(H.chip, 'transform', 'scale(' + (0.5 + 0.5 * back(seg(p, 4.1, 4.5))) + ')')
      S(H.bloom, 'opacity', String(cl(seg(p, 4.3, 4.5)))); S(H.qk, 'opacity', String(cl(seg(p, 5.4, 5.7))))
      S(H.hl, 'backgroundSize', (ease(seg(p, 4.9, 5.6)) * 100 * (1 - end)) + '% 55%')
      const co = ease(seg(p, A2, A2 + 0.4)); S(H.chat, 'opacity', String(1 - co)); S(H.chat, 'transform', 'translateY(' + (-co * 16) + 'px)')
      // the thread from the citation (or the "Revise p.132" chip) to the highlighted line
      const useB = p > A2
      const dr = useB ? ease(seg(p, 13.0, 13.5)) : ease(seg(p, 4.4, 5.1))
      const tv = useB ? cl(seg(p, 13.0, 13.1)) * (1 - end) : cl(seg(p, 4.4, 4.5)) * (1 - seg(p, 6.2, 6.6))
      if (tv > 0) {
        const o = H.outer.getBoundingClientRect(), s = Math.min(1, o.width / 640) || 1, src = (useB ? H.rev : H.chip).getBoundingClientRect(), hr = H.hl.getBoundingClientRect()
        const x1 = (src.left - o.left) / s + 4, y1 = (src.top + src.height / 2 - o.top) / s, x2 = (hr.left - o.left) / s + Math.min(hr.width / s, 170) * 0.75, y2 = (hr.top - o.top) / s + 9
        const path = 'M ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' C ' + (x1 - 80).toFixed(1) + ' ' + (y1 + 80).toFixed(1) + ', ' + (x2 + 90).toFixed(1) + ' ' + (y2 - 70).toFixed(1) + ', ' + x2.toFixed(1) + ' ' + y2.toFixed(1)
        if (path !== cur) { cur = path; H.thr.setAttribute('d', path); H.glow.setAttribute('d', path); len = H.thr.getTotalLength(); H.thr.style.strokeDasharray = String(len); H.glow.style.strokeDasharray = String(len) }
      }
      S(H.thr, 'strokeDashoffset', String(len * (1 - dr))); S(H.glow, 'strokeDashoffset', String(len * (1 - dr)))
      S(H.thr, 'opacity', String(tv)); S(H.glow, 'opacity', String(tv * 0.7))
      if (len && dr > 0 && dr < 1) { const pt = H.thr.getPointAtLength(len * dr); H.dot.setAttribute('cx', pt.x); H.dot.setAttribute('cy', pt.y); S(H.dot, 'opacity', String(tv)) } else S(H.dot, 'opacity', '0')
      // act 2: InkBuddy
      const ii = ease(seg(p, A2 + 0.3, A2 + 0.8)) * (1 - end); S(H.ink, 'opacity', String(ii)); S(H.ink, 'transform', 'translateY(' + ((1 - ii) * 16) + 'px)')
      const po = ease(seg(p, 12.8, 13.2)), pin = back(seg(p, 0.05, 0.7)), mv = ease(seg(p, A2, A2 + 0.9))
      S(H.ph, 'opacity', String(act ? 1 - po : cl(seg(p, 0.05, 0.25))))
      const phx = act ? 400 * (1 - mv) - po * 50 : 400, phy = act ? po * 70 - Math.sin(mv * Math.PI) * 40 : (1 - pin) * 90, phr = act ? -4 + 8 * mv - po * 6 : -4 + (1 - pin) * 8
      S(H.ph, 'transform', 'translate3d(' + phx + 'px,' + (phy + Math.sin(t * 1.1) * 5) + 'px,60px) rotate(' + phr + 'deg)')
      S(H.pchat, 'opacity', String(1 - ease(seg(p, A2 + 0.15, A2 + 0.55)))); S(H.cam, 'opacity', String(ease(seg(p, A2 + 0.3, A2 + 0.7))))
      S(H.s1, 'opacity', p < 10.1 ? '1' : '0'); S(H.s2, 'opacity', p >= 10.1 && p < 11.9 ? '1' : '0'); S(H.s3, 'opacity', p >= 11.9 ? '1' : '0')
      let penOn = 0, px = 0, py = 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      H.lines.forEach((l: any, i: number) => { const w = act ? ease(seg(p, 7.5 + i * 0.75, 8.2 + i * 0.75)) : 0; S(l, 'clipPath', 'inset(-4px ' + ((1 - w) * 100) + '% -4px 0)'); if (w > 0 && w < 1 && geo.lp[i]) { penOn = 1; px = geo.lp[i].x + geo.lw[i] * w; py = geo.lp[i].y } })
      S(H.pen, 'opacity', String(penOn)); S(H.pen, 'transform', 'translate(' + (px - 3) + 'px,' + (py + 2) + 'px)')
      const lock = back(seg(p, 9.7, 10.1)), cv = cl(seg(p, 9.4, 9.6)) * (1 - seg(p, 10.5, 10.8))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      H.corners.forEach((c: any) => { S(c, 'opacity', String(cv)); S(c, 'transform', 'scale(' + (1.3 - 0.3 * lock) + ')'); S(c, 'borderColor', p > 10 ? '#FF9933' : '#FFFFFF') })
      S(H.shut, 'transform', 'scale(' + (1 - 0.25 * Math.sin(seg(p, 10.05, 10.35) * Math.PI)) + ')')
      S(H.flash, 'opacity', String(Math.sin(seg(p, 10.15, 10.5) * Math.PI) * 0.9))
      const sc = seg(p, 10.5, 11.3); S(H.scan, 'opacity', String(Math.sin(sc * Math.PI))); S(H.scan, 'top', (6 + sc * 84) + '%')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      H.marks.forEach((m: any, i: number) => { const k = back(seg(p, 11.3 + i * 0.2, 11.6 + i * 0.2)); S(m, 'opacity', String(cl(seg(p, 11.3 + i * 0.2, 11.4 + i * 0.2)))); S(m, 'transform', 'scale(' + (0.3 + 0.7 * k) + ') rotate(' + ((1 - k) * -20) + 'deg)') })
      S(H.mnote, 'opacity', String(cl(seg(p, 12.1, 12.4))))
      const st = seg(p, 12, 12.45); S(H.stamp, 'opacity', String(cl(st * 3) * (1 - end))); S(H.stamp, 'transform', 'scale(' + (1.8 - 0.8 * ease(st)) + ') rotate(' + (-22 + 12 * ease(st)) + 'deg)')
      const rp = seg(p, 12.3, 12.9); S(H.rip, 'opacity', String(rp > 0 ? (1 - rp) * 0.8 : 0)); S(H.rip, 'transform', 'scale(' + (1 + rp * 1.6) + ')')
      const v = Math.round(ease(seg(p, 11.3, 12.3)) * 5) / 2, vs = v % 1 ? Math.floor(v) + '.5' : String(v)
      if (vs !== lastScore) { lastScore = vs; H.score.textContent = vs }
      S(H.sbar, 'width', (v / 3 * 100) + '%')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      H.rub.forEach((r: any, i: number) => { const k = ease(seg(p, 11.4 + i * 0.25, 11.65 + i * 0.25)); S(r, 'opacity', String(k)); S(r, 'transform', 'translateX(' + ((1 - k) * -10) + 'px)') })
      const rv = ease(seg(p, 12.4, 12.7)); S(H.rev, 'opacity', String(rv)); S(H.rev, 'transform', 'translateY(' + ((1 - rv) * 8) + 'px)')
      S(H.why, 'opacity', String(ease(seg(p, 12.55, 12.85))))
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', mm); ro?.disconnect(); io?.disconnect(); timers.forEach((id) => window.clearTimeout(id)) }
  }, [])

  return (
    <section ref={secRef} style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: 'clamp(40px,7vw,88px) 20px clamp(48px,7vw,96px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,480px),1fr))', gap: 'clamp(40px,6vw,72px)', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, animation: 'sbIn .6s both', minWidth: 0 }}>
        <span style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px 7px 8px', borderRadius: 999, background: 'var(--sb-surface)', border: '1px solid var(--sb-line)', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
          <span style={{ padding: '3px 8px', borderRadius: 999, background: '#0A0F24', color: '#FF9933', fontSize: 11.5, fontWeight: 800 }}>2026</span>Founding students onboarding now
        </span>
        <h1 style={{ margin: 0, fontWeight: 700, fontSize: 'clamp(40px,6.4vw,76px)', lineHeight: 1, letterSpacing: '-.045em' }}>
          Learn it with <span className="sb-hi">Gyankosh.</span><br />Prove it with <span className="sb-hi sb-hi-2">InkBuddy.</span>
        </h1>
        <p style={{ margin: 0, maxWidth: 540, fontSize: 'clamp(17px,1.8vw,19px)', lineHeight: 1.6, color: 'var(--sb-text-2)', textWrap: 'pretty' as React.CSSProperties['textWrap'] }}>
          <b style={{ color: 'var(--sb-ink)' }}>Virat Gyankosh</b> answers your doubts from your NCERT textbook and shows the page. <b style={{ color: 'var(--sb-ink)' }}>InkBuddy</b> checks the answers you write by hand and gives marks and feedback, like a board examiner. CBSE and ICSE, Classes 6–12.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: 10, maxWidth: 560 }}>
          {PRODUCTS.map((p, i) => {
            const on = i === act
            return (
              <button key={p.name} className="sbl-press" onClick={() => { goRef.current?.(i); actRef.current = i; setAct(i) }} aria-pressed={on}
                style={{ position: 'relative', overflow: 'hidden', textAlign: 'left', display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', borderRadius: 20, border: `1.5px solid ${on ? 'var(--sb-navy)' : 'var(--sb-line)'}`, background: on ? 'var(--sb-grad-stage)' : 'var(--sb-surface)', cursor: 'pointer', transition: 'background .3s,border-color .3s,transform .15s', boxShadow: on ? 'var(--sb-shadow-stage)' : 'var(--sb-shadow-card)' }}>
                <span style={{ width: 46, height: 46, borderRadius: 15, background: on ? '#FF9933' : i ? 'var(--sb-sky)' : 'var(--sb-lav)', color: on ? '#0A0F24' : i ? 'var(--sb-sky-ink)' : 'var(--sb-lav-ink)', display: 'grid', placeItems: 'center', flex: 'none', transition: 'all .3s' }}><Icon name={p.icon} size={25} weight="duotone" /></span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'block', fontWeight: 800, fontSize: 15.5, color: on ? '#fff' : 'var(--sb-ink)', transition: 'color .3s' }}>{p.name}</span>
                  <span style={{ display: 'block', fontSize: 13, color: on ? '#A9AEC6' : 'var(--sb-muted)', marginTop: 1, transition: 'color .3s' }}>{p.line}</span>
                </span>
                <Icon name="arrow" size={16} weight="bold" color={on ? '#FF9933' : 'var(--sb-line)'} />
                <span data-hbar="1" style={{ position: 'absolute', left: 0, bottom: 0, height: 3, width: '0%', background: '#FF9933' }} />
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Link href="/sign-up" className="sbl-press" style={{ display: 'flex', alignItems: 'center', gap: 10, height: 56, padding: '0 26px', borderRadius: 18, background: 'var(--sb-grad-stage)', color: '#fff', fontWeight: 800, fontSize: 16, whiteSpace: 'nowrap', boxShadow: 'var(--sb-shadow-stage)' }}>
            Start 7-day free trial<Icon name="arrow" size={18} weight="bold" color="#FF9933" />
          </Link>
          <a href="#proof" className="sbl-btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 10, height: 56, padding: '0 22px', borderRadius: 18, border: '1.5px solid var(--sb-ink)', fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap' }}>
            <Icon name="play" size={22} weight="fill" color="var(--sb-saffron-deep)" />See a real answer
          </a>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', fontSize: 13.5, fontWeight: 600, color: 'var(--sb-muted)' }}>
          {['No credit card', '15 free questions', 'Works on any phone'].map((t) => (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><Icon name="check" size={16} weight="bold" color="var(--sb-saffron-deep)" />{t}</span>
          ))}
        </div>
      </div>

        <div ref={deviceRoot} style={{ position: "relative", display: "flex", justifyContent: "center", padding: "10px 0" }}>
        <span style={{ position: "absolute", left: "50%", top: "50%", width: "min(110%,600px)", aspectRatio: "1", transform: "translate(-50%,-50%)", borderRadius: "50%", border: "1.5px solid #FF99332E" }}>
        </span>
        <span style={{ position: "absolute", left: "50%", top: "50%", width: "min(80%,440px)", aspectRatio: "1", margin: "calc(min(80%,440px) / -2) 0 0 calc(min(80%,440px) / -2)", borderRadius: "50%", border: "1.5px dashed #FF993366", animation: "sbSpin 60s linear infinite" }}>
        </span>
        <div data-h="outer" aria-hidden="true" style={{ position: "relative", width: "100%", maxWidth: "640px", height: "600px" }}>
        <div data-h="stage" style={{ position: "absolute", left: "0", top: "0", width: "640px", height: "600px", transformOrigin: "top left", perspective: "1800px", perspectiveOrigin: "50% 40%" }}>
        <div style={{ position: "absolute", left: "0", right: "0", top: "0", display: "flex", justifyContent: "center", zIndex: "5" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "40px", padding: "0 16px 0 6px", borderRadius: "999px", background: "#0A0F24", color: "#fff", fontSize: "13px", fontWeight: "700", boxShadow: "0 14px 30px -16px #0A0F24" }}>
        <span style={{ position: "relative", width: "28px", height: "28px", borderRadius: "50%", background: "#FF9933", color: "#0A0F24", display: "grid", placeItems: "center" }}>
        <span data-h="pIA" style={{ position: "absolute", transition: "opacity .4s", display: "inline-flex" }}>
        <Icon name="sparkle" size={15} weight="fill" />
        </span>
        <span data-h="pIB" style={{ position: "absolute", opacity: "0", transition: "opacity .4s", display: "inline-flex" }}>
        <Icon name="pen-nib" size={15} weight="fill" />
        </span>
        </span>
        <span style={{ display: "grid" }}>
        <span data-h="pTA" style={{ gridArea: "1/1", whiteSpace: "nowrap", transition: "opacity .4s" }}>Virat Gyankosh · the answer, with its page</span>
        <span data-h="pTB" style={{ gridArea: "1/1", whiteSpace: "nowrap", opacity: "0", transition: "opacity .4s" }}>InkBuddy · your handwriting, marked</span>
        </span>
        </div>
        </div>
        <div data-h="rig" style={{ position: "absolute", inset: "0", transformStyle: "preserve-3d" }}>
        <span style={{ position: "absolute", left: "120px", top: "120px", width: "420px", height: "320px", borderRadius: "50%", background: "radial-gradient(ellipse,#FF993355,transparent 65%)", filter: "blur(30px)" }}>
        </span>
        <span style={{ position: "absolute", left: "70px", top: "478px", width: "500px", height: "70px", borderRadius: "50%", background: "radial-gradient(ellipse,#0A0F2455,transparent 70%)", filter: "blur(12px)" }}>
        </span>
        <div data-h="tab" style={{ position: "absolute", left: "14px", top: "64px", width: "584px", height: "404px", borderRadius: "28px", background: "linear-gradient(145deg,#4A5378 0%,#1A2040 26%,#0A0F24 55%,#2A3152 100%)", padding: "6px", boxShadow: "0 0 0 1px #05081A,inset 0 0 0 1px #FFFFFF2E,inset 0 1.5px 0 #FFFFFF4D,0 2px 4px #0A0F2433,0 30px 60px -20px #0A0F2466,0 80px 120px -50px #0A0F24AA" }}>
        <span style={{ position: "absolute", right: "70px", top: "-2px", width: "44px", height: "3px", borderRadius: "2px 2px 0 0", background: "#2A3152" }}>
        </span>
        <span style={{ position: "absolute", right: "124px", top: "-2px", width: "26px", height: "3px", borderRadius: "2px 2px 0 0", background: "#2A3152" }}>
        </span>
        <span style={{ position: "absolute", left: "50%", top: "3px", width: "4px", height: "4px", marginLeft: "-2px", borderRadius: "50%", background: "#05081A", boxShadow: "0 0 0 1px #FFFFFF14" }}>
        </span>
        <div data-h="scr" style={{ position: "relative", width: "100%", height: "100%", borderRadius: "22px", background: "#F7F6F2", overflow: "hidden", color: "#0A0F24", boxShadow: "inset 0 0 0 1px #0A0F2414" }}>
        <span style={{ position: "absolute", left: "50%", bottom: "4px", width: "120px", height: "4px", marginLeft: "-60px", borderRadius: "4px", background: "#0A0F2433", zIndex: "3" }}>
        </span>
        <span style={{ position: "absolute", inset: "0", background: "linear-gradient(118deg,#FFFFFF38 0%,#FFFFFF00 26%,#FFFFFF00 72%,#FFFFFF12 100%)", pointerEvents: "none", zIndex: "4" }}>
        </span>
        <div style={{ height: "26px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", fontSize: "11px", fontWeight: "700" }}>
        <span>9:41</span>
        <span style={{ display: "flex", gap: "5px" }}>
        <Icon name="wifi-high" size={16} weight="fill" />
        <Icon name="battery-full" size={16} weight="fill" />
        </span>
        </div>
        <div style={{ height: "44px", display: "flex", alignItems: "center", gap: "10px", padding: "0 14px", borderBottom: "1px solid #E7E5DE" }}>
        <span style={{ position: "relative", width: "30px", height: "30px", borderRadius: "10px", background: "#0A0F24", color: "#FF9933", display: "grid", placeItems: "center" }}>
        <span data-h="hIA" style={{ position: "absolute", transition: "opacity .4s", display: "inline-flex" }}>
        <Icon name="sparkle" size={16} weight="fill" />
        </span>
        <span data-h="hIB" style={{ position: "absolute", opacity: "0", transition: "opacity .4s", display: "inline-flex" }}>
        <Icon name="pen-nib" size={16} weight="fill" />
        </span>
        </span>
        <span style={{ flex: "1", display: "grid", fontFamily: "var(--sb-font-display)", fontWeight: "700", fontSize: "16px" }}>
        <span data-h="hTA" style={{ gridArea: "1/1", transition: "opacity .4s" }}>Virat Gyankosh</span>
        <span data-h="hTB" style={{ gridArea: "1/1", opacity: "0", transition: "opacity .4s" }}>InkBuddy</span>
        </span>
        <span style={{ padding: "4px 10px", borderRadius: "999px", background: "#FFEBD6", color: "#B45309", fontSize: "11px", fontWeight: "800" }}>Class IX · CBSE</span>
        </div>
        <div style={{ position: "absolute", left: "12px", right: "12px", top: "82px", bottom: "12px", display: "grid", gridTemplateColumns: "232px minmax(0,1fr)", gap: "12px" }}>
        <div data-h="page" style={{ position: "relative", overflow: "hidden", background: "#fff", border: "1px solid #E7E5DE", borderRadius: "14px", padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", fontWeight: "800", letterSpacing: ".1em", color: "#7F85A3" }}>
        <span>NCERT · SCIENCE IX</span>
        <span>p.132</span>
        </div>
        <div style={{ fontFamily: "var(--sb-font-display)", fontWeight: "700", fontSize: "19px", lineHeight: "1.05", letterSpacing: "-.02em", margin: "8px 0" }}>Density and floating</div>
        <p style={{ margin: "0 0 7px", fontSize: "10.5px", lineHeight: "16px", color: "#3F4459" }}>Density is mass per unit volume. A substance floats on a liquid when its density is lower than the liquid's.</p>
        <p style={{ margin: "0 0 7px", fontSize: "10.5px", lineHeight: "16px", color: "#3F4459" }}>
        <span data-h="hl" style={{ background: "linear-gradient(#FFC067,#FFC067) no-repeat 0 90%", backgroundSize: "0% 55%", color: "#0A0F24", fontWeight: "700" }}>When water freezes, it expands, so ice is less dense than water.</span>{" "}Its molecules lock into an open hexagonal lattice.</p>
        <p style={{ margin: "0", fontSize: "10.5px", lineHeight: "16px", color: "#3F4459" }}>This is why a lake freezes from the top, and fish survive the winter below the ice.</p>
        <div data-h="sweep" style={{ position: "absolute", left: "0", right: "0", top: "10%", height: "30px", background: "linear-gradient(#FF993333,transparent)", borderTop: "1.5px solid #FF9933", opacity: "0" }}>
        </div>
        </div>
        <div style={{ position: "relative" }}>
        <div data-h="chat" style={{ position: "absolute", left: "0", top: "0", bottom: "0", width: "64px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "12px 0", borderRadius: "16px", background: "#fff", border: "1px solid #E7E5DE" }}>
        <span style={{ width: "40px", height: "40px", borderRadius: "13px", background: "#0A0F24", color: "#FF9933", display: "grid", placeItems: "center" }}>
        <Icon name="device-mobile" size={20} weight="fill" />
        </span>
        <span style={{ width: "2px", flex: "1", borderRadius: "2px", background: "repeating-linear-gradient(#FF9933 0 6px,transparent 6px 12px)" }}>
        </span>
        <span style={{ width: "40px", height: "40px", borderRadius: "13px", background: "#FFEBD6", color: "#B45309", display: "grid", placeItems: "center" }}>
        <Icon name="book-open-text" size={20} weight="duotone" />
        </span>
        <span style={{ fontSize: "9.5px", fontWeight: "800", letterSpacing: ".08em", color: "#B45309" }}>LIVE</span>
        </div>
        <div data-h="ink" style={{ position: "absolute", inset: "0", display: "flex", flexDirection: "column", gap: "9px", opacity: "0" }}>
        <div style={{ background: "#fff", border: "1px solid #E7E5DE", borderRadius: "14px", padding: "9px 12px" }}>
        <div style={{ fontSize: "9.5px", fontWeight: "800", letterSpacing: ".08em", color: "#5C6178" }}>Q3 · SCIENCE IX · CH 10 · 3 MARKS</div>
        <div style={{ fontWeight: "800", fontSize: "13.5px", marginTop: "2px" }}>Why does ice float on water?</div>
        </div>
        <div style={{ display: "grid", fontSize: "11.5px", fontWeight: "700", color: "#5C6178" }}>
        <span data-h="s1" style={{ gridArea: "1/1", display: "flex", alignItems: "center", gap: "6px", transition: "opacity .3s" }}>
        <Icon name="camera" size={16} weight="duotone" color="#B45309" />Waiting for your photo</span>
        <span data-h="s2" style={{ gridArea: "1/1", display: "flex", alignItems: "center", gap: "6px", opacity: "0", transition: "opacity .3s" }}>
        <span style={{ animation: "sbSpin 1s linear infinite", display: "inline-flex" }}>
        <Icon name="circle-notch" size={15} weight="bold" color="#B45309" />
        </span>Reading your handwriting…</span>
        <span data-h="s3" style={{ gridArea: "1/1", display: "flex", alignItems: "center", gap: "6px", opacity: "0", color: "#0A0F24", transition: "opacity .3s" }}>
        <Icon name="seal-check" size={16} weight="fill" color="#B45309" />Marked like the board exam</span>
        </div>
        <div style={{ background: "#0A0F24", color: "#fff", borderRadius: "16px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "7px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "800", letterSpacing: ".08em", color: "#FF9933" }}>INKBUDDY MARKS</span>
        <span style={{ fontFamily: "var(--sb-font-display)", fontWeight: "700", fontSize: "26px", lineHeight: "1" }}>
        <span data-h="score">0</span>
        <span style={{ fontSize: "13px", color: "#A9AEC6" }}>{" "}/ 3</span>
        </span>
        </div>
        <span style={{ height: "5px", borderRadius: "5px", background: "#FFFFFF1F", overflow: "hidden" }}>
        <span data-h="sbar" style={{ display: "block", height: "100%", width: "0%", background: "#FF9933", borderRadius: "5px" }}>
        </span>
        </span>
        <span data-r="1" style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "11.5px", color: "#fff", opacity: "0" }}>
        <Icon name="check" size={16} weight="bold" color="#FF9933" />Water expands on freezing</span>
        <span data-r="1" style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "11.5px", color: "#fff", opacity: "0" }}>
        <Icon name="check" size={16} weight="bold" color="#FF9933" />Density decreases</span>
        <span data-r="1" style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "11.5px", color: "#FFB4AE", opacity: "0" }}>
        <Icon name="minus" size={16} weight="bold" color="#FFB4AE" />Why? Open hexagonal lattice (−0.5)</span>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
        <span data-h="rev" style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "999px", background: "#E8E5FB", color: "#4636B0", fontSize: "11px", fontWeight: "800", opacity: "0" }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FF9933", boxShadow: "0 0 6px #FF9933" }}>
        </span>Revise p.132</span>
        <span data-h="why" style={{ padding: "5px 10px", borderRadius: "999px", background: "#FFEBD6", color: "#B45309", fontSize: "11px", fontWeight: "800", opacity: "0" }}>Ask Gyankosh why</span>
        </div>
        </div>
        </div>
        </div>
        </div>
        </div>
        <svg width={640} height={600} style={{ position: "absolute", left: "0", top: "0", overflow: "visible", pointerEvents: "none", transform: "translateZ(90px)" }}>
        <path data-h="glow" d="M0 0" style={{ fill: "none", stroke: "#FF9933", strokeWidth: "8", strokeLinecap: "round", opacity: "0", filter: "blur(6px)" }} />
        <path data-h="thr" d="M0 0" style={{ fill: "none", stroke: "#FF9933", strokeWidth: "2.4", strokeLinecap: "round", opacity: "0" }} />
        <circle data-h="dot" r="5" cx="0" cy="0" style={{ fill: "#FFF3DE", opacity: "0", filter: "drop-shadow(0 0 6px #FF9933)" }} />
        </svg>
        <div data-h="ph" style={{ position: "absolute", left: "-6px", top: "136px", width: "232px", height: "452px", borderRadius: "38px", background: "linear-gradient(145deg,#4A5378 0%,#1A2040 26%,#0A0F24 55%,#2A3152 100%)", padding: "3px", opacity: "0", boxShadow: "0 0 0 1px #05081A,inset 0 0 0 1px #FFFFFF2E,inset 0 1.5px 0 #FFFFFF4D,0 2px 4px #0A0F2433,0 30px 50px -20px #0A0F2477,0 60px 90px -30px #0A0F24CC" }}>
        <span style={{ position: "absolute", right: "-3px", top: "112px", width: "3px", height: "44px", borderRadius: "0 2px 2px 0", background: "#2A3152" }}>
        </span>
        <span style={{ position: "absolute", right: "-3px", top: "170px", width: "3px", height: "72px", borderRadius: "0 2px 2px 0", background: "#2A3152" }}>
        </span>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "35px", background: "radial-gradient(120% 80% at 50% 30%,#232946,#0E1222)", overflow: "hidden", color: "#fff", boxShadow: "inset 0 0 0 1px #FFFFFF14" }}>
        <span style={{ position: "absolute", left: "50%", top: "9px", width: "11px", height: "11px", marginLeft: "-5.5px", borderRadius: "50%", background: "#000", boxShadow: "inset 0 0 0 2px #1B2033,0 0 0 1px #FFFFFF14", zIndex: "5" }}>
        </span>
        <span style={{ position: "absolute", left: "50%", bottom: "7px", width: "84px", height: "4px", marginLeft: "-42px", borderRadius: "4px", background: "#FFFFFF80", zIndex: "5" }}>
        </span>
        <span style={{ position: "absolute", inset: "0", background: "linear-gradient(118deg,#FFFFFF38 0%,#FFFFFF00 26%,#FFFFFF00 72%,#FFFFFF12 100%)", pointerEvents: "none", zIndex: "6" }}>
        </span>
        <div data-h="pchat" style={{ position: "absolute", inset: "0", zIndex: "1", background: "#F7F6F2", color: "#0A0F24", display: "flex", flexDirection: "column" }}>
        <div style={{ height: "30px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", fontSize: "10px", fontWeight: "700" }}>
        <span>9:41</span>
        <span style={{ display: "flex", gap: "4px" }}>
        <Icon name="wifi-high" size={16} weight="fill" />
        <Icon name="battery-full" size={16} weight="fill" />
        </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 12px 10px", borderBottom: "1px solid #E7E5DE" }}>
        <span style={{ width: "28px", height: "28px", borderRadius: "9px", background: "#0A0F24", color: "#FF9933", display: "grid", placeItems: "center" }}>
        <Icon name="sparkle" size={15} weight="fill" />
        </span>
        <span style={{ flex: "1", fontFamily: "var(--sb-font-display)", fontWeight: "700", fontSize: "14px", whiteSpace: "nowrap" }}>Virat Gyankosh</span>
        <span style={{ padding: "3px 8px", borderRadius: "999px", background: "#FFEBD6", color: "#B45309", fontSize: "9.5px", fontWeight: "800" }}>Sci IX</span>
        </div>
        <div style={{ flex: "1", minHeight: "0", padding: "12px 10px 34px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div data-h="q" style={{ alignSelf: "flex-end", maxWidth: "86%", background: "#0A0F24", color: "#F2F3F8", padding: "9px 13px", borderRadius: "16px 16px 4px 16px", fontSize: "12px", fontWeight: "600", transformOrigin: "bottom right", opacity: "0" }}>Why does ice float on water?</div>
        <div style={{ position: "relative" }}>
        <div data-h="dots" style={{ position: "absolute", left: "0", top: "0", display: "flex", gap: "7px", alignItems: "center", opacity: "0" }}>
        <span style={{ width: "24px", height: "24px", borderRadius: "8px", background: "#0A0F24", color: "#FF9933", display: "grid", placeItems: "center" }}>
        <Icon name="sparkle" size={13} weight="fill" />
        </span>
        <span style={{ display: "flex", gap: "4px" }}>
        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#0A0F24", animation: "sbDot 1.1s 0s infinite" }}>
        </span>
        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#0A0F24", animation: "sbDot 1.1s 0.15s infinite" }}>
        </span>
        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#0A0F24", animation: "sbDot 1.1s 0.3s infinite" }}>
        </span>
        </span>
        <span style={{ fontSize: "11px", color: "#5C6178" }}>Searching your textbook…</span>
        </div>
        <div data-h="ans" style={{ background: "#fff", border: "1px solid #E7E5DE", borderRadius: "4px 16px 16px 16px", padding: "11px 12px", fontSize: "12px", lineHeight: "1.5", opacity: "0", boxShadow: "0 18px 30px -22px #FF9933" }}>
        <span data-w="1" style={{ opacity: "0" }}>Water{" "}</span>
        <span data-w="1" style={{ opacity: "0", fontWeight: "800" }}>expands{" "}</span>
        <span data-w="1" style={{ opacity: "0", fontWeight: "800" }}>when{" "}</span>
        <span data-w="1" style={{ opacity: "0", fontWeight: "800" }}>it{" "}</span>
        <span data-w="1" style={{ opacity: "0", fontWeight: "800" }}>freezes,{" "}</span>
        <span data-w="1" style={{ opacity: "0" }}>so{" "}</span>
        <span data-w="1" style={{ opacity: "0" }}>ice{" "}</span>
        <span data-w="1" style={{ opacity: "0" }}>is{" "}</span>
        <span data-w="1" style={{ opacity: "0" }}>less{" "}</span>
        <span data-w="1" style={{ opacity: "0" }}>dense{" "}</span>
        <span data-w="1" style={{ opacity: "0" }}>than{" "}</span>
        <span data-w="1" style={{ opacity: "0" }}>liquid{" "}</span>
        <span data-w="1" style={{ opacity: "0" }}>water{" "}</span>
        <span data-w="1" style={{ opacity: "0" }}>and{" "}</span>
        <span data-w="1" style={{ opacity: "0" }}>floats.{" "}</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "9px" }}>
        <span data-h="chip" style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 9px", borderRadius: "999px", background: "#E8E5FB", color: "#4636B0", fontSize: "10.5px", fontWeight: "800", opacity: "0", transformOrigin: "left center" }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FF9933", boxShadow: "0 0 6px #FF9933" }}>
        </span>NCERT Science IX · p.132</span>
        <span data-h="bloom" style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 9px", borderRadius: "999px", background: "#EDECE6", color: "#3F4459", fontSize: "10.5px", fontWeight: "700", opacity: "0" }}>
        <Icon name="stack" size={16} weight="regular" />Understand</span>
        </div>
        </div>
        </div>
        <div data-h="qk" style={{ display: "flex", gap: "6px", opacity: "0" }}>
        <span style={{ padding: "6px 10px", borderRadius: "999px", border: "1px solid #E7E5DE", background: "#fff", fontSize: "11px", fontWeight: "700" }}>Explain simpler</span>
        <span style={{ padding: "6px 10px", borderRadius: "999px", background: "#FFEBD6", color: "#B45309", fontSize: "11px", fontWeight: "800" }}>Quiz me</span>
        </div>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "6px", background: "#fff", border: "1.5px solid #0A0F24", borderRadius: "20px", padding: "3px 3px 3px 12px" }}>
        <span data-h="inp" style={{ flex: "1", minWidth: "0", fontSize: "12px", color: "#8A8FA6", whiteSpace: "nowrap", overflow: "hidden" }}>Ask about any chapter…</span>
        <Icon name="microphone" size={16} weight="regular" />
        <span data-h="send" style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#FF9933", display: "grid", placeItems: "center" }}>
        <Icon name="arrow-up" size={14} weight="bold" />
        </span>
        </div>
        </div>
        <span style={{ position: "absolute", left: "50%", bottom: "7px", width: "84px", height: "4px", marginLeft: "-42px", borderRadius: "4px", background: "#0A0F2440" }}>
        </span>
        </div>
        <div data-h="cam" style={{ position: "absolute", inset: "0", zIndex: "1", opacity: "0" }}>
        <div style={{ position: "absolute", left: "0", right: "0", top: "26px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", fontSize: "11px", fontWeight: "700" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Icon name="pen-nib" size={14} weight="fill" color="#FF9933" />InkBuddy</span>
        <span style={{ padding: "3px 8px", borderRadius: "999px", background: "#FFFFFF1A", fontSize: "10px" }}>Q3 · 3 marks</span>
        </div>
        <div data-h="nb" style={{ position: "absolute", left: "14px", right: "14px", top: "58px", height: "262px", borderRadius: "6px", background: "#FFFDF6 linear-gradient(transparent 29px,#1F3A8A22 29px) 0 10px/100% 30px", transform: "rotate(-2deg)", boxShadow: "0 20px 30px -16px #000", padding: "10px 10px 0 34px", overflow: "hidden" }}>
        <span style={{ position: "absolute", left: "26px", top: "0", bottom: "0", width: "1.5px", background: "#FF9933AA" }}>
        </span>
        <div style={{ fontFamily: "var(--sb-font-hand)", fontWeight: "700", fontSize: "12px", lineHeight: "30px", color: "#0A0F24", whiteSpace: "nowrap" }}>Q3. Why does ice float?</div>
        <div style={{ position: "relative", height: "30px" }}>
        <div data-l="1" style={{ fontFamily: "var(--sb-font-hand)", fontSize: "12px", lineHeight: "30px", color: "#1F3A8A", whiteSpace: "nowrap", width: "max-content", clipPath: "inset(-4px 100% -4px 0)" }}>Water expands on freezing,</div>
        <span data-m="1" style={{ position: "absolute", left: "-32px", top: "0", lineHeight: "30px", fontFamily: "var(--sb-font-hand)", fontWeight: "700", fontSize: "11px", color: "#B45309", opacity: "0", whiteSpace: "nowrap" }}>✓+1</span>
        </div>
        <div style={{ position: "relative", height: "30px" }}>
        <div data-l="1" style={{ fontFamily: "var(--sb-font-hand)", fontSize: "12px", lineHeight: "30px", color: "#1F3A8A", whiteSpace: "nowrap", width: "max-content", clipPath: "inset(-4px 100% -4px 0)" }}>so its density decreases.</div>
        <span data-m="1" style={{ position: "absolute", left: "-32px", top: "0", lineHeight: "30px", fontFamily: "var(--sb-font-hand)", fontWeight: "700", fontSize: "11px", color: "#B45309", opacity: "0", whiteSpace: "nowrap" }}>✓+1</span>
        </div>
        <div style={{ position: "relative", height: "30px" }}>
        <div data-l="1" style={{ fontFamily: "var(--sb-font-hand)", fontSize: "12px", lineHeight: "30px", color: "#1F3A8A", whiteSpace: "nowrap", width: "max-content", clipPath: "inset(-4px 100% -4px 0)" }}>Less dense ice floats.</div>
        <span data-m="1" style={{ position: "absolute", left: "-32px", top: "0", lineHeight: "30px", fontFamily: "var(--sb-font-hand)", fontWeight: "700", fontSize: "11px", color: "#B45309", opacity: "0", whiteSpace: "nowrap" }}>✓+½</span>
        </div>
        <div data-h="mnote" style={{ fontFamily: "var(--sb-font-hand)", fontWeight: "700", fontSize: "11px", lineHeight: "30px", color: "#B45309", opacity: "0", whiteSpace: "nowrap" }}>↳ Why does it expand?</div>
        <div data-h="scan" style={{ position: "absolute", left: "0", right: "0", top: "6%", height: "2px", background: "#FF9933", boxShadow: "0 0 14px 4px #FF993399", opacity: "0" }}>
        </div>
        <div data-h="rip" style={{ position: "absolute", right: "10px", bottom: "14px", width: "66px", height: "66px", borderRadius: "50%", border: "3px solid #FF9933", opacity: "0" }}>
        </div>
        <div data-h="stamp" style={{ position: "absolute", right: "10px", bottom: "14px", width: "66px", height: "66px", borderRadius: "50%", background: "#0A0F24", color: "#fff", border: "3px solid #FF9933", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: "0", boxShadow: "0 12px 20px -10px #0A0F24" }}>
        <span style={{ fontFamily: "var(--sb-font-display)", fontWeight: "700", fontSize: "21px", lineHeight: "1" }}>2½</span>
        <span style={{ fontSize: "8.5px", fontWeight: "800", color: "#FF9933" }}>out of 3</span>
        </div>
        <span data-h="pen" style={{ position: "absolute", left: "0", top: "0", opacity: "0", filter: "drop-shadow(0 4px 4px #0A0F2466)", display: "inline-flex" }}>
        <Icon name="pen-nib" size={22} weight="fill" color="#EE7A0C" />
        </span>
        </div>
        <span data-c="1" style={{ position: "absolute", left: "8px", top: "50px", width: "22px", height: "22px", borderTop: "3px solid #fff", borderLeft: "3px solid #fff", borderRadius: "8px 0 0 0", opacity: "0" }}>
        </span>
        <span data-c="1" style={{ position: "absolute", right: "8px", top: "50px", width: "22px", height: "22px", borderTop: "3px solid #fff", borderRight: "3px solid #fff", borderRadius: "0 8px 0 0", opacity: "0" }}>
        </span>
        <span data-c="1" style={{ position: "absolute", left: "8px", top: "308px", width: "22px", height: "22px", borderBottom: "3px solid #fff", borderLeft: "3px solid #fff", borderRadius: "0 0 0 8px", opacity: "0" }}>
        </span>
        <span data-c="1" style={{ position: "absolute", right: "8px", top: "308px", width: "22px", height: "22px", borderBottom: "3px solid #fff", borderRight: "3px solid #fff", borderRadius: "0 0 8px 0", opacity: "0" }}>
        </span>
        <div data-h="flash" style={{ position: "absolute", inset: "0", background: "#fff", opacity: "0", pointerEvents: "none" }}>
        </div>
        <div style={{ position: "absolute", left: "0", right: "0", bottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-around" }}>
        <span style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#FFFFFF1F", display: "grid", placeItems: "center" }}>
        <Icon name="image" size={17} weight="regular" />
        </span>
        <span style={{ width: "58px", height: "58px", borderRadius: "50%", border: "3px solid #fff", display: "grid", placeItems: "center" }}>
        <span data-h="shut" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#FF9933" }}>
        </span>
        </span>
        <span style={{ padding: "6px 9px", borderRadius: "999px", background: "#FFFFFF1F", fontSize: "10.5px", fontWeight: "800", whiteSpace: "nowrap" }}>EN · हि</span>
        </div>
        </div>
        </div>
        </div>
        </div>
        </div>
        </div>
        </div>
    </section>
  )
}

export default HeroSection
