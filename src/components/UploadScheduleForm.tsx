import { useState } from 'react'
import { ChevronLeft, Check } from 'lucide-react'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Checkbox } from './ui/checkbox'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import { AIUploadView } from './AIUploadView'

interface UploadScheduleFormProps {
  onSubmit: (data: any) => void
  onBack: () => void
  existingClasses: any[]
}

interface AISuggestion {
  id: string
  type: 'task' | 'class' | 'activity'
  title: string
  dueDate?: string
  subject?: string
  days?: string[]
  dateFrom?: string
  dateTo?: string
  times?: { start: string; end: string }
  color?: string
  selected: boolean
  __raw?: any
}

export function UploadScheduleForm({ onSubmit, onBack, existingClasses }: UploadScheduleFormProps) {
  const [parentClass, setParentClass] = useState('')
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Display helper to clean instructor strings for UI (remove (Principal), escapes, and normalize LAST, FIRST)
  const displayInstructor = (raw: any) => {
    if (!raw) return ''
    let s = String(raw)
    s = s.replace(/\\n/g, ' ').replace(/\\r/g, ' ').replace(/\\/g, '')
    s = s.replace(/\s*\([^)]*\)/g, '').trim()
    const commaMatch = s.match(/^([^,]+),\s*(.+)$/)
    if (commaMatch) s = `${commaMatch[2].trim()} ${commaMatch[1].trim()}`
    return s.trim()
  }

  const handleAIAnalysis = (aiData: any) => {
    if (!aiData) return

    console.log('✅ AI analysis completed:', aiData)

    const items: any[] = aiData.items || []

    // Group events by normalized title and time block so that sessions of the same course
    // that happen at different times/rooms are separated, while same-title same-time are grouped across days.
    const normalize = (s: string) => (s || '').toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase().trim()

    const groups: Record<string, any> = {}

    // small helper to clean instructor strings coming from ICS DESCRIPTION
    const cleanInstructor = (raw: any) => {
      if (!raw) return ''
      let s = String(raw)
      // replace literal escaped newlines and carriage returns
      s = s.replace(/\\n/g, ' ').replace(/\\r/g, ' ')
      // remove backslashes used for escaping in ICS
      s = s.replace(/\\/g, '')
      // remove parenthetical qualifiers like (Principal)
      s = s.replace(/\s*\([^)]*\)/g, '')
      s = s.trim()
      // convert "LAST, FIRST" -> "FIRST LAST"
      const commaMatch = s.match(/^([^,]+),\s*(.+)$/)
      if (commaMatch) s = `${commaMatch[2].trim()} ${commaMatch[1].trim()}`
      return s.trim()
    }

    items.forEach((it, idx) => {
      const title = it.title || it.summary || 'Untitled'
      const norm = normalize(title)
      const start = it.start ? new Date(it.start) : new Date()
      const end = it.end ? new Date(it.end) : new Date(start.getTime() + 60 * 60 * 1000)
      const day = typeof it.day === 'number' ? it.day : start.getDay()
      const startTime = it.startTime || start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const endTime = it.endTime || end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const room = it.location || ''
  // clean professor string to remove markers like (Principal) and ICS escapes
  const professor = cleanInstructor(it.instructor || '')
      const dateFrom = it.dateFrom || start.toISOString().slice(0,10)
      const dateTo = it.dateTo || end.toISOString().slice(0,10)

      const baseKey = norm
      const timeKey = `${startTime}__${endTime}__${room}`
      if (!groups[baseKey]) groups[baseKey] = {}
      if (!groups[baseKey][timeKey]) {
        groups[baseKey][timeKey] = {
          id: `${baseKey}-${Object.keys(groups[baseKey]).length}`,
          title,
          normTitle: norm,
          days: new Set<number>(),
          daySchedule: {},
          rooms: new Set<string>(),
          professors: new Set<string>(),
          dateFrom,
          dateTo,
          color: '#7B61FF',
          selected: true,
        }
      }

      const g = groups[baseKey][timeKey]
      g.days.add(day)
      g.rooms.add(room)
      if (!g.daySchedule[day]) g.daySchedule[day] = { start: startTime, end: endTime, room, professor }
      else {
        g.daySchedule[day] = { ...g.daySchedule[day], room: g.daySchedule[day].room || room, professor: g.daySchedule[day].professor || professor }
      }
      if (professor) g.professors.add(professor)
    })

    // Convert groups into suggestions array
    const formattedSuggestions: AISuggestion[] = []
    Object.values(groups).forEach((timeMap: any) => {
      Object.values(timeMap).forEach((g: any) => {
        const daysArr = Array.from<number>(g.days).sort((a, b) => a - b)
        formattedSuggestions.push({
          id: g.id,
          title: g.title,
          type: 'class',
          subject: '',
          days: daysArr.map((d: number) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]),
          dateFrom: g.dateFrom,
          dateTo: g.dateTo,
          times: undefined,
          color: g.color || '#7B61FF',
          selected: true,
          __raw: g,
        })
      })
    })

    setSuggestions(formattedSuggestions)
    setShowSuggestions(true)
    if (aiData.linkedClass) setParentClass(aiData.linkedClass)
  }

  const toggleSuggestion = (id: string) => {
    setSuggestions(suggestions.map(s =>
      s.id === id ? { ...s, selected: !s.selected } : s
    ))
  }

  const handleSubmit = () => {
    const selectedSuggestions = suggestions.filter(s => s.selected)

    // Convert suggestions into backend payloads per class
    const payloads = selectedSuggestions.map(s => {
      // If suggestion carries raw aggregated daySchedule use it, otherwise try fallbacks
      const raw = (s as any).__raw || {}
      const daySchedule = raw.daySchedule || {}

      // days csv and per-day start/end/professor/room CSVs (order Sun..Sat)
      const daysFlags: string[] = []
      const startTimes: string[] = []
      const endTimes: string[] = []
      const professors: string[] = []
      const rooms: string[] = []
      for (let d = 0; d < 7; d++) {
        const info = daySchedule[d]
        if (info) {
          daysFlags.push('1')
          startTimes.push(info.start || '')
          endTimes.push(info.end || '')
          professors.push(info.professor || '')
          rooms.push(info.room || '')
        } else {
          daysFlags.push('0')
          startTimes.push('')
          endTimes.push('')
          professors.push('')
          rooms.push('')
        }
      }

      return {
        title: s.title,
        days: daysFlags.join(','),
        startTimes: startTimes.join(','),
        endTimes: endTimes.join(','),
        professor: professors.join(','),
        room: rooms.join(','),
        startDate: s.dateFrom || raw.dateFrom || null,
        endDate: s.dateTo || raw.dateTo || null,
        color: s.color || '#7B61FF',
      }
    })

    onSubmit({
      parentClass: parentClass || null,
      suggestions: payloads
    })
  }

  if (!showSuggestions) {
    return (
      <>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <DialogTitle>Upload your schedule (.ics)</DialogTitle>
              <DialogDescription>Supports only .ics files</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Link to Class */}
          <div className="space-y-2">
            <Label>
              Link to Class <span className="text-destructive">*</span>
            </Label>
            <Select value={parentClass} onValueChange={setParentClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class..." />
              </SelectTrigger>
              <SelectContent>
                {existingClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cls.color }}
                      />
                      {cls.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose which class this schedule belongs to
            </p>
          </div>

          {/* AI Upload View */}
          <AIUploadView
            onAnalysisComplete={handleAIAnalysis}
            analysisType="schedule"
            description="Supports only .ics files"
          />
        </div>
      </>
    )
  }

  // Suggestions view
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowSuggestions(false)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <DialogTitle>Review AI Suggestions</DialogTitle>
            <DialogDescription>
              Select the items you want to add to your schedule
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="mt-4 space-y-4 max-h-[50vh] overflow-y-auto pr-2" style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        <style>{`
          .space-y-4::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Summary */}
        <Card className="p-4 bg-[#7B61FF]/5 border-[#7B61FF]">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">AI Analysis Complete</p>
              <p className="text-sm text-muted-foreground">
                Found {suggestions.length} items in your schedule
              </p>
            </div>
            <Badge className="bg-[#7B61FF]">
              {suggestions.filter(s => s.selected).length} selected
            </Badge>
          </div>
        </Card>

        {/* Linked Class Display */}
        {parentClass && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Linked to:</span>
            <Badge variant="secondary">
              {existingClasses.find(c => c.id === parentClass)?.title || 'Unknown Class'}
            </Badge>
          </div>
        )}

        {/* Suggestions List */}
        <div className="space-y-2">
          {suggestions.map((suggestion) => (
            <Card
              key={suggestion.id}
              className={`p-4 cursor-pointer transition-all ${
                suggestion.selected
                  ? 'border-[#7B61FF] bg-[#7B61FF]/5'
                  : 'border-border hover:border-[#7B61FF]/50'
              }`}
              onClick={() => toggleSuggestion(suggestion.id)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={suggestion.selected}
                  onCheckedChange={() => toggleSuggestion(suggestion.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {/* Inline editable title */}
                    <input
                      value={suggestion.title}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setSuggestions(suggestions.map(s => s.id === suggestion.id ? { ...s, title: e.target.value } : s))}
                      className="font-medium bg-transparent focus:outline-none"
                    />
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.type}
                    </Badge>
                    {/* color picker */}
                    <input
                      type="color"
                      value={suggestion.color || '#7B61FF'}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setSuggestions(suggestions.map(s => s.id === suggestion.id ? { ...s, color: e.target.value } : s))}
                      className="ml-2 w-8 h-6 p-0 border-0"
                      title="Pick color"
                    />
                  </div>
                  {/* Top-line attributes: professor, room, days, times */}
                  <div className="flex flex-wrap gap-2 mt-2 items-center text-sm">
                    {suggestion.__raw && (
                      <>
                        {/* Best-effort professor */}
                        {(() => {
                          const profs = Array.from(new Set(Object.values(suggestion.__raw.daySchedule || {}).map((d: any) => displayInstructor(d.professor)).filter(Boolean)))
                          return profs.length > 0 ? <Badge variant="secondary" className="text-xs">Prof: {profs.join(', ')}</Badge> : null
                        })()}

                        {/* Best-effort rooms */}
                        {(() => {
                          const rooms = Array.from(new Set(Object.values(suggestion.__raw.daySchedule || {}).map((d: any) => d.room).filter(Boolean)))
                          return rooms.length > 0 ? <Badge variant="secondary" className="text-xs">Room: {rooms.join(', ')}</Badge> : null
                        })()}

                        {/* Days */}
                        {suggestion.days && <span className="text-xs text-muted-foreground">Days: {suggestion.days.join(', ')}</span>}
                      </>
                    )}
                  </div>

                  {/* Expandable per-day details (read-only) */}
                  {((suggestion as any).__raw?.daySchedule) && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      {Object.entries((suggestion as any).__raw.daySchedule).map(([dayIdx, info]: any) => (
                        <div key={dayIdx} className="grid grid-cols-12 gap-3 items-center py-1">
                          <div className="col-span-2 text-xs font-medium">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][Number(dayIdx)]}</div>
                          <div className="col-span-4 text-sm">{info.start || '-'}{info.start && info.end ? ` — ${info.end}` : ''}</div>
                          <div className="col-span-3">
                            {info.room ? <Badge variant="secondary" className="text-xs">Room: {info.room}</Badge> : <span className="text-xs text-muted-foreground">Room: -</span>}
                          </div>
                          <div className="col-span-3">
                            {info.professor ? <Badge variant="secondary" className="text-xs">Prof: {displayInstructor(info.professor)}</Badge> : <span className="text-xs text-muted-foreground">Prof: -</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {suggestion.selected && (
                  <Check className="w-5 h-5 text-[#7B61FF]" />
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-background border-t mt-4 -mx-2 px-2 py-3">
          <Button variant="outline" onClick={() => setShowSuggestions(false)}>
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#7B61FF] hover:bg-[#6B51EF]"
            disabled={suggestions.filter(s => s.selected).length === 0}
          >
            Create Classes
          </Button>
        </div>
      </div>
    </>
  )
}
