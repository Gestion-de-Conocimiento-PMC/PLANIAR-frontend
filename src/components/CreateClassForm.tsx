import { useState } from 'react'
// CreateClassForm: build payload and delegate network to parent via onSubmit
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
  // mode: 'create' | 'edit' - when editing, hide ICS/AI tab and change titles
  mode?: 'create' | 'edit'
  // Optional handler for uploading a schedule (.ics) and creating classes from it
  onUploadSchedule?: (data: any) => void
}

export function CreateClassForm({ onSubmit, onBack, userId, initialData, mode, onUploadSchedule }: CreateClassFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [selectedDays, setSelectedDays] = useState<number[]>(initialData?.days || [])
  const [daySchedule, setDaySchedule] = useState<Record<
    number,
    { start: string; end: string; room: string; professor: string }
  >>(initialData?.daySchedule || {})
  // Helpers for applying same values across selected days
  const [sameProfessorActive, setSameProfessorActive] = useState(false)
  const [sameRoomActive, setSameRoomActive] = useState(false)
  const [sameTimeActive, setSameTimeActive] = useState(false)
  const [globalProfessor, setGlobalProfessor] = useState(initialData?.professor || '')
  const [globalRoom, setGlobalRoom] = useState(initialData?.room || '')
  const [globalStart, setGlobalStart] = useState('')
  const [globalEnd, setGlobalEnd] = useState('')
  const [dateFrom, setDateFrom] = useState(initialData?.startDate || '')
  const [dateTo, setDateTo] = useState(initialData?.endDate || '')
  const [selectedColor, setSelectedColor] = useState(initialData?.color || PRESET_COLORS[0].value)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const isEditMode = mode === 'edit' || !!initialData
  const [inputMode, setInputMode] = useState<'manual' | 'ics'>(isEditMode ? 'manual' : 'manual')
  const [icsSuggestions, setIcsSuggestions] = useState<any[] | null>(null)
  const [showIcsSuggestions, setShowIcsSuggestions] = useState(false)

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
    // Save suggestions from ICS analysis so user can confirm creation
    // `data` shape: { linkedClass?, items?: [...] }
    const items = data?.items || []
    setIcsSuggestions(items)
    setShowIcsSuggestions(true)
  }
  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)

    try {
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
        // userId is provided by the backend route when creating (POST /api/classes/user/{userId})
        id: initialData?.id,
      }

      if (onSubmit) onSubmit(payload)

      // Reset form
      setTitle('')
      setSelectedDays([])
      setDaySchedule({})
      setDateFrom('')
      setDateTo('')
      setSelectedColor(PRESET_COLORS[0].value)
    } catch (error: any) {
      console.error('❌ Error preparing class payload:', error)
    } finally {
      setLoading(false)
    }
  }

  // Toggle helpers: when enabling a "same X" option, capture current value from the
  // first selected day (if any) and apply it to all selected days so the per-day inputs
  // can be hidden and the user only needs to pick days.
  const toggleSameProfessor = () => {
    setSameProfessorActive((prev) => {
      const next = !prev
      if (next && selectedDays.length > 0) {
        const first = selectedDays[0]
        const existing = daySchedule[first]?.professor || ''
        setGlobalProfessor(existing || globalProfessor)
        // apply to all selected days immediately
        setDaySchedule(prevSched => {
          const copy = { ...prevSched }
          selectedDays.forEach(d => {
            copy[d] = { ...(copy[d] || { start: '', end: '', room: '', professor: '' }), professor: existing || globalProfessor }
          })
          return copy
        })
      }
      return next
    })
  }

  const toggleSameRoom = () => {
    setSameRoomActive((prev) => {
      const next = !prev
      if (next && selectedDays.length > 0) {
        const first = selectedDays[0]
        const existing = daySchedule[first]?.room || ''
        setGlobalRoom(existing || globalRoom)
        setDaySchedule(prevSched => {
          const copy = { ...prevSched }
          selectedDays.forEach(d => {
            copy[d] = { ...(copy[d] || { start: '', end: '', room: '', professor: '' }), room: existing || globalRoom }
          })
          return copy
        })
      }
      return next
    })
  }

  const toggleSameTime = () => {
    setSameTimeActive((prev) => {
      const next = !prev
      if (next && selectedDays.length > 0) {
        const first = selectedDays[0]
        const existingStart = daySchedule[first]?.start || ''
        const existingEnd = daySchedule[first]?.end || ''
        setGlobalStart(existingStart || globalStart)
        setGlobalEnd(existingEnd || globalEnd)
        setDaySchedule(prevSched => {
          const copy = { ...prevSched }
          selectedDays.forEach(d => {
            copy[d] = { ...(copy[d] || { start: '', end: '', room: '', professor: '' }), start: existingStart || globalStart, end: existingEnd || globalEnd }
          })
          return copy
        })
      }
      return next
    })
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <DialogTitle>{isEditMode ? 'Edit Class' : 'Create Class'}</DialogTitle>
            <DialogDescription>{isEditMode ? 'Edit the class details' : 'Add a recurring class to your schedule'}</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Manual / ICS Tabs */}
      <Tabs value={inputMode} onValueChange={(v: any) => setInputMode(v)} className="mt-4">
        <TabsList className={`grid w-full ${isEditMode ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <TabsTrigger value="manual">Manual</TabsTrigger>
          {!isEditMode && <TabsTrigger value="ics">ics</TabsTrigger>}
        </TabsList>

        {!isEditMode && (
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

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Upload your schedule .ics file</h3>
            </div>

            <AIUploadView
              onAnalysisComplete={handleAIAnalysis}
              analysisType="schedule"
              description="Supports only .ics files"
            />

            {/* After analysis: show suggestions summary and create button */}
            {showIcsSuggestions && icsSuggestions && (
              <div className="mt-4 space-y-3">
                <div className="text-sm text-muted-foreground">Found {icsSuggestions.length} items in the uploaded .ics</div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setShowIcsSuggestions(false); setIcsSuggestions(null) }}>Cancel</Button>
                  <Button
                    onClick={() => {
                      // Delegate the bulk creation to the parent upload handler if provided
                      if (typeof onUploadSchedule === 'function') {
                        onUploadSchedule({ parentClass: null, suggestions: icsSuggestions })
                      } else if (typeof onSubmit === 'function') {
                        // fallback: pass through to onSubmit so parent can handle it
                        onSubmit({ parentClass: null, suggestions: icsSuggestions })
                      }
                      // close suggestions view
                      setShowIcsSuggestions(false)
                      setIcsSuggestions(null)
                    }}
                    className="bg-[#7B61FF] hover:bg-[#6B51EF]"
                  >
                    Create Classes
                  </Button>
                </div>
              </div>
            )}
          </div>
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

            {/* Quick apply controls for same professor/room/time across selected days */}
            <div className="space-y-3">
              <Label>Quick settings (optional)</Label>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant={sameProfessorActive ? 'default' : 'outline'} onClick={toggleSameProfessor}>
                  Same professor for all days
                </Button>
                <Button type="button" variant={sameRoomActive ? 'default' : 'outline'} onClick={toggleSameRoom}>
                  Same room for all days
                </Button>
                <Button type="button" variant={sameTimeActive ? 'default' : 'outline'} onClick={toggleSameTime}>
                  Same time for all days
                </Button>
              </div>

              {/* Professor apply panel (English labels) */}
              {sameProfessorActive && (
                <div className="mt-2 grid grid-cols-1 gap-2">
                  <div>
                    <Label className="text-xs">Professor</Label>
                    <Input placeholder="e.g., Dr. John Doe" value={globalProfessor} onChange={e => {
                      const v = e.target.value
                      setGlobalProfessor(v)
                      // auto-apply as the user types when toggle is active
                      if (selectedDays.length > 0) {
                        setDaySchedule(prev => {
                          const copy = { ...prev }
                          selectedDays.forEach(d => {
                            copy[d] = { ...(copy[d] || { start: '', end: '', room: '', professor: '' }), professor: v }
                          })
                          return copy
                        })
                      }
                    }} />
                    <p className="text-xs text-muted-foreground mt-1">Values are applied automatically to selected days.</p>
                  </div>
                </div>
              )}

              {/* Room apply panel (English labels) */}
              {sameRoomActive && (
                <div className="mt-2 grid grid-cols-1 gap-2">
                  <div>
                    <Label className="text-xs">Room</Label>
                    <Input placeholder="e.g., AU_001" value={globalRoom} onChange={e => {
                      const v = e.target.value
                      setGlobalRoom(v)
                      if (selectedDays.length > 0) {
                        setDaySchedule(prev => {
                          const copy = { ...prev }
                          selectedDays.forEach(d => {
                            copy[d] = { ...(copy[d] || { start: '', end: '', room: '', professor: '' }), room: v }
                          })
                          return copy
                        })
                      }
                    }} />
                    <p className="text-xs text-muted-foreground mt-1">Values are applied automatically to selected days.</p>
                  </div>
                </div>
              )}

              {/* Time apply panel (English labels) */}
              {sameTimeActive && (
                <div className="mt-2 grid grid-cols-2 gap-3 items-end">
                  <div>
                    <Label className="text-xs">Start</Label>
                    <Input type="time" value={globalStart} onChange={e => {
                      const v = e.target.value
                      setGlobalStart(v)
                      if (selectedDays.length > 0) {
                        setDaySchedule(prev => {
                          const copy = { ...prev }
                          selectedDays.forEach(d => {
                            copy[d] = { ...(copy[d] || { start: '', end: '', room: '', professor: '' }), start: v }
                          })
                          return copy
                        })
                      }
                    }} />
                  </div>
                  <div>
                    <Label className="text-xs">End</Label>
                    <Input type="time" value={globalEnd} onChange={e => {
                      const v = e.target.value
                      setGlobalEnd(v)
                      if (selectedDays.length > 0) {
                        setDaySchedule(prev => {
                          const copy = { ...prev }
                          selectedDays.forEach(d => {
                            copy[d] = { ...(copy[d] || { start: '', end: '', room: '', professor: '' }), end: v }
                          })
                          return copy
                        })
                      }
                    }} />
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mt-1">Times are applied automatically to selected days.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Schedule for Each Day */}
            {selectedDays.length > 0 && (
              <div className="space-y-3">
                <Label>Schedule for Each Day</Label>

                {/* If ALL "same" options are active we show the compact per-day summary (pick days only).
                    Otherwise show the detailed per-day inputs but disable only the fields that are marked as "same". */}
                {(sameProfessorActive && sameRoomActive && sameTimeActive) ? (
                  <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
                    <p className="text-sm text-muted-foreground">Compact view: same settings are active — pick days only. Applied values shown below.</p>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      {selectedDays.map((dayId) => {
                        const day = DAYS_OF_WEEK.find(d => d.id === dayId)
                        const info = daySchedule[dayId] || { start: '', end: '', room: '', professor: '' }
                        return (
                          <div key={dayId} className="flex items-center justify-between gap-4 p-2 rounded bg-white/5">
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="bg-[#7B61FF] text-white">{day?.label}</Badge>
                              <div className="text-sm text-muted-foreground">
                                { (info.start || info.end) ? `${info.start || ''}${info.start && info.end ? ' - ' : ''}${info.end || ''}` : `${globalStart || ''}${globalStart && globalEnd ? ' - ' : ''}${globalEnd || ''}` }
                                <div>Prof: {info.professor || globalProfessor}</div>
                                <div>Room: {info.room || globalRoom}</div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                    {selectedDays.map((dayId) => {
                      const day = DAYS_OF_WEEK.find(d => d.id === dayId)
                      const info = daySchedule[dayId] || { start: '', end: '', room: '', professor: '' }
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
                                value={sameTimeActive ? (info.start || globalStart) : (info.start || '')}
                                onChange={(e) => !sameTimeActive && handleScheduleChange(dayId, 'start', e.target.value)}
                                disabled={sameTimeActive}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">End Time</Label>
                              <Input
                                type="time"
                                placeholder="End"
                                value={sameTimeActive ? (info.end || globalEnd) : (info.end || '')}
                                onChange={(e) => !sameTimeActive && handleScheduleChange(dayId, 'end', e.target.value)}
                                disabled={sameTimeActive}
                              />
                            </div>
                          </div>

                          {/* Room & Professor for this specific day */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Room</Label>
                              <Input
                                placeholder="e.g., Room 305"
                                value={sameRoomActive ? (info.room || globalRoom) : (info.room || '')}
                                onChange={(e) => !sameRoomActive && handleScheduleChange(dayId, 'room', e.target.value)}
                                disabled={sameRoomActive}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Professor</Label>
                              <Input
                                placeholder="e.g., Dr. Smith"
                                value={sameProfessorActive ? (info.professor || globalProfessor) : (info.professor || '')}
                                onChange={(e) => !sameProfessorActive && handleScheduleChange(dayId, 'professor', e.target.value)}
                                disabled={sameProfessorActive}
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
                )}
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