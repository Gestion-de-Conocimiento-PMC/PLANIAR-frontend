import { useState, useEffect, useRef } from 'react'
import { useIsMobile } from '../ui/use-mobile'
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
  onDeleteActivity?: (id: string | number) => void
  onEditClasses?: (classes?: any[], activities?: any[], itemToEdit?: any) => void
  // For local/mock mode (no userId) the parent can pass existing classes/activities
  existingClasses?: any[]
  existingActivities?: any[]
  dataRefreshKey?: number
  // mobile-only: allow parent to request a larger hour height for better visibility
  mobileHeightPerHour?: number
}

export function ScheduleGrid({ weekDates, userId, onUpdateClass, onDeleteClass, onDeleteActivity, onEditClasses, existingClasses, existingActivities, dataRefreshKey, mobileHeightPerHour }: ScheduleGridProps) {
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
  const DAYS_ORDER = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
  // Allow mobile override for height per hour to make blocks larger on mobile
  const heightPerHour = mobileHeightPerHour ?? 60

  const isMobile = useIsMobile()
  const visibleCount = isMobile ? 3 : weekDates.length

  // Refs to sync horizontal scroll between headers and days so the time column can remain outside
  const headersRef = useRef<HTMLDivElement>(null)
  const daysRef = useRef<HTMLDivElement>(null)

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

  // Sync horizontal scrolling between header row and days container so the time column remains fixed
  useEffect(() => {
    const h = headersRef.current
    const d = daysRef.current
    if (!h || !d) return
    const onH = () => { if (d) d.scrollLeft = h.scrollLeft }
    const onD = () => { if (h) h.scrollLeft = d.scrollLeft }
    h.addEventListener('scroll', onH, { passive: true })
    d.addEventListener('scroll', onD, { passive: true })
    return () => {
      h.removeEventListener('scroll', onH)
      d.removeEventListener('scroll', onD)
    }
  }, [weekDates])

  // Fetch clases y actividades por fecha
  useEffect(() => {
    // If running in local/mock mode (no backend userId), use provided existing data.
    if (!userId) {
      if (existingClasses) setClasses(existingClasses)
      if (existingActivities) setActivities(existingActivities)
      setLoading(false)
      // Scroll to today
      if (daysRef.current) {
        const todayIndex = weekDates.findIndex(d => isToday(d))
        if (todayIndex >= 0) {
          // Try to compute day width from DOM so scrolling matches actual widths.
          const firstDay = daysRef.current.querySelector('.schedule-day-cell') as HTMLElement | null
          const dayWidth = firstDay ? firstDay.clientWidth : 320
          const offsetIndex = Math.max(0, todayIndex - Math.floor(visibleCount / 2))
          daysRef.current.scrollTo({ left: dayWidth * offsetIndex, behavior: 'smooth' })
        }
      }
      return
    }

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
      if (daysRef.current) {
        const todayIndex = weekDates.findIndex(d => isToday(d))
        if (todayIndex >= 0) {
          const firstDay = daysRef.current.querySelector('.schedule-day-cell') as HTMLElement | null
          const dayWidth = firstDay ? firstDay.clientWidth : 320
          const offsetIndex = Math.max(0, todayIndex - Math.floor(visibleCount / 2))
          daysRef.current.scrollTo({ left: dayWidth * offsetIndex, behavior: 'smooth' })
        }
      }
    }

    fetchWeekData()
  }, [userId, weekDates])

  // Re-fetch when parent signals data changes (create/update/delete)
  useEffect(() => {
    if (dataRefreshKey === undefined) return
    // Trigger the same fetch logic by calling the async fetchWeekData defined above.
    // We duplicate a small fetch here to avoid hoisting fetchWeekData out of the effect.
    const run = async () => {
      if (!userId) return
      setLoading(true)
      const fetchedClasses: any[] = []
      const fetchedActivities: any[] = []

      for (const date of weekDates) {
        const dateStr = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().slice(0,10)
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
          console.error('Error fetching data on refresh:', err)
        }
      }

      setClasses(fetchedClasses)
      setActivities(fetchedActivities)
      setLoading(false)
    }
    run()
  }, [dataRefreshKey])

  const getItemsForDay = (date: Date) => {
    const items: any[] = []
    const dayIndex = date.getDay() // domingo=0

    // Clases (support multiple shapes: dayTimes object, days array, or bitmask/csv)
    classes.forEach(cls => {
      const dayKey = DAYS_ORDER[dayIndex]

      let isActive = false
      let startTimeStr: string | undefined
      let endTimeStr: string | undefined

      // If class has dayTimes object (preferred)
      if (cls.dayTimes && typeof cls.dayTimes === 'object') {
        const times = cls.dayTimes[dayKey]
        if (times && times.start && times.end) {
          isActive = true
          startTimeStr = times.start
          endTimeStr = times.end
        }
      }

      // If days is an array of day keys like ['monday','wednesday']
      if (!isActive && Array.isArray(cls.days)) {
        const normalized = cls.days.map((d: any) => String(d).toLowerCase())
        if (normalized.includes(dayKey)) {
          isActive = true
          // try to get times from dayTimes if present
          if (cls.dayTimes && cls.dayTimes[dayKey]) {
            startTimeStr = cls.dayTimes[dayKey].start
            endTimeStr = cls.dayTimes[dayKey].end
          }
        }
      }

      // Fallback: days as bitmask or csv of 0/1 and startTimes/endTimes as csv strings
      if (!isActive && cls.days && typeof cls.days === 'string') {
        const s = String(cls.days).trim()
        if (/^[01](?:,?[01])*$/.test(s)) {
          const parts = s.includes(',') ? s.split(',') : s.split('')
          if (parts[dayIndex] === '1') {
            isActive = true
            const starts = String(cls.startTimes || '').split(',')
            const ends = String(cls.endTimes || '').split(',')
            startTimeStr = starts[dayIndex]
            endTimeStr = ends[dayIndex]
          }
        }
      }

      if (!isActive) return
      if (!startTimeStr || !endTimeStr) return
      const startHour = parseTime(startTimeStr)
      const duration = parseTime(endTimeStr) - startHour

      // Profesor y salón del día actual
      const professors = cls.professor ? String(cls.professor).split(',') : []
      const rooms = cls.room ? String(cls.room).split(',') : []
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

    // Actividades (support same shapes)
  activities.forEach(act => {
      const dayKey = DAYS_ORDER[dayIndex]

      let isActive = false
      let startTimeStr: string | undefined
      let endTimeStr: string | undefined

      if (act.dayTimes && typeof act.dayTimes === 'object') {
        const times = act.dayTimes[dayKey]
        if (times && times.start && times.end) {
          isActive = true
          startTimeStr = times.start
          endTimeStr = times.end
        }
      }

      if (!isActive && Array.isArray(act.days)) {
        const normalized = act.days.map((d: any) => String(d).toLowerCase())
        if (normalized.includes(dayKey)) {
          isActive = true
          if (act.dayTimes && act.dayTimes[dayKey]) {
            startTimeStr = act.dayTimes[dayKey].start
            endTimeStr = act.dayTimes[dayKey].end
          }
        }
      }

      if (!isActive && act.days && typeof act.days === 'string') {
        const s = String(act.days).trim()
        if (/^[01](?:,?[01])*$/.test(s)) {
          const parts = s.includes(',') ? s.split(',') : s.split('')
          if (parts[dayIndex] === '1') {
            isActive = true
            const starts = String(act.startTimes || '').split(',')
            const ends = String(act.endTimes || '').split(',')
            startTimeStr = starts[dayIndex]
            endTimeStr = ends[dayIndex]
          }
        }
      }

      if (!isActive) return
      if (!startTimeStr || !endTimeStr) return
      const startHour = parseTime(startTimeStr)
      const duration = parseTime(endTimeStr) - startHour
      // Mark as activity so the renderer can use the same visual component as classes
      items.push({ ...act, startHour, duration, itemType: 'activity' })
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
    if (onEditClasses) onEditClasses(existingClasses, existingActivities, selectedClass)
  }

  const handleDeleteClass = () => {
    if (!selectedClass) return
    // If the selected item is an activity, call onDeleteActivity if provided;
    // otherwise, call onDeleteClass. This ensures we use the correct backend route.
    if (selectedClass.itemType === 'activity') {
      if (onDeleteActivity) onDeleteActivity(selectedClass.id)
    } else {
      if (onDeleteClass) onDeleteClass(selectedClass.id)
    }
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

                  {/* Horizontally scrollable header row (synced with days) */}
                  <div ref={headersRef} className="schedule-headers-grid schedule-headers-scrollable flex w-full">
                    {weekDates.map((date, idx) => {
                      const dayStyle = isMobile ? { flex: `0 0 ${100/visibleCount}%`, minWidth: `${100/visibleCount}%` } : { flex: '1 1 0', minWidth: 0 }
                      return (
                      <div key={idx} className={`schedule-single-day-header text-center ${isToday(date) ? 'schedule-today-header' : ''}`} style={dayStyle}>
                        <p className="text-sm font-semibold">{dayNames[date.getDay()]}</p>
                        <p className="text-xs mt-1">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    )})}
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

                  {/* Days are horizontally scrollable in their own container; the time column stays outside so it remains visible */}
                  <div ref={daysRef} className="schedule-days-scrollable w-full">
                    <div className="schedule-days-container flex">
                      {weekDates.map((date, idx) => {
                        const items = getItemsForDay(date)
                        const isTodayDate = isToday(date)
                        const dayCellStyle = isMobile ? { flex: `0 0 ${100/visibleCount}%`, minWidth: `${100/visibleCount}%` } : { flex: '1 1 0', minWidth: 0 }
                        return (
                          <div key={idx} className={`schedule-day-cell relative ${isTodayDate ? 'schedule-today-cell' : ''}`} style={dayCellStyle}>
                            {hours.map(hour => <div key={hour} className="schedule-hour-grid-line" style={{height:`${heightPerHour}px`}} />)}
                            {items.map((item, idy) => {
                              const topPosition = item.startHour * heightPerHour
                              return (
                                <div key={idy} className="absolute" style={{ top:`${topPosition}px`, left:'4px', right:'4px', zIndex: item.itemType === 'class' ? 15 : 10 }}>
                                  {(item.itemType === 'class' || item.itemType === 'activity') ?
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
