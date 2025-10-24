import { useState } from 'react'
import { Circle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../ui/button'
import { ScheduleHeader } from '../Schedule/Header'
import { ScheduleGrid } from '../Schedule/Grid'
import { ScheduleLegend } from '../Schedule/Legend'

interface ScheduleProps {
  userId: number | undefined
  onUpdateClass?: (id: string, updates: any) => void
  onDeleteClass?: (id: string) => void
  onEditClasses?: () => void
}

export function Schedule({ 
  userId, 
  onUpdateClass, 
  onDeleteClass,
  onEditClasses 
}: ScheduleProps) {
  // State for current week's Monday
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const currentDayOfWeek = today.getDay()
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)
    monday.setHours(0, 0, 0, 0)
    return monday
  })

  const getWeekDates = (startDate: Date) => {
    const week = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      week.push(date)
    }
    return week
  }

  const weekDates = getWeekDates(currentWeekStart)

  const goToNextWeek = () => {
    const nextMonday = new Date(currentWeekStart)
    nextMonday.setDate(currentWeekStart.getDate() + 7)
    setCurrentWeekStart(nextMonday)
  }

  const goToPrevWeek = () => {
    const prevMonday = new Date(currentWeekStart)
    prevMonday.setDate(currentWeekStart.getDate() - 7)
    setCurrentWeekStart(prevMonday)
  }

  const goToCurrentWeek = () => {
    const today = new Date()
    const currentDayOfWeek = today.getDay()
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)
    monday.setHours(0, 0, 0, 0)
    setCurrentWeekStart(monday)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ScheduleHeader />

      {/* Controls */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex gap-2">
          <Button onClick={goToPrevWeek} className="border border-gray-300 hover:bg-gray-100">
            <ChevronLeft /> Prev Week
          </Button>
          <Button onClick={goToNextWeek} className="border border-gray-300 hover:bg-gray-100">
            Next Week <ChevronRight />
          </Button>
        </div>

        <Button
          onClick={goToCurrentWeek}
          className="gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white border-0"
        >
          <Circle className="w-4 h-4" />
          Today
        </Button>
      </div>

      {/* Schedule Grid (solo la semana visible) */}
      <ScheduleGrid 
        weekDates={weekDates}
        userId={userId ?? null}
        onUpdateClass={onUpdateClass}
        onDeleteClass={onDeleteClass}
        onEditClasses={onEditClasses}
      />

      {/* Legend */}
      <ScheduleLegend />
    </div>
  )
}