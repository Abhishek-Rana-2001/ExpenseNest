import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { motion } from 'motion/react'
import { forwardRef, useEffect, useRef, useState } from 'react'

type SearchBarProps = React.ComponentProps<'input'> & {
  containerClass?: string
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ containerClass, className, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [isFocused, setIsFocused] = useState(false)

    // merge refs
    const setRefs = (node: HTMLInputElement) => {
      inputRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.RefObject<HTMLInputElement | null>).current = node
    }

    // 🔥 "/" shortcut to focus
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === '/' && document.activeElement !== inputRef.current) {
          e.preventDefault()
          inputRef.current?.focus()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
      <motion.div
        onClick={() => inputRef.current?.focus()}
        animate={{
          boxShadow: isFocused
            ? '0 0 0 2px rgba(59,130,246,0.5)'
            : '0 0 0 0px rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          'flex gap-2 items-center bg-[#F2F3FB] rounded-md p-2 w-full max-w-2xl cursor-text',
          containerClass
        )}
      >
        {/* 🔥 Animated Icon */}
        <motion.div
          animate={{
            scale: isFocused ? 1.1 : 1,
            opacity: isFocused ? 1 : 0.6,
          }}
          transition={{ duration: 0.2 }}
        >
          <Search />
        </motion.div>

        <input
          ref={setRefs}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'outline-none w-full bg-transparent placeholder:text-gray-400 placeholder:text-sm',
            className
          )}
          {...props}
        />

        {/* 🔥 Shortcut hint */}
        <span className="text-xs text-gray-400 hidden sm:block">/</span>
      </motion.div>
    )
  }
)

export default SearchBar

// import { cn } from '@/lib/utils'
// import { Search } from 'lucide-react'
// import { motion, type HTMLMotionProps } from 'motion/react'
// import { forwardRef, useRef } from 'react'

// type SearchBarProps = HTMLMotionProps<'input'> & {
//   containerClass?: string
// }

// const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
//   ({ containerClass, className, ...props }, ref) => {

//     return (
//       <div className={cn('flex gap-2 items-center bg-[#F2F3FB] rounded-md p-2 w-full max-w-2xl', containerClass)}>
//         <Search />
//         <motion.input
//           ref={ref}
//           className={cn('outline-0 w-full ', className)}
//           {...props}
//         />
//       </div>
//     )
//   }
// )

// export default SearchBar