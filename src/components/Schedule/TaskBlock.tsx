import { Clock } from 'lucide-react'

interface TaskBlockProps {
  taskData: any
  startHour: number
  duration: number
  heightPerHour: number
}

export function TaskBlock({ taskData, startHour, duration, heightPerHour }: TaskBlockProps) {
  const height = Math.max(duration * heightPerHour, 50) // Minimum 50px
  const color = '#7B61FF' // Use purple for all tasks (no color differentiation)

  return (
    <div
      className="mx-2 mb-1 rounded-lg border transition-all shadow-sm"
      style={{
        height: `${height}px`,
        backgroundColor: `${color}15`,
        borderColor: color,
        borderWidth: '2px',
        borderStyle: 'dashed',
        minHeight: '50px'
      }}
    >
      <div className="p-3 h-full flex flex-col justify-center">
        <p 
          className="font-semibold text-sm leading-tight text-foreground" 
          style={{ 
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}
        >
          {taskData.title}
        </p>
        {taskData.estimatedTime && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
            <Clock className="w-3 h-3" />
            <span>{taskData.estimatedTime}m</span>
          </div>
        )}
        {taskData.subject && duration > 1 && (
          <p className="text-xs text-muted-foreground mt-1 leading-tight">
            {taskData.subject}
          </p>
        )}
      </div>
    </div>
  )
}
