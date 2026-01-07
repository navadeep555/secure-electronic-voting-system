import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'
import { slideIn, fadeIn } from '../lib/animations'

interface AnimatedContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode
  delay?: number
  slideDirection?: 'left' | 'right' | 'none'
  className?: string
}

export function AnimatedContainer({ 
  children, 
  delay = 0, 
  slideDirection = 'none',
  className = "",
  ...props 
}: AnimatedContainerProps) {
  
  const getVariants = () => {
    if (slideDirection === 'left') return slideIn
    if (slideDirection === 'right') {
      return {
        ...slideIn,
        initial: { x: 20, opacity: 0 },
        exit: { x: -20, opacity: 0 }
      }
    }
    return fadeIn
  }

  return (
    <motion.div
      variants={getVariants()}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
