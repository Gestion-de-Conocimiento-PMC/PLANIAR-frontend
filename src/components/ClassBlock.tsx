import { Clock, MapPin, User } from 'lucide-react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'

interface ClassBlockProps {
  classData: any
  times: { start: string; end: string }
  onClick?: () => void
}

export function ClassBlock({ classData, times, onClick }: ClassBlockProps) {
  const getTimeRange = () => {
    if (!times.start || !times.end) return ''
    return `${times.start} - ${times.end}`
  }

  return (
    <Card
      className="p-3 cursor-pointer hover:shadow-lg transition-all border-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
      style={{
        backgroundColor: classData.color,
        borderColor: classData.color,
        color: '#ffffff'
      }}
      onClick={onClick}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Badge 
              variant="secondary" 
              className="mb-2 text-xs"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              {classData.type === 'activity' ? 'Activity' : 'Class'}
            </Badge>
            <h4 className="font-semibold leading-tight" style={{ color: '#ffffff' }}>
              {classData.title}
            </h4>
          </div>
        </div>

        {times.start && times.end && (
          <div className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            <Clock className="w-3.5 h-3.5" />
            <span>{getTimeRange()}</span>
          </div>
        )}

        {classData.room && (
          <div className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            <MapPin className="w-3.5 h-3.5" />
            <span>{classData.room}</span>
          </div>
        )}

        {classData.professor && (
          <div className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            <User className="w-3.5 h-3.5" />
            <span>{classData.professor}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
