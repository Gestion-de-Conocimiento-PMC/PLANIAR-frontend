import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { ArrowLeft, ArrowRight, BookOpen, ClipboardCheck, CalendarPlus, Users, ListChecks } from 'lucide-react'

interface WelcomeTutorialProps {
  userId: number | string | null
  onCreateClassClick?: () => void
}

export function WelcomeTutorial({ userId, onCreateClassClick }: WelcomeTutorialProps) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const slides = [
    {
      title: 'Welcome to PLANIAR',
      text: 'An AI powered smart assistant to plan tasks and view your schedule with activities and classes. This quick tour will show the essentials so you can get started.',
      icon: BookOpen
    },
    {
      title: 'Create Classes',
      text: 'Define your classes with times, professor and room. You can even import classes from your university schedule using a .ics file to save time!',
      icon: BookOpen,
      image: 'create-class.png'
    },
    {
      title: 'Create Activities',
      text: 'Add activities, set reminders and link them to your classes so everything stays organized.',
      icon: CalendarPlus,
      image: 'create-activity.png'
    },
    {
      title: 'Create Tasks',
      text: 'Create task lists, set due dates and mark items as done to stay on top of your work.',
      icon: ListChecks,
      image: 'create-task.png'
    },
    {
      title: 'Manage Classes & Activities',
      text: 'Edit or remove classes and activities, and view them together in your schedule.',
      icon: ClipboardCheck,
      image: 'manage-classes.png'
    },
    {
      title: 'Manage Tasks',
      text: 'Organize your tasks, prioritize them and track progress over time.',
      icon: ListChecks,
      image: 'manage-tasks.png'
    },
    {
      title: 'Ready to create your first class?',
      text: 'When you are ready you can create a class and start planning your schedule.',
      icon: BookOpen,
      image: 'welcome.png',
      final: true
    }
  ]

  useEffect(() => {
    if (!userId) return
    try {
      const key = `planiar:tutorialSeen:${userId}`
      const seen = localStorage.getItem(key)
      if (!seen) setOpen(true)
    } catch (e) {
      // ignore storage errors and do not block showing tutorial
      setOpen(true)
    }
    // Listen for programmatic requests to show the tutorial again
    const handler = () => {
      setIndex(0)
      setOpen(true)
    }
    window.addEventListener('planiar:showTutorial', handler)
    return () => window.removeEventListener('planiar:showTutorial', handler)
  }, [userId])

  const closePermanent = () => {
    if (userId) {
      try {
        const key = `planiar:tutorialSeen:${userId}`
        localStorage.setItem(key, '1')
      } catch (e) {
        // ignore
      }
    }
    setOpen(false)
  }

  const next = () => setIndex(i => Math.min(i + 1, slides.length - 1))
  const prev = () => setIndex(i => Math.max(i - 1, 0))

  const SlideIcon = slides[index].icon

  // Track resolved image URL and whether it actually loads. If the image file is missing
  // the component will fall back to rendering the icon so the UI is robust when assets
  // are not present.
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null)
  const [imageExists, setImageExists] = useState(false)

  useEffect(() => {
    const imgName = slides[index].image
    if (!imgName) {
      setResolvedImageUrl(null)
      setImageExists(false)
      return
    }

    try {
      const url = new URL(`../assets/tutorial/${imgName}`, import.meta.url).toString()
      setResolvedImageUrl(url)
      // Preload image to confirm it exists; Image onerror will catch 404s.
      const probe = new Image()
      let canceled = false
      probe.onload = () => { if (!canceled) setImageExists(true) }
      probe.onerror = () => { if (!canceled) setImageExists(false) }
      probe.src = url
      return () => { canceled = true; probe.onload = null; probe.onerror = null }
    } catch (e) {
      setResolvedImageUrl(null)
      setImageExists(false)
    }
  }, [index])

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) closePermanent(); setOpen(v) }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            {resolvedImageUrl && imageExists ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolvedImageUrl} alt={slides[index].title} className="w-12 h-12 rounded-md object-cover" />
            ) : (
              // Render lucide-react icons with explicit size/color so they display even when images
              // are not provided or fail to load.
              <SlideIcon size={28} color="#7B61FF" />
            )}
            <DialogTitle>{slides[index].title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{slides[index].text}</p>
          </div>
          {slides[index].final && (
            <div className="mt-4">
              <div className="flex justify-center">
                <Button onClick={() => { if (onCreateClassClick) onCreateClassClick(); closePermanent() }} className="bg-[#10B981] text-white whitespace-nowrap">Create Class</Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prev} disabled={index === 0}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              {slides.map((s, i) => (
                <button key={i} onClick={() => setIndex(i)} className={`w-2 h-2 rounded-full ${i === index ? 'bg-[#7B61FF]' : 'bg-muted'}`} aria-label={`Slide ${i+1}`} />
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={next} disabled={index === slides.length - 1}>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!slides[index].final ? (
              <Button onClick={next} className="bg-[#7B61FF] text-white">Next</Button>
            ) : (
              <div className="ml-auto">
                <Button onClick={closePermanent} className="bg-[#7B61FF] text-white">Done</Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default WelcomeTutorial
