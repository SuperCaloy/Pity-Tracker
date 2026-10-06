'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { Button } from './ui/Button'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const reducedMotion = useReducedMotion()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-9 h-9" />
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-9 px-0"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <motion.span
        key={theme}
        initial={reducedMotion ? false : { opacity: 0, rotate: -90 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={reducedMotion ? { duration: 0.01 } : { duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className="flex items-center justify-center"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </motion.span>
    </Button>
  )
}
