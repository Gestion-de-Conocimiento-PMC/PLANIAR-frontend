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

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        subject: task.subject || '',
        date: task.dueDate || '',
        priority: task.priority || 'Medium',
        estimatedTime: task.estimatedTime || 60,
        description: task.description || '',
        state: task.status || 'Pending'
      })
    }
  }, [task])

  const handleInputChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.subject.trim() || !formData.date) return

    try {
      const payload = {
        title: formData.title,
        classId: task.classId,
        type: "Homework",
        date: formData.date,
        priority: formData.priority,
        estimatedTime: formData.estimatedTime,
        description: formData.description,
        state: formData.state
      }

  const response = await fetch(APIPATH(`/api/tasks/${task.id}`), {
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
      alert('Error updating task')
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
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
                  <Label htmlFor="dueDate" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Due Date *
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.date}
                    onChange={e => handleInputChange('date', e.target.value)}
                    required
                  />
                  {formData.date && <p className="text-sm text-muted-foreground">{formatDate(formData.date)}</p>}
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