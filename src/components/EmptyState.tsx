import { Calendar, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

interface EmptyStateProps {
  onAddTask: () => void
  userName: string
}

// Component/PlaceholderEmpty - Empty state for users without activities
export function EmptyState({ onAddTask, userName }: EmptyStateProps) {
  return (
    <Card className="border-2 border-dashed border-[#7B61FF]/30">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6">
        <div className="w-20 h-20 rounded-full bg-[#EDE6FF] dark:bg-[#2D2545] flex items-center justify-center mb-6">
          <Calendar className="w-10 h-10 text-[#7B61FF]" />
        </div>
        <h3 className="text-xl mb-2 text-center">No activities yet</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          {userName 
            ? `Welcome to PlanIAr, ${userName}. Start by adding your first activities.`
            : 'Welcome to PlanIAr, start by adding your first activities.'}
        </p>
        <Button
          onClick={onAddTask}
          className="gap-2 bg-[#7B61FF] hover:bg-[#6B51EF] text-white shadow-lg h-12 px-8"
        >
          <Plus className="w-5 h-5" />
          Add your first task
        </Button>
      </CardContent>
    </Card>
  )
}
