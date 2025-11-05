import React from 'react'

export function ScheduleHeader() {
  return (
    <div className="space-y-2">
      <h1 style={{ fontSize: '30px', fontWeight: '600' }} className="text-[#2B2B2B] dark:text-white animate-header-title">
        Schedule Overview
      </h1>
      <p className="text-muted-foreground animate-header-subtitle">
        View your complete weekly timetable including classes, activities, and tasks. Stay organized and track your time effectively.
      </p>
    </div>
  )
}
