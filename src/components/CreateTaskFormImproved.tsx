import { useState, useEffect } from 'react'
import { APIPATH } from '../lib/api'
import { ChevronLeft } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'

interface ClassData {
  id: number
  title: string
  color?: string
}

interface CreateTaskFormImprovedProps {
  onSubmit?: (data: any) => void
  onBack: () => void
  existingClasses: any[]
  userId: number | null
  initialValues?: any
}

export function CreateTaskFormImproved({ onSubmit, onBack, userId, initialValues }: CreateTaskFormImprovedProps) {
  const [title, setTitle] = useState('')
  const [classId, setClassId] = useState<number | null>(null)
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium')
  const [date, setDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [workDate, setWorkDate] = useState('')
  const [estimatedTime, setEstimatedTime] = useState('')
  const [timeUnit, setTimeUnit] = useState('minutes')
  const [workStart, setWorkStart] = useState('')
  const [workEnd, setWorkEnd] = useState('')
  const [taskType, setTaskType] = useState<'Project' | 'Homework' | 'Exam'>('Homework')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState<ClassData[]>([])
  // When editing an existing task we keep advanced fields locked until user opts-in
  const isEditMode = !!initialValues
  // Advanced panel should be hidden by default for both create and edit; user can opt-in
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 🔹 Cargar clases del usuario
  useEffect(() => {
    const fetchClasses = async () => {
      if (!userId) return
      try {
  const res = await fetch(APIPATH(`/classes/user/${userId}`))
        if (!res.ok) throw new Error('Failed to fetch classes')
        const data: ClassData[] = await res.json()
        setClasses(data)
      } catch (err) {
        console.error('Error fetching classes:', err)
      }
    }
    fetchClasses()
  }, [userId])

  // If initialValues are provided, populate the form (edit mode)
  useEffect(() => {
    if (!initialValues) return

    // Map backend fields into local state safely
    const iv: any = initialValues
    setTitle(iv.title || '')
    setClassId(iv.classId ?? iv.class?.id ?? null)
    setPriority(iv.priority || 'Medium')
    // support legacy 'date' or 'dueDate'
    // dueDate and dueTime support
    if (iv.date) setDate(String(iv.date).split('T')[0])
    else if (iv.dueDate) setDate(String(iv.dueDate).split('T')[0])
    else setDate('')
    // dueTime may be provided as iv.dueTime or embedded in dueDate
    if (iv.dueTime) setDueTime(String(iv.dueTime).split(':').slice(0,2).join(':'))
    else if (iv.dueDate && String(iv.dueDate).includes('T')) {
      const parts = String(iv.dueDate).split('T')
      if (parts[1]) setDueTime(parts[1].split(':').slice(0,2).join(':'))
    }
    setWorkDate(iv.workingDate ? String(iv.workingDate).split('T')[0] : (iv.workDate ? String(iv.workDate).split('T')[0] : ''))
    setWorkStart(iv.startTime || '')
    setWorkEnd(iv.endTime || '')
    setEstimatedTime(iv.estimatedTime ? String(iv.estimatedTime) : '')
    setTimeUnit('minutes')
    setTaskType(iv.type || 'Homework')
    setDescription(iv.description || '')

    // keep advanced hidden initially in edit mode (user asked to only change due date by default)
    setShowAdvanced(false)
  }, [initialValues])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Title is required'
  if (!date) newErrors.date = 'Date is required'
  if (!dueTime) newErrors.dueTime = 'Due time is required'
  // Only require workingDay/start/end when advanced editing is enabled
  if (showAdvanced) {
    if (!workDate) newErrors.workDate = 'Select a day to work on this task'
    if (!workStart) newErrors.workStart = 'Start time is required'
    if (!workEnd) newErrors.workEnd = 'End time is required'
  }
    // Ensure end time is after start time when both provided
    if (workStart && workEnd) {
      const [sh, sm] = workStart.split(':').map(x => parseInt(x, 10))
      const [eh, em] = workEnd.split(':').map(x => parseInt(x, 10))
      const sMinutes = sh * 60 + (isNaN(sm) ? 0 : sm)
      const eMinutes = eh * 60 + (isNaN(em) ? 0 : em)
      if (eMinutes <= sMinutes) newErrors.workEnd = 'End time must be after start time'
    }
    if (!estimatedTime || parseInt(estimatedTime) <= 0)
      newErrors.estimatedTime = 'Estimated time is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)

    try {
  const dateISO = date ? new Date(date).toISOString().split('T')[0] : null
  const workDateISO = workDate ? new Date(workDate).toISOString().split('T')[0] : null
      const timeInMinutes = timeUnit === 'hours' ? parseInt(estimatedTime) * 60 : parseInt(estimatedTime)

      // Normalize times to HH:MM (no seconds)
      const normalizeTime = (t: string | null) => {
        if (!t) return null
        const parts = t.split(':')
        if (parts.length >= 2) return `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}`
        return t
      }

      const taskPayload = {
        title,
        classId,
        // use backend field name 'dueDate'
        dueDate: dateISO,
        // dueTime is required: normalized HH:MM
        dueTime: normalizeTime(dueTime) || null,
        // backend-friendly fields for scheduling the work session
        workingDate: workDateISO,
        startTime: normalizeTime(workStart) || null,
        endTime: normalizeTime(workEnd) || null,
        priority: priority,
        estimatedTime: timeInMinutes,
        description,
        type: taskType,
        state: 'Pending',
        user: { id: userId },
      }

      // Delegate creation to parent via onSubmit so App can centralize API calls
      if (onSubmit) onSubmit(taskPayload)

      // Clear form only when creating new tasks. In edit mode keep values (parent may close dialog)
      if (!isEditMode) {
        setTitle('')
        setClassId(null)
        setPriority('Medium')
        setDate('')
        setDueTime('')
        setWorkDate('')
        setWorkStart('')
        setWorkEnd('')
        setTaskType('Homework')
        setEstimatedTime('')
        setDescription('')
      }
    } catch (error: any) {
      window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: error.message || 'Error creating task' } }))
      console.error('❌ Error creating task:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>Add homework or a single task</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-6 mt-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Math Homework - Chapter 5"
            className={errors.title ? 'border-destructive' : ''}
          />
          {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
        </div>

        {/* Class */}
        <div className="space-y-2">
          <Label htmlFor="class">Class</Label>
          <Select
            value={classId !== null ? classId.toString() : ''}
            onValueChange={(val) => setClassId(val ? parseInt(val) : null)}
            disabled={classes.length === 0}
          >
            <SelectTrigger>
              {/* Let the SelectValue render the selected item's content (SelectItem includes the color dot). */}
              <SelectValue
                placeholder={
                  classes.length === 0
                    ? 'No classes available'
                    : 'Select a class'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {classes.length === 0 ? (
                <SelectItem value="none" disabled>No classes available</SelectItem>
              ) : (
                classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cls.color }}
                      />
                      {cls.title}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label>Priority</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={priority === 'High' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPriority('High')}
              className={priority === 'High' ? 'bg-[#EF4444] hover:bg-[#DC2626]' : ''}
            >
              High
            </Button>
            <Button
              type="button"
              variant={priority === 'Medium' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPriority('Medium')}
              className={priority === 'Medium' ? 'bg-[#F59E0B] hover:bg-[#D97706]' : ''}
            >
              Medium
            </Button>
            <Button
              type="button"
              variant={priority === 'Low' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPriority('Low')}
              className={priority === 'Low' ? 'bg-[#10B981] hover:bg-[#059669]' : ''}
            >
              Low
            </Button>
          </div>
        </div>

        {/* Due Date + Time */}
        <div className="space-y-2">
          <Label>
            Due Date & Time <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={errors.date ? 'border-destructive' : ''}
              />
              {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
            </div>
            <div className="md:col-span-2">
              <Input
                id="dueTime"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className={errors.dueTime ? 'border-destructive' : ''}
              />
              {errors.dueTime && <p className="text-sm text-destructive">{errors.dueTime}</p>}
            </div>
          </div>
        </div>

        {/* Task Type */}
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={taskType} onValueChange={(v) => setTaskType(v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Project">Project</SelectItem>
              <SelectItem value="Homework">Homework</SelectItem>
              <SelectItem value="Exam">Exam</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Working Day & Time. In edit mode advanced editing is off by default. */}
        {showAdvanced ? (
          <div className="space-y-2 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="workDate">Work Day <span className="text-destructive">*</span></Label>
              <Input id="workDate" type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} className={errors.workDate ? 'border-destructive' : ''} />
              {errors.workDate && <p className="text-sm text-destructive">{errors.workDate}</p>}
            </div>

            <div>
              <Label htmlFor="workStart">Start Time <span className="text-destructive">*</span></Label>
              <Input id="workStart" type="time" value={workStart} onChange={(e) => setWorkStart(e.target.value)} className={errors.workStart ? 'border-destructive' : ''} />
              {errors.workStart && <p className="text-sm text-destructive">{errors.workStart}</p>}
            </div>

            <div>
              <Label htmlFor="workEnd">End Time <span className="text-destructive">*</span></Label>
              <Input id="workEnd" type="time" value={workEnd} onChange={(e) => setWorkEnd(e.target.value)} className={errors.workEnd ? 'border-destructive' : ''} />
              {errors.workEnd && <p className="text-sm text-destructive">{errors.workEnd}</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-2 p-3 rounded border bg-muted/10">
            <div className="flex items-center justify-between">
              <Label>Work session (read-only)</Label>
              <Button size="sm" variant="outline" onClick={() => setShowAdvanced(true)}>Advanced</Button>
            </div>
            <div className="grid grid-cols-1 gap-2 mt-2 text-sm text-muted-foreground">
              <div>
                <div className="text-xs text-muted-foreground">Work Day</div>
                <div>{workDate ? new Date(workDate).toLocaleDateString() : 'Not set'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Start — End</div>
                <div>{(workStart || workEnd) ? `${workStart || 'TBD'} - ${workEnd || 'TBD'}` : 'Not set'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Estimated Time */}
        <div className="space-y-2">
          <Label htmlFor="estimatedTime">
            Estimated Time <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="estimatedTime"
              type="number"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="e.g., 60"
              min="1"
              className={`flex-1 ${errors.estimatedTime ? 'border-destructive' : ''}`}
            />
            <Select value={timeUnit} onValueChange={setTimeUnit}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.estimatedTime && (
            <p className="text-sm text-destructive">{errors.estimatedTime}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details about this task..."
            rows={3}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button variant="ghost" onClick={() => setShowAdvanced(s => !s)}>
            {showAdvanced ? 'Hide advanced' : 'Advanced'}
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#7B61FF] hover:bg-[#6B51EF]"
            disabled={loading}
          >
            {loading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save' : 'Create Task')}
          </Button>
        </div>
      </div>
    </>
  )
}