import React from 'react'
import { useState, useEffect } from 'react'
import { Calendar, CheckSquare, BarChart3, Plus, MoveRight } from 'lucide-react'
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
import WelcomeTutorial from './components/WelcomeTutorial'
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react"; // 👈 Importa el icono

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
  const [showSurvey, setShowSurvey] = useState(true);

  const val_encuesta = [
    { id: 1, label: 'Nada satisfecho' },
    { id: 2, label: 'Poco satisfecho' },
    { id: 3, label: 'Neutral' },
    { id: 4, label: 'satisfecho' },
    { id: 5, label: 'mUy satisfecho' },
  ]

  // Dataset/Users - User database with activities and classes
  const [users, setUsers] = useState<User[]>([
    {
      // User/JohnDoe - Test user with all activitiesnpx tailwindcss -v

      name: 'John Doe',
      email: 'john.doe@mail.com',
      password: '1234',
      classes: [
        {
          id: 'class-1',
          title: 'Mathematics 101',
          days: ['monday', 'wednesday', 'friday'],
          dateFrom: '2025-10-01',
          dateTo: '2025-12-20',
          dayTimes: {
            monday: { start: '09:00', end: '10:30' },
            wednesday: { start: '09:00', end: '10:30' },
            friday: { start: '09:00', end: '10:30' }
          },
          room: 'Room 305',
          professor: 'Dr. Smith',
          color: '#3B82F6'
        },
        {
          id: 'class-2',
          title: 'Chemistry Lab',
          days: ['tuesday', 'thursday'],
          dateFrom: '2025-10-01',
          dateTo: '2025-12-20',
          dayTimes: {
            tuesday: { start: '14:00', end: '16:00' },
            thursday: { start: '14:00', end: '16:00' }
          },
          room: 'Lab 201',
          professor: 'Dr. Johnson',
          color: '#10B981'
        }
      ],
      activities: [
        // Monday 10/7 (Today)
        {
          id: 1,
          title: 'Morning Workout',
          type: 'activity',
          subject: 'Fitness',
          dueDate: '2025-10-07',
          priority: 'medium',
          estimatedTime: 60,
          status: 'in-progress',
          description: 'Cardio and strength training session',
          suggestedStartTime: '07:00'
        },
        {
          id: 2,
          title: 'Math Homework - Chapter 5',
          type: 'homework',
          subject: 'Mathematics',
          dueDate: '2025-10-07',
          priority: 'high',
          estimatedTime: 90,
          status: 'pending',
          description: 'Complete exercises 1-15 on quadratic equations',
          suggestedStartTime: '14:00'
        },
        {
          id: 3,
          title: 'Team Meeting',
          type: 'activity',
          subject: 'Work',
          dueDate: '2025-10-07',
          priority: 'high',
          estimatedTime: 120,
          status: 'pending',
          description: 'Weekly project status meeting',
          suggestedStartTime: '10:00'
        },
        // Tuesday 10/8
        {
          id: 4,
          title: 'Chemistry Lab Report',
          type: 'homework',
          subject: 'Chemistry',
          dueDate: '2025-10-08',
          priority: 'high',
          estimatedTime: 150,
          status: 'pending',
          description: 'Complete lab report on chemical reactions',
          suggestedStartTime: '09:00'
        },
        {
          id: 5,
          title: 'Piano Practice',
          type: 'activity',
          subject: 'Music',
          dueDate: '2025-10-08',
          priority: 'low',
          estimatedTime: 45,
          status: 'pending',
          description: 'Practice scales and Bach invention',
          suggestedStartTime: '18:00'
        },
        {
          id: 6,
          title: 'Reading Assignment',
          type: 'homework',
          subject: 'Literature',
          dueDate: '2025-10-08',
          priority: 'medium',
          estimatedTime: 75,
          status: 'pending',
          description: 'Read chapters 3-5 of assigned novel',
          suggestedStartTime: '15:30'
        },
        // Wednesday 10/9
        {
          id: 7,
          title: 'Physics Problem Set',
          type: 'homework',
          subject: 'Physics',
          dueDate: '2025-10-09',
          priority: 'high',
          estimatedTime: 120,
          status: 'pending',
          description: 'Solve problems 1-20 on momentum and energy',
          suggestedStartTime: '13:00'
        },
        {
          id: 8,
          title: 'Yoga Class',
          type: 'activity',
          subject: 'Fitness',
          dueDate: '2025-10-09',
          priority: 'medium',
          estimatedTime: 90,
          status: 'pending',
          description: 'Evening yoga and meditation session',
          suggestedStartTime: '19:00'
        },
        {
          id: 9,
          title: 'Spanish Vocabulary',
          type: 'homework',
          subject: 'Spanish',
          dueDate: '2025-10-09',
          priority: 'low',
          estimatedTime: 30,
          status: 'pending',
          description: 'Study vocabulary list for upcoming quiz',
          suggestedStartTime: '16:00'
        },
        // Thursday 10/10
        {
          id: 10,
          title: 'History Essay',
          type: 'homework',
          subject: 'History',
          dueDate: '2025-10-10',
          priority: 'high',
          estimatedTime: 180,
          status: 'pending',
          description: 'Write 1000-word essay on World War II causes',
          suggestedStartTime: '09:30'
        },
        {
          id: 11,
          title: 'Grocery Shopping',
          type: 'activity',
          subject: 'Personal',
          dueDate: '2025-10-10',
          priority: 'medium',
          estimatedTime: 60,
          status: 'pending',
          description: 'Weekly grocery shopping trip',
          suggestedStartTime: '17:00'
        },
        {
          id: 12,
          title: 'Art Project',
          type: 'homework',
          subject: 'Art',
          dueDate: '2025-10-10',
          priority: 'medium',
          estimatedTime: 90,
          status: 'pending',
          description: 'Complete watercolor landscape painting',
          suggestedStartTime: '14:00'
        },
        // Friday 10/11
        {
          id: 13,
          title: 'Biology Quiz Prep',
          type: 'homework',
          subject: 'Biology',
          dueDate: '2025-10-11',
          priority: 'high',
          estimatedTime: 105,
          status: 'pending',
          description: 'Review cell structure and photosynthesis',
          suggestedStartTime: '14:30'
        },
        {
          id: 14,
          title: 'Movie Night',
          type: 'activity',
          subject: 'Entertainment',
          dueDate: '2025-10-11',
          priority: 'low',
          estimatedTime: 120,
          status: 'pending',
          description: 'Watch movie with friends',
          suggestedStartTime: '20:00'
        },
        {
          id: 15,
          title: 'Code Review',
          type: 'activity',
          subject: 'Work',
          dueDate: '2025-10-11',
          priority: 'medium',
          estimatedTime: 90,
          status: 'pending',
          description: 'Review teammate\'s code submissions',
          suggestedStartTime: '11:00'
        },
        // Saturday 10/12
        {
          id: 16,
          title: 'House Cleaning',
          type: 'activity',
          subject: 'Personal',
          dueDate: '2025-10-12',
          priority: 'medium',
          estimatedTime: 120,
          status: 'pending',
          description: 'Deep clean kitchen and bathroom',
          suggestedStartTime: '09:00'
        },
        {
          id: 17,
          title: 'Guitar Practice',
          type: 'activity',
          subject: 'Music',
          dueDate: '2025-10-12',
          priority: 'low',
          estimatedTime: 60,
          status: 'pending',
          description: 'Practice new songs for upcoming performance',
          suggestedStartTime: '15:00'
        },
        {
          id: 18,
          title: 'Statistics Assignment',
          type: 'homework',
          subject: 'Mathematics',
          dueDate: '2025-10-12',
          priority: 'medium',
          estimatedTime: 135,
          status: 'pending',
          description: 'Complete statistical analysis problems',
          suggestedStartTime: '13:00'
        },
        // Sunday 10/13
        {
          id: 19,
          title: 'Family Dinner',
          type: 'activity',
          subject: 'Personal',
          dueDate: '2025-10-13',
          priority: 'high',
          estimatedTime: 180,
          status: 'pending',
          description: 'Sunday family dinner at home',
          suggestedStartTime: '18:00'
        },
        {
          id: 20,
          title: 'Week Planning',
          type: 'activity',
          subject: 'Planning',
          dueDate: '2025-10-13',
          priority: 'medium',
          estimatedTime: 45,
          status: 'pending',
          description: 'Plan and organize upcoming week',
          suggestedStartTime: '10:00'
        },
        {
          id: 21,
          title: 'Nature Walk',
          type: 'activity',
          subject: 'Fitness',
          dueDate: '2025-10-13',
          priority: 'low',
          estimatedTime: 90,
          status: 'pending',
          description: 'Relaxing walk in the local park',
          suggestedStartTime: '14:00'
        }
      ]
    },
    {
      // Additional test user with no activities
      name: 'Ana',
      email: 'ana@mail.com',
      password: 'abcd',
      classes: [],
      activities: []
    }
  ])

  // Get current user's data
  const getCurrentUser = () => {
    if (!user) return null
    return users.find(u => u.email === user.email)
  }

  const getUserTasks = () => {
    const currentUser = getCurrentUser()
    return currentUser?.activities || []
  }

  const getUserClasses = () => {
    const currentUser = getCurrentUser()
    return currentUser?.classes || []
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
  setSuccessMessage('Class created successfully')
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
  setSuccessMessage('Class updated successfully')
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
  setSuccessMessage('Class deleted successfully')
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

      <AnimatePresence>
        {showSurvey && (
          <motion.div
            key="survey"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden bg-purple-100 border-b border-purple-300"
          >

            <div className=" mx-auto px-4" style={{
              overflow: "hidden",
              // borderBottom: "1px solid #c4b5fd",
              background: "linear-gradient(to right, #866EFF 0%, white 15%, white 85%, #866EFF 100%)",
            }}>
              <div className="max-w-7xl mx-auto px-4" style={{height: '85px'}}>
                <div className="flex items-center justify-between h-full">
                  {/* <div className="flex items-center gap-4" style={{ marginLeft: '24px' }}> */}
                    <Button
                      onClick={() => setShowSurvey(false)}
                      className="absolute top-2 left-2 text-gray-500 hover:text-gray-700 transition-colors rounded-md p-1"
                      title="Cerrar encuesta"
                      style={{
                        background: "transparent",
                        // border: "none",
                        boxShadow: "none",
                        minHeight: "auto",
                        height: "auto",
                      }}
                    >
                      <X size={20} strokeWidth={2} />
                    </Button>
                    <h5 className="text-lg text-purple-800 text-center">
                      ¿Hoy sentí que la aplicación me ayudó a organizar mis tareas de forma personalizada, redujo mi estrés académico, fue fácil de usar y contribuyó positivamente a mejorar mi desempeño?
                    </h5>
                  {/* </div> */}
                </div>
              </div>
              <div className="max-w-7xl mx-auto px-4" style={{height: '50px'}}>
              <div className="flex items-center justify-center h-full">
                    {val_encuesta.map((day) => (
                      <Button
                        key={day.id}
                        type="button"
                        className="gap-2 bg-[#7B61FF] hover:bg-[#6B51EF] text-white shadow-lg rounded-lg left-px-2 mx-2"
                        size="sm"
                        onClick={() => {}}
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header - Component/Header with official logo */}
      <header className="border-b sticky top-0 z-50 bg-white dark:bg-[#1a1a1a]" style={{ 
        height: '72px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
      }}>
        <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 h-full">
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
        {/* Welcome tutorial for new users (appears once per user) */}
        {user && (
          <WelcomeTutorial userId={user.id ?? user.email} onCreateClassClick={() => {
            // Open the Manage dialog where user can create a class
            setSelectedClassesForDialog(userClasses)
            setSelectedActivitiesForDialog(userTasks)
            setIsEditClassesOpen(true)
          }} />
        )}
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
