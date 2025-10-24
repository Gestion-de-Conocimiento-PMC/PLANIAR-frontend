interface HourRowProps {
  hour: number
  heightPerHour: number
}

export function HourRow({ hour, heightPerHour }: HourRowProps) {
  return (
    <div 
      className="border-b p-3 text-right bg-muted/20"
      style={{ height: `${heightPerHour}px` }}
    >
      <p className="text-sm text-muted-foreground font-semibold">
        {String(hour).padStart(2, '0')}:00
      </p>
    </div>
  )
}
