import { useState, useEffect } from 'react'
import { APIPATH } from '../lib/api'
import { Clock, Calendar, Target, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { EmptyState } from './EmptyState'
import { TaskActivity } from '../types'

interface DashboardProps {
  userId: number | undefined
  userName: string
  onAddTask: () => void
  initialTasks?: TaskActivity[]
  // optional refresh key from parent app to re-fetch when tasks change
  dataRefreshKey?: number
}

export function Dashboard({ userId, userName, onAddTask, initialTasks, dataRefreshKey }: DashboardProps) {
  const [tasks, setTasks] = useState<TaskActivity[]>([])
  const [lifetimeTasks, setLifetimeTasks] = useState<TaskActivity[]>([])
  const [loading, setLoading] = useState(false)

  const normalize = (t: any): TaskActivity => {
    const rawStatus = String((t as any).status || (t as any).state || '').toLowerCase()
    let status = rawStatus
    if (status === 'in progress' || status === 'inprogress') status = 'in-progress'
    if (status === 'completed' || status === 'done') status = 'completed'
    if (!status) status = ''

    const rawPriority = String((t as any).priority || '').toLowerCase()
    let priority: any = rawPriority
    if (priority === 'high' || priority === 'alta') priority = 'high'
    if (priority === 'medium' || priority === 'normal' || priority === 'media') priority = 'medium'
    if (priority === 'low' || priority === 'baja') priority = 'low'
    if (!priority) priority = 'low'

    return {
      id: t.id,
      title: t.title || t.name || '',
      type: t.type || 'task',
      subject: t.subject || '',
      dueDate: (t as any).dueDate || (t as any).date || '',
      priority,
      estimatedTime: Number((t as any).estimatedTime) || 0,
      status,
      description: t.description || '',
      suggestedStartTime: (t as any).suggestedStartTime || ''
    }
  }

  const fetchTasksForWeek = async () => {
    if (!userId) {
      // If no backend id is available (local mock data), fall back to provided initial tasks
      if (initialTasks) {
        // Normalize numeric fields to avoid NaN when reducing
        const normalized = initialTasks.map(t => normalize(t))
        setTasks(normalized)
      }
      return
    }
    setLoading(true)

  const today = new Date()
  const weekStart = new Date(today)
  // Start week on Monday. JS getDay(): 0=Sun..6=Sat. Compute offset to previous Monday.
  const day = today.getDay()
  const mondayOffset = (day + 6) % 7 // 0->6,1->0,2->1,...
  weekStart.setDate(today.getDate() - mondayOffset)
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      return d
    })

    // Fetch all user tasks once and filter client-side by week range. Some backends
    // don't implement per-day endpoints (avoid 404). This also reduces many requests.
    let normalized: TaskActivity[] = []
    try {
      const res = await fetch(APIPATH(`/tasks/user/${userId}`))
      if (res.ok) {
        const allData = await res.json()
        // helper to normalize date-like values (string ISO or {year,month,day})
        const parseDateVal = (v: any) => {
          if (!v) return null
          if (typeof v === 'string') return v.split('T')[0]
          if (typeof v === 'object' && v.year && v.month && v.day) return `${v.year}-${String(v.month).padStart(2,'0')}-${String(v.day).padStart(2,'0')}`
          return String(v).split('T')[0]
        }

        const weekDateStrs = weekDates.map(d => d.toISOString().split('T')[0])
        const filtered = (allData || []).filter((t: any) => {
          const raw = (t as any).workingDate ?? (t as any).date ?? (t as any).dueDate
          const parsed = parseDateVal(raw)
          return parsed && weekDateStrs.includes(parsed)
        })

        const normalized = filtered.map((t: any) => normalize(t))
        setTasks(normalized)

        // lifetime tasks (all data)
        const normalizedAll = (allData || []).map((t: any) => normalize(t))
        setLifetimeTasks(normalizedAll)
      } else {
        setTasks([])
        setLifetimeTasks([])
      }
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setTasks([])
      setLifetimeTasks([])
    }
    // Try to fetch lifetime / all tasks for better lifetime metrics. If the
    // endpoint doesn't exist or fails, fall back to the week-limited list.
    try {
      const allRes = await fetch(APIPATH(`/tasks/user/${userId}`))
      if (allRes.ok) {
        const allData = await allRes.json()
        const normalizedAll = (allData || []).map((t: any) => normalize(t))
        setLifetimeTasks(normalizedAll)
      } else {
        // fallback
        setLifetimeTasks(normalized)
      }
    } catch (e) {
      setLifetimeTasks(normalized)
    }
    setLoading(false)
  }

  // Re-run when userId OR provided initialTasks change or when parent
  // signals a refresh (dataRefreshKey). This ensures the dashboard updates
  // when tasks are created/updated/deleted in the app.
  useEffect(() => {
    fetchTasksForWeek()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, initialTasks, dataRefreshKey])

  // Analytics
  const totalTasks = tasks.length
  // Normalize status/priority values for robust counting (API may return 'High'/'high' or 'Pending'/'pending')
  const normStatus = (t: TaskActivity) => String((t as any).status || '').toLowerCase()
  const normPriority = (t: TaskActivity) => String((t as any).priority || '').toLowerCase()

  const completedTasks = tasks.filter(t => normStatus(t) === 'completed').length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  const highPriorityTasks = tasks.filter(t => normPriority(t) === 'high' && normStatus(t) !== 'completed')

  // Lifetime metrics (from lifetimeTasks state)
  const totalLifetime = lifetimeTasks.length
  // Use normalized status for robust matching (API may return 'Completed' / 'completed' / 'COMPLETED')
  const completedLifetime = lifetimeTasks.filter(t => String((t as any).status || '').toLowerCase() === 'completed').length
  const lifetimeCompletionRate = totalLifetime > 0 ? (completedLifetime / totalLifetime) * 100 : 0
  const totalLifetimeEstimatedMinutes = lifetimeTasks.reduce((sum, t) => sum + (Number((t as any).estimatedTime) || 0), 0)

  // Helpers for date handling in local timezone (avoid TZ-shifts when parsing ISO strings)
  const parseYMD = (d?: string | undefined) => {
    if (!d) return null
    const parts = String(d).split('-').map(Number)
    if (parts.length < 3) return null
    return new Date(parts[0], parts[1] - 1, parts[2])
  }

  const getWeekRange = (ref = new Date()) => {
    const weekStart = new Date(ref)
    const day = ref.getDay()
    const mondayOffset = (day + 6) % 7
    weekStart.setDate(ref.getDate() - mondayOffset) // Monday
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    return { weekStart, weekEnd }
  }

  const { weekStart, weekEnd } = getWeekRange()

  const thisWeekTasks = tasks.filter(t => {
    const due = parseYMD((t as any).dueDate)
    if (!due) return false
    return due >= weekStart && due <= weekEnd
  })

  const averageTaskTime = totalTasks > 0
    ? tasks.reduce((sum, t) => sum + (Number((t as any).estimatedTime) || 0), 0) / totalTasks
    : 0

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const overdueTasks = tasks.filter(t => {
    if (normStatus(t) === 'completed') return false
    const due = parseYMD((t as any).dueDate)
    if (!due) return false
    return due < todayStart
  })

  const getProductivityRecommendations = () => {
    const recs = []
    if (completionRate < 80) recs.push({
      title: 'Time Management',
      tip: 'Use the 2-minute rule: if a task takes less than 2 minutes, do it immediately.',
      impact: 'High'
    })
    recs.push({
      title: 'Energy Management',
      tip: 'Schedule demanding tasks during your peak energy hours.',
      impact: 'High'
    })
    recs.push({
      title: 'Batch Similar Tasks',
      tip: 'Group similar tasks together.',
      impact: 'Medium'
    })
    if (overdueTasks.length > 0) recs.push({
      title: 'Deadline Buffer',
      tip: 'Set personal deadlines 1-2 days before the actual due date.',
      impact: 'High'
    })
    return recs
  }

  const recommendations = getProductivityRecommendations()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Summary of your progress and weekly productivity.</p>
      </div>

      {loading && <div className="p-4 text-center text-muted-foreground">Loading tasks...</div>}

      {/* Consider the week tasks and lifetime tasks when deciding empty state */}
      {!loading && thisWeekTasks.length === 0 && lifetimeTasks.length === 0 && (
        <EmptyState onAddTask={onAddTask} userName={userName} />
      )}

      {!loading && (thisWeekTasks.length > 0 || lifetimeTasks.length > 0) && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Lifetime summary card */}
            <Card>
              <CardHeader>
                <CardTitle>Lifetime Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold">{totalLifetime}</div>
                      <div className="text-xs text-muted-foreground">Total tasks</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{completedLifetime}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Total time: {formatTime(totalLifetimeEstimatedMinutes)}</div>
                  <div className="text-sm text-muted-foreground">Lifetime completion: {Math.round(lifetimeCompletionRate)}%</div>
                </div>
              </CardContent>
            </Card>
            {/* removed Average Task Duration card per UX request */}

            <Card>
              <CardHeader>
                <CardTitle>This Week's Load</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-600">{thisWeekTasks.length}</span>
                  <Calendar className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatTime(thisWeekTasks.reduce((sum, t) => sum + t.estimatedTime, 0))} total time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Priority Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-red-600">{highPriorityTasks.length}</span>
                  <Target className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-xs text-muted-foreground">High priority tasks pending</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{completedTasks}</div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
                  <p className="text-xs text-muted-foreground">Progress</p>
                </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-orange-600">{tasks.filter(t => normStatus(t) === 'pending').length}</div>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-blue-600">{tasks.filter(t => normStatus(t) === 'in-progress').length}</div>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>
          </div>

          {/* Productivity Recommendations */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" /> Productivity Recommendations
              </CardTitle>
              <CardDescription>Personalized tips to boost your efficiency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.map((rec, i) => (
                <div key={i} className="p-4 rounded-lg border hover:border-purple-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{rec.title}</h4>
                    <Badge variant={rec.impact === 'High' ? 'default' : 'secondary'}>
                      {rec.impact} Impact
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.tip}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}