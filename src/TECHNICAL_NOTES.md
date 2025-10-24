# PlanIAr - Technical Implementation Notes

## Recent Major Changes (Oct 2025)

### 1. AI Upload System
All AI-powered forms now use a two-step process:
- **Step 1**: Upload-only view (`AIUploadView` component)
  - Clean drag-and-drop interface
  - No inline suggestions or controls
  - Shows analyzing animation during processing
- **Step 2**: Auto-switch to Manual tab with pre-filled data
  - AI suggestions are automatically applied to form fields
  - User can review and modify before submitting

**Components using AIUploadView**:
- `CreateClassForm` (AI tab)
- `CreateActivityForm` (AI tab)  
- `UploadScheduleForm` (entire form)

### 2. Create Class Form - Simplified Time Input
**Removed**:
- Duration field
- Time entry mode toggle (start+duration vs start+end)

**Current fields** (per day):
- Start Time (time picker)
- End Time (time picker)
- Room (optional text)
- Professor (optional text)

**Validation**: Ensures end time > start time

### 3. Weekly Planner - Complete Redesign

#### Layout Structure
```
┌─────────────────────────────────────────┐
│  [Hour Column - STICKY]  │  [7 Days - SCROLLABLE HORIZONTAL]  │
│         00:00 - 23:00     │   Mon  Tue  Wed  Thu  Fri  Sat  Sun │
│                           │                                      │
│  [Current Time Line] ──────────────────────────────────────────►│
└─────────────────────────────────────────┘
```

#### Key Features:
1. **Sticky Hour Column** (left, 80px width)
   - Shows 24-hour grid (00:00 to 23:00)
   - Stays fixed during horizontal scroll
   - Contains "Now" time label

2. **Horizontal Scrolling Days**
   - 7 columns (Monday - Sunday)
   - Minimum width: 1400px (200px per day)
   - Scroll hidden: `scrollbarWidth: none`, `::-webkit-scrollbar { display: none }`

3. **Current Time Line**
   - Red horizontal line showing current time
   - Calculated: `(hours * 60 + minutes) / (24 * 60) * 100%`
   - Updates every minute
   - Only shows on current week (`currentWeek === 0`)
   - Label shows in hour column, line extends across current day

4. **Item Rendering Priority**:
   ```javascript
   // For each day:
   timedItems = classes + scheduled_tasks  // Has start/end time
   untimedItems = tasks_without_time       // No specific time
   
   // Render order:
   1. timedItems (sorted by start time, positioned absolutely by hour)
   2. untimedItems (stacked at bottom of day column)
   ```

5. **Class Blocks**:
   - Positioned absolutely by start/end time
   - Background color from class.color
   - Shows: title, time range, room
   - Clickable → opens `ClassDetailDialog`
   - Minimum height: 40px

6. **Classes Always Visible**:
   - Classes render independently of tasks/activities
   - Bug fixed: Previously classes wouldn't show without activities
   - Each day checks `class.days.includes(dayOfWeek)` and date range

### 4. Edit Class Button - Direct Navigation
**Previous behavior**: Redirected to "View All Classes" list

**Current behavior**: 
- Click "Edit" in `ClassDetailDialog` → calls `onEditClasses()`
- Opens `EditClassesDialog` in edit mode
- `CreateClassForm` loads with `initialData` pre-filled
- User sees form with all fields populated
- Submit updates the class directly

### 5. CSS Utilities

#### Hidden Scrollbars
```css
.scrollable-container {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollable-container::-webkit-scrollbar {
  display: none;
}
```

#### Bouncing Dots Animation (AI analyzing)
```css
@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
}
.animate-bounce {
  animation: bounce 1s infinite;
}
```

Apply with staggered delays:
```jsx
<div style={{ animationDelay: '0ms' }} />
<div style={{ animationDelay: '150ms' }} />
<div style={{ animationDelay: '300ms' }} />
```

## Component Architecture

### AIUploadView (NEW)
Reusable component for AI file upload:
- Props: `onAnalysisComplete`, `analysisType`, `description`
- Types: 'class' | 'activity' | 'schedule'
- Simulates 2.5s AI analysis
- Returns suggestions object to parent

### WeeklyView
- Hour column: `position: sticky; left: 0; z-index: 20`
- Days grid: `display: grid; grid-cols-7; min-width-1400px`
- Time positioning: `top: ${(hour/24) * 100}%`
- Height calculation: `height: ${((end-start)/1440) * 100}%`

### CreateClassForm
- Tabs: Manual | AI
- AI tab: Shows only `AIUploadView`
- Manual tab: Shows form fields
- Initial data support for editing

## Data Models

### Class Object
```typescript
{
  id: string
  title: string
  days: string[]  // ['monday', 'wednesday', 'friday']
  dateFrom?: string  // ISO date
  dateTo?: string    // ISO date
  dayTimes: {
    monday: { start: '09:00', end: '10:30' }
    // ...
  }
  daySchedule: {
    monday: { 
      start: '09:00', 
      end: '10:30',
      room?: 'Room 305',
      professor?: 'Dr. Smith'
    }
    // ...
  }
  color: string  // Hex color
}
```

### Task Object
```typescript
{
  id: number
  title: string
  type: 'homework' | 'activity'
  subject?: string
  dueDate: string  // ISO date
  priority: 'high' | 'medium' | 'low'
  estimatedTime: number  // minutes
  status: 'pending' | 'in-progress' | 'completed'
  suggestedStartTime?: string  // HH:MM
}
```

## Browser Compatibility
- Grid Layout: Modern browsers (Chrome 57+, Firefox 52+, Safari 10.1+)
- Sticky positioning: All modern browsers
- CSS Custom Properties: All modern browsers
- Time input: All modern browsers (fallback for Safari < 14.1)

## Performance Notes
- Weekly planner renders max 7 days at once
- Time line updates via interval (1 minute)
- Class filtering happens in JavaScript (not DB)
- No virtual scrolling (acceptable for weekly view)

## Future Considerations
- Add drag-to-resize for class blocks
- Implement class overlap detection/stacking
- Add week view export (PDF/image)
- Persist scroll position across navigations
- Add keyboard shortcuts for navigation
