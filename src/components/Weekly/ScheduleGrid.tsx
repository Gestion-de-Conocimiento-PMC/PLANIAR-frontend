import { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { ScrollArea } from '../ui/scroll-area'
import { ClassBlock } from '../Schedule/ClassBlock'
import { TaskBlock } from '../Schedule/TaskBlock'
import { ClassDetailDialog } from '../ClassDetailDialog'
import { ClassItem } from '../../types'

interface ScheduleGridProps {
  weekDates: Date[]
  tasks: any[]
  classes: any[]
  onUpdateClass?: (id: string, updates: any) => void
  onDeleteClass?: (id: string) => void
  onEditClasses?: () => void
}

export function ScheduleGrid({ 
  weekDates, 
  tasks, 
  classes, 
  onUpdateClass, 
  onDeleteClass,
  onEditClasses 
}: ScheduleGridProps) {
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null)
  const [isClassDetailOpen, setIsClassDetailOpen] = useState(false)
  
  const hours = Array.from({ length: 17 }, (_, i) => i + 6) // 6:00 to 22:00
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const heightPerHour = 60 // 60px per hour

  const getDayOfWeek = (date: Date) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[date.getDay()]
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours + minutes / 60
  }

  const getItemsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = getDayOfWeek(date)
    
    const items: any[] = []

    // Get classes for this day
    const dayClasses = classes.filter(cls => {
      if (!cls.days || !cls.days.includes(dayOfWeek)) return false
      
      if (cls.dateFrom && cls.dateTo) {
        const classStart = new Date(cls.dateFrom)
        const classEnd = new Date(cls.dateTo)
        return date >= classStart && date <= classEnd
      }
      
      return true
    })

    dayClasses.forEach(cls => {
      const dayTime = cls.dayTimes?.[dayOfWeek]
      if (dayTime?.start && dayTime?.end) {
        const startHour = parseTime(dayTime.start)
        const endHour = parseTime(dayTime.end)
        items.push({
          ...cls,
          itemType: 'class',
          startHour,
          duration: endHour - startHour,
          room: cls.room
        })
      }
    })

    // Get tasks for this day with suggested times
    const dayTasks = tasks.filter(task => {
      if (task.dueDate && task.dueDate.startsWith(dateStr) && task.suggestedStartTime && task.suggestedStartTime !== '23:59') {
        return true
      }
      return false
    })

    dayTasks.forEach(task => {
      const startHour = parseTime(task.suggestedStartTime)
      const duration = (task.estimatedTime || 60) / 60 // Convert minutes to hours
      items.push({
        ...task,
        itemType: 'task',
        startHour,
        duration
      })
    })

    return items
  }

  const handleClassClick = (classItem: any) => {
    setSelectedClass(classItem)
    setIsClassDetailOpen(true)
  }

  const handleEditClass = () => {
    setIsClassDetailOpen(false)
    if (onEditClasses) {
      onEditClasses()
    }
  }

  const handleDeleteClass = () => {
    if (selectedClass && onDeleteClass) {
      onDeleteClass(selectedClass.id)
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="relative">
              {/* Header with day names */}
              <div className="sticky top-0 z-20 bg-background border-b">
                <div className="grid grid-cols-8 min-w-[800px]">
                  {/* Empty corner cell */}
                  <div className="border-r p-3 bg-muted/30">
                    <p className="text-xs font-medium text-muted-foreground">Time</p>
                  </div>
                  {/* Day headers */}
                  {weekDates.map((date, index) => (
                    <div 
                      key={index} 
                      className="border-r last:border-r-0 p-3 text-center bg-muted/30"
                    >
                      <p className="text-xs font-medium text-muted-foreground">{dayNames[index]}</p>
                      <p className="text-sm font-medium mt-1">{formatDate(date)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule grid */}
              <div className="grid grid-cols-8 min-w-[800px]">
                {/* Time labels column */}
                <div className="border-r">
                  {hours.map(hour => (
                    <div 
                      key={hour}
                      className="border-b p-2 text-right bg-muted/10"
                      style={{ height: `${heightPerHour}px` }}
                    >
                      <p className="text-xs text-muted-foreground font-medium">
                        {String(hour).padStart(2, '0')}:00
                      </p>
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {weekDates.map((date, dayIndex) => {
                  const items = getItemsForDay(date)
                  
                  return (
                    <div key={dayIndex} className="border-r last:border-r-0 relative">
                      {/* Hour cells */}
                      {hours.map(hour => (
                        <div
                          key={hour}
                          className="border-b"
                          style={{ height: `${heightPerHour}px` }}
                        />
                      ))}

                      {/* Items positioned absolutely */}
                      {items.map((item, itemIndex) => {
                        const topPosition = (item.startHour - 6) * heightPerHour
                        
                        return (
                          <div
                            key={itemIndex}
                            className="absolute"
                            style={{
                              top: `${topPosition}px`,
                              left: 0,
                              right: 0
                            }}
                          >
                            {item.itemType === 'class' ? (
                              <ClassBlock
                                classData={item}
                                startHour={item.startHour}
                                duration={item.duration}
                                heightPerHour={heightPerHour}
                                onClick={() => handleClassClick(item)}
                              />
                            ) : (
                              <TaskBlock
                                taskData={item}
                                startHour={item.startHour}
                                duration={item.duration}
                                heightPerHour={heightPerHour}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Class Detail Dialog */}
      {selectedClass && (
        <ClassDetailDialog
          open={isClassDetailOpen}
          onOpenChange={setIsClassDetailOpen}
          classData={selectedClass}
          onEdit={handleEditClass}
          onDelete={handleDeleteClass}
        />
      )}
    </>
  )
}
