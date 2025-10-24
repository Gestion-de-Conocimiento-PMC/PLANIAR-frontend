interface ClassBlockProps {
  classData: any
  startHour: number
  duration: number
  heightPerHour: number
  onClick?: () => void
}

export function ClassBlock({ classData, startHour, duration, heightPerHour, onClick }: ClassBlockProps) {
  const height = Math.max(duration * heightPerHour, 60) // Minimum 60px

  return (
    <div
      onClick={onClick}
      className="mx-2 mb-1 rounded-lg border cursor-pointer hover:opacity-90 transition-all shadow-sm hover:shadow-md"
      style={{
        height: `${height - 3}px`,
        backgroundColor: classData.color ? `${classData.color}20` : '#7B61FF20',
        borderColor: classData.color || '#7B61FF',
        borderWidth: '2px',
        minHeight: '60px'
      }}
    >
      <div className="p-3 h-full flex flex-col justify-center">
        <p 
          className="font-semibold text-sm leading-tight mb-1" 
          style={{ 
            color: classData.color || '#7B61FF',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}
        >
          {classData.title}
        </p>
        {classData.room && (
          <p className="text-xs text-muted-foreground mt-1 leading-tight">
            {classData.room}
          </p>
        )}
        {classData.professor && duration > 1 && (
          <p className="text-xs text-muted-foreground mt-1 leading-tight">
            {classData.professor}
          </p>
        )}
      </div>
    </div>
  )
}
