import { useState } from 'react'
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
import { ImageWithFallback } from './components/figma/ImageWithFallback'
import { AddEventModal } from './components/AddEventModal'
import { EditClassesDialog } from './components/EditClassesDialog'
import { User, TaskActivity, ClassItem } from './types'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [isEditClassesOpen, setIsEditClassesOpen] = useState(false)
  
  // Dataset/Users - User database with activities and classes
  const [users, setUsers] = useState<User[]>([
    {
      // User/JohnDoe - Test user with all activities
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

  // Class Management
  const createClass = (classData: any) => {
    if (!user) return

    const newClass = {
      ...classData,
      id: `class-${Date.now()}`,
      type: 'class'
    }

    setUsers(users.map(u => {
      if (u.email === user.email) {
        return {
          ...u,
          classes: [...(u.classes || []), newClass]
        }
      }
      return u
    }))
  }

  const updateClass = (classId: string, updates: any) => {
    if (!user) return

    setUsers(users.map(u => {
      if (u.email === user.email) {
        return {
          ...u,
          classes: (u.classes || []).map(cls =>
            cls.id === classId ? { ...cls, ...updates } : cls
          )
        }
      }
      return u
    }))
  }

  const deleteClass = (classId: string) => {
    if (!user) return

    setUsers(users.map(u => {
      if (u.email === user.email) {
        return {
          ...u,
          classes: (u.classes || []).filter(cls => cls.id !== classId)
        }
      }
      return u
    }))
  }

  // Activity Management
  const createActivity = (activityData: any) => {
    if (!user) return

    // For recurring activities, we'll store them differently
    // but for now, we'll create task entries for each occurrence
    const newActivity = {
      ...activityData,
      id: `activity-${Date.now()}`,
      type: 'activity'
    }

    setUsers(users.map(u => {
      if (u.email === user.email) {
        return {
          ...u,
          activities: [...u.activities, newActivity]
        }
      }
      return u
    }))
  }

  // Task Management
  const addTask = (newTask: any) => {
    if (!user) return

    const newTaskWithId = { 
      ...newTask, 
      id: Date.now(), 
      status: 'pending' 
    }

    setUsers(users.map(u => {
      if (u.email === user.email) {
        return {
          ...u,
          activities: [...u.activities, newTaskWithId]
        }
      }
      return u
    }))
  }

  const updateTask = (taskId: string | number, updates: any) => {
    if (!user) return

    setUsers(users.map(u => {
      if (u.email === user.email) {
        return {
          ...u,
          activities: u.activities.map(task => 
            task.id === taskId ? { ...task, ...updates } : task
          )
        }
      }
      return u
    }))
  }

  const deleteTask = async (taskId: string | number) => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      console.log(`Task ${taskId} deleted successfully.`);
    } catch (error) {
      console.error(error);
    }
  }

  // Upload Schedule Handler
  const handleUploadSchedule = (scheduleData: any) => {
    if (!user || !scheduleData.suggestions) return

    setUsers(users.map(u => {
      if (u.email === user.email) {
        const newClasses: ClassItem[] = []
        const newActivities: TaskActivity[] = []

        scheduleData.suggestions.forEach((suggestion: any) => {
          if (suggestion.type === 'class') {
            newClasses.push({
              ...suggestion,
              id: `class-${Date.now()}-${Math.random()}`
            })
          } else if (suggestion.type === 'task' || suggestion.type === 'activity') {
            newActivities.push({
              ...suggestion,
              id: Date.now() + Math.random(),
              status: 'pending'
            })
          }
        })

        return {
          ...u,
          classes: [...(u.classes || []), ...newClasses],
          activities: [...u.activities, ...newActivities]
        }
      }
      return u
    }))
  }

  const handleLogin = (userData: any) => {
    setUser(userData)
    setIsLoggedIn(true)
    setShowRegister(false)
  }

  const handleRegister = (userData: any) => {
    const newUser = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      classes: [],
      activities: []
    }
    
    setUsers([...users, newUser])
    setUser(newUser)
    setIsLoggedIn(true)
    setShowRegister(false)
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
    setShowRegister(false)
    setActiveTab('dashboard')
  }

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

  const userTasks = getUserTasks()
  const userClasses = getUserClasses()

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
                onEditClasses={() => setIsEditClassesOpen(true)}
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
              onEditClasses={() => setIsEditClassesOpen(true)}
            />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
          {user && (
            <TaskManager 
              userId={user.id}
              onUpdateTask={updateTask} 
              onDeleteTask={deleteTask} 
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
        onOpenChange={setIsEditClassesOpen}
        classes={userClasses}
        onEditClass={updateClass}
        onDeleteClass={deleteClass}
        onCreateClass={createClass}
      />
    </div>
  )
}
