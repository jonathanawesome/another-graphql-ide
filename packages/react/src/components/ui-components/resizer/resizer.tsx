import { RecipeVariants } from '@another-graphql-ide/style'
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { resizerStyles } from './resizer.css'

const KEYBOARD_STEP = 2

export type ResizerProps = {
  orientation: Pick<
    NonNullable<RecipeVariants<typeof resizerStyles.container>>,
    'orientation'
  >['orientation']
  firstPane: ReactNode
  secondPane: ReactNode
  defaultSizePercent?: number
  minSizePercent?: number
  maxSizePercent?: number
}

export const Resizer = ({
  orientation,
  firstPane,
  secondPane,
  defaultSizePercent = 50,
  minSizePercent = 10,
  maxSizePercent = 90,
}: ResizerProps) => {
  const [sizePercent, setSizePercent] = useState(defaultSizePercent)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartPosRef = useRef<number>(0)
  const dragStartSizeRef = useRef<number>(0)
  const currentSizeRef = useRef<number>(defaultSizePercent)
  const containerSizeRef = useRef<number>(0)
  const frameRef = useRef<number | null>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)

      const container = containerRef.current
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      containerSizeRef.current =
        orientation === 'horizontal'
          ? containerRect.width
          : containerRect.height
      dragStartPosRef.current =
        orientation === 'horizontal' ? e.clientX : e.clientY
      dragStartSizeRef.current = currentSizeRef.current
    },
    [orientation]
  )

  const updateSize = useCallback((newSizePercent: number) => {
    currentSizeRef.current = newSizePercent
    setSizePercent(newSizePercent)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }

      frameRef.current = requestAnimationFrame(() => {
        if (!containerRef.current || containerSizeRef.current === 0) return

        const currentPos = orientation === 'horizontal' ? e.clientX : e.clientY
        const delta = currentPos - dragStartPosRef.current
        const deltaPercent = (delta / containerSizeRef.current) * 100

        const newSizePercent = Math.max(
          minSizePercent,
          Math.min(maxSizePercent, dragStartSizeRef.current + deltaPercent)
        )

        updateSize(newSizePercent)
      })
    },
    [orientation, minSizePercent, maxSizePercent, updateSize]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const decKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'
      const incKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown'
      let next: number | null = null
      if (e.key === decKey) next = currentSizeRef.current - KEYBOARD_STEP
      else if (e.key === incKey) next = currentSizeRef.current + KEYBOARD_STEP
      else if (e.key === 'Home') next = minSizePercent
      else if (e.key === 'End') next = maxSizePercent
      if (next === null) return
      e.preventDefault()
      updateSize(Math.max(minSizePercent, Math.min(maxSizePercent, next)))
    },
    [orientation, minSizePercent, maxSizePercent, updateSize]
  )

  useEffect(() => {
    if (isDragging) {
      const handleMouseMoveWrapper = (e: MouseEvent) => handleMouseMove(e)
      const handleMouseUpWrapper = () => handleMouseUp()

      document.addEventListener('mousemove', handleMouseMoveWrapper)
      document.addEventListener('mouseup', handleMouseUpWrapper)
      document.body.style.cursor =
        orientation === 'horizontal' ? 'col-resize' : 'row-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMoveWrapper)
        document.removeEventListener('mouseup', handleMouseUpWrapper)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current)
        }
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, orientation])

  const firstPaneStyle = useMemo(
    () =>
      orientation === 'horizontal'
        ? { width: `${sizePercent}%` }
        : { height: `${sizePercent}%` },
    [orientation, sizePercent]
  )

  const secondPaneStyle = useMemo(
    () =>
      orientation === 'horizontal'
        ? { width: `${100 - sizePercent}%` }
        : { height: `${100 - sizePercent}%` },
    [orientation, sizePercent]
  )

  return (
    <div
      ref={containerRef}
      className={resizerStyles.container({ orientation })}
    >
      <div className={resizerStyles.pane} style={firstPaneStyle}>
        {firstPane}
      </div>
      {/* WAI-ARIA window-splitter: focusable separator with keyboard resize.
          jsx-a11y does not model focusable separators as interactive. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className={resizerStyles.handle({ orientation, isDragging })}
        role="separator"
        aria-orientation={
          orientation === 'horizontal' ? 'vertical' : 'horizontal'
        }
        aria-valuenow={Math.round(sizePercent)}
        aria-valuemin={minSizePercent}
        aria-valuemax={maxSizePercent}
        aria-label="Resize panes"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
      />
      <div className={resizerStyles.pane} style={secondPaneStyle}>
        {secondPane}
      </div>
    </div>
  )
}
