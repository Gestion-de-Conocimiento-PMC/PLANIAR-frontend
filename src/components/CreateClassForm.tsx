import { useState } from 'react'
import { APIPATH } from '../lib/api'
import { ChevronLeft } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Badge } from './ui/badge'
import { AIUploadView } from './AIUploadView'
import { ICS_TUTORIAL_URL } from '../lib/config'

// Constantes de colores y días de la semana
const PRESET_COLORS = [
  { name: 'Purple', value: '#7B61FF' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Green', value: '#10B981' },
  { name: 'Blue', value: '#3B82F6' },
]

const DAYS_OF_WEEK = [
  { id: 0, label: 'Sun' },
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
]

interface CreateClassFormProps {
  onSubmit?: (data: any) => void
  onBack: () => void
  userId: number | null
  initialData?: any
}

export function CreateClassForm({ onSubmit, onBack, userId, initialData }: CreateClassFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [selectedDays, setSelectedDays] = useState<number[]>(initialData?.days || [])
  const [daySchedule, setDaySchedule] = useState<Record<
    number,
    { start: string; end: string; room: string; professor: string }
  >>(initialData?.daySchedule || {})
  const [dateFrom, setDateFrom] = useState(initialData?.startDate || '')
  const [dateTo, setDateTo] = useState(initialData?.endDate || '')
  const [selectedColor, setSelectedColor] = useState(initialData?.color || PRESET_COLORS[0].value)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [inputMode, setInputMode] = useState<'manual' | 'ics'>('manual')

  const handleDayToggle = (dayId: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    )
  }

  const handleScheduleChange = (dayId: number, field: 'start' | 'end' | 'room' | 'professor', value: string) => {
    setDaySchedule((prev) => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value },
    }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    if (selectedDays.length === 0) newErrors.days = 'At least one day must be selected'
    if (!dateFrom) newErrors.dateFrom = 'Start date is required'
    if (!dateTo) newErrors.dateTo = 'End date is required'
    const start = new Date(dateFrom)
    const end = new Date(dateTo)
    if (start > end) newErrors.dateTo = 'End date must be after start date'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAIAnalysis = (data: any) => {
    console.log('AI Analysis:', data)
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)

    try {
      if (!userId) throw new Error('User not found')

      const payload = {
        title,
        days: DAYS_OF_WEEK.map(d => selectedDays.includes(d.id) ? '1' : '0').join(','),
        startTimes: DAYS_OF_WEEK.map(d => daySchedule[d.id]?.start || '').join(','),
        endTimes: DAYS_OF_WEEK.map(d => daySchedule[d.id]?.end || '').join(','),
        professor: DAYS_OF_WEEK.map(d => daySchedule[d.id]?.professor || '').join(','),
        room: DAYS_OF_WEEK.map(d => daySchedule[d.id]?.room || '').join(','),
        startDate: dateFrom,
        endDate: dateTo,
        color: selectedColor,
        user: { id: userId },
      }

  const res = await fetch(APIPATH(`/classes/user/${userId}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error creating class')
      }

      const result = await res.json()
      alert('✅ Class created successfully')
      if (onSubmit) onSubmit(result)

      // Limpiar formulario
      setTitle('')
      setSelectedDays([])
      setDaySchedule({})
      setDateFrom('')
      setDateTo('')
      setSelectedColor(PRESET_COLORS[0].value)

    } catch (error: any) {
      alert(error.message)
      console.error('❌ Error creating class:', error)
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
            <DialogTitle>Create Class</DialogTitle>
            <DialogDescription>Add a recurring class to your schedule</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Manual / ICS Tabs */}
      <Tabs value={inputMode} onValueChange={(v: any) => setInputMode(v)} className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual</TabsTrigger>
          <TabsTrigger value="ics">ics</TabsTrigger>
        </TabsList>

        <TabsContent value="ics" className="mt-4 space-y-4">
          {ICS_TUTORIAL_URL ? (
            (() => {
              const url = ICS_TUTORIAL_URL.trim()
              const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(url)
              if (isYouTube) {
                // Normalize to embed URL
                let videoId = ''
                try {
                  if (url.includes('youtu.be/')) {
                    videoId = url.split('youtu.be/')[1].split(/[?&]/)[0]
                  } else if (url.includes('watch?v=')) {
                    const params = new URL(url).searchParams
                    videoId = params.get('v') || ''
                  } else {
                    // Fallback: try to extract last path segment
                    const parts = new URL(url).pathname.split('/')
                    videoId = parts.pop() || ''
                  }
                } catch (e) {
                  // Fallback naive parsing
                  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
                  videoId = m ? m[1] : ''
                }
                const embedSrc = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&rel=0` : url
                return (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Tutorial: how to obtain your classes ICS</p>
                    <div className="w-full rounded overflow-hidden bg-black">
                      <iframe
                        src={embedSrc}
                        title="ICS import tutorial"
                        className="w-full h-[360px] bg-black border-0"
                        allow="autoplay; encrypted-media; fullscreen"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )
              }

              // Non-YouTube source: use native video element (autoplay muted)
              return (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Tutorial: how to obtain your classes ICS</p>
                  <div className="w-full rounded overflow-hidden bg-black">
                    <video
                      src={url}
                      controls
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-auto max-h-[360px] bg-black"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )
            })()
          ) : (
            <div className="mb-4 text-sm text-muted-foreground">Upload classes with a ICS file — tutorial soon...</div>
          )}

          <AIUploadView
            onAnalysisComplete={handleAIAnalysis}
            analysisType="class"
            description="Upload your class syllabus or schedule"
          />
        </TabsContent>

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
                placeholder="e.g., Advanced Mathematics"
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

            {/* Schedule for Each Day */}
            {selectedDays.length > 0 && (
              <div className="space-y-3">
                <Label>Schedule for Each Day</Label>

                <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                  {selectedDays.map((dayId) => {
                    const day = DAYS_OF_WEEK.find(d => d.id === dayId)
                    return (
                      <div key={dayId} className="space-y-3 pb-3 border-b last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-[#7B61FF] text-white">
                            {day?.label}
                          </Badge>
                        </div>
                        
                        {/* Time Inputs - Only Start and End */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Start Time</Label>
                            <Input
                              type="time"
                              placeholder="Start"
                              value={daySchedule[dayId]?.start || ''}
                              onChange={(e) => handleScheduleChange(dayId, 'start', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">End Time</Label>
                            <Input
                              type="time"
                              placeholder="End"
                              value={daySchedule[dayId]?.end || ''}
                              onChange={(e) => handleScheduleChange(dayId, 'end', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Room & Professor for this specific day */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Room</Label>
                            <Input
                              placeholder="e.g., Room 305"
                              value={daySchedule[dayId]?.room || ''}
                              onChange={(e) => handleScheduleChange(dayId, 'room', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Professor</Label>
                            <Input
                              placeholder="e.g., Dr. Smith"
                              value={daySchedule[dayId]?.professor || ''}
                              onChange={(e) => handleScheduleChange(dayId, 'professor', e.target.value)}
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
              <Label className="text-sm text-muted-foreground">From - To</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className={errors.dateFrom ? 'border-destructive' : ''}
                  />
                  {errors.dateFrom && <p className="text-sm text-destructive">{errors.dateFrom}</p>}
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
              <p className="text-xs text-muted-foreground">Leave empty for ongoing classes</p>
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label>
                Color <span className="text-destructive">*</span>
              </Label>
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
              {errors.color && <p className="text-sm text-destructive">{errors.color}</p>}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-background border-t mt-4 -mx-2 px-2 py-3">
              <Button variant="outline" onClick={onBack} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-[#7B61FF] hover:bg-[#6B51EF] flex items-center gap-2"
                disabled={loading} // 🔹 Evita múltiples clicks
              >
                {loading && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                {initialData ? 'Update Class' : 'Create Class'}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}