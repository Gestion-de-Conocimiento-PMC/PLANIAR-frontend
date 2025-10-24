import { Clock, MapPin, User, Edit, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog'
import { useState } from 'react'

interface ClassDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classData: any
  onEdit: () => void
  onDelete: () => void
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

export function ClassDetailDialog({
  open,
  onOpenChange,
  classData,
  onEdit,
  onDelete
}: ClassDetailDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = () => {
    onDelete()
    setShowDeleteConfirm(false)
    onOpenChange(false)
  }

  if (!classData) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: classData.color }}
              />
              <DialogTitle>{classData.title}</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Badge variant="secondary">Class</Badge>
            </div>

            {classData.professor && (
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Professor</p>
                  <p>{classData.professor}</p>
                </div>
              </div>
            )}

            {classData.room && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p>{classData.room}</p>
                </div>
              </div>
            )}

            {classData.days && classData.days.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Days</p>
                <div className="flex flex-wrap gap-2">
                  {classData.days.map((day: string) => (
                    <Badge key={day} variant="secondary">
                      {DAYS_MAP[day]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {classData.dayTimes && Object.keys(classData.dayTimes).length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Schedule</p>
                <div className="space-y-2">
                  {Object.entries(classData.dayTimes).map(([day, times]: [string, any]) => (
                    <div key={day} className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">{DAYS_MAP[day]}:</span>{' '}
                        {times.start} - {times.end}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {classData.dateFrom && classData.dateTo && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <p className="text-sm">
                  {new Date(classData.dateFrom).toLocaleDateString()} -{' '}
                  {new Date(classData.dateTo).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <Button
              onClick={() => {
                onEdit()
                onOpenChange(false)
              }}
              className="gap-2 bg-[#7B61FF] hover:bg-[#6B51EF]"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{classData.title}"? This will remove all
              recurring sessions from your schedule. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
