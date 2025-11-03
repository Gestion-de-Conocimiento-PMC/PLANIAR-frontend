import { User, Settings, LogOut, GraduationCap } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { useState } from 'react'

interface UserAvatarProps {
  // Accept flexible user shape returned by backend: may contain `name`, `username`, `email`, `registrationDate`, `registeredAt`, etc.
  user: { name?: string; username?: string; email?: string; registrationDate?: string; registeredAt?: string } | null
  onLogout: () => void
  onEditClasses: () => void
}

export function UserAvatar({ user, onLogout, onEditClasses }: UserAvatarProps) {
  const [showProfile, setShowProfile] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  // Derive a human-friendly display name and initials with fallbacks.
  const displayName = (() => {
    if (!user) return 'User'
    if (user.name && user.name.trim().length > 0) return user.name.trim()
    if (user.username && user.username.trim().length > 0) return user.username.trim()
    if (user.email && user.email.trim().length > 0) return user.email.split('@')[0]
    return 'User'
  })()

  const initials = (() => {
    const name = displayName
    // If name contains spaces, take first letter of first two words
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    // Single word: take up to first two characters
    return name.slice(0, 2).toUpperCase()
  })()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative rounded-full p-0 flex items-center gap-2 px-2">
            <Avatar style={{ width: '40px', height: '40px' }} className="border-2 border-[#7B61FF]/20">
              <AvatarFallback className="bg-[#7B61FF] text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm font-medium max-w-[140px] truncate">{displayName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowProfile(true)}>
            <User className="mr-2 h-4 w-4" />
            {"Profile"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowOptions(true)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Options</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>My Profile</DialogTitle>
            <DialogDescription>
              Your personal account information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm">Username</label>
              <p className="text-base">{displayName}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Email</label>
              <p className="text-base">{user?.email || 'user@example.com'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Role</label>
              <p className="text-base">Premium User</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Member since</label>
              <p className="text-base">
                {(() => {
                  const rd = user?.registrationDate || user?.registeredAt || null
                  if (!rd) return '—'
                  const s = String(rd)
                  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
                  let d: Date
                  if (m) d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
                  else d = new Date(s)
                  if (isNaN(d.getTime())) return s
                  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                })()}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Options Dialog */}
      <Dialog open={showOptions} onOpenChange={setShowOptions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Options</DialogTitle>
            <DialogDescription>
              Application configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <label className="text-sm">Notifications</label>
              <div className="text-muted-foreground text-sm">Coming soon...</div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm">Theme</label>
              <div className="text-muted-foreground text-sm">Coming soon...</div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm">Language</label>
              <div className="text-muted-foreground text-sm">English</div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm">Time zone</label>
              <div className="text-muted-foreground text-sm">GMT-5</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
