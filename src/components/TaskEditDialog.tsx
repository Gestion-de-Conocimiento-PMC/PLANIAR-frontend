import { useState, useEffect } from 'react'
import { APIPATH } from '../lib/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Card, CardContent } from './ui/card'
import { Edit, Calendar, Clock } from 'lucide-react'
import { TaskForUI } from './TaskManager'

interface TaskEditDialogProps {
  task: TaskForUI
  onUpdateTask?: (taskId: number | string, updates: Partial<TaskForUI>) => void
  children?: React.ReactNode
  onRefresh?: () => void
}

interface FormData {
  title: string
  subject: string
  date: string
  priority: 'High' | 'Medium' | 'Low'
  estimatedTime: number
  description: string
  state: 'Pending' | 'In Progress' | 'Completed'
}

export function TaskEditDialog({ task, onUpdateTask, children, onRefresh }: TaskEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    subject: '',
    date: '',
    priority: 'Medium',
    estimatedTime: 60,
    description: '',
    state: 'Pending'
  })
  // advanced scheduling fields (hidden by default)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [workingDate, setWorkingDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [dueTime, setDueTime] = useState('')

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        subject: task.subject || '',
        date: (task as any).dueDate || (task as any).date || '',
        priority: task.priority || 'Medium',
        estimatedTime: task.estimatedTime || 60,
        description: task.description || '',
        state: task.status || 'Pending'
      })
      // populate advanced fields from task if available
      // helper to normalize LocalDate/LocalTime representations
      const parseDateVal = (v: any) => {
        if (!v) return ''
        if (typeof v === 'string') return v.split('T')[0]
        if (typeof v === 'object' && v.year && v.month && v.day) {
          const mm = String(v.month).padStart(2, '0')
          const dd = String(v.day).padStart(2, '0')
          return `${v.year}-${mm}-${dd}`
        }
        return String(v)
      }

      const parseTimeVal = (v: any) => {
        if (!v) return ''
        if (typeof v === 'string') {
          const parts = v.split(':')
          return parts.length >= 2 ? `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}` : v
        }
        if (typeof v === 'object' && (v.hour !== undefined)) {
          const hh = String(v.hour).padStart(2,'0')
          const mm = String(v.minute ?? v.min ?? 0).padStart(2,'0')
          return `${hh}:${mm}`
        }
        return String(v)
      }

      setWorkingDate(parseDateVal((task as any).workingDate ?? (task as any).working_date))
      setStartTime(parseTimeVal((task as any).startTime ?? (task as any).start_time))
      setEndTime(parseTimeVal((task as any).endTime ?? (task as any).end_time))
      // dueTime may be present as dueTime or embedded in dueDate
      const parsedDueTime = parseTimeVal((task as any).dueTime ?? (task as any).due_time ?? null)
      if (parsedDueTime) setDueTime(parsedDueTime)
      // hide advanced by default when opening edit dialog
      setShowAdvanced(false)
    }
  }, [task])

  const handleInputChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.subject.trim() || !formData.date) return

    try {
      // Build payload including scheduling fields. If advanced editing is off,
      // include the existing scheduling values so they are preserved on update.
      const payload: any = {
        title: formData.title,
        classId: task.classId,
        type: "Homework",
        // send backend field dueDate
        dueDate: formData.date,
        dueTime: dueTime || null,
        priority: formData.priority,
        estimatedTime: formData.estimatedTime,
        description: formData.description,
        state: formData.state,
        // preserve or update scheduling fields
        workingDate: showAdvanced ? (workingDate || null) : ((task as any).workingDate ?? (task as any).working_date ?? null),
        startTime: showAdvanced ? (startTime || null) : ((task as any).startTime ?? (task as any).start_time ?? null),
        endTime: showAdvanced ? (endTime || null) : ((task as any).endTime ?? (task as any).end_time ?? null)
      }

  const response = await fetch(APIPATH(`/tasks/${task.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to update task')

      const updatedTask: TaskForUI = await response.json()
      if (onUpdateTask) onUpdateTask(task.id, updatedTask)
      if (onRefresh) onRefresh()
      setIsOpen(false)
    } catch (error) {
      console.error(error)
      window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: 'Error updating task' } }))
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    // Prefer constructing a local Date from YYYY-MM-DD to avoid timezone shifts
    const s = String(dateString)
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    let date: Date
    if (m) {
      date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    } else {
      date = new Date(s)
    }
    if (isNaN(date.getTime())) return s
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Task
          </DialogTitle>
          <DialogDescription>Update the details of your task</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Status</Label>
                  <Select value={formData.state} onValueChange={v => handleInputChange('state', v as 'Pending' | 'In Progress' | 'Completed')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">⏳ Pending</SelectItem>
                      <SelectItem value="In Progress">🏃 In Progress</SelectItem>
                      <SelectItem value="Completed">✅ Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject/Category *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={e => handleInputChange('subject', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={v => handleInputChange('priority', v as 'High' | 'Medium' | 'Low')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">🟢 Low Priority</SelectItem>
                      <SelectItem value="Medium">🟡 Medium Priority</SelectItem>
                      <SelectItem value="High">🔴 High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Due Date & Time *
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Input
                          id="dueDate"
                          type="date"
                          value={formData.date}
                          onChange={e => handleInputChange('date', e.target.value)}
                          required
                        />
                        {formData.date && <p className="text-sm text-muted-foreground">{formatDate(formData.date)}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <Input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} />
                      </div>
                    </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedTime" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Estimated Time (minutes)
                  </Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    min={5}
                    max={480}
                    step={5}
                    value={formData.estimatedTime}
                    onChange={e => handleInputChange('estimatedTime', Number(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">Approximately {formatTime(formData.estimatedTime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced scheduling fields */}
          {showAdvanced ? (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Work Day</Label>
                    <Input type="date" value={workingDate} onChange={e => setWorkingDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Work session</div>
                    <div className="text-sm">{workingDate ? ((): string => {
                        const s = String(workingDate)
                        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
                        if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString()
                        const d = new Date(s)
                        return isNaN(d.getTime()) ? s : d.toLocaleDateString()
                      })() : 'Not set'}</div>
                    <div className="text-sm">{(startTime || endTime) ? `${startTime || 'TBD'} - ${endTime || 'TBD'}` : 'Not set'}</div>
                  </div>
                  <div>
                    <Button variant="outline" size="sm" onClick={() => setShowAdvanced(true)}>Advanced</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit">Update Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}