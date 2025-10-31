import { useState } from 'react'
import { Search, Edit, Trash2, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog'
import { CreateClassForm } from './CreateClassForm'

interface EditClassesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classes: any[]
  onEditClass: (classId: string, updates: any) => void
  onDeleteClass: (classId: string) => void
  onCreateClass: (classData: any) => void
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

export function EditClassesDialog({
  open,
  onOpenChange,
  classes,
  onEditClass,
  onDeleteClass,
  onCreateClass
}: EditClassesDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingClass, setEditingClass] = useState<any>(null)
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const safeClasses = classes ?? []
  const filteredClasses = safeClasses.filter(cls =>
    (cls?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (cls: any) => {
    setEditingClass(cls)
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
      onEditClass(editingClass.id, updates)
      setEditingClass(null)
    }
  }

  const handleCreateSubmit = (classData: any) => {
    onCreateClass(classData)
    setShowCreateForm(false)
  }

  // Show create form
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
            <DialogTitle>Manage Classes</DialogTitle>
            <DialogDescription>
              View, edit, or delete your existing classes
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
                  placeholder="Search classes..."
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
                {filteredClasses.map((cls) => (
                  <Card key={cls.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cls.color }}
                          />
                          <h3 className="font-medium">{cls.title}</h3>
                        </div>

                        <div className="flex flex-wrap gap-2 text-sm">
                          {Array.isArray(cls.days) && cls.days.length > 0 && (
                            <div className="flex gap-1">
                              {cls.days.map((day: string) => (
                                <Badge key={day} variant="secondary" className="text-xs">
                                  {DAYS_MAP[day] || day}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          {cls.professor && (
                            <div>
                              <span className="font-medium">Professor:</span> {cls.professor}
                            </div>
                          )}
                          {cls.room && (
                            <div>
                              <span className="font-medium">Room:</span> {cls.room}
                            </div>
                          )}
                          {cls.dateFrom && cls.dateTo && (
                            <div className="col-span-2">
                              <span className="font-medium">Period:</span>{' '}
                              {new Date(cls.dateFrom).toLocaleDateString()} -{' '}
                              {new Date(cls.dateTo).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {/* Show times for each day */}
                        {cls.dayTimes && Object.keys(cls.dayTimes).length > 0 && (
                          <div className="text-sm">
                            <span className="font-medium text-muted-foreground">Schedule:</span>
                            <div className="mt-1 space-y-1">
                              {Object.entries(cls.dayTimes).map(([day, times]: [string, any]) => (
                                <div key={day} className="text-muted-foreground">
                                  {DAYS_MAP[day]}: {times.start} - {times.end}
                                </div>
                              ))}
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
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
    </>
  )
}
