import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '../ui/card'
import { ClassBlock } from './ClassBlock'
import { TaskBlock } from './TaskBlock'
import { ClassDetailDialog } from '../ClassDetailDialog'
import { APIPATH } from '../../lib/api'

interface ScheduleGridProps {
  weekDates: Date[]
  userId: number | null
  onUpdateClass?: (id: string, updates: any) => void
  onDeleteClass?: (id: string) => void
  onEditClasses?: () => void
}

export function ScheduleGrid({ weekDates, userId, onUpdateClass, onDeleteClass, onEditClasses }: ScheduleGridProps) {
  const [classes, setClasses] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [isClassDetailOpen, setIsClassDetailOpen] = useState(false)
  const [nowLinePosition, setNowLinePosition] = useState(0)
  const [currentTime, setCurrentTime] = useState('')
  const [loading, setLoading] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const heightPerHour = 60

  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number)
    return h + m / 60
  }

  const isToday = (date: Date) => new Date().toDateString() === date.toDateString()

  const getCurrentTimePosition = () => {
    const now = new Date()
    const totalMinutes = now.getHours() * 60 + now.getMinutes()
    return totalMinutes * (heightPerHour / 60)
  }

  const getCurrentTimeString = () => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
  }

  useEffect(() => {
    setNowLinePosition(getCurrentTimePosition())
    setCurrentTime(getCurrentTimeString())
    const interval = setInterval(() => {
      setNowLinePosition(getCurrentTimePosition())
      setCurrentTime(getCurrentTimeString())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch clases y actividades por fecha
  useEffect(() => {
    if (!userId) return

    const fetchWeekData = async () => {
      setLoading(true)
      const fetchedClasses: any[] = []
      const fetchedActivities: any[] = []

      for (const date of weekDates) {
        // Use UTC-safe ISO date (YYYY-MM-DD)
        const dateStr = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
          .toISOString()
          .slice(0, 10)
        try {
          const [classesRes, activitiesRes] = await Promise.all([
            fetch(APIPATH(`/classes/user/${userId}/date/${dateStr}`)),
            fetch(APIPATH(`/activities/user/${userId}/date/${dateStr}`))
          ])
          if (classesRes.ok) {
            const dayClasses = await classesRes.json()
            fetchedClasses.push(...dayClasses)
          }
          if (activitiesRes.ok) {
            const dayActivities = await activitiesRes.json()
            fetchedActivities.push(...dayActivities)
          }
        } catch (err) {
          console.error('Error fetching data:', err)
        }
      }

      setClasses(fetchedClasses)
      setActivities(fetchedActivities)
      setLoading(false)

      // Scroll al día actual
      if (scrollContainerRef.current) {
        const todayIndex = weekDates.findIndex(d => isToday(d))
        if (todayIndex >= 0) {
          const cardWidth = 320 // ajustar según ancho real del día
          scrollContainerRef.current.scrollTo({ left: cardWidth * todayIndex, behavior: 'smooth' })
        }
      }
    }

    fetchWeekData()
  }, [userId, weekDates])

  const getItemsForDay = (date: Date) => {
    const items: any[] = []
    const dayIndex = date.getDay() // domingo=0

    // Clases
    classes.forEach(cls => {
      if (!cls.days) return
      const isActive = cls.days.split(',')[dayIndex] === '1'
      if (!isActive) return
      const startTimeStr = cls.startTimes.split(',')[dayIndex]
      const endTimeStr = cls.endTimes.split(',')[dayIndex]
      if (!startTimeStr || !endTimeStr) return
      const startHour = parseTime(startTimeStr)
      const duration = parseTime(endTimeStr) - startHour

      // Profesor y salón del día actual
      const professors = cls.professor ? cls.professor.split(',') : []
      const rooms = cls.room ? cls.room.split(',') : []
      const professorToday = professors[dayIndex] || ''
      const roomToday = rooms[dayIndex] || ''

      items.push({ 
        ...cls, 
        startHour, 
        duration, 
        itemType: 'class', 
        professor: professorToday, 
        room: roomToday 
      })
    })

    // Actividades
    activities.forEach(act => {
      if (!act.days) return
      const isActive = act.days.split(',')[dayIndex] === '1'
      if (!isActive) return
      const startTimeStr = act.startTimes.split(',')[dayIndex]
      const endTimeStr = act.endTimes.split(',')[dayIndex]
      if (!startTimeStr || !endTimeStr) return
      const startHour = parseTime(startTimeStr)
      const duration = parseTime(endTimeStr) - startHour
      items.push({ ...act, startHour, duration, itemType: 'task' })
    })

    return items
  }

  const handleClassClick = (cls: any) => {
    setSelectedClass(cls)
    setIsClassDetailOpen(true)
  }

  const handleTaskClick = (task: any) => {
    // Reuse the same dialog for simplicity; it will display available fields.
    setSelectedClass(task)
    setIsClassDetailOpen(true)
  }

  const handleEditClass = () => {
    setIsClassDetailOpen(false)
    if (onEditClasses) onEditClasses()
  }

  const handleDeleteClass = () => {
    if (selectedClass && onDeleteClass) onDeleteClass(selectedClass.id)
  }

  return (
    <>
      {loading ? (
        <div className="p-4 text-center text-muted-foreground">Cargando...</div>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="schedule-main-container">
              <div ref={scrollContainerRef} className="schedule-scrollable-area">
                <div className="schedule-sticky-headers">
                  <div className="schedule-header-corner">
                    <p className="text-xs font-semibold text-muted-foreground">Time</p>
                  </div>
                  <div className="schedule-headers-grid flex w-full">
                    {weekDates.map((date, idx) => (
                      <div key={idx} className={`schedule-single-day-header text-center ${isToday(date) ? 'schedule-today-header' : ''}`} style={{ flex:'1 1 0', minWidth:0 }}>
                        <p className="text-sm font-semibold">{dayNames[date.getDay()]}</p>
                        <p className="text-xs mt-1">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="schedule-grid-wrapper">
                  <div className="schedule-time-column">
                    {hours.map(hour => (
                      <div key={hour} className="schedule-time-cell" style={{height:`${heightPerHour}px`}}>
                        <p className="text-xs text-muted-foreground">{String(hour).padStart(2,'0')}:00</p>
                      </div>
                    ))}
                  </div>

                  <div className="schedule-days-container flex w-full">
                    {weekDates.map((date, idx) => {
                      const items = getItemsForDay(date)
                      const isTodayDate = isToday(date)
                      return (
                        <div key={idx} className={`schedule-day-cell relative ${isTodayDate ? 'schedule-today-cell' : ''}`} style={{ flex:'1 1 0', minWidth:0 }}>
                          {hours.map(hour => <div key={hour} className="schedule-hour-grid-line" style={{height:`${heightPerHour}px`}} />)}
                          {items.map((item, idy) => {
                            const topPosition = item.startHour * heightPerHour
                            return (
                              <div key={idy} className="absolute" style={{ top:`${topPosition}px`, left:'4px', right:'4px', zIndex: item.itemType === 'class' ? 15 : 10 }}>
                                {item.itemType === 'class' ?
                                  <ClassBlock
                                    classData={item}
                                    startHour={item.startHour}
                                    duration={item.duration}
                                    heightPerHour={heightPerHour}
                                    onClick={() => handleClassClick(item)}
                                  /> :
                                  <TaskBlock 
                                    taskData={item} 
                                    startHour={item.startHour} 
                                    duration={item.duration} 
                                    heightPerHour={heightPerHour} 
                                    onClick={() => handleTaskClick(item)}
                                  />}
                              </div>
                            )
                          })}
                          {isTodayDate && (
                            <div className="schedule-now-indicator" style={{ top:`${nowLinePosition}px` }}>
                              <div className="schedule-now-label">Ahora — {currentTime}</div>
                              <div className="schedule-now-bar"></div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
