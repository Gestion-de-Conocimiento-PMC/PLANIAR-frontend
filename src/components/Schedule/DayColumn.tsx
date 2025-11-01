import React from 'react'
interface DayColumnProps {
  date: Date
  dayName: string
  children?: React.ReactNode
}

export function DayColumn({ date, dayName, children }: DayColumnProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="border-r last:border-r-0 relative min-w-[140px]">
      {/* Day header - rendered separately in grid */}
      {children}
    </div>
  )
}
