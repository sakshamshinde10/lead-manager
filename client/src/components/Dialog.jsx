import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { gsap, MOTION_OK } from '../lib/motion'

// A modal built on the browser's native <dialog> element. The browser gives
// us, for free and correctly: a focus trap, closing with Esc, a dimmed
// backdrop, and making everything behind it unreachable for screen readers.
// GSAP only adds the movement.
//
// variant="drawer"  slides in from the right (the Add / Edit panel)
// variant="center"  fades and scales in (the delete confirmation)
//
// `children` is a function so the content can call `close()`, which plays the
// exit animation first and only then tells the parent to remove the dialog.

const DRAWER =
  'm-0 ml-auto h-dvh max-h-none w-full max-w-md overflow-hidden border-l-2 border-ink bg-cream-50 p-0 text-ink'
const CENTER =
  'm-auto w-[min(92vw,26rem)] overflow-hidden rounded-3xl border-2 border-ink bg-cream-50 p-0 text-ink shadow-hard'

const motionAllowed = () => window.matchMedia(MOTION_OK).matches

export default function Dialog({ variant = 'center', labelledBy, onClose, children }) {
  const ref = useRef(null)
  const closing = useRef(false)

  // Always call the latest onClose, even if the parent re-rendered meanwhile.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  const close = useCallback(() => {
    const dialog = ref.current
    if (!dialog || closing.current) return
    closing.current = true

    const finish = () => {
      if (dialog.open) dialog.close()
      onCloseRef.current()
    }

    dialog.classList.add('closing') // fades the backdrop out (see index.css)
    if (!motionAllowed()) return finish()

    gsap.to(dialog, {
      ...(variant === 'drawer' ? { xPercent: 100 } : { opacity: 0, scale: 0.96, y: 12 }),
      duration: 0.28,
      ease: 'power2.in',
      onComplete: finish,
    })
  }, [variant])

  // Open as soon as it mounts. A layout effect runs before the browser paints,
  // so the starting position is set first and there is no flash.
  useLayoutEffect(() => {
    const dialog = ref.current
    dialog.showModal()
    dialog.querySelector('[data-autofocus]')?.focus()

    if (motionAllowed()) {
      gsap.from(dialog, {
        ...(variant === 'drawer' ? { xPercent: 100 } : { opacity: 0, scale: 0.96, y: 16 }),
        duration: 0.45,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      })
    }

    return () => {
      gsap.killTweensOf(dialog)
      if (dialog.open) dialog.close()
    }
  }, [variant])

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      // Esc: run our animated close instead of the browser's instant one.
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
      // A click on the dimmed backdrop lands on the <dialog> element itself.
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
      }}
      className={variant === 'drawer' ? DRAWER : CENTER}
    >
      {/* `close` only reads refs when it is CALLED (a click or Esc), never while
          rendering, so the "refs during render" lint rule is a false alarm here. */}
      {/* oxlint-disable-next-line react/refs */}
      {children({ close })}
    </dialog>
  )
}
