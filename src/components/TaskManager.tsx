import { useState, useEffect } from 'react'
import { APIPATH } from '../lib/api'
import { Search, Filter, Trash2, Edit, Clock, Calendar, CheckCircle, Circle, PlayCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { TaskEditDialog } from './TaskEditDialog'

// ✅ Interfaz específica para este componente
export interface TaskForUI {
  id: number
  title: string
  classId?: number
  subject: string
  dueDate: string
  // optional scheduling fields from backend
  workingDate?: string | null
  startTime?: string | null
  endTime?: string | null
  dueTime?: string | null
  priority: 'High' | 'Medium' | 'Low'
  estimatedTime: number
  description: string
  type: string
  status: 'Pending' | 'In Progress' | 'Completed'
}

interface TaskManagerProps {
  userId: number | undefined
  onUpdateTask: (taskId: number | string, updates: Partial<TaskForUI>) => void
  onDeleteTask: (taskId: number | string) => void
  dataRefreshKey?: number
}

export function TaskManager({ userId, onUpdateTask, onDeleteTask, dataRefreshKey }: TaskManagerProps) {
  const [tasks, setTasks] = useState<TaskForUI[]>([])
  const [classNames, setClassNames] = useState<Record<number, string>>({})
  const [existingClasses, setExistingClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')

  const mapTaskToUI = (task: any): TaskForUI => ({
    id: task.id,
    title: task.title,
    classId: task.classId,
    subject: '', // se rellenará luego con la info de la clase
    dueDate: (task as any).dueDate || (task as any).date || '',
    // keep scheduling fields if present so edit dialog can show them
    workingDate: (task as any).workingDate ?? (task as any).working_date ?? null,
    startTime: (task as any).startTime ?? (task as any).start_time ?? null,
    endTime: (task as any).endTime ?? (task as any).end_time ?? null,
  dueTime: (task as any).dueTime ?? (task as any).due_time ?? null,
    // Normalize priority and type casing so filters work regardless of backend casing
    priority: (() => {
      const raw = task.priority ?? task.priority
      if (!raw) return 'Low'
      const s = String(raw).trim()
      return (s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()) as 'High' | 'Medium' | 'Low'
    })(),
    estimatedTime: task.estimatedTime || 0,
    description: task.description || '',
    // Normalize type to one of the allowed values: Homework, Project, Exam
    type: (() => {
      const raw = task.type ?? task.type
      const allowed = ['Homework', 'Project', 'Exam']
      if (!raw) return 'Homework'
      const s = String(raw).trim()
      const normalized = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
      return allowed.includes(normalized) ? normalized : 'Homework'
    })(),
    status: (task.state || 'Pending') as 'Pending' | 'In Progress' | 'Completed',
  })

  const fetchTasks = async () => {
    if (!userId) return
    setLoading(true)
    try {
  const response = await fetch(APIPATH(`/tasks/user/${userId}`))
      if (!response.ok) throw new Error('Failed to fetch tasks')
      const data: any[] = await response.json()
      const mappedTasks = data.map(mapTaskToUI)
      setTasks(mappedTasks)

      // ✅ Obtener los nombres de clase para los classId distintos
      // En lugar de hacer una llamada por cada id (puede producir 404 en backend si la clase no existe),
      // hacemos una sola petición user-scoped para traer las clases del usuario y construir el mapa.
      const classNamesMap: Record<number, string> = {}
      try {
        const classesRes = await fetch(APIPATH(`/classes/user/${userId}`))
        if (classesRes.ok) {
          const classesData: any[] = await classesRes.json()
          setExistingClasses(classesData || [])
          for (const cls of classesData) {
            if (cls && (cls.id !== undefined && cls.id !== null)) {
              classNamesMap[Number(cls.id)] = cls.title
            }
          }
        } else {
          // If the user-scoped endpoint is not available, silently fall back to per-id attempts
          // (this keeps previous behavior but avoids throwing)
          const classIds = Array.from(new Set(
            data.map(t => t.classId).filter((id): id is number => id !== undefined)
          ))
          await Promise.all(classIds.map(async id => {
            try {
              const res = await fetch(APIPATH(`/classes/${id}`))
              if (!res.ok) return
              const cls = await res.json()
              classNamesMap[id] = cls.title
            } catch {}
          }))
        }
      } catch (e) {
        console.warn('Failed to fetch classes for user, falling back to per-id fetches', e)
        const classIds = Array.from(new Set(
          data.map(t => t.classId).filter((id): id is number => id !== undefined)
        ))
        await Promise.all(classIds.map(async id => {
          try {
            const res = await fetch(APIPATH(`/classes/${id}`))
            if (!res.ok) return
            const cls = await res.json()
            classNamesMap[id] = cls.title
          } catch {}
        }))
      }
      setClassNames(classNamesMap)

      // ✅ Actualizar subject en cada task
      setTasks(prev =>
        prev.map(t => ({
          ...t,
          subject: t.classId ? classNamesMap[t.classId] || 'General' : 'General'
        }))
      )
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [userId, dataRefreshKey])

  const handleStatusChange = async (taskId: number, newStatus: TaskForUI['status']) => {
    try {
  const response = await fetch(APIPATH(`/tasks/${taskId}/state/${newStatus}`), {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to update task state');
      const updatedTask = await response.json();
      
      // Actualizar estado en UI
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...t, status: updatedTask.state } : t));
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateTask = async (taskId: number | string, updates: Partial<TaskForUI>) => {
    await onUpdateTask(taskId, updates); // ejecuta el update que ya tienes
    // ✅ Si la actualización incluye cambio de classId, refrescamos tareas
    if (updates.classId !== undefined) {
      fetchTasks(); // vuelve a cargar las tareas
    }
  };

  const clearFilters = () => {
    setSearchTerm('')
    setFilterStatus('all')
    setFilterType('all')
    setFilterPriority('all')
    setSortBy('dueDate')
  }

  const parseDateVal = (v?: any) => {
    if (!v) return null
    if (typeof v === 'string') return v.split('T')[0]
    if (typeof v === 'object' && v.year && v.month && v.day) return `${v.year}-${String(v.month).padStart(2,'0')}-${String(v.day).padStart(2,'0')}`
    return String(v).split('T')[0]
  }

  const isOverdue = (task: TaskForUI) => {
    const today = new Date().toISOString().split('T')[0]
    const due = parseDateVal(task.dueDate)
    if (!due) return false
    return task.status !== 'Completed' && due < today
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'destructive'
      case 'Medium': return 'secondary'
      case 'Low': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in-progress': return <PlayCircle className="w-4 h-4 text-blue-600" />
      default: return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  const formatDate = (dateString: string | any) => {
    const ds = parseDateVal(dateString)
    if (!ds) return ''
    // Construct a local date from YYYY-MM-DD to avoid timezone shifts
    const m = String(ds).match(/^(\d{4})-(\d{2})-(\d{2})$/)
    let date: Date
    if (m) date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    else date = new Date(String(ds))
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000*60*60*24))
    if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`
    if (diffDays <= 7) return `In ${diffDays} day${diffDays !== 1 ? 's' : ''}`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  // ✅ Aplicamos filtros y ordenamiento
  const filteredAndSortedTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus
      const matchesType = filterType === 'all' || task.type === filterType
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
      return matchesSearch && matchesStatus && matchesType && matchesPriority
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate': {
              const dsA = parseDateVal(a.dueDate)
              const dsB = parseDateVal(b.dueDate)
              const toTs = (s: any) => {
                if (!s) return 0
                const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/)
                if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime()
                const d = new Date(String(s))
                return isNaN(d.getTime()) ? 0 : d.getTime()
              }
              return toTs(dsA) - toTs(dsB)
            }
        case 'priority':
          const order = { High: 3, Medium: 2, Low: 1 }
          return order[b.priority] - order[a.priority]
        case 'estimatedTime': return b.estimatedTime - a.estimatedTime
        case 'title': return a.title.localeCompare(b.title)
        case 'subject': return a.subject.localeCompare(b.subject)
        default: return 0
      }
    })

  if (loading) return <div className="text-center py-8">Loading tasks...</div>

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-[#2B2B2B] dark:text-white" style={{ fontSize: '30px', fontWeight: '600' }}>Task Manager</h1>
        <p className="text-[#555555] dark:text-gray-400" style={{ fontSize: '16px' }}>All your tasks in one place.</p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search tasks by title, subject, or description..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="pl-10" />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Homework">Homework</SelectItem>
                  <SelectItem value="Project">Project</SelectItem>
                  <SelectItem value="Exam">Exam</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="estimatedTime">Time Required</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="subject">Subject</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardContent className="p-0">
          {filteredAndSortedTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                {tasks.length === 0 ? (
                  <>
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No tasks yet</p>
                    <p>Add your first task to get started with planning!</p>
                  </>
                ) : (
                  <>
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No tasks found</p>
                    <p>Try adjusting your search or filter criteria</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedTasks.map(task => (
                      <TableRow key={task.id} className={isOverdue(task) ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                        <TableCell>{getStatusIcon(task.status)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            {task.description && <div className="text-sm text-muted-foreground mt-1 max-w-xs truncate">{task.description}</div>}
                            <Badge variant="outline" className="mt-1 text-xs">{task.type}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{task.subject}</TableCell>
                        <TableCell><div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /><span className={isOverdue(task) ? 'text-red-600 font-medium' : ''}>{formatDate(task.dueDate)}</span></div></TableCell>
                        <TableCell><Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge></TableCell>
                        <TableCell><div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" />{formatTime(task.estimatedTime)}</div></TableCell>
                        <TableCell>
                          <Select value={task.status} onValueChange={(status: string) => handleStatusChange(task.id, status as TaskForUI['status'])}>
                            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TaskEditDialog task={task} onUpdateTask={handleUpdateTask} existingClasses={existingClasses}>
                              <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                            </TaskEditDialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                  <AlertDialogDescription>Are you sure you want to delete "{task.title}"? This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={async () => {await onDeleteTask(task.id); fetchTasks();}} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4 p-4">
                {filteredAndSortedTasks.map(task => (
                  <Card key={task.id} className={isOverdue(task) ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : ''}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">{getStatusIcon(task.status)}<div className="flex-1 min-w-0"><h4 className="font-medium break-words">{task.title}</h4><p className="text-sm text-muted-foreground">{task.subject}</p></div></div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <TaskEditDialog task={task} onUpdateTask={onUpdateTask} existingClasses={existingClasses}><Button variant="ghost" size="sm" style={{ minWidth: '44px', minHeight: '44px' }}><Edit className="w-4 h-4" /></Button></TaskEditDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600" style={{ minWidth: '44px', minHeight: '44px' }}><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                <AlertDialogDescription>Are you sure you want to delete "{task.title}"? This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDeleteTask(task.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {task.description && <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">{task.type}</Badge>
                        <Badge variant={getPriorityColor(task.priority)} className="text-xs">{task.priority}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-muted-foreground" /><span className={isOverdue(task) ? 'text-red-600 font-medium' : ''}>{formatDate(task.dueDate)}</span></div>
                        <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-muted-foreground" />{formatTime(task.estimatedTime)}</div>
                      </div>
                      <Select value={task.status} onValueChange={(status: string) => onUpdateTask(task.id, { status: status as "Pending" | "In Progress" | "Completed" })}>
                        <SelectTrigger className="w-full" style={{ minHeight: '44px' }}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
