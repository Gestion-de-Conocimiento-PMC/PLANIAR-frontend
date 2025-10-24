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
}

export function CreateTaskFormImproved({ onSubmit, onBack, userId }: CreateTaskFormImprovedProps) {
  const [title, setTitle] = useState('')
  const [classId, setClassId] = useState<number | null>(null)
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium')
  const [date, setDate] = useState('')
  const [estimatedTime, setEstimatedTime] = useState('')
  const [timeUnit, setTimeUnit] = useState('minutes')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState<ClassData[]>([])

  // 🔹 Cargar clases del usuario
  useEffect(() => {
    const fetchClasses = async () => {
      if (!userId) return
      try {
  const res = await fetch(APIPATH(`/api/classes/user/${userId}`))
        if (!res.ok) throw new Error('Failed to fetch classes')
        const data: ClassData[] = await res.json()
        setClasses(data)
      } catch (err) {
        console.error('Error fetching classes:', err)
      }
    }
    fetchClasses()
  }, [userId])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    if (!date) newErrors.date = 'Date is required'
    if (!estimatedTime || parseInt(estimatedTime) <= 0)
      newErrors.estimatedTime = 'Estimated time is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)

    try {
      const dateISO = new Date(date).toISOString().split('T')[0]
      const timeInMinutes = timeUnit === 'hours' ? parseInt(estimatedTime) * 60 : parseInt(estimatedTime)

      const taskPayload = {
        title,
        classId,
        date: dateISO,
        priority: priority,
        estimatedTime: timeInMinutes,
        description,
        type: 'Homework',
        state: 'Pending',
        user: { id: userId },
      }

  const response = await fetch(APIPATH(`/api/tasks/user/${userId}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskPayload),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Error creating task')
      }

      const result = await response.json()
      alert('✅ Task created successfully')
      if (onSubmit) onSubmit(result)

      // Limpiar formulario
      setTitle('')
      setClassId(null)
      setPriority('Medium')
      setDate('')
      setEstimatedTime('')
      setDescription('')
    } catch (error: any) {
      alert(error.message)
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
                    {cls.title}
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

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={errors.date ? 'border-destructive' : ''}
          />
          {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
        </div>

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
          <Button
            onClick={handleSubmit}
            className="bg-[#7B61FF] hover:bg-[#6B51EF]"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </div>
    </>
  )
}