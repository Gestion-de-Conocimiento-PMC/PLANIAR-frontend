import { useState, useRef, useEffect } from 'react'
import { APIPATH } from '../lib/api'
import { ChevronLeft, ChevronRight, Circle, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'

interface TaskItem {
  id: number
  title: string
  classId?: number
  date: string
  priority?: 'High' | 'Medium' | 'Low'
  estimatedTime?: number
  description?: string
  type?: 'Homework' | 'Activity'
  state?: 'Pending' | 'In Progress' | 'Completed'
  subject?: string
}

interface ActivityItem {
  id: number
  title: string
  days: string
  startTimes: string
  endTimes: string
  startDate?: string
  endDate?: string
  description?: string
  color?: string
}

interface WeeklyViewProps {
  userId: number | undefined
}

export function WeeklyView({ userId }: WeeklyViewProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [currentWeek, setCurrentWeek] = useState(0)
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const getWeekDates = (weekOffset = 0) => {
    const today = new Date()
    const currentDayOfWeek = today.getDay()
    const monday = new Date(today)
    const daysFromMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek
    monday.setDate(today.getDate() + daysFromMonday + weekOffset * 7)

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      return date
    })
  }

  const weekDates = getWeekDates(currentWeek)
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const isToday = (date: Date) => date.toDateString() === new Date().toDateString()

  // Fetch tasks and activities
  useEffect(() => {
    if (!userId) return

    const fetchData = async () => {
      setLoading(true)
      const fetchedTasks: TaskItem[] = []
      const fetchedActivities: ActivityItem[] = []

      for (const date of weekDates) {
        const dateStr = date.toISOString().split('T')[0]

        try {
          const res = await fetch(APIPATH(`/tasks/user/${userId}/date/${dateStr}`))
          if (res.ok) {
            const dayTasks: TaskItem[] = await res.json()
            fetchedTasks.push(...dayTasks)
          }
        } catch (err) {
          console.error('Error fetching tasks:', err)
        }

        try {
          const res = await fetch(APIPATH(`/activities/user/${userId}/date/${dateStr}`))
          if (res.ok) {
            const dayActivities: ActivityItem[] = await res.json()
            fetchedActivities.push(...dayActivities)
          }
        } catch (err) {
          console.error('Error fetching activities:', err)
        }
      }

      setTasks(fetchedTasks)
      setActivities(fetchedActivities)
      setLoading(false)
    }

    fetchData()
  }, [userId, currentWeek])

  // Scroll automatically to today's day
  useEffect(() => {
    if (!scrollRef.current) return

    const todayIndex = weekDates.findIndex(d => isToday(d))
    if (todayIndex === -1) return

    const cardWidth = 320 // Ancho aproximado de cada Card
    scrollRef.current.scrollTo({
      left: cardWidth * todayIndex,
      behavior: 'smooth'
    })
  }, [tasks, activities, currentWeek])

  const getTasksForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return tasks.filter(t => t.date.startsWith(dateStr))
  }

  const getActivitiesForDay = (date: Date) => {
    const dayIndex = date.getDay()
    const activitiesForDay: ActivityItem[] = []
    const seenIds = new Set<number>()

    for (const a of activities) {
      if (seenIds.has(a.id)) continue
      const daysArr = a.days.split(',').map(Number)
      const withinRange =
        (!a.startDate || new Date(a.startDate) <= date) &&
        (!a.endDate || new Date(a.endDate) >= date)

      if (daysArr[dayIndex] === 1 && withinRange) {
        activitiesForDay.push(a)
        seenIds.add(a.id)
      }
    }

    return activitiesForDay
  }

  const getPriorityBadge = (priority: string) =>
    ({
      High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Medium: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      Low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    }[priority] || 'bg-muted text-muted-foreground')

  const stats = {
    completed: tasks.filter(t => t.state === 'Completed').length,
    pending: tasks.filter(t => t.state !== 'Completed').length,
    totalHours: tasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0) / 60,
    total: tasks.length
  }

  const getClassesCountForDay = (date: Date) => 0

  return (
    <>
      {/* Header */}
      <div className="space-y-2">
        <h1 style={{ fontSize: '30px', fontWeight: 600 }} className="text-[#2B2B2B] dark:text-white animate-header-title">
          Weekly Planner
        </h1>
        <p className="text-muted-foreground animate-header-subtitle">
          Plan and organize your weekly activities, tasks, and goals with ease.
        </p>
        <p className="text-sm text-[#1E90FF] mt-2 animate-ai-note" style={{ fontStyle: 'italic' }}>
          These hours are suggested by AI.
        </p>
      </div>

      {/* Weekly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-semibold mt-1">{stats.completed}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-semibold mt-1">{stats.pending}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-2xl font-semibold mt-1">{stats.totalHours.toFixed(1)}h</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-semibold mt-1">{stats.total}</p>
            </div>
            <Circle className="w-8 h-8 text-purple-500" />
          </CardContent>
        </Card>
      </div>

      {/* Week Navigation */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setCurrentWeek(currentWeek - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-center min-w-[200px]">
              <p className="font-medium">{formatDate(weekDates[0])} - {formatDate(weekDates[6])}</p>
            </div>
            <Button variant="outline" size="icon" onClick={() => setCurrentWeek(currentWeek + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={() => setCurrentWeek(0)}
            className="gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white border-0 w-full lg:w-auto"
          >
            <Circle className="w-4 h-4" />
            <span>Today</span>
          </Button>
        </div>

        {/* Daily Widgets */}
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory weekly-scroll -mx-2 px-2">
          {loading ? (
            <div className="flex justify-center items-center w-full h-[400px]">
              <p className="text-muted-foreground text-lg animate-pulse">Loading week...</p>
            </div>
          ) : (
            weekDates.map((date, index) => {
              const dayActivities = getActivitiesForDay(date)
              const dayTasks = getTasksForDay(date)
              const isTodayDate = isToday(date)
              const classesCount = getClassesCountForDay(date)
              const itemsExist = dayActivities.length > 0 || dayTasks.length > 0

              return (
                <Card
                  key={index}
                  className={`flex-shrink-0 w-80 snap-center transition-all ${isTodayDate ? 'today-widget-highlight' : ''}`}
                  style={isTodayDate ? {
                    backgroundColor: '#EDE7FF',
                    borderColor: '#7B61FF',
                    borderWidth: 1,
                    boxShadow: '0 0 6px rgba(123,97,255,0.3)'
                  } : {}}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{dayNames[index]}</p>
                        <p className={`font-medium ${isTodayDate ? 'text-[#7B61FF]' : ''}`}>
                          {formatDate(date)}
                        </p>
                      </div>
                      {isTodayDate && <Badge className="bg-[#7B61FF] text-white">Hoy</Badge>}
                    </div>

                    <ScrollArea className="h-[400px] pr-2">
                      {!itemsExist ? (
                        <div className="flex flex-col items-center justify-center h-[200px] text-center">
                          <Circle className="w-12 h-12 text-muted-foreground mb-2 opacity-30" />
                          <p className="text-sm text-muted-foreground">No tasks</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {dayActivities.map((item, idx) => (
                            <div
                              key={`activity-${idx}`}
                              className="p-3 rounded-lg border bg-background hover:shadow-sm transition-all"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-sm">{item.title}</p>
                                <Badge className="text-xs bg-[#1E90FF]/10 text-[#1E90FF]">
                                  {item.startTimes.split(',')[date.getDay()] || 'TBD'}
                                </Badge>
                              </div>
                              {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                            </div>
                          ))}
                          {dayTasks.map((item, idx) => (
                            <div
                              key={`task-${idx}`}
                              className={`p-3 rounded-lg border transition-all ${
                                item.state === 'Completed' ? 'opacity-60 bg-muted/50' : 'bg-background hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-1">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className={`font-medium text-sm ${item.state === 'Completed' ? 'line-through' : ''}`}>
                                      {item.title}
                                    </p>
                                  </div>
                                  {item.subject && <p className="text-xs text-muted-foreground mt-1">{item.subject}</p>}
                                </div>
                                {item.priority && <Badge className={`text-xs ${getPriorityBadge(item.priority)}`}>{item.priority}</Badge>}
                              </div>
                              {item.estimatedTime && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                  <Circle className="w-3 h-3" />
                                  {item.estimatedTime}min
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>

                    {(itemsExist || classesCount > 0) && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground text-center">
                          {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                          {classesCount > 0 && `, ${classesCount} ${classesCount === 1 ? 'class' : 'classes'}`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </Card>
    </>
  )
}