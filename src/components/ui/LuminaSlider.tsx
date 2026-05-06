'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

declare const gsap: any
declare const THREE: any

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SlideData {
  title: string
  subtitle?: string   // e.g. "Middle East" or "Warm · Spicy · Resinous"
  badge?: string      // e.g. "12 brands" or "7 fragrances"
  description: string
  image: string       // Unsplash URL
  href: string        // /country/[slug] or /vibe/[slug]
  ctaLabel?: string   // defaults to "Explore collection →"
}

interface LuminaSliderProps {
  slides: SlideData[]
  pageLabel?: string  // tiny top-left label, e.g. "Fragrance Origins"
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LuminaSlider({ slides, pageLabel }: LuminaSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [activeCta, setActiveCta] = useState({ href: slides[0]?.href ?? '#', label: slides[0]?.ctaLabel ?? 'Explore collection →' })

  useEffect(() => {
    if (!containerRef.current || slides.length < 2) return
    const container = containerRef.current
    let destroyed = false

    // ── Script loader ──────────────────────────────────────────────────────
    const loadScript = (src: string, global: string) =>
      new Promise<void>((res, rej) => {
        if ((window as any)[global]) { res(); return }
        const existing = document.querySelector(`script[src="${src}"]`)
        if (existing) {
          const t = setInterval(() => { if ((window as any)[global]) { clearInterval(t); res() } }, 50)
          setTimeout(() => { clearInterval(t); rej(new Error(`Timeout: ${global}`)) }, 10_000)
          return
        }
        const s = document.createElement('script')
        s.src = src
        s.onload = () => setTimeout(() => res(), 100)
        s.onerror = () => rej(new Error(`Failed: ${src}`))
        document.head.appendChild(s)
      })

    // ── State ──────────────────────────────────────────────────────────────
    let currentIndex = 0
    let transitioning = false
    let shaderMat: any, renderer: any, scene: any, camera: any
    let textures: any[] = []
    let texturesReady = false
    let sliderOn = false
    let progAnim: any = null
    let slideTimer: any = null
    let animFrameId: number | null = null
    let roCleanup: (() => void) | null = null
    let visCleanup: (() => void) | null = null

    const TRANSITION_S = 2.5
    const SLIDE_MS = 6000
    const TICK_MS = 50

    // ── DOM helpers (scoped to container) ─────────────────────────────────
    const q = <T extends HTMLElement = HTMLElement>(sel: string): T | null =>
      container.querySelector(sel) as T | null
    const qAll = (sel: string): HTMLElement[] =>
      Array.from(container.querySelectorAll(sel)) as HTMLElement[]

    // ── Shaders ───────────────────────────────────────────────────────────
    const vert = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`
    const frag = `
      uniform sampler2D uTex1,uTex2;
      uniform float uProg;
      uniform vec2 uRes,uTex1Size,uTex2Size;
      varying vec2 vUv;
      vec2 cover(vec2 uv,vec2 ts){
        vec2 s=uRes/ts; float sc=max(s.x,s.y);
        vec2 sc2=ts*sc; vec2 off=(uRes-sc2)*0.5;
        return (uv*uRes-off)/sc2;
      }
      void main(){
        vec2 uv1=cover(vUv,uTex1Size); vec2 uv2=cover(vUv,uTex2Size);
        float maxR=length(uRes)*0.85; float br=uProg*maxR;
        vec2 p=vUv*uRes; vec2 c=uRes*0.5;
        float d=length(p-c); float nd=d/max(br,0.001);
        float mask=smoothstep(br+3.0,br-3.0,d);
        vec4 img;
        if(mask>0.0){
          float ro=0.07*pow(smoothstep(0.3,1.0,nd),1.5);
          vec2 dir=(d>0.0)?(p-c)/d:vec2(0.0);
          vec2 du=uv2-dir*ro;
          du+=vec2(sin(uProg*5.0+nd*10.0),cos(uProg*4.0+nd*8.0))*0.012*nd*mask;
          float ca=0.018*pow(smoothstep(0.3,1.0,nd),1.2);
          img=vec4(
            texture2D(uTex2,du+dir*ca*1.2).r,
            texture2D(uTex2,du+dir*ca*0.2).g,
            texture2D(uTex2,du-dir*ca*0.8).b,1.0
          );
          float rim=smoothstep(0.95,1.0,nd)*(1.0-smoothstep(1.0,1.01,nd));
          img.rgb+=rim*0.05;
        } else {
          img=texture2D(uTex2,uv2);
        }
        vec4 old=texture2D(uTex1,uv1);
        if(uProg>0.95) img=mix(img,texture2D(uTex2,uv2),(uProg-0.95)/0.05);
        gl_FragColor=mix(old,img,mask);
      }
    `

    // ── Text split/animate ─────────────────────────────────────────────────
    const split = (t: string) =>
      t.split('').map(c => `<span style="display:inline-block;opacity:0">${c === ' ' ? '&nbsp;' : c}</span>`).join('')

    const animIn = (idx: number) => {
      const titleEl = q('[data-l="title"]')
      const descEl  = q('[data-l="desc"]')
      const subEl   = q('[data-l="sub"]')
      const badgeEl = q('[data-l="badge"]')
      if (!titleEl || !descEl) return

      // Out
      gsap.to(titleEl.children, { y: -20, opacity: 0, duration: 0.4, stagger: 0.01, ease: 'power2.in' })
      gsap.to([descEl, subEl, badgeEl].filter(Boolean), { y: -10, opacity: 0, duration: 0.3, ease: 'power2.in' })

      setTimeout(() => {
        if (destroyed) return
        const s = slides[idx]
        titleEl.innerHTML = split(s.title)
        descEl.textContent = s.description
        if (subEl)   subEl.textContent   = s.subtitle ?? ''
        if (badgeEl) badgeEl.textContent = s.badge ?? ''

        // Update CTA via React state (Link component)
        setActiveCta({ href: s.href, label: s.ctaLabel ?? 'Explore collection →' })

        gsap.set(titleEl.children, { opacity: 0 })
        gsap.set([descEl, subEl, badgeEl].filter(Boolean), { y: 20, opacity: 0 })

        const anims = [
          () => { gsap.set(titleEl.children, { y: 24 }); gsap.to(titleEl.children, { y: 0, opacity: 1, duration: 0.9, stagger: 0.03, ease: 'power3.out' }) },
          () => { gsap.set(titleEl.children, { y: -24 }); gsap.to(titleEl.children, { y: 0, opacity: 1, duration: 0.9, stagger: 0.03, ease: 'back.out(1.7)' }) },
          () => { gsap.set(titleEl.children, { filter: 'blur(8px)', scale: 1.4 }); gsap.to(titleEl.children, { filter: 'blur(0px)', scale: 1, opacity: 1, duration: 1, stagger: { amount: 0.5, from: 'random' }, ease: 'power2.out' }) },
          () => { gsap.set(titleEl.children, { scale: 0 }); gsap.to(titleEl.children, { scale: 1, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'back.out(1.5)' }) },
          () => { gsap.set(titleEl.children, { rotationX: 90, transformOrigin: '50% 50%' }); gsap.to(titleEl.children, { rotationX: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: 'power2.out' }) },
          () => { gsap.set(titleEl.children, { x: 30 }); gsap.to(titleEl.children, { x: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: 'power3.out' }) },
          () => { gsap.set(titleEl.children, { y: 24 }); gsap.to(titleEl.children, { y: 0, opacity: 1, duration: 0.9, stagger: 0.03, ease: 'power3.out' }) },
        ]
        anims[idx % anims.length]()
        gsap.to([descEl, subEl, badgeEl].filter(Boolean), { y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: 'power3.out' })
      }, 420)
    }

    // ── Navigation ────────────────────────────────────────────────────────
    const buildNav = () => {
      const nav = q('[data-l="nav"]')
      if (!nav) return
      nav.innerHTML = ''
      slides.forEach((s, i) => {
        const item = document.createElement('div')
        item.className = `lumina-nav-item${i === 0 ? ' lumina-active' : ''}`
        item.dataset.i = String(i)
        item.innerHTML = `
          <div class="lumina-prog-line"><div class="lumina-prog-fill"></div></div>
          <span class="lumina-nav-title">${s.title}</span>
          ${s.subtitle ? `<span class="lumina-nav-sub">${s.subtitle}</span>` : ''}
        `
        item.addEventListener('click', e => {
          e.stopPropagation()
          if (!transitioning && i !== currentIndex) goTo(i)
        })
        nav.appendChild(item)
      })
    }

    const setNavActive = (idx: number) =>
      qAll('.lumina-nav-item').forEach((el, i) => el.classList.toggle('lumina-active', i === idx))

    const setProgress = (idx: number, pct: number) => {
      const fill = qAll('.lumina-nav-item')[idx]?.querySelector('.lumina-prog-fill') as HTMLElement
      if (fill) { fill.style.width = `${pct}%`; fill.style.opacity = '1' }
    }

    const resetProgress = (idx: number) => {
      const fill = qAll('.lumina-nav-item')[idx]?.querySelector('.lumina-prog-fill') as HTMLElement
      if (fill) {
        fill.style.transition = 'width 0.2s ease-out'
        fill.style.width = '0%'
        setTimeout(() => { if (fill) fill.style.transition = '' }, 220)
      }
    }

    const updateCounter = (idx: number) => {
      const num   = q('[data-l="num"]')
      const total = q('[data-l="total"]')
      if (num)   num.textContent   = String(idx + 1).padStart(2, '0')
      if (total) total.textContent = String(slides.length).padStart(2, '0')
    }

    // ── Timer ─────────────────────────────────────────────────────────────
    const stopTimer = () => {
      if (progAnim)   clearInterval(progAnim)
      if (slideTimer) clearTimeout(slideTimer)
      progAnim = null; slideTimer = null
    }

    const startTimer = () => {
      if (!texturesReady || !sliderOn || destroyed) return
      stopTimer()
      let pct = 0
      const step = (100 / SLIDE_MS) * TICK_MS
      progAnim = setInterval(() => {
        if (!sliderOn || destroyed) { stopTimer(); return }
        pct += step
        setProgress(currentIndex, pct)
        if (pct >= 100) {
          clearInterval(progAnim); progAnim = null
          resetProgress(currentIndex)
          if (!transitioning) goTo((currentIndex + 1) % slides.length)
        }
      }, TICK_MS)
    }

    const safeStart = (delay = 0) => {
      stopTimer()
      if (delay > 0) slideTimer = setTimeout(startTimer, delay)
      else startTimer()
    }

    // ── Texture loader ────────────────────────────────────────────────────
    const loadTex = (url: string) =>
      new Promise<any>((res, rej) => {
        const loader = new THREE.TextureLoader()
        loader.crossOrigin = 'anonymous'
        loader.load(
          url,
          (t: any) => {
            t.minFilter = t.magFilter = THREE.LinearFilter
            t.userData = { size: new THREE.Vector2(t.image.width, t.image.height) }
            res(t)
          },
          undefined,
          rej
        )
      })

    // ── Slide transition ──────────────────────────────────────────────────
    const goTo = (target: number) => {
      if (transitioning || target === currentIndex) return
      stopTimer()
      resetProgress(currentIndex)

      const cur  = textures[currentIndex]
      const next = textures[target]
      if (!cur || !next) return

      transitioning = true
      shaderMat.uniforms.uTex1.value     = cur
      shaderMat.uniforms.uTex2.value     = next
      shaderMat.uniforms.uTex1Size.value = cur.userData.size
      shaderMat.uniforms.uTex2Size.value = next.userData.size

      animIn(target)
      currentIndex = target
      updateCounter(currentIndex)
      setNavActive(currentIndex)

      gsap.fromTo(
        shaderMat.uniforms.uProg,
        { value: 0 },
        {
          value: 1,
          duration: TRANSITION_S,
          ease: 'power2.inOut',
          onComplete: () => {
            shaderMat.uniforms.uProg.value     = 0
            shaderMat.uniforms.uTex1.value     = next
            shaderMat.uniforms.uTex1Size.value = next.userData.size
            transitioning = false
            if (!destroyed) safeStart(100)
          }
        }
      )
    }

    // ── Init ──────────────────────────────────────────────────────────────
    const init = async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', 'gsap')
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'THREE')
      } catch (e) {
        console.error('[LuminaSlider] Script load failed', e)
        return
      }
      if (destroyed) return

      const canvas = q('canvas')
      if (!canvas) return

      const W = container.clientWidth
      const H = container.clientHeight

      scene    = new THREE.Scene()
      camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      shaderMat = new THREE.ShaderMaterial({
        uniforms: {
          uTex1:     { value: null },
          uTex2:     { value: null },
          uProg:     { value: 0 },
          uRes:      { value: new THREE.Vector2(W, H) },
          uTex1Size: { value: new THREE.Vector2(1, 1) },
          uTex2Size: { value: new THREE.Vector2(1, 1) },
        },
        vertexShader: vert,
        fragmentShader: frag,
      })
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMat))

      // Load all textures
      for (const s of slides) {
        try {
          textures.push(await loadTex(s.image))
        } catch {
          console.warn('[LuminaSlider] Texture failed:', s.image)
          textures.push(null)
        }
      }
      if (destroyed) return

      // Find first two valid textures
      const firstValid  = textures.findIndex(t => t !== null)
      const secondValid = textures.findIndex((t, i) => t !== null && i > firstValid)
      if (firstValid < 0 || secondValid < 0) return

      shaderMat.uniforms.uTex1.value     = textures[firstValid]
      shaderMat.uniforms.uTex2.value     = textures[secondValid]
      shaderMat.uniforms.uTex1Size.value = textures[firstValid].userData.size
      shaderMat.uniforms.uTex2Size.value = textures[secondValid].userData.size
      texturesReady = true
      sliderOn = true
      setLoaded(true)
      safeStart(600)

      // Render loop
      const render = () => {
        if (destroyed) return
        animFrameId = requestAnimationFrame(render)
        renderer.render(scene, camera)
      }
      render()

      // ResizeObserver
      const ro = new ResizeObserver(() => {
        if (destroyed) return
        const cw = container.clientWidth
        const ch = container.clientHeight
        renderer.setSize(cw, ch)
        shaderMat.uniforms.uRes.value.set(cw, ch)
      })
      ro.observe(container)
      roCleanup = () => ro.disconnect()

      // Visibility
      const onVis = () => {
        if (document.hidden) stopTimer()
        else if (!transitioning && sliderOn) safeStart()
      }
      document.addEventListener('visibilitychange', onVis)
      visCleanup = () => document.removeEventListener('visibilitychange', onVis)

      // Build nav + init content
      buildNav()
      updateCounter(0)

      const titleEl = q('[data-l="title"]')
      const descEl  = q('[data-l="desc"]')
      const subEl   = q('[data-l="sub"]')
      const badgeEl = q('[data-l="badge"]')
      if (titleEl && descEl) {
        titleEl.innerHTML = split(slides[0].title)
        descEl.textContent = slides[0].description
        if (subEl)   subEl.textContent   = slides[0].subtitle ?? ''
        if (badgeEl) badgeEl.textContent = slides[0].badge ?? ''
        gsap.fromTo(titleEl.children,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.03, ease: 'power3.out', delay: 0.5 }
        )
        gsap.fromTo([descEl, subEl, badgeEl].filter(Boolean),
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.8 }
        )
      }
    }

    init()

    return () => {
      destroyed = true
      stopTimer()
      if (animFrameId !== null) cancelAnimationFrame(animFrameId)
      if (roCleanup)  roCleanup()
      if (visCleanup) visCleanup()
      if (renderer) {
        renderer.dispose()
        try { renderer.forceContextLoss() } catch {}
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="lumina-wrapper"
      style={{
        height: 'calc(100vh - 64px)',
        minHeight: 600,
        position: 'relative',
        overflow: 'hidden',
        background: '#0a0a0a',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.9s ease',
      }}
    >
      {/* WebGL canvas */}
      <canvas style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {/* Gradient overlays */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)',
      }} />

      {/* Page label — top left */}
      {pageLabel && (
        <p style={{
          position: 'absolute', top: '2rem', left: '2.5rem', zIndex: 10,
          fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)', margin: 0,
        }}>
          {pageLabel}
        </p>
      )}

      {/* Slide content — center-left */}
      <div style={{
        position: 'absolute', bottom: '9rem', left: '2.5rem',
        zIndex: 10, maxWidth: 520,
      }}>
        {/* Subtitle (region / notes) */}
        <p data-l="sub" style={{
          fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: '#D4AF37', marginBottom: '0.5rem', opacity: 0,
        }} />

        {/* Badge (brand count / fragrance count) */}
        <p data-l="badge" style={{
          fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)', marginBottom: '0.75rem', opacity: 0,
        }} />

        {/* Title — GSAP animates children spans */}
        <h2 data-l="title" style={{
          fontFamily: 'var(--font-playfair, "Playfair Display", Georgia, serif)',
          fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
          color: '#F5F0E8',
          fontWeight: 300,
          lineHeight: 1.05,
          marginBottom: '1.1rem',
          letterSpacing: '-0.01em',
        }} />

        {/* Description */}
        <p data-l="desc" style={{
          fontSize: 14, color: 'rgba(245,240,232,0.7)',
          lineHeight: 1.75, marginBottom: '1.75rem', maxWidth: 400, opacity: 0,
        }} />

        {/* CTA — React-rendered so it's a real Link */}
        <Link
          href={activeCta.href}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#D4AF37', textDecoration: 'none',
            borderBottom: '1px solid rgba(212,175,55,0.35)',
            paddingBottom: 3,
          }}
        >
          {activeCta.label}
        </Link>
      </div>

      {/* Counter — bottom left */}
      <div style={{
        position: 'absolute', bottom: '2.5rem', left: '2.5rem',
        zIndex: 10, display: 'flex', alignItems: 'baseline', gap: '0.3rem',
      }}>
        <span data-l="num" style={{
          fontFamily: 'var(--font-playfair, "Playfair Display", Georgia, serif)',
          fontSize: '3.5rem', color: 'rgba(245,240,232,0.9)', lineHeight: 1, fontWeight: 300,
        }}>
          01
        </span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>&nbsp;/&nbsp;</span>
        <span data-l="total" style={{
          color: 'rgba(255,255,255,0.35)', fontSize: 12, letterSpacing: '0.1em',
        }}>
          {String(slides.length).padStart(2, '0')}
        </span>
      </div>

      {/* Right navigation */}
      <nav
        data-l="nav"
        style={{
          position: 'absolute', right: '2.5rem', top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1.25rem',
          minWidth: 180,
        }}
      />
    </div>
  )
}
