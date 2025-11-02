import { useState, useEffect } from 'react'
import { Calendar, CheckSquare, BarChart3, Plus } from 'lucide-react'
import { Button } from './components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Badge } from './components/ui/badge'
import { Dashboard } from './components/Dashboard'
import { WeeklyView } from './components/WeeklyView'
import { Schedule } from './components/Page/Schedule'
import { TaskManager } from './components/TaskManager'
import { Login } from './components/Login'
import { Register } from './components/Register'
import { UserAvatar } from './components/UserAvatar'
import { AddEventModal } from './components/AddEventModal'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './components/ui/dialog'
import { APIPATH } from './lib/api'
import { EditClassesDialog } from './components/EditClassesDialog'
import { User, TaskActivity, ClassItem } from './types'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [isEditClassesOpen, setIsEditClassesOpen] = useState(false)
  const [selectedClassesForDialog, setSelectedClassesForDialog] = useState<any[] | null>(null)
  const [selectedActivitiesForDialog, setSelectedActivitiesForDialog] = useState<any[] | null>(null)
  const [selectedItemForDialog, setSelectedItemForDialog] = useState<any | null>(null)
  
  // Data loaded from backend for the current logged user
  const [userClasses, setUserClasses] = useState<any[]>([])
  const [userActivities, setUserActivities] = useState<any[]>([])
  const [loadingUserData, setLoadingUserData] = useState(false)
  // Used to notify child views to refresh data after create/update/delete
  const [dataRefreshKey, setDataRefreshKey] = useState(0)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // Global notification event listener so child components can trigger app-styled dialogs
  useEffect(() => {
    const handler = (e: any) => {
      const msg = e?.detail?.message
      if (msg) {
        setSuccessMessage(String(msg))
        setShowSuccessDialog(true)
      }
    }
    window.addEventListener('planiar:notify', handler as EventListener)
    return () => window.removeEventListener('planiar:notify', handler as EventListener)
  }, [])

  // Load user's classes and activities from backend
  const loadUserData = async (u: any | null) => {
    if (!u) {
      setUserClasses([])
      setUserActivities([])
      return
    }

    setLoadingUserData(true)
    try {
      const idPart = u.id ? u.id : undefined
      const emailPart = u.email ? encodeURIComponent(u.email) : undefined

      // Try endpoints by user id first, then fallback to email-based endpoints
      const classesPaths = idPart ? [APIPATH(`/classes/user/${idPart}`)] : []
      const activitiesPaths = idPart ? [APIPATH(`/activities/user/${idPart}`)] : []
      if (!idPart && emailPart) {
        classesPaths.push(APIPATH(`/classes/user/email/${emailPart}`))
        activitiesPaths.push(APIPATH(`/activities/user/email/${emailPart}`))
      }

      // Fetch classes
      let classes: any[] = []
      for (const p of classesPaths) {
        try {
          const res = await fetch(p)
          if (res.ok) {
            classes = await res.json()
            break
          }
        } catch (e) {
          console.warn('Failed to fetch classes from', p, e)
        }
      }

      // Fetch activities
      let activities: any[] = []
      for (const p of activitiesPaths) {
        try {
          const res = await fetch(p)
          if (res.ok) {
            activities = await res.json()
            break
          }
        } catch (e) {
          console.warn('Failed to fetch activities from', p, e)
        }
      }

      setUserClasses(classes || [])
      setUserActivities(activities || [])
    } finally {
      setLoadingUserData(false)
    }
  }

  // Class Management (backend-aware)
  const createClass = async (classData: any) => {
    if (!user) return
    try {
      // Backend expects POST /api/classes/user/{userId}
      const url = APIPATH(`/classes/user/${user.id}`)
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // send the class entity in the body; user is provided in the path per backend controller
        body: JSON.stringify(classData)
      })
      if (!res.ok) {
        // Try to parse server error payload for a helpful message
        let serverMsg = 'Failed to create class'
        try {
          const errBody = await res.json()
          serverMsg = errBody?.error || errBody?.message || JSON.stringify(errBody)
        } catch (e) {
          try { serverMsg = await res.text() } catch (e) { /* ignore */ }
        }
        // notify user via app notification
        window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: serverMsg } }))
        throw new Error(serverMsg)
      }
      await loadUserData(user)
      setDataRefreshKey(k => k + 1)
      setSuccessMessage('Clase creada correctamente')
      setShowSuccessDialog(true)
    } catch (e) {
      console.error('Error creating class:', e)
      // Ensure the user is notified if not already notified above
      if (e instanceof Error) {
        window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: e.message } }))
      }
    }
  }

  const updateClass = async (classId: string, updates: any) => {
    if (!user) return
    try {
      const res = await fetch(APIPATH(`/classes/${classId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) throw new Error('Failed to update class')
      await loadUserData(user)
      setDataRefreshKey(k => k + 1)
      setSuccessMessage('Clase actualizada correctamente')
      setShowSuccessDialog(true)
    } catch (e) {
      console.error(e)
    }
  }

  const deleteClass = async (classId: string) => {
    if (!user) return
    try {
      const res = await fetch(APIPATH(`/classes/${classId}`), { method: 'DELETE' })
      if (!res.ok) {
        let serverMsg = 'Failed to delete class'
        try {
          const err = await res.json()
          serverMsg = err?.error || err?.message || JSON.stringify(err)
        } catch {}
        window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: serverMsg } }))
        throw new Error(serverMsg)
      }
      await loadUserData(user)
      setDataRefreshKey(k => k + 1)
      setSuccessMessage('Clase eliminada correctamente')
      setShowSuccessDialog(true)
    } catch (e) {
      console.error(e)
      if (e instanceof Error) window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: e.message } }))
    }
  }

  // Activity Management (backend-aware)
  const createActivity = async (activityData: any) => {
    if (!user) return
    try {
      // Backend expects POST /api/activities/user/{userId}
      const res = await fetch(APIPATH(`/activities/user/${user.id}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData)
      })
      if (!res.ok) throw new Error('Failed to create activity')
      await loadUserData(user)
      setDataRefreshKey(k => k + 1)
      setSuccessMessage('Activity created successfully')
      setShowSuccessDialog(true)
    } catch (e) {
      console.error(e)
    }
  }

  const updateActivity = async (activityId: string | number, updates: any) => {
    if (!user) return
    try {
      const res = await fetch(APIPATH(`/activities/${activityId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) throw new Error('Failed to update activity')
      await loadUserData(user)
      setDataRefreshKey(k => k + 1)
      setSuccessMessage('Activity updated successfully')
      setShowSuccessDialog(true)
    } catch (e) {
      console.error(e)
    }
  }

  const deleteActivity = async (activityId: string | number) => {
    if (!user) return
    try {
      // Some backends require a user-scoped delete endpoint for activities.
      // Try the user-scoped route first, then fall back to the generic activity id route.
      const candidateUrls = [
        APIPATH(`/activities/user/${user.id}/${activityId}`),
        APIPATH(`/activities/${activityId}`)
      ]
      let res: Response | null = null
      let lastError: any = null
      for (const url of candidateUrls) {
        try {
          res = await fetch(url, { method: 'DELETE' })
          if (res.ok) break
          // if not ok, capture body for message and continue to next candidate
          lastError = res
        } catch (e) {
          lastError = e
        }
      }
      if (!res || !res.ok) {
        let serverMsg = 'Failed to delete activity'
        try {
          if (lastError && typeof lastError.json === 'function') {
            const err = await lastError.json()
            serverMsg = err?.error || err?.message || JSON.stringify(err)
          } else if (lastError && typeof lastError.text === 'function') {
            serverMsg = await lastError.text()
          } else if (lastError instanceof Error) {
            serverMsg = lastError.message
          }
        } catch {}
        window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: serverMsg } }))
        throw new Error(serverMsg)
      }
      await loadUserData(user)
      setDataRefreshKey(k => k + 1)
      setSuccessMessage('Activity deleted successfully')
      setShowSuccessDialog(true)
    } catch (e) {
      console.error(e)
      if (e instanceof Error) window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: e.message } }))
    }
  }

  // Task Management (backend-aware). Tasks are handled via /tasks endpoints when available.
  const addTask = async (newTask: any) => {
    if (!user) return
    try {
      // Backend expects a user-scoped create for tasks: POST /api/tasks/user/{userId}
      const res = await fetch(APIPATH(`/tasks/user/${user.id}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      })
      if (!res.ok) {
        let serverMsg = 'Failed to add task'
        try {
          const err = await res.json()
          serverMsg = err?.error || err?.message || JSON.stringify(err)
        } catch {}
        window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: serverMsg } }))
        throw new Error(serverMsg)
      }
      await loadUserData(user)
      setDataRefreshKey(k => k + 1)
  // Close the AddEvent modal (if open) and switch to the Tasks tab so the user
  // can immediately see the newly created task.
  setIsAddEventOpen(false)
  setActiveTab('tasks')
      setSuccessMessage('Task created successfully')
      setShowSuccessDialog(true)
    } catch (e) {
      console.error(e)
      if (e instanceof Error) window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: e.message } }))
    }
  }

  const updateTask = async (taskId: string | number, updates: any) => {
    if (!user) return
    try {
      const res = await fetch(APIPATH(`/tasks/${taskId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) throw new Error('Failed to update task')
      await loadUserData(user)
      setDataRefreshKey(k => k + 1)
      setSuccessMessage('Task updated successfully')
      setShowSuccessDialog(true)
    } catch (e) {
      console.error(e)
    }
  }

  const deleteTask = async (taskId: string | number) => {
    if (!user) return;
    try {
      const response = await fetch(APIPATH(`/tasks/${taskId}`), {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
      await loadUserData(user)
      setDataRefreshKey(k => k + 1)
      setSuccessMessage('Task deleted successfully')
      setShowSuccessDialog(true)
    } catch (error) {
      console.error(error);
    }
  }

  // Upload Schedule Handler - POST suggestions to backend then refresh
  const handleUploadSchedule = async (scheduleData: any) => {
    if (!user || !scheduleData?.suggestions) return
    try {
      // POST suggestions to backend /schedule or similar endpoint if available
      const res = await fetch(APIPATH('/schedule/upload'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id ?? user.email, suggestions: scheduleData.suggestions })
      })
      if (!res.ok) {
        // if endpoint not available, try to individually create classes/activities
        for (const suggestion of scheduleData.suggestions) {
          if (suggestion.type === 'class') await createClass(suggestion)
          else await createActivity(suggestion)
        }
      } else {
        await loadUserData(user)
      }
    } catch (e) {
      console.warn('Upload schedule failed, falling back to individual creation', e)
      for (const suggestion of scheduleData.suggestions) {
        if (suggestion.type === 'class') await createClass(suggestion)
        else await createActivity(suggestion)
      }
    }
  }

  const handleLogin = (userData: any) => {
    // Normalize backend response: some APIs return { user: { ... } }
    const normalized = userData && userData.user ? userData.user : userData
    setUser(normalized)
    try {
      localStorage.setItem('planiar_user', JSON.stringify(normalized))
      localStorage.setItem('planiar_logged_in', '1')
    } catch (e) {
      console.warn('Failed to persist user to localStorage', e)
    }
    setIsLoggedIn(true)
    setShowRegister(false)
    // Load classes/activities for this user from backend
    loadUserData(normalized)
  }

  const handleRegister = (userData: any) => {
    // Register via backend if possible
    const doRegister = async () => {
      try {
        const res = await fetch(APIPATH('/users'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
        if (!res.ok) throw new Error('Registration failed')
        const created = await res.json()
        setUser(created)
        localStorage.setItem('planiar_user', JSON.stringify(created))
        localStorage.setItem('planiar_logged_in', '1')
        setIsLoggedIn(true)
        setShowRegister(false)
        await loadUserData(created)
      } catch (e) {
        // Fallback: create a minimal local user object
        const newUser = { name: userData.name, email: userData.email }
        setUser(newUser as any)
        try {
          localStorage.setItem('planiar_user', JSON.stringify(newUser))
          localStorage.setItem('planiar_logged_in', '1')
        } catch (e) {
          console.warn('Failed to persist user to localStorage', e)
        }
        setIsLoggedIn(true)
        setShowRegister(false)
      }
    }
    doRegister()
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
    setShowRegister(false)
    setActiveTab('dashboard')
    try {
      localStorage.removeItem('planiar_user')
      localStorage.removeItem('planiar_logged_in')
    } catch (e) {
      console.warn('Failed to clear localStorage on logout', e)
    }
  }

  // On mount, restore user from localStorage if present
  useEffect(() => {
    try {
      const raw = localStorage.getItem('planiar_user')
      if (raw) {
        const parsed = JSON.parse(raw)
        setUser(parsed)
        setIsLoggedIn(true)
        // load classes/activities for restored user
        loadUserData(parsed)
      }
    } catch (e) {
      console.warn('Failed to restore user from localStorage', e)
    }
  }, [])

  // Show login/register screen if not logged in
  if (!isLoggedIn) {
    if (showRegister) {
      return <Register  
        onShowLogin={() => setShowRegister(false)}
      />
    }
    return <Login
      onLogin={handleLogin} 
      onShowRegister={() => setShowRegister(true)}
    />
  }

  const userTasks = userActivities

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Component/Header with official logo */}
      <header className="border-b sticky top-0 z-50 bg-white dark:bg-[#1a1a1a]" style={{ 
        height: '72px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-4" style={{ marginLeft: '24px' }}>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="logo-hover focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:ring-offset-2 rounded"
                aria-label="Go to Dashboard"
              >
                <img src={new URL('./assets/LogoPLANIAR.png', import.meta.url).toString()} alt="PLANIAR Logo" style={{ height: '48px', width: 'auto' }} />
              </button>
              <Badge variant="secondary" className="hidden md:inline-flex">
                PLANIAR - Smart Productivity Assistant
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              {/* Add Task Button */}
              <Button
                onClick={() => setIsAddEventOpen(true)}
                className="gap-2 bg-[#7B61FF] hover:bg-[#6B51EF] text-white shadow-lg rounded-lg px-4"
                style={{ minHeight: '48px', height: '48px' }}
                title="Add Task"
              >
                <Plus className="w-5 h-5" />
                <span>Add Event</span>
              </Button>
              
              {/* User Avatar */}
              <UserAvatar 
                user={user} 
                onLogout={handleLogout}
                onEditClasses={() => {
                  // When opening from the avatar, explicitly provide the current user's lists
                  setSelectedClassesForDialog(userClasses)
                  setSelectedActivitiesForDialog(userTasks)
                  setIsEditClassesOpen(true)
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="weekly" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Planner</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard 
              userId={user?.id}
              userName={user?.name || ''}
              onAddTask={() => setIsAddEventOpen(true)}
              initialTasks={userTasks}
              dataRefreshKey={dataRefreshKey}
            />
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            <WeeklyView
              userId={user?.id}
            />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
              <Schedule 
                userId={user?.id}
                onUpdateClass={updateClass}
                onDeleteClass={deleteClass}
                onDeleteActivity={deleteActivity}
                // Accepts optional lists so Schedule can open the dialog with the current user's data
                onEditClasses={(classes, activities, itemToEdit) => {
                  // If the Schedule/Grid passes undefined (e.g. running in a mode that doesn't provide
                  // the lists) fall back to the current user's lists so the dialog always shows data.
                  console.debug('Schedule requested EditClasses dialog, classes:', classes?.length, 'activities:', activities?.length, 'itemToEdit:', !!itemToEdit)
                  setSelectedClassesForDialog(classes ?? userClasses)
                  setSelectedActivitiesForDialog(activities ?? userTasks)
                  setSelectedItemForDialog(itemToEdit ?? null)
                  setIsEditClassesOpen(true)
                }}
                existingClasses={userClasses}
                existingActivities={userTasks}
              />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
          {user && (
            <TaskManager 
              userId={user.id}
              onUpdateTask={updateTask} 
              onDeleteTask={deleteTask}
              dataRefreshKey={dataRefreshKey}
            />
          )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Event Modal */}
      {user && (
        <AddEventModal
          open={isAddEventOpen}
          onOpenChange={setIsAddEventOpen}
          onCreateClass={createClass}
          onCreateActivity={createActivity}
          onCreateTask={addTask}
          onUploadSchedule={handleUploadSchedule}
          existingClasses={userClasses}
          userId={user.id}
        />
      )}

      {/* Edit Classes Dialog */}
      <EditClassesDialog
        open={isEditClassesOpen}
        onOpenChange={(open) => {
          setIsEditClassesOpen(open)
          if (!open) {
            // clear any explicitly provided lists when dialog closes
            setSelectedClassesForDialog(null)
            setSelectedActivitiesForDialog(null)
            setSelectedItemForDialog(null)
          }
        }}
        classes={selectedClassesForDialog ?? userClasses}
        activities={selectedActivitiesForDialog ?? userTasks}
        onEditClass={updateClass}
        onDeleteClass={deleteClass}
        onCreateClass={createClass}
        onUploadSchedule={handleUploadSchedule}
        onEditActivity={updateActivity}
        onDeleteActivity={deleteActivity}
        onCreateActivity={createActivity}
        initialEditItem={selectedItemForDialog}
      />

      {/* Success confirmation dialog for class CRUD actions */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{successMessage ?? 'Operation completed'}</DialogTitle>
          </DialogHeader>
          <div className="pt-4" />
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)} className="bg-[#7B61FF] hover:bg-[#6B51EF]">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
