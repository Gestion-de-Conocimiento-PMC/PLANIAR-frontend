import { useState, useEffect } from 'react'
import { Search, Edit, Trash2, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog'
import { CreateClassForm } from './CreateClassForm'
import { ClassDetailDialog } from './ClassDetailDialog'
import { CreateActivityForm } from './CreateActivityForm'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'

interface EditClassesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classes: any[]
  activities?: any[]
  onEditClass: (classId: string, updates: any) => void
  onDeleteClass: (classId: string) => void
  onCreateClass: (classData: any) => void
  onUploadSchedule?: (scheduleData: any) => void
  onEditActivity?: (activityId: string | number, updates: any) => void
  onDeleteActivity?: (activityId: string | number) => void
  onCreateActivity?: (activityData: any) => void
  // If provided, when the dialog opens it will immediately show the edit form for this item
  initialEditItem?: any
}

const DAYS_MAP: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun'
}
const INDEX_TO_DAY = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']

export function EditClassesDialog({
  open,
  onOpenChange,
  classes,
  activities,
  onEditClass,
  onDeleteClass,
  onCreateClass,
  onUploadSchedule,
  onEditActivity,
  onDeleteActivity,
  onCreateActivity,
  initialEditItem
}: EditClassesDialogProps) {
  // Debug: log incoming data so we can inspect shapes when running locally
  // (This will appear in the browser console.)
  // eslint-disable-next-line no-console
  console.debug('EditClassesDialog props:', { classes, activities })
  const [searchQuery, setSearchQuery] = useState('')
  const [editingClass, setEditingClass] = useState<any>(null)
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'classes' | 'activities'>('classes')
  const [editingActivity, setEditingActivity] = useState<any>(null)
  const [deletingActivityId, setDeletingActivityId] = useState<string | number | null>(null)
  const [showCreateActivityForm, setShowCreateActivityForm] = useState(false)
  const [viewItem, setViewItem] = useState<any | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  const safeClasses = classes ?? []
  const safeActivities = activities ?? []

  // Listen for parent-level refresh signals to reset internal UI state so
  // changes performed elsewhere (create/update/delete) are reflected when the
  // dialog stays open. App passes `dataRefreshKey` to EditClassesDialog.
  // NOTE: App must pass `dataRefreshKey` prop for this to be useful.
  useEffect(() => {
    // When classes/activities props change, make sure list view reflects latest data
    // If we are not actively editing/creating, ensure we show list view.
    if (!open) return
    setShowCreateForm(false)
    setShowCreateActivityForm(false)
    setEditingClass(null)
    setEditingActivity(null)
    setDeletingClassId(null)
    setDeletingActivityId(null)
    setViewItem(null)
    setIsViewOpen(false)
    setActiveTab('classes')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes, activities, open])

  // When the dialog opens from the manager button (no initialEditItem provided),
  // reset any internal editing/create state so the dialog always starts on the list view.
  useEffect(() => {
    if (!open) return
    // If App requested a specific item to open for edit, let the existing useEffect handle it.
    if (initialEditItem) return
    // Reset internal editing/create states to show the list view by default
    setShowCreateForm(false)
    setShowCreateActivityForm(false)
    setEditingClass(null)
    setEditingActivity(null)
    setDeletingClassId(null)
    setDeletingActivityId(null)
    setViewItem(null)
    setIsViewOpen(false)
    setActiveTab('classes')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // If App passes an item to edit directly, open the correct edit form when dialog is opened
  // Use useEffect to avoid state updates during render
  useEffect(() => {
    if (!open || !initialEditItem) return
    if (initialEditItem.itemType === 'class') {
      setEditingClass(normalizeClassForForm(initialEditItem))
    } else {
      setEditingActivity(normalizeActivityForForm(initialEditItem))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEditItem, open])

  const filteredClasses = safeClasses.filter(cls =>
    (cls?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredActivities = safeActivities.filter(act =>
    (act?.title || act?.subject || '').toString().toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (cls: any) => {
    // Normalize incoming class shape into the form-expected initialData
    const normalized = normalizeClassForForm(cls)
    setEditingClass(normalized)
  }
  
  const handleEditActivity = (act: any) => {
    const normalized = normalizeActivityForForm(act)
    setEditingActivity(normalized)
  }

  const handleDelete = (classId: string) => {
    setDeletingClassId(classId)
  }

  const confirmDelete = () => {
    if (deletingClassId) {
      onDeleteClass(deletingClassId)
      setDeletingClassId(null)
    }
  }

  const handleEditSubmit = (updates: any) => {
    if (editingClass) {
      // pass normalized id and updates to parent
      const id = editingClass.id ?? editingClass._id ?? null
      if (id) onEditClass(id, updates)
      setEditingClass(null)
    }
  }
  
  const handleEditActivitySubmit = (updates: any) => {
    if (editingActivity && onEditActivity) {
      const id = editingActivity.id ?? editingActivity._id ?? null
      if (id) onEditActivity(id, updates)
      setEditingActivity(null)
    }
  }

  // Helpers: normalize various backend shapes into the form's expected initialData
  const dayNameToId = (name: string) => {
    const n = String(name || '').toLowerCase()
    switch (n) {
      case 'sunday': case 'sun': return 0
      case 'monday': case 'mon': return 1
      case 'tuesday': case 'tue': return 2
      case 'wednesday': case 'wed': return 3
      case 'thursday': case 'thu': return 4
      case 'friday': case 'fri': return 5
      case 'saturday': case 'sat': return 6
      default: return -1
    }
  }

  const normalizeClassForForm = (cls: any) => {
    if (!cls) return cls
    const normalized: any = { ...cls }
    // id
    normalized.id = cls.id ?? cls._id ?? cls.classId ?? cls.uuid

    // title & color
    normalized.title = cls.title || cls.name || ''
    normalized.color = cls.color || cls.colour || '#7B61FF'

    // start/end dates
    normalized.startDate = cls.startDate || cls.dateFrom || cls.from || cls.date_from || ''
    normalized.endDate = cls.endDate || cls.dateTo || cls.to || cls.date_to || ''

    // days: accept array of names, array of numbers, or csv bitmask
    const daysRaw = cls.days
    let daysArr: number[] = []
    if (Array.isArray(daysRaw) && daysRaw.length > 0) {
      if (typeof daysRaw[0] === 'number') daysArr = daysRaw as number[]
      else daysArr = (daysRaw as string[]).map(d => dayNameToId(d)).filter(n => n >= 0)
    } else if (typeof daysRaw === 'string' && daysRaw.trim() !== '') {
      const s = daysRaw.trim()
      if (/^[01](?:,?[01])*$/.test(s)) {
        const parts = s.includes(',') ? s.split(',') : s.split('')
        daysArr = parts.map((v,i) => v === '1' ? i : -1).filter(n => n >= 0)
      } else if (s.includes(',')) {
        daysArr = s.split(',').map(x => dayNameToId(x.trim())).filter(n => n >= 0)
      }
    }
    normalized.days = daysArr

    // daySchedule / dayTimes: prefer an object keyed by numeric dayId
  const schedule: Record<number, any> = {}
    const dt = cls.dayTimes || cls.day_schedule || cls.daySchedule
    if (dt && typeof dt === 'object') {
      // keys may be day names or numbers
      Object.entries(dt).forEach(([k,v]) => {
        const keyNum = isNaN(Number(k)) ? dayNameToId(k) : Number(k)
        if (keyNum >= 0) schedule[keyNum] = v
      })
    } else if (cls.startTimes && cls.endTimes) {
      const starts = String(cls.startTimes).split(',')
      const ends = String(cls.endTimes).split(',')
      starts.forEach((st, i) => {
        const en = ends[i] || ''
        if (st || en) schedule[i] = { start: (st||'').trim(), end: (en||'').trim() }
      })
    }
    // If professor/room provided as CSV or single string, attach to schedule entries
  const profs = cls.professor ? String(cls.professor).split(',').map((s: string) => s.trim()) : []
  const rooms = cls.room ? String(cls.room).split(',').map((s: string) => s.trim()) : []
    const firstProf = profs.find((p: string) => p) ?? ''
    const firstRoom = rooms.find((r: string) => r) ?? ''
    // Ensure schedule has entries for selected days so inputs show up in the form
    daysArr.forEach((d: number) => {
      schedule[d] = schedule[d] || { start: '', end: '', professor: '', room: '' }
    })
    Object.keys(schedule).forEach(k => {
      const idx = Number(k)
      schedule[idx] = schedule[idx] || { start: '', end: '', professor: '', room: '' }
      // prefer the CSV value for the exact index if present and non-empty
      if (!schedule[idx].professor) {
        schedule[idx].professor = (profs[idx] && profs[idx] !== '') ? profs[idx] : (profs.filter(Boolean).length === 1 ? firstProf : '')
      }
      if (!schedule[idx].room) {
        schedule[idx].room = (rooms[idx] && rooms[idx] !== '') ? rooms[idx] : (rooms.filter(Boolean).length === 1 ? firstRoom : '')
      }
    })
    normalized.daySchedule = schedule

    // userId
    normalized.userId = cls.userId ?? (cls.user && (cls.user.id || cls.user._id)) ?? null

    return normalized
  }

  const normalizeActivityForForm = (act: any) => {
    if (!act) return act
    const normalized: any = { ...act }
    normalized.id = act.id ?? act._id ?? null
    normalized.title = act.title || act.name || ''
    normalized.color = act.color || act.colour || '#7B61FF'
    normalized.startDate = act.startDate || act.dateFrom || act.from || ''
    normalized.endDate = act.endDate || act.dateTo || act.to || ''
    // days handling similar to class
    const daysRaw = act.days
    let daysArr: number[] = []
    if (Array.isArray(daysRaw) && daysRaw.length > 0) {
      if (typeof daysRaw[0] === 'number') daysArr = daysRaw as number[]
      else daysArr = (daysRaw as string[]).map(d => dayNameToId(d)).filter(n => n >= 0)
    } else if (typeof daysRaw === 'string' && daysRaw.trim() !== '') {
      const s = daysRaw.trim()
      if (/^[01](?:,?[01])*$/.test(s)) {
        const parts = s.includes(',') ? s.split(',') : s.split('')
        daysArr = parts.map((v,i) => v === '1' ? i : -1).filter(n => n >= 0)
      } else if (s.includes(',')) {
        daysArr = s.split(',').map(x => dayNameToId(x.trim())).filter(n => n >= 0)
      }
    }
    normalized.days = daysArr

    // dayTimes -> map numeric keys
    const schedule: Record<number, any> = {}
    const dt = act.dayTimes || act.day_schedule || act.daySchedule
    if (dt && typeof dt === 'object') {
      Object.entries(dt).forEach(([k,v]) => {
        const keyNum = isNaN(Number(k)) ? dayNameToId(k) : Number(k)
        if (keyNum >= 0) schedule[keyNum] = v
      })
    } else if (act.startTimes && act.endTimes) {
      const starts = String(act.startTimes).split(',').map((s) => s.trim())
      const ends = String(act.endTimes).split(',').map((s) => s.trim())
      starts.forEach((st, i) => {
        const en = ends[i] || ''
        // create entry even if only professor/room info exists — keep keys for form
        schedule[i] = schedule[i] || { start: '', end: '' }
        if (st) schedule[i].start = st
        if (en) schedule[i].end = en
      })
    }
    // ensure entries exist for selected days so the edit form shows inputs
    normalized.days?.forEach((d: number) => {
      schedule[d] = schedule[d] || { start: '', end: '' }
    })
    normalized.dayTimes = schedule
    normalized.description = act.description || act.notes || ''
    normalized.userId = act.userId ?? (act.user && (act.user.id || act.user._id)) ?? null
    return normalized
  }

  const handleCreateSubmit = (classData: any) => {
    onCreateClass(classData)
    setShowCreateForm(false)
  }
  
  const handleCreateActivitySubmit = (activityData: any) => {
    if (onCreateActivity) onCreateActivity(activityData)
    setShowCreateActivityForm(false)
  }

  // Show create class or activity form
  if (showCreateForm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
          <style>{`
            .scrollable-form-content::-webkit-scrollbar {
              display: none;
            }
            .scrollable-form-content {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
          `}</style>
          <div className="scrollable-form-content overflow-y-auto max-h-[90vh] px-6 py-6">
            <CreateClassForm
              onSubmit={handleCreateSubmit}
              onBack={() => setShowCreateForm(false)}
              userId={null}
              onUploadSchedule={onUploadSchedule}
            />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Show edit form
  if (editingClass) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
          <style>{`
            .scrollable-form-content::-webkit-scrollbar {
              display: none;
            }
            .scrollable-form-content {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
          `}</style>
          <div className="scrollable-form-content overflow-y-auto max-h-[90vh] px-6 py-6">
            <CreateClassForm
              onSubmit={handleEditSubmit}
              onBack={() => setEditingClass(null)}
              initialData={editingClass}
              userId={editingClass?.userId ?? null}
              mode="edit"
            />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Show create activity form
  if (showCreateActivityForm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
          <style>{`
            .scrollable-form-content::-webkit-scrollbar {
              display: none;
            }
            .scrollable-form-content {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
          `}</style>
          <div className="scrollable-form-content overflow-y-auto max-h-[90vh] px-6 py-6">
            <CreateActivityForm
              onSubmit={handleCreateActivitySubmit}
              onBack={() => setShowCreateActivityForm(false)}
              userId={null}
            />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Show edit activity form
  if (editingActivity) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
          <style>{`
            .scrollable-form-content::-webkit-scrollbar {
              display: none;
            }
            .scrollable-form-content {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
          `}</style>
          <div className="scrollable-form-content overflow-y-auto max-h-[90vh] px-6 py-6">
            <CreateActivityForm
              onSubmit={handleEditActivitySubmit}
              onBack={() => setEditingActivity(null)}
              initialData={editingActivity}
              userId={editingActivity?.userId ?? null}
              mode="edit"
            />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Show classes list
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Classes & Activities</DialogTitle>
            <DialogDescription>
              View, edit, or delete your existing classes and activities
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Search and Create */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search classes or activities..."
                  className="pl-9"
                />
              </div>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="gap-2 bg-[#7B61FF] hover:bg-[#6B51EF]"
              >
                <Plus className="w-4 h-4" />
                Create Class
              </Button>
            </div>

            {/* Classes List */}
            <div className="mb-2 text-sm text-muted-foreground">Found {filteredClasses.length} classes • {filteredActivities.length} activities</div>
            {filteredClasses.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">
                  {searchQuery ? 'No classes found' : 'No classes yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Create your first class to get started'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="gap-2 bg-[#7B61FF] hover:bg-[#6B51EF]"
                  >
                    <Plus className="w-4 h-4" />
                    Create Class
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {filteredClasses.map((cls) => {
                  const disp = normalizeClassForForm(cls)
                  return (
                    <Card key={disp.id || cls.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: disp.color }}
                            />
                            <h3 className="font-medium cursor-pointer" onClick={() => { setViewItem({ ...disp, itemType: 'class' }); setIsViewOpen(true) }}>{disp.title}</h3>
                          </div>

                          <div className="flex flex-wrap gap-2 text-sm">
                            {Array.isArray(disp.days) && disp.days.length > 0 && (
                              <div className="flex gap-1">
                                {disp.days.map((dayId: number) => (
                                  <Badge key={dayId} variant="secondary" className="text-xs">
                                    {DAYS_MAP[INDEX_TO_DAY[dayId]] || INDEX_TO_DAY[dayId]}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            {/* Show per-day professor/room if available; otherwise fallback to top-level */}
                            {disp.days && disp.days.length > 0 ? (
                              <div className="col-span-2">
                                <div className="grid grid-cols-2 gap-2">
                                  {disp.days.map((d: number) => (
                                    <div key={d} className="text-sm">
                                      <span className="font-medium">{DAYS_MAP[INDEX_TO_DAY[d]]}:</span>{' '}
                                      {disp.daySchedule && disp.daySchedule[d] && (disp.daySchedule[d].professor || disp.daySchedule[d].room) ? (
                                        <span className="text-muted-foreground">{disp.daySchedule[d].professor ?? ''}{disp.daySchedule[d].professor && disp.daySchedule[d].room ? ' · ' : ''}{disp.daySchedule[d].room ?? ''}</span>
                                      ) : (
                                        <span className="text-muted-foreground">{disp.professor || ''}{disp.professor && disp.room ? ' · ' : ''}{disp.room || ''}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <>
                                {disp.professor && (
                                  <div>
                                    <span className="font-medium">Professor:</span> {disp.professor}
                                  </div>
                                )}
                                {disp.room && (
                                  <div>
                                    <span className="font-medium">Room:</span> {disp.room}
                                  </div>
                                )}
                              </>
                            )}

                            {disp.startDate && disp.endDate && (
                              <div className="col-span-2">
                                <span className="font-medium">Period:</span>{' '}
                                {new Date(disp.startDate).toLocaleDateString()} -{' '}
                                {new Date(disp.endDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          {/* Show times for each day if available */}
                          {disp.daySchedule && Object.keys(disp.daySchedule).length > 0 && (
                            <div className="text-sm">
                              <span className="font-medium text-muted-foreground">Schedule:</span>
                              <div className="mt-1 space-y-1">
                                      {Object.entries(disp.daySchedule)
                                        .filter(([dayKey]) => disp.days?.includes(Number(dayKey)))
                                        .map(([dayKey, info]: [string, any]) => {
                                          const dayNum = Number(dayKey)
                                          return (
                                            <div key={dayKey} className="text-muted-foreground">
                                              {DAYS_MAP[INDEX_TO_DAY[dayNum]]}: {info.start ?? ''}{info.start && info.end ? ' - ' : ''}{info.end ?? ''}
                                            </div>
                                          )
                                        })}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(cls)}
                            title="Edit class"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(cls.id)}
                            title="Delete class"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
            {/* Activities List (below classes) */}
            {filteredActivities.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Activities</h4>
                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                  {filteredActivities.map((act) => {
                    const ad = normalizeActivityForForm(act)
                    return (
                      <Card key={ad.id || act.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full flex-shrink-0"
                                style={{ backgroundColor: ad.color || '#7B61FF' }}
                              />
                              <h3 className="font-medium cursor-pointer" onClick={() => { setViewItem({ ...ad, itemType: ad.itemType || 'activity' }); setIsViewOpen(true) }}>{ad.title}</h3>
                            </div>

                            <div className="flex flex-wrap gap-2 text-sm">
                              {Array.isArray(ad.days) && ad.days.length > 0 && (
                                <div className="flex gap-1">
                                  {ad.days.map((dayId: number) => (
                                    <Badge key={dayId} variant="secondary" className="text-xs">
                                      {DAYS_MAP[INDEX_TO_DAY[dayId]] || INDEX_TO_DAY[dayId]}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                              {ad.subject && (
                                <div>
                                  <span className="font-medium">Subject:</span> {ad.subject}
                                </div>
                              )}
                              {ad.suggestedStartTime && (
                                <div>
                                  <span className="font-medium">Suggested:</span> {ad.suggestedStartTime}
                                </div>
                              )}
                              {ad.dueDate && (
                                <div className="col-span-2">
                                  <span className="font-medium">Due:</span>{' '}
                                  {new Date(ad.dueDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>

                            {/* Show day times if provided */}
                            {ad.dayTimes && Object.keys(ad.dayTimes).length > 0 && (
                              <div className="text-sm mt-2">
                                <span className="font-medium text-muted-foreground">Times:</span>
                                <div className="mt-1 space-y-1">
                                  {Object.entries(ad.dayTimes)
                                    .filter(([dayKey]) => ad.days?.includes(Number(dayKey)))
                                    .map(([dayKey, info]: [string, any]) => {
                                      const dayNum = Number(dayKey)
                                      return (
                                        <div key={dayKey} className="text-muted-foreground">
                                          {DAYS_MAP[INDEX_TO_DAY[dayNum]]}: {info.start ?? ''}{info.start && info.end ? ' - ' : ''}{info.end ?? ''}
                                        </div>
                                      )
                                    })}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditActivity(act)}
                              title="Edit activity"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setDeletingActivityId(act.id)}
                              title="Delete activity"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog for Classes */}
      <AlertDialog open={!!deletingClassId} onOpenChange={() => setDeletingClassId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this class? This action cannot be undone.
              All associated tasks will remain but will no longer be linked to this class.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog for Activities */}
      <AlertDialog open={!!deletingActivityId} onOpenChange={() => setDeletingActivityId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this activity? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingActivityId && onDeleteActivity) onDeleteActivity(deletingActivityId)
                setDeletingActivityId(null)
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* View details dialog for both classes and activities */}
      {viewItem && (
        <ClassDetailDialog
          open={isViewOpen}
          onOpenChange={setIsViewOpen}
          classData={viewItem}
          onEdit={() => {
              // Open edit form depending on type; normalize before editing so fields populate
              if (viewItem.itemType === 'class') setEditingClass(normalizeClassForForm(viewItem))
              else setEditingActivity(normalizeActivityForForm(viewItem))
              setIsViewOpen(false)
          }}
          onDelete={() => {
            if (viewItem.itemType === 'class') onDeleteClass && onDeleteClass(viewItem.id)
            else onDeleteActivity && onDeleteActivity(viewItem.id)
            setIsViewOpen(false)
          }}
        />
      )}
    </>
  )
}
