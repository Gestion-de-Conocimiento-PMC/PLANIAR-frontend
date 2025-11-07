import { useState, useRef, useEffect } from 'react'
import { APIPATH } from '../lib/api'
import { ChevronLeft, ChevronRight, Circle, Clock, CheckCircle2, AlertCircle, Loader2, Check } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'

interface TaskItem {
  id: number
  title: string
  classId?: number
  date?: string
  dueDate?: string
  workingDate?: string
  startTime?: string
  endTime?: string
  priority?: 'High' | 'Medium' | 'Low'
  estimatedTime?: number
  description?: string
  type?: 'Project' | 'Homework' | 'Exam' | 'Activity'
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
  // Refresh counter state for "Refresh my plan" (persisted per user and reset monthly)
  const maxRefreshCount = 3
  const storageMetaKey = `planiar:refreshCountMeta:${userId ?? 'anon'}`
  const getCurrentMonth = () => new Date().toISOString().slice(0, 7) // YYYY-MM

  // Try to read a role for the current user from localStorage (if set). Default to 'user'.
  const [userRole] = useState<string>(() => {
    try {
      return localStorage.getItem('planiar:userRole') || 'user'
    } catch {
      return 'user'
    }
  })

  const [refreshCount, setRefreshCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(storageMetaKey)
      if (!raw) return maxRefreshCount
      const meta = JSON.parse(raw)
      if (!meta || typeof meta !== 'object') return maxRefreshCount
      if (meta.month !== getCurrentMonth()) return maxRefreshCount
      const n = parseInt(String(meta.count), 10)
      return Number.isFinite(n) ? Math.max(0, Math.min(maxRefreshCount, n)) : maxRefreshCount
    } catch {
      return maxRefreshCount
    }
  })

  // Persist refresh metadata (count + month)
  useEffect(() => {
    try {
      const meta = { count: refreshCount, month: getCurrentMonth() }
      localStorage.setItem(storageMetaKey, JSON.stringify(meta))
    } catch {
      // ignore storage errors
    }
  }, [refreshCount, storageMetaKey])

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
  const fetchData = async () => {
    if (!userId) return
    setLoading(true)
    try {
      // Fetch all tasks for the user and filter client-side by workingDate or due date
      const tRes = await fetch(APIPATH(`/tasks/user/${userId}`))
      if (tRes.ok) {
        const allTasks: TaskItem[] = await tRes.json()
        setTasks(allTasks)
      } else {
        setTasks([])
      }
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setTasks([])
    }

    try {
      const aRes = await fetch(APIPATH(`/activities/user/${userId}`))
      if (aRes.ok) {
        const allActivities: ActivityItem[] = await aRes.json()
        setActivities(allActivities)
      } else {
        setActivities([])
      }
    } catch (err) {
      console.error('Error fetching activities:', err)
      setActivities([])
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [userId, currentWeek])

  // refreshing controls button spinner state
  const [refreshing, setRefreshing] = useState(false)
  const [refreshSuccess, setRefreshSuccess] = useState(false)
  const successTimerRef = useRef<number | null>(null)

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
    // Build a local YYYY-MM-DD string to avoid timezone shifts caused by toISOString()
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`
    const parseDateVal = (v: any) => {
      if (!v) return null
      if (typeof v === 'string') return v.split('T')[0]
      if (typeof v === 'object' && v.year && v.month && v.day) {
        return `${v.year}-${String(v.month).padStart(2,'0')}-${String(v.day).padStart(2,'0')}`
      }
      return String(v).split('T')[0]
    }

    return tasks.filter(t => {
      // Support multiple possible field names returned by different backends
      const raw = (t as any).workingDate ?? (t as any).working_date ?? (t as any).date ?? (t as any).dueDate ?? (t as any).due_date ?? null
      const wd = parseDateVal(raw)
      if (!wd) return false
      return wd === dateStr
    })
  }

  const parseDateVal = (v: any) => {
    if (!v) return ''
    if (typeof v === 'string') return v.split('T')[0]
    if (typeof v === 'object' && v.year && v.month && v.day) return `${v.year}-${String(v.month).padStart(2,'0')}-${String(v.day).padStart(2,'0')}`
    return String(v)
  }

  // Create a local-date formatted string safely from a YYYY-MM-DD or other ISO-ish input
  const toLocalDateString = (isoLike: string | null | undefined) => {
    if (!isoLike) return ''
    const s = String(isoLike)
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (m) {
      const y = Number(m[1])
      const mo = Number(m[2]) - 1
      const d = Number(m[3])
      return new Date(y, mo, d).toLocaleDateString()
    }
    const parsed = new Date(s)
    if (!isNaN(parsed.getTime())) return parsed.toLocaleDateString()
    return s
  }

  const parseTimeVal = (v: any) => {
    if (!v) return ''
    if (typeof v === 'string') {
      // If value is an ISO datetime, extract time after 'T'
      if (v.includes('T')) {
        const timePart = v.split('T')[1]
        if (timePart) {
          const hhmm = timePart.split(':')
          return hhmm.length >= 2 ? `${hhmm[0].padStart(2,'0')}:${hhmm[1].padStart(2,'0')}` : v
        }
      }
      const parts = v.split(':')
      return parts.length >= 2 ? `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}` : v
    }
    if (typeof v === 'object' && v.hour !== undefined) {
      return `${String(v.hour).padStart(2,'0')}:${String(v.minute ?? v.min ?? 0).padStart(2,'0')}`
    }
    return String(v)
  }

  const formatTimeShort = (t?: string) => {
    if (!t) return ''
    // strip seconds if present and keep only HH:MM
    const parts = String(t).split(':')
    if (parts.length >= 2) return `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}`
    return t
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

  // whether the refresh action is available (admins always have it)
  const isRefreshAvailable = userRole !== 'user' || refreshCount > 0

  // Try to read user availability from local cache or backend; return null if none found
  const getAvailableHours = async (): Promise<Record<string, string[]> | null> => {
    if (!userId) return null

    // Prefer local cached user object if present (less chatty)
    try {
      const raw = localStorage.getItem('planiar_user')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.availableHours && typeof parsed.availableHours === 'object') return parsed.availableHours
      }
    } catch (e) {
      // ignore parse errors and proceed to network
    }

    // Try the canonical user endpoint first, then fallbacks
    const candidates = [
      APIPATH(`/users/${userId}`),
      APIPATH(`/users/${userId}/availability`),
      APIPATH(`/users/${userId}/preferences`),
      APIPATH(`/users/${userId}/settings`)
    ]

    for (const url of candidates) {
      try {
        const r = await fetch(url)
        if (!r.ok) continue
        const body = await r.json()
        if (!body) continue
        // Common shapes: { availableHours: { MON: [...] } } or direct map { MON: [...] }
        if (body.availableHours && typeof body.availableHours === 'object') return body.availableHours
        if (body.available_hours && typeof body.available_hours === 'object') return body.available_hours
        if (typeof body === 'object') {
          const keys = Object.keys(body)
          const dayKeys = ['MON','TUE','WED','THU','FRI','SAT','SUN']
          if (keys.some(k => dayKeys.includes(k.toUpperCase()))) {
            // Normalize keys to upper-case day codes
            const normalized: Record<string, string[]> = {}
            for (const kk of keys) {
              const upper = kk.toUpperCase()
              if (dayKeys.includes(upper) && Array.isArray((body as any)[kk])) normalized[upper] = (body as any)[kk]
            }
            if (Object.keys(normalized).length > 0) return normalized
          }
        }
      } catch (e) {
        // ignore and try next
      }
    }
    return null
  }

  // Handler to call backend AI planning and apply returned schedule
  const handleRefreshPlan = async () => {
    if (!userId) {
      window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: 'User not signed in' } }))
      return
    }

    if (userRole === 'user' && refreshCount <= 0) {
      window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: 'No refreshes left for this month' } }))
      return
    }

    try {
      setLoading(true)
      setRefreshing(true)

      // Build a payload matching backend DTO: { userId, tasks, availableHours }
      const payloadTasks = tasks.map(t => ({
        id: t.id,
        title: t.title,
        classId: t.classId ?? null,
        dueDate: t.dueDate ?? t.date ?? null,
        dueTime: (t as any).dueTime ?? null,
        priority: t.priority ?? null,
        estimatedTime: t.estimatedTime ?? null,
        description: t.description ?? null,
        type: t.type ?? null,
        state: t.state ?? null
      }))

      // Try to read real availability from backend; fall back to reasonable defaults
      let availableHours = await getAvailableHours()
      if (!availableHours) {
        availableHours = {
          MON: ['08:00-20:00'],
          TUE: ['08:00-20:00'],
          WED: ['08:00-20:00'],
          THU: ['08:00-20:00'],
          FRI: ['08:00-20:00'],
          SAT: [],
          SUN: []
        }
      }

      const resp = await fetch(APIPATH('/ai/refresh-plan'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tasks: payloadTasks, availableHours })
      })

      if (!resp.ok) throw new Error('AI planning failed')

      const planned: any[] = await resp.json()

      // Update local tasks with returned planning. The backend returns Task objects; map them into our TaskItem shape.
      const mappedPlanned: TaskItem[] = planned.map(p => ({
        id: p.id,
        title: p.title,
        classId: p.classId ?? p.class_id ?? undefined,
        date: p.date ?? p.dueDate ?? p.due_date ?? undefined,
        workingDate: p.workingDate ?? p.working_date ?? null,
        startTime: p.startTime ?? p.start_time ?? null,
        endTime: p.endTime ?? p.end_time ?? null,
        priority: p.priority ?? undefined,
        estimatedTime: p.estimatedTime ?? p.estimated_time ?? undefined,
        description: p.description ?? undefined,
        type: p.type ?? undefined,
        state: p.state ?? p.status ?? undefined,
        subject: p.subject ?? undefined
      }))

      // Prefer backend as source of truth: reload tasks after planning
      await fetchData()
      // Consume one refresh for regular users
      if (userRole === 'user') setRefreshCount(c => Math.max(0, c - 1))
      // show transient success UI (checkmark) instead of loader
      setRefreshing(false)
      setRefreshSuccess(true)
      // clear any existing timer
      if (successTimerRef.current) window.clearTimeout(successTimerRef.current)
      successTimerRef.current = window.setTimeout(() => {
        setRefreshSuccess(false)
        successTimerRef.current = null
      }, 2000)
      window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: 'Plan refreshed' } }))
    } catch (err) {
      console.error('Error refreshing plan:', err)
      window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: 'Error refreshing plan' } }))
    } finally {
      setLoading(false)
      // if not already cleared by success branch
      if (!refreshSuccess) setRefreshing(false)
    }
  }

  // cleanup success timer on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) window.clearTimeout(successTimerRef.current)
    }
  }, [])

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
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <div className="flex flex-col lg:flex-row items-center gap-3 w-full lg:w-auto">
            <Button
              onClick={() => setCurrentWeek(0)}
              className="gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white border-0 w-full lg:w-auto"
            >
              <Circle className="w-4 h-4" />
              <span>Today</span>
            </Button>

            {/* Refresh my plan button with dynamic counter (persisted monthly). Admins have unlimited refreshes. */}
            <Button
              size="sm"
              className={`gap-2 ${isRefreshAvailable ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white border-0 w-full lg:w-auto' : 'border-[#7B61FF] text-[#7B61FF] bg-white w-full lg:w-auto'}`}
              onClick={handleRefreshPlan}
              disabled={!isRefreshAvailable || refreshing || refreshSuccess}
            >
              {refreshing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> <span>Refreshing...</span></>
              ) : refreshSuccess ? (
                <><Check className="w-4 h-4 text-green-200" /> <span>Refreshed</span></>
              ) : (
                <span>Refresh my plan</span>
              )}
              <Badge className="ml-2">{userRole === 'user' ? `${refreshCount}/${maxRefreshCount}` : '∞'}</Badge>
            </Button>
          </div>
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
                      {isTodayDate && <Badge className="bg-[#7B61FF] text-white">Today</Badge>}
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
                              className="p-3 rounded-lg border hover:shadow-sm transition-all"
                              style={{
                                backgroundColor: item.color ? `${item.color}15` : undefined,
                                borderColor: item.color || '#7B61FF',
                                borderWidth: 1
                              }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-sm" style={{ color: item.color || '#7B61FF' }}>{item.title}</p>
                                <Badge className="text-xs" style={{ backgroundColor: (item.color || '#1E90FF') + '10', color: item.color || '#1E90FF' }}>
                                  {String(item.startTimes || '').split(',')[date.getDay()] || 'TBD'}
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
                                  {/* Show due date and work hours */}
                                  <div className="mt-1">
                                    {/* Show due date and due time on the same line */}
                                    {(((item as any).date) || ((item as any).dueDate)) && (
                                      <div className="text-xs text-muted-foreground">
                                        Due: {toLocalDateString(parseDateVal((item as any).dueDate || (item as any).date))} 
                                        {((item as any).dueTime || (item as any).due_time) && (
                                          <span className="ml-2"> • {parseTimeVal((item as any).dueTime ?? (item as any).due_time)}</span>
                                        )}
                                      </div>
                                    )}

                                    {/* Start/End work times (show below the due line) */}
                                    {((item as any).startTime || (item as any).start_time) && ((item as any).endTime || (item as any).end_time) && (
                                      <div className="text-xs font-medium mt-1" style={{ color: '#1E90FF' }}>
                                        {parseTimeVal((item as any).startTime ?? (item as any).start_time)} - {parseTimeVal((item as any).endTime ?? (item as any).end_time)}
                                      </div>
                                    )}
                                  </div>
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