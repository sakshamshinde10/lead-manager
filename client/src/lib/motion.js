import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

// Register the React hook once, here, so every component imports GSAP from
// this one file. useGSAP cleans up animations automatically when a component
// unmounts, which prevents leaks and the odd double-run in React StrictMode.
gsap.registerPlugin(useGSAP)

// Every animation is wrapped in this media query. Users who ask their system
// for reduced motion simply see the finished page with no movement.
export const MOTION_OK = '(prefers-reduced-motion: no-preference)'

export { gsap, useGSAP }
