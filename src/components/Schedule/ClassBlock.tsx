import type { MouseEvent, KeyboardEvent } from 'react'
import React from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog'
import { Info } from 'lucide-react'
import { useIsTouchDevice } from '../ui/use-touch'

interface ClassBlockProps {
  classData: any
  startHour: number
  duration: number
  heightPerHour: number
  // onClick receives the item (classData) when activated
  onClick?: (item?: any) => void
}

export function ClassBlock({ classData, startHour, duration, heightPerHour, onClick }: ClassBlockProps) {
  const height = Math.max(duration * heightPerHour, 60) // Minimum 60px
  const isTouch = useIsTouchDevice()
  const [open, setOpen] = React.useState(false)

  return (
    <div
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick?.(classData) }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); onClick?.(classData) } }}
      className="mx-2 mb-1 rounded-lg border cursor-pointer hover:opacity-90 transition-all shadow-sm hover:shadow-md"
      style={{
        height: `${height - 3}px`,
        backgroundColor: classData?.color ? `${classData.color}20` : '#7B61FF20',
        borderColor: classData?.color || '#7B61FF',
        borderWidth: '2px',
        minHeight: '60px'
      }}
    >
      <div className="p-3 h-full flex flex-col justify-center">
        {/* Title + info control. On touch devices we open a dialog (better UX for taps); on desktop we keep tooltip. */}
        {isTouch ? (
          <>
            <div className="flex items-center mb-1">
              <p
                className="font-semibold text-sm leading-tight"
                style={{
                  color: '#000000',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {classData?.title}
              </p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <button className="info-icon-button" aria-label="More info about class">
                    <Info size={14} />
                  </button>
                </DialogTrigger>
                <DialogContent className="tooltip-size">
                  <DialogTitle>{classData?.title}</DialogTitle>
                  <DialogDescription>
                    <div className="tooltip-scrollable p-2">
                      {classData?.room && <div className="mb-2">Room: {classData.room}</div>}
                      {classData?.professor && <div>Prof: {classData.professor}</div>}
                    </div>
                  </DialogDescription>
                </DialogContent>
              </Dialog>
            </div>
          </>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center mb-1">
                <p
                  className="font-semibold text-sm leading-tight"
                  style={{
                    color: '#000000',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    cursor: 'help'
                  }}
                >
                  {classData?.title}
                </p>
                <button className="info-icon-button" aria-hidden>
                  <Info size={14} />
                </button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6} className="tooltip-size p-0">
              <div className="tooltip-scrollable p-2">
                <div className="font-semibold mb-1">{classData?.title}</div>
                {classData?.room && <div className="text-sm text-muted-foreground mb-1">Room: {classData.room}</div>}
                {classData?.professor && <div className="text-sm text-muted-foreground">Prof: {classData.professor}</div>}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
        {classData?.room && (
          <p className="text-xs text-muted-foreground mt-1 leading-tight">
            {classData.room}
          </p>
        )}
        {classData?.professor && duration > 1 && (
          <p className="text-xs text-muted-foreground mt-1 leading-tight">
            {classData.professor}
          </p>
        )}
      </div>
    </div>
  )
}
