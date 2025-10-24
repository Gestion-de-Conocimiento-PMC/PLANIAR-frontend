import { useState } from 'react'
import { GraduationCap, Sparkles, CheckSquare, Upload } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { CreateClassForm } from './CreateClassForm'
import { CreateActivityForm } from './CreateActivityForm'
import { CreateTaskFormImproved } from './CreateTaskFormImproved'
import { UploadScheduleForm } from './UploadScheduleForm'

type EventType = 'class' | 'activity' | 'task' | 'upload' | null

interface AddEventModalProps {
  
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateClass: (classData: any) => void
  onCreateActivity: (activityData: any) => void
  onCreateTask: (taskData: any) => void
  onUploadSchedule: (scheduleData: any) => void
  existingClasses: any[]
  userId: number | undefined
}

export function AddEventModal({
  open,
  onOpenChange,
  onCreateClass,
  onCreateActivity,
  onCreateTask,
  onUploadSchedule,
  existingClasses,
  userId
}: AddEventModalProps) {
  const [selectedType, setSelectedType] = useState<EventType>(null)

  const handleClose = () => {
    setSelectedType(null)
    onOpenChange(false)
  }

  const handleOptionClick = (type: EventType) => {
    setSelectedType(type)
  }

  const handleBack = () => {
    setSelectedType(null)
  }

  // Main menu with 4 options
  if (!selectedType) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <DialogDescription>
              Choose what you want to create
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Create Class */}
            <button
              onClick={() => handleOptionClick('class')}
              className="group relative p-6 border-2 border-border rounded-lg hover:border-[#7B61FF] hover:bg-[#7B61FF]/5 transition-all duration-200 text-left"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-full bg-[#7B61FF]/10 group-hover:bg-[#7B61FF]/20 transition-colors">
                  <GraduationCap className="w-8 h-8 text-[#7B61FF]" />
                </div>
                <div>
                  <h3 className="font-medium">Create Class</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add recurring class sessions
                  </p>
                </div>
              </div>
            </button>

            {/* Create Activity */}
            <button
              onClick={() => handleOptionClick('activity')}
              className="group relative p-6 border-2 border-border rounded-lg hover:border-[#7B61FF] hover:bg-[#7B61FF]/5 transition-all duration-200 text-left"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-full bg-[#7B61FF]/10 group-hover:bg-[#7B61FF]/20 transition-colors">
                  <Sparkles className="w-8 h-8 text-[#7B61FF]" />
                </div>
                <div>
                  <h3 className="font-medium">Create Activity</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add recurring activities
                  </p>
                </div>
              </div>
            </button>

            {/* Create Task */}
            <button
              onClick={() => handleOptionClick('task')}
              className="group relative p-6 border-2 border-border rounded-lg hover:border-[#7B61FF] hover:bg-[#7B61FF]/5 transition-all duration-200 text-left"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-full bg-[#7B61FF]/10 group-hover:bg-[#7B61FF]/20 transition-colors">
                  <CheckSquare className="w-8 h-8 text-[#7B61FF]" />
                </div>
                <div>
                  <h3 className="font-medium">Create Task</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add homework or single tasks
                  </p>
                </div>
              </div>
            </button>

            {/* Upload Schedule */}
            <button
              onClick={() => handleOptionClick('upload')}
              className="group relative p-6 border-2 border-border rounded-lg hover:border-[#7B61FF] hover:bg-[#7B61FF]/5 transition-all duration-200 text-left"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-full bg-[#7B61FF]/10 group-hover:bg-[#7B61FF]/20 transition-colors">
                  <Upload className="w-8 h-8 text-[#7B61FF]" />
                </div>
                <div>
                  <h3 className="font-medium">Upload Schedule</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Import and analyze documents
                  </p>
                </div>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Show specific form based on selection
  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
          {selectedType === 'class' && (
            <CreateClassForm
              onSubmit={(data) => {
                onCreateClass({data, userId})
                handleClose()
              }}
              onBack={handleBack}
              userId={userId ?? null}
            />
          )}
          {selectedType === 'activity' && (
            <CreateActivityForm
              onSubmit={(data) => {
                onCreateActivity({data, userId})
                handleClose()
              }}
              onBack={handleBack}
              userId={userId ?? null}
            />
          )}
          {selectedType === 'task' && (
            <CreateTaskFormImproved
              onSubmit={(data) => {
                onCreateTask({data, userId})
                handleClose()
              }}
              onBack={handleBack}
              existingClasses={existingClasses}
              userId={userId ?? null}
            />
          )}
          {selectedType === 'upload' && (
            <UploadScheduleForm
              onSubmit={(data) => {
                onUploadSchedule(data)
                handleClose()
              }}
              onBack={handleBack}
              existingClasses={existingClasses}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}