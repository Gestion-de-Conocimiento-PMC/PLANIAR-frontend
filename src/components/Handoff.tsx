import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export function Handoff() {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl">AI Planner - Handoff Documentation</h1>
        <p className="text-muted-foreground">
          Documento de entrega con tokens, componentes y notas de interacción
        </p>
      </div>

      <Separator />

      {/* Tokens Section */}
      <Card>
        <CardHeader>
          <CardTitle>Design Tokens</CardTitle>
          <CardDescription>Colores, espaciados y tipografías del sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Colors */}
          <div className="space-y-3">
            <h3 className="font-semibold">Colores</h3>
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
            <h3 className="font-semibold">Espaciados</h3>
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
            <h3 className="font-semibold">Tipografía</h3>
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
          <CardTitle>Componentes Creados/Actualizados</CardTitle>
          <CardDescription>Lista de componentes y sus variantes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">Login</code>
                <Badge>Nuevo</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Componente de inicio de sesión con campos Email y Password
              </p>
              <p className="text-xs">Ubicación: <code>/components/Login.tsx</code></p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">UserAvatar</code>
                <Badge>Nuevo</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Avatar con dropdown: Mi perfil, Opciones, Log Out
              </p>
              <p className="text-xs">Ubicación: <code>/components/UserAvatar.tsx</code></p>
              <p className="text-xs">Variantes: expanded/collapsed</p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">Btn/AddTask</code>
                <Badge variant="secondary">Actualizado</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Botón grande morado (48x48px min) que abre modal
              </p>
              <p className="text-xs">Estados: default, hover, active</p>
              <p className="text-xs">Color: #7B61FF (hover: #6B51EF)</p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">Modal/AddTask</code>
                <Badge>Nuevo</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Popup modal centrado con todos los campos de TaskInput
              </p>
              <p className="text-xs">Animación: fade + translateY(6px), 180-240ms</p>
              <p className="text-xs">Focus trap habilitado</p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">Dashboard</code>
                <Badge variant="secondary">Actualizado</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Contiene 4 panels: Average Task Duration, This Week's Load, Priority Focus, Productivity Recommendations
              </p>
              <p className="text-xs">Ubicación: <code>/components/Dashboard.tsx</code></p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">Panel/AverageTaskDuration</code>
                <Badge>Integrado</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Widget que muestra duración promedio de tareas
              </p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">Panel/ThisWeeksLoad</code>
                <Badge>Integrado</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Widget que muestra carga de trabajo semanal
              </p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">Panel/PriorityFocus</code>
                <Badge>Integrado</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Widget que muestra tareas de alta prioridad pendientes
              </p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">Panel/ProductivityRecommendations</code>
                <Badge>Integrado</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Panel completo con recomendaciones personalizadas
              </p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">WeeklyView</code>
                <Badge variant="secondary">Actualizado</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Planeador semanal sin sidebar. Scroll horizontal habilitado
              </p>
              <p className="text-xs">Sidebar lateral izquierdo eliminado completamente</p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-semibold">DayColumn/TaskCard</code>
                <Badge variant="secondary">Mantenido</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Tarjetas de días con tareas
              </p>
              <p className="text-xs">Variantes: Pending, In Progress, Done (sin cambios)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interaction Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notas de Interacción</CardTitle>
          <CardDescription>Comportamientos y flujos principales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">🔴 Cambios Principales</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Add Task:</strong> Ahora abre modal popup (antigua página eliminada)</li>
                <li><strong>AI Analysis submenu:</strong> Eliminado del header</li>
                <li><strong>Dashboard:</strong> Contiene 4 panels específicos listados arriba</li>
                <li><strong>Weekly Planner:</strong> Sidebar izquierdo completamente eliminado</li>
                <li><strong>Header:</strong> Solo 3 submenús - Dashboard, Weekly Planner, Task</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
              <h4 className="font-semibold mb-2">📱 Flujo de Usuario/Login</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Login (iniciar sesión) → Dashboard</li>
                <li>Avatar → dropdown (Mi perfil / Opciones / Log Out)</li>
                <li>Log Out → vuelve a Login</li>
                <li>Mi perfil: muestra información personal (nombre, correo, rol, fecha)</li>
                <li>Opciones: menú visual sin funcionalidad (próximamente)</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200">
              <h4 className="font-semibold mb-2">⚡ Prototipo de Interacciones</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Botón Add Task:</strong> onClick → abre modal (overlay) con fade animation</li>
                <li><strong>Avatar:</strong> onClick → dropdown expandido/colapsado</li>
                <li><strong>Log Out:</strong> onClick → navega a Login page</li>
                <li><strong>Tabs de header:</strong> navegación entre Dashboard / Weekly Planner / Task</li>
                <li><strong>Weekly Planner:</strong> scroll horizontal habilitado entre días</li>
                <li><strong>Modal Add Task:</strong> focus trap activo, ESC para cerrar</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
              <h4 className="font-semibold mb-2">♿ Accesibilidad</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Focus visible en todos los botones y enlaces</li>
                <li>Modal con focus trap (Tab navega solo dentro del modal)</li>
                <li>Roles ARIA: button, dialog, menu</li>
                <li>Navegación por teclado en Weekly Planner (flechas ←/→)</li>
                <li>Labels apropiados en todos los inputs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notas Técnicas para Desarrollo</CardTitle>
          <CardDescription>Ejemplo de comportamiento del modal Add Task</CardDescription>
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
          <CardTitle className="text-[#7B61FF]">Resumen de Entrega</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">✅ Header limpio con 3 submenús (Dashboard, Weekly Planner, Task)</p>
          <p className="text-sm">✅ Botón Add Task grande morado (48x48px) con modal</p>
          <p className="text-sm">✅ Avatar de usuario con dropdown (Mi perfil, Opciones, Log Out)</p>
          <p className="text-sm">✅ Dashboard con 4 panels específicos de AI Analysis</p>
          <p className="text-sm">✅ Weekly Planner sin sidebar lateral</p>
          <p className="text-sm">✅ Página de Login funcional</p>
          <p className="text-sm">✅ Submenu "AI Analysis" eliminado</p>
          <p className="text-sm">✅ Página "Add Task" eliminada (ahora es modal)</p>
          <p className="text-sm">✅ Componentes documentados y listos para desarrollo</p>
        </CardContent>
      </Card>
    </div>
  )
}
