import { CreateClassForm } from './CreateClassForm'
import { Dialog, DialogContent } from './ui/dialog'

interface ClassEditorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: any
  onSave: (data: any) => void
}

const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function suggestionToFormInitial(sugg: any) {
  if (!sugg) return undefined
  // days may be ['Sun','Mon'] or [0,1]
  let daysNums: number[] = []
  if (Array.isArray(sugg.days)) {
    daysNums = sugg.days.map((d: any) => typeof d === 'number' ? d : DAY_LABELS.indexOf(String(d)))
      .filter((n: number) => n >= 0)
  }

  // prefer __raw.daySchedule if present (keys numeric)
  const rawSchedule = (sugg.__raw && sugg.__raw.daySchedule) ? sugg.__raw.daySchedule : (sugg.daySchedule || {})

  // normalize schedule into numeric-keyed object
  const daySchedule: Record<number, any> = {}
  Object.entries(rawSchedule || {}).forEach(([k, v]: any) => {
    const idx = Number(k)
    if (!isNaN(idx)) daySchedule[idx] = { ...(v || {}) }
  })

  // helper to clean instructor strings
  const cleanInstructor = (raw: any) => {
    if (!raw) return ''
    let s = String(raw)
    s = s.replace(/\\n/g, ' ').replace(/\\r/g, ' ').replace(/\\/g, '')
    s = s.replace(/\s*\([^)]*\)/g, '').trim()
    const commaMatch = s.match(/^([^,]+),\s*(.+)$/)
    if (commaMatch) s = `${commaMatch[2].trim()} ${commaMatch[1].trim()}`
    return s.trim()
  }

  // apply cleaning to per-day professor fields
  Object.keys(daySchedule).forEach((k) => {
    const idx = Number(k)
    if (!isNaN(idx) && daySchedule[idx]) {
      daySchedule[idx] = { ...daySchedule[idx], professor: cleanInstructor(daySchedule[idx].professor) }
    }
  })

  return {
    id: sugg.id,
    title: sugg.title,
    color: sugg.color || '#7B61FF',
    startDate: sugg.dateFrom || sugg.startDate || null,
    endDate: sugg.dateTo || sugg.endDate || null,
    days: daysNums,
    daySchedule,
  }
}

function formResultToSuggestion(original: any, result: any) {
  // result contains days csv and startTimes/endTimes/professor/room CSVS (as CreateClassForm builds)
  const resDays = result.days || ''
  const parts = resDays.includes(',') ? resDays.split(',') : resDays.split('')
  const dayIndices: number[] = parts.map((p: string, i: number) => p === '1' ? i : -1).filter((n: number) => n >= 0)

  const startArr = (result.startTimes || '').split(',')
  const endArr = (result.endTimes || '').split(',')
  const profArr = (result.professor || '').split(',')
  const roomArr = (result.room || '').split(',')

  const daySchedule: Record<number, any> = {}
  for (let i = 0; i < 7; i++) {
    if (parts[i] === '1') {
      daySchedule[i] = {
        start: (startArr[i] || '').trim(),
        end: (endArr[i] || '').trim(),
        professor: (profArr[i] || '').trim(),
        room: (roomArr[i] || '').trim(),
      }
    }
  }

  const updated = {
    ...original,
    title: result.title || original.title,
    color: result.color || original.color,
    dateFrom: result.startDate || original.dateFrom || result.startDate,
    dateTo: result.endDate || original.dateTo || result.endDate,
    __raw: { ...(original.__raw || {}), daySchedule },
    days: dayIndices.map(i => DAY_LABELS[i]),
  }
  return updated
}

export default function ClassEditorModal({ open, onOpenChange, initial, onSave }: ClassEditorModalProps) {
  const initialForm = suggestionToFormInitial(initial)

  const handleSubmitFromForm = (formPayload: any) => {
    const updatedSuggestion = formResultToSuggestion(initial, formPayload)
    onSave(updatedSuggestion)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <div className="overflow-y-auto max-h-[90vh] px-6 py-6">
          <CreateClassForm
            onSubmit={handleSubmitFromForm}
            onBack={() => onOpenChange(false)}
            initialData={initialForm}
            userId={initial?.userId ?? null}
            mode="edit"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
