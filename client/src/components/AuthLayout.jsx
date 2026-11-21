import { useRef } from 'react'
import { gsap, useGSAP, MOTION_OK } from '../lib/motion'
import Logo from './Logo'

// Shared frame for the login and signup pages: a bold orange panel on the
// left (hidden detail on phones) and the form on a cream background.
//
// Animation (GSAP), all transform/opacity only so it stays smooth:
//   1. shapes pop in
//   2. each heading line slides up out of a hidden strip (a "mask reveal")
//   3. supporting text and form fields rise in one after another
//   4. two shapes drift gently up and down
export default function AuthLayout({ lines, blurb, children }) {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        tl.from('[data-shape]', { scale: 0.5, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'back.out(1.7)' })
          .from('[data-line]', { yPercent: 115, duration: 0.75, stagger: 0.1 }, 0.05)
          .from('[data-fade]', { y: 16, opacity: 0, duration: 0.5, stagger: 0.08 }, 0.4)
          .from('[data-field]', { y: 18, opacity: 0, duration: 0.5, stagger: 0.07 }, 0.3)

        gsap.to('[data-float]', { y: -12, duration: 3, ease: 'sine.inOut', repeat: -1, yoyo: true, stagger: 0.6 })
      })
    },
    { scope: root },
  )

  return (
    <main ref={root} className="grid min-h-dvh md:grid-cols-[1.05fr_1fr]">
      <section className="relative flex flex-col justify-between gap-10 overflow-hidden bg-brand-500 px-6 py-8 md:px-14 md:py-14">
        <div data-fade className="relative z-10">
          <Logo onOrange />
        </div>

        <div className="relative z-10">
          <p className="display text-[2rem] sm:text-5xl md:text-6xl" aria-hidden="true">
            {lines.map((line) => (
              <span key={line} className="block overflow-hidden pb-1">
                <span data-line className="block">
                  {line}
                </span>
              </span>
            ))}
          </p>
          <p data-fade className="mt-5 hidden max-w-sm text-base font-medium md:block">
            {blurb}
          </p>
        </div>

        {/* Decorative shapes, hand-built from simple CSS. Hidden on phones. */}
        <div aria-hidden="true" className="pointer-events-none hidden md:block">
          <div data-shape className="absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-cream-100" />
          <div data-shape data-float className="absolute bottom-28 right-28 h-10 w-32 -rotate-12 rounded-full bg-ink" />
          <div data-shape data-float className="absolute right-14 top-32 h-16 w-16 rounded-full border-[7px] border-ink" />
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10 md:px-14">
        <div className="w-full max-w-sm">{children}</div>
      </section>
    </main>
  )
}
