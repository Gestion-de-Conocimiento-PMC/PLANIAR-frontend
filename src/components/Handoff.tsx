import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export function Handoff() {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl">AI Planner - Handoff Documentation</h1>
        <p className="text-muted-foreground">
          Handoff document with design tokens, components and interaction notes
        </p>
      </div>

      <Separator />

      {/* Tokens Section */}
      <Card>
        <CardHeader>
          <CardTitle>Design Tokens</CardTitle>
          <CardDescription>Colors, spacing and typography of the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Colors */}
          <div className="space-y-3">
            <h3 className="font-semibold">Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-[#7B61FF] border"></div>
                <p className="text-sm font-medium">Primary Purple</p>
                <code className="text-xs">#7B61FF</code>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-[#6B51EF] border"></div>
                <p className="text-sm font-medium">Primary Purple Hover</p>
                <code className="text-xs">#6B51EF</code>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-background border"></div>
                <p className="text-sm font-medium">Background</p>
                <code className="text-xs">var(--background)</code>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-card border"></div>
                <p className="text-sm font-medium">Card</p>
                <code className="text-xs">var(--card)</code>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-muted border"></div>
                <p className="text-sm font-medium">Muted</p>
                <code className="text-xs">var(--muted)</code>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-destructive border"></div>
                <p className="text-sm font-medium">Destructive (Red)</p>
                <code className="text-xs">var(--destructive)</code>
              </div>
            </div>
          </div>

          {/* Spacing */}
          <div className="space-y-3">
            <h3 className="font-semibold">Spacing</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="w-16 h-8 bg-[#7B61FF]/20 rounded"></div>
                <code className="text-sm">gap-2 (0.5rem / 8px)</code>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 h-8 bg-[#7B61FF]/20 rounded"></div>
                <code className="text-sm">gap-3 (0.75rem / 12px)</code>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 h-8 bg-[#7B61FF]/20 rounded"></div>
                <code className="text-sm">gap-4 (1rem / 16px)</code>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-48 h-8 bg-[#7B61FF]/20 rounded"></div>
                <code className="text-sm">gap-6 (1.5rem / 24px)</code>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-3">
            <h3 className="font-semibold">Typography</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">text-xs</p>
                <p className="text-xs">0.75rem (12px)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">text-sm</p>
                <p className="text-sm">0.875rem (14px)</p>
              </div>
              <div>
                <p className="text-base text-muted-foreground">text-base</p>
                <p className="text-base">1rem (16px)</p>
              </div>
              <div>
                <p className="text-lg text-muted-foreground">text-lg</p>
                <p className="text-lg">1.125rem (18px)</p>
              </div>
              <div>
                <p className="text-xl text-muted-foreground">text-xl</p>
                <p className="text-xl">1.25rem (20px)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Components Section */}
      <Card>
        <CardHeader>
          <CardTitle>Components Created/Updated</CardTitle>
          <CardDescription>List of components and their variants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">Login</code>
                <Badge>New</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Login component with Email and Password fields
              </p>
              <p className="text-xs">Location: <code>/components/Login.tsx</code></p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">UserAvatar</code>
                <Badge>New</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Avatar with dropdown: My profile, Settings, Log Out
              </p>
              <p className="text-xs">Location: <code>/components/UserAvatar.tsx</code></p>
              <p className="text-xs">Variantes: expanded/collapsed</p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">Btn/AddTask</code>
                <Badge variant="secondary">Updated</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Large purple button (48x48px min) that opens a modal
              </p>
              <p className="text-xs">Estados: default, hover, active</p>
              <p className="text-xs">Color: #7B61FF (hover: #6B51EF)</p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">Modal/AddTask</code>
                <Badge>New</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Centered popup modal with all TaskInput fields
              </p>
              <p className="text-xs">Animation: fade + translateY(6px), 180-240ms</p>
              <p className="text-xs">Focus trap enabled</p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">Dashboard</code>
                <Badge variant="secondary">Updated</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Contains 4 panels: Average Task Duration, This Week's Load, Priority Focus, Productivity Recommendations
              </p>
              <p className="text-xs">Ubicación: <code>/components/Dashboard.tsx</code></p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">Panel/AverageTaskDuration</code>
                <Badge>Integrated</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Widget that shows average task duration
              </p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">Panel/ThisWeeksLoad</code>
                <Badge>Integrated</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Widget that shows weekly workload
              </p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">Panel/PriorityFocus</code>
                <Badge>Integrated</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Widget that shows pending high-priority tasks
              </p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">Panel/ProductivityRecommendations</code>
                <Badge>Integrated</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Full panel with personalized recommendations
              </p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">WeeklyView</code>
                <Badge variant="secondary">Updated</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Weekly planner without sidebar. Horizontal scroll enabled
              </p>
              <p className="text-xs">Left sidebar fully removed</p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">DayColumn/TaskCard</code>
                <Badge variant="secondary">Maintained</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Day cards with tasks
              </p>
              <p className="text-xs">Variants: Pending, In Progress, Done (no changes)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interaction Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Interaction Notes</CardTitle>
          <CardDescription>Main behaviors and flows</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">🔴 Key Changes</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Add Task:</strong> Now opens a modal popup (previous standalone page removed)</li>
                <li><strong>AI Analysis submenu:</strong> Removed from the header</li>
                <li><strong>Dashboard:</strong> Contains 4 specific panels listed above</li>
                <li><strong>Weekly Planner:</strong> Left sidebar fully removed</li>
                <li><strong>Header:</strong> Only 3 submenus - Dashboard, Weekly Planner, Tasks</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
              <h4 className="font-semibold mb-2">📱 User Flow / Login</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Login → Dashboard</li>
                <li>Avatar → dropdown (My profile / Settings / Log Out)</li>
                <li>Log Out → returns to Login</li>
                <li>My profile: shows personal info (name, email, role, date)</li>
                <li>Settings: visual menu without functionality (coming soon)</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200">
              <h4 className="font-semibold mb-2">⚡ Interaction Prototype</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Add Task button:</strong> onClick → opens modal (overlay) with fade animation</li>
                <li><strong>Avatar:</strong> onClick → dropdown expand/collapse</li>
                <li><strong>Log Out:</strong> onClick → navigate to Login page</li>
                <li><strong>Header tabs:</strong> navigation between Dashboard / Weekly Planner / Tasks</li>
                <li><strong>Weekly Planner:</strong> horizontal scroll enabled between days</li>
                <li><strong>Add Task Modal:</strong> focus trap enabled, ESC to close</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
              <h4 className="font-semibold mb-2">♿ Accessibility</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Focus visible on all buttons and links</li>
                <li>Modal with focus trap (Tab navigation constrained to the modal)</li>
                <li>ARIA roles: button, dialog, menu</li>
                <li>Keyboard navigation in Weekly Planner (←/→ arrows)</li>
                <li>Appropriate labels on all inputs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Notes for Development</CardTitle>
          <CardDescription>Example behavior for the Add Task modal</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`// Add Task Modal Behavior (React Example)
const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)

// Open modal
<Button onClick={() => setIsAddTaskOpen(true)}>
  Add Task
</Button>

// Modal component
<Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Add New Task</DialogTitle>
    </DialogHeader>
    <TaskInput onAddTask={(task) => {
      addTask(task)
      setIsAddTaskOpen(false) // Close on save
    }} />
  </DialogContent>
</Dialog>

// Animation (CSS/Tailwind)
.dialog-content {
  animation: fadeIn 240ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}`}
          </pre>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-[#7B61FF]">
        <CardHeader>
          <CardTitle className="text-[#7B61FF]">Handoff Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">✅ Clean header with 3 submenus (Dashboard, Weekly Planner, Tasks)</p>
          <p className="text-sm">✅ Large purple Add Task button (48x48px) with modal</p>
          <p className="text-sm">✅ User avatar with dropdown (My profile, Settings, Log Out)</p>
          <p className="text-sm">✅ Dashboard with 4 AI Analysis-specific panels</p>
          <p className="text-sm">✅ Weekly Planner without left sidebar</p>
          <p className="text-sm">✅ Functional Login page</p>
          <p className="text-sm">✅ "AI Analysis" submenu removed</p>
          <p className="text-sm">✅ "Add Task" page removed (now a modal)</p>
          <p className="text-sm">✅ Components documented and ready for development</p>
        </CardContent>
      </Card>
    </div>
  )
}
