'use client'

import { motion } from 'framer-motion'

interface Props {
  count: number
  onCompare: () => void
  onClear: () => void
}

export default function ComparisonBar({ count, onCompare, onClear }: Props) {
  return (
    <motion.div
      className="fixed bottom-0 left-0 md:left-[250px] right-0 z-40 bg-dark border-t-2 border-dark px-6 py-4 flex items-center justify-between"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <span className="text-white font-display font-bold uppercase text-sm tracking-wide">
        {count} space{count !== 1 ? 's' : ''} selected
      </span>
      <div className="flex items-center gap-3">
        <button
          onClick={onClear}
          className="text-white/50 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
        >
          Clear
        </button>
        <button
          onClick={onCompare}
          disabled={count < 2}
          className="bg-primary border-2 border-dark text-dark font-bold uppercase text-xs tracking-widest px-6 py-2.5 rounded-xl disabled:opacity-40 hover:bg-secondary hover:text-white transition-colors"
        >
          Compare{count > 1 ? ` (${count})` : ''}
        </button>
      </div>
    </motion.div>
  )
}
