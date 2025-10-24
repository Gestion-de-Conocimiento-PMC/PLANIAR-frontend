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
}

export function Dashboard({ userId, userName, onAddTask }: DashboardProps) {
  const [tasks, setTasks] = useState<TaskActivity[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTasksForWeek = async () => {
    if (!userId) return
    setLoading(true)

    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay()) // Sunday
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      return d
    })

    const allTasks: TaskActivity[] = []

    for (const date of weekDates) {
      try {
        const dateStr = date.toISOString().split('T')[0]
        const res = await fetch(APIPATH(`/api/tasks/user/${userId}/date/${dateStr}`))
        if (res.ok) {
          const dayTasks = await res.json()
          allTasks.push(...dayTasks)
        }
      } catch (err) {
        console.error('Error fetching tasks:', err)
      }
    }

    setTasks(allTasks)
    setLoading(false)
  }

  useEffect(() => {
    fetchTasksForWeek()
  }, [userId])

  // Analytics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed')
  const thisWeekTasks = tasks.filter(t => {
    const due = new Date(t.dueDate)
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    return due >= weekStart && due <= weekEnd
  })
  const averageTaskTime = totalTasks > 0
    ? tasks.reduce((sum, t) => sum + t.estimatedTime, 0) / totalTasks
    : 0

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const overdueTasks = tasks.filter(t => {
    const todayStr = new Date().toISOString().split('T')[0]
    return t.status !== 'completed' && t.dueDate < todayStr
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

      {!loading && tasks.length === 0 && (
        <EmptyState onAddTask={onAddTask} userName={userName} />
      )}

      {!loading && tasks.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Average Task Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-600">{formatTime(Math.round(averageTaskTime))}</span>
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-xs text-muted-foreground">Optimal range: 30-90 minutes</p>
              </CardContent>
            </Card>

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
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-orange-600">{tasks.filter(t => t.status === 'pending').length}</div>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.status === 'in-progress').length}</div>
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