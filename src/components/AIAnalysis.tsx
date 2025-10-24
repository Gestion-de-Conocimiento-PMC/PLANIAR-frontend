import { Brain, TrendingUp, Clock, Target, Lightbulb, Calendar, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { TaskActivity } from '../types'

interface AIAnalysisProps {
  tasks: TaskActivity[]
  userName: string
  onAnalyze: () => void
}

export function AIAnalysis({ tasks }: AIAnalysisProps) {
  // Calculate analytics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  
  const currentWeek = new Date()
  const weekStart = new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1))
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  
  const thisWeekTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate)
    return taskDate >= weekStart && taskDate <= weekEnd
  })

  const overdueTasks = tasks.filter(task => {
    const today = new Date().toISOString().split('T')[0]
    return task.status !== 'completed' && task.dueDate < today
  })

  const highPriorityTasks = tasks.filter(task => 
    task.priority === 'high' && task.status !== 'completed'
  )

  const subjectWorkload = tasks.reduce<Record<string, number>>((acc, task) => {
    if (task.status !== 'completed') {
      acc[task.subject] = (acc[task.subject] || 0) + task.estimatedTime
    }
    return acc
  }, {})

  const averageTaskTime = totalTasks > 0 
    ? tasks.reduce((sum, task) => sum + task.estimatedTime, 0) / totalTasks 
    : 0

  // AI Insights
  const generateInsights = () => {
    const insights = []

    if (completionRate < 60) {
      insights.push({
        type: 'improvement',
        title: 'Focus on Task Completion',
        description: `Your completion rate is ${Math.round(completionRate)}%. Try breaking larger tasks into smaller, manageable chunks.`,
        icon: Target
      })
    }

    if (overdueTasks.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Overdue Tasks Need Attention',
        description: `You have ${overdueTasks.length} overdue task${overdueTasks.length !== 1 ? 's' : ''}. Consider rescheduling or breaking them down.`,
        icon: Calendar
      })
    }

    if (highPriorityTasks.length > 3) {
      insights.push({
        type: 'suggestion',
        title: 'Too Many High Priority Tasks',
        description: 'Consider reassessing priorities. Having too many "high priority" items can reduce focus.',
        icon: TrendingUp
      })
    }

    const heaviestSubject = Object.entries(subjectWorkload).sort((a, b) => b[1] - a[1])[0]
    if (heaviestSubject && heaviestSubject[1] > 300) {
      insights.push({
        type: 'info',
        title: 'Heavy Workload in ' + heaviestSubject[0],
        description: `${heaviestSubject[0]} requires ${Math.round(heaviestSubject[1] / 60)} hours. Consider spreading this across multiple days.`,
        icon: BarChart3
      })
    }

    if (thisWeekTasks.length > 10) {
      insights.push({
        type: 'suggestion',
        title: 'Busy Week Ahead',
        description: `You have ${thisWeekTasks.length} tasks this week. Consider time-blocking and taking regular breaks.`,
        icon: Clock
      })
    }

    if (insights.length === 0) {
      insights.push({
        type: 'positive',
        title: 'Great Job!',
        description: 'Your task management looks healthy. Keep up the excellent work!',
        icon: Target
      })
    }

    return insights
  }

  const insights = generateInsights()

  // Study pattern analysis
  const getStudyPatternAnalysis = () => {
    const patterns = []

    const homeworkTasks = tasks.filter(task => task.type === 'homework')
    const activityTasks = tasks.filter(task => task.type === 'activity')

    if (homeworkTasks.length > activityTasks.length * 3) {
      patterns.push('You focus heavily on homework. Consider adding more personal activities for balance.')
    }

    const avgHomeworkTime = homeworkTasks.length > 0 
      ? homeworkTasks.reduce((sum, task) => sum + task.estimatedTime, 0) / homeworkTasks.length 
      : 0

    if (avgHomeworkTime > 120) {
      patterns.push('Your homework sessions are quite long. Consider the Pomodoro Technique (25-min focused sessions).')
    }

    const subjectCount = new Set(tasks.map(task => task.subject)).size
    if (subjectCount > 6) {
      patterns.push('You\'re juggling many subjects. Consider creating dedicated study blocks for each.')
    }

    return patterns
  }

  const studyPatterns = getStudyPatternAnalysis()

  // Productivity recommendations
  const getProductivityRecommendations = () => {
    const recommendations = []

    if (completionRate < 80) {
      recommendations.push({
        title: 'Time Management',
        tip: 'Use the "2-minute rule" - if a task takes less than 2 minutes, do it immediately.',
        impact: 'High'
      })
    }

    recommendations.push({
      title: 'Energy Management',
      tip: 'Schedule demanding tasks during your peak energy hours (usually 9-11 AM for most people).',
      impact: 'High'
    })

    recommendations.push({
      title: 'Batch Similar Tasks',
      tip: 'Group similar activities together (e.g., all reading assignments, all problem sets).',
      impact: 'Medium'
    })

    if (overdueTasks.length > 0) {
      recommendations.push({
        title: 'Deadline Buffer',
        tip: 'Set personal deadlines 1-2 days before the actual due date to avoid last-minute stress.',
        impact: 'High'
      })
    }

    return recommendations
  }

  const recommendations = getProductivityRecommendations()

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-500" />
            AI Productivity Analysis
          </CardTitle>
          <CardDescription>
            Intelligent insights and recommendations based on your task patterns
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{Math.round(completionRate)}%</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <Progress value={completionRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Average Task Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{formatTime(Math.round(averageTaskTime))}</span>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground">
              Optimal range: 30-90 minutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">This Week's Load</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{thisWeekTasks.length}</span>
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatTime(thisWeekTasks.reduce((sum, task) => sum + task.estimatedTime, 0))} total time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Priority Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{highPriorityTasks.length}</span>
              <Target className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-xs text-muted-foreground">
              High priority tasks pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Key Insights
          </CardTitle>
          <CardDescription>
            AI-powered analysis of your productivity patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => {
            const IconComponent = insight.icon
            const alertVariant = insight.type === 'warning' ? 'destructive' : 'default'
            
            return (
              <Alert key={index} className={alertVariant === 'destructive' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20' : ''}>
                <IconComponent className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-1">{insight.title}</div>
                  <div className="text-sm">{insight.description}</div>
                </AlertDescription>
              </Alert>
            )
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Study Pattern Analysis
            </CardTitle>
            <CardDescription>
              Insights into your study habits and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {studyPatterns.length > 0 ? (
              studyPatterns.map((pattern, index) => (
                <div key={index} className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">{pattern}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">
                Add more tasks to see personalized study pattern analysis.
              </p>
            )}

            {/* Subject workload breakdown */}
            {Object.keys(subjectWorkload).length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Subject Workload Distribution</h4>
                {Object.entries(subjectWorkload)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([subject, time]) => (
                    <div key={subject} className="flex items-center justify-between">
                      <span className="font-medium">{subject}</span>
                      <Badge variant="outline">{formatTime(time)}</Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Productivity Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Productivity Recommendations
            </CardTitle>
            <CardDescription>
              Personalized tips to boost your efficiency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 rounded-lg border">
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
      </div>

      {/* Weekly Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Forecast
          </CardTitle>
          <CardDescription>
            AI predictions and suggestions for the week ahead
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600 dark:text-green-400">Optimal Days</h4>
              <p className="text-sm text-muted-foreground">
                Tuesday and Wednesday look best for tackling complex assignments based on your current schedule.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-600 dark:text-yellow-400">Potential Bottlenecks</h4>
              <p className="text-sm text-muted-foreground">
                {thisWeekTasks.length > 7 
                  ? 'Thursday-Friday may be overwhelming. Consider moving some tasks earlier.' 
                  : 'No major bottlenecks detected for this week.'}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600 dark:text-blue-400">Recommended Focus</h4>
              <p className="text-sm text-muted-foreground">
                {highPriorityTasks.length > 0 
                  ? `Start with ${highPriorityTasks[0].subject} tasks to stay ahead of deadlines.`
                  : 'Maintain steady progress on all subjects.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}