import { useState } from 'react'
import { APIPATH } from '../lib/api'
import { ChevronLeft } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { AIUploadView } from './AIUploadView'

const DAYS_OF_WEEK = [
  { id: 0, label: 'Sun' },
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
]

const PRESET_COLORS = [
  { name: 'Purple', value: '#7B61FF' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Indigo', value: '#6366F1' }
]

interface CreateActivityFormProps {
  onSubmit?: (data: any) => void
  onBack: () => void
  userId: number | null
  initialData?: any
  // mode: 'create' | 'edit' - when editing, hide AI tab and change titles
  mode?: 'create' | 'edit'
}

export function CreateActivityForm({ onSubmit, onBack, userId, initialData, mode }: CreateActivityFormProps) {
  const isEditMode = mode === 'edit' || !!initialData
  const [inputMode, setInputMode] = useState<'manual' | 'ai'>(isEditMode ? 'manual' : 'manual')
  const [title, setTitle] = useState(initialData?.title || '')
  const [selectedDays, setSelectedDays] = useState<number[]>(initialData?.days || [])
  const [dayTimes, setDayTimes] = useState<Record<number, { start: string; end: string }>>(initialData?.dayTimes || {})
  const [dateFrom, setDateFrom] = useState(initialData?.startDate || '')
  const [dateTo, setDateTo] = useState(initialData?.endDate || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [selectedColor, setSelectedColor] = useState(initialData?.color || PRESET_COLORS[0].value)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleDayToggle = (dayId: number) => {
    setSelectedDays(prev => {
      if (prev.includes(dayId)) {
        const newTimes = { ...dayTimes }
        delete newTimes[dayId]
        setDayTimes(newTimes)
        return prev.filter(d => d !== dayId)
      }
      return [...prev, dayId]
    })
  }

  const handleTimeChange = (dayId: number, field: 'start' | 'end', value: string) => {
    setDayTimes(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value }
    }))
  }

  const handleAIAnalysis = (suggestions: any) => {
    if (suggestions.title) setTitle(suggestions.title)
    if (suggestions.days) setSelectedDays(suggestions.days)
    if (suggestions.dayTimes) setDayTimes(suggestions.dayTimes)
    if (suggestions.description) setDescription(suggestions.description)
    if (suggestions.color) setSelectedColor(suggestions.color)
    setInputMode('manual')
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    if (selectedDays.length === 0) newErrors.days = 'Select at least one day'
    if (dateFrom && dateTo && dateFrom > dateTo) newErrors.dateTo = 'End date must be after start date'
    selectedDays.forEach(day => {
      const times = dayTimes[day]
      if (times?.start && times?.end && times.start >= times.end) {
        newErrors[`time_${day}`] = 'End time must be after start time'
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)

    try {
      const payload = {
        title,
        days: DAYS_OF_WEEK.map(d => selectedDays.includes(d.id) ? '1' : '0').join(','),
        startTimes: DAYS_OF_WEEK.map(d => dayTimes[d.id]?.start || '').join(','),
        endTimes: DAYS_OF_WEEK.map(d => dayTimes[d.id]?.end || '').join(','),
        description,
        // If the user leaves dates empty (recurring activity), send very distant
        // start/end dates so the backend receives non-null values but the
        // activity effectively behaves as ongoing/recurrent.
        startDate: dateFrom || '1900-01-01',
        endDate: dateTo || '9999-12-31',
        color: selectedColor,
        userId: userId ?? null,
        id: initialData?.id,
      }

      if (onSubmit) onSubmit(payload)

      // Reset form
      setTitle('')
      setSelectedDays([])
      setDayTimes({})
      setDateFrom('')
      setDateTo('')
      setDescription('')
      setSelectedColor(PRESET_COLORS[0].value)
      setErrors({})

    } catch (error: any) {
      console.error('❌ Error preparing activity payload:', error)
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
            <DialogTitle>{isEditMode ? 'Edit Activity' : 'Create Activity'}</DialogTitle>
            <DialogDescription>{isEditMode ? 'Edit the activity details' : 'Add a recurring activity to your schedule'}</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Manual / AI Tabs */}
      <Tabs value={inputMode} onValueChange={(v: any) => setInputMode(v)} className="mt-4">
        <TabsList className={`grid w-full ${isEditMode ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <TabsTrigger value="manual">Manual</TabsTrigger>
          {!isEditMode && <TabsTrigger value="ai">AI</TabsTrigger>}
        </TabsList>

        {!isEditMode && (
          <TabsContent value="ai" className="mt-4">
            <AIUploadView
              onAnalysisComplete={handleAIAnalysis}
              analysisType="activity"
              description="Upload your activity schedule or details"
            />
          </TabsContent>
        )}

        <TabsContent value="manual" className="mt-4">
          <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2" style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            <style>{`
              .space-y-6::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Morning Workout"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            {/* Days of Week */}
            <div className="space-y-2">
              <Label>
                Days of the Week <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <Button
                    key={day.id}
                    type="button"
                    variant={selectedDays.includes(day.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleDayToggle(day.id)}
                    className={selectedDays.includes(day.id) ? 'bg-[#7B61FF] hover:bg-[#6B51EF]' : ''}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
              {errors.days && <p className="text-sm text-destructive">{errors.days}</p>}
            </div>

            {/* Hours per Day */}
            {selectedDays.length > 0 && (
              <div className="space-y-3">
                <Label>Hours per Day</Label>

                <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                  {selectedDays.map((dayId) => {
                    const day = DAYS_OF_WEEK.find(d => d.id === dayId)
                    return (
                      <div key={dayId} className="space-y-2 pb-3 border-b last:border-b-0 last:pb-0">
                        <Badge variant="secondary" className="bg-[#7B61FF] text-white">
                          {day?.label}
                        </Badge>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Start Time</Label>
                            <Input
                              type="time"
                              placeholder="Start"
                              value={dayTimes[dayId]?.start || ''}
                              onChange={(e) => handleTimeChange(dayId, 'start', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">End Time</Label>
                            <Input
                              type="time"
                              placeholder="End"
                              value={dayTimes[dayId]?.end || ''}
                              onChange={(e) => handleTimeChange(dayId, 'end', e.target.value)}
                            />
                          </div>
                        </div>
                        {errors[`time_${dayId}`] && (
                          <p className="text-sm text-destructive">{errors[`time_${dayId}`]}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Date Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className={errors.dateFrom ? 'border-destructive' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className={errors.dateTo ? 'border-destructive' : ''}
                  />
                  {errors.dateTo && <p className="text-sm text-destructive">{errors.dateTo}</p>}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Leave empty for ongoing activities</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about this activity..."
                rows={3}
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color.value ? 'border-foreground scale-110' : 'border-border'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-background border-t mt-4 -mx-2 px-2 py-3">
              <Button variant="outline" onClick={onBack} disabled={loading}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                className="bg-[#7B61FF] hover:bg-[#6B51EF] flex items-center gap-2"
                disabled={loading}
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                )}
                {isEditMode ? 'Save Changes' : 'Create Activity'}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}