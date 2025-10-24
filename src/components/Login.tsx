import { useState } from 'react'
import { APIPATH } from '../lib/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { UserNotFoundAlert } from './UserNotFoundAlert'
import { ImageWithFallback } from './figma/ImageWithFallback'

interface LoginProps {
  onLogin: (user: any) => void
  onShowRegister: () => void
}

export function Login({ onLogin, onShowRegister }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showUserNotFound, setShowUserNotFound] = useState(false)
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setShowUserNotFound(false)
    setLoading(true)

    try {
  const response = await fetch(APIPATH('/api/users/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok) {
        // Ahora el backend devuelve directamente el objeto User (no { user: {...} })
        onLogin(data)
      } else {
        console.warn('Login failed:', data.error || data.message)
        setShowUserNotFound(true)
      }
    } catch (err) {
      console.error('Login error:', err)
      setShowUserNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-4 mb-8" style={{ marginTop: '48px' }}>
          <img
            src={new URL('../assets/LogoPLANIAR.png', import.meta.url).toString()}
            alt="PLANIAR Logo"
            className="animate-logo-entrance"
            style={{ height: '90px', width: 'auto' }}
          />
          <span className="text-4xl font-extrabold text-foreground animate-title-pop select-none">
            PLAN
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">IA</span>
            R
          </span>
        </div>

        <Card className="w-full shadow-xl">
          <CardHeader className="space-y-4 text-center pb-8">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to access your smart productivity assistant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {showUserNotFound && (
              <UserNotFoundAlert
                onRegister={() => {
                  setShowUserNotFound(false)
                  onShowRegister()
                }}
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="flex items-center justify-end">
                <button type="button" className="text-sm text-[#7B61FF] hover:underline">
                  Forgot your password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#7B61FF] hover:bg-[#6B51EF] shadow-lg"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button onClick={onShowRegister} className="text-[#7B61FF] hover:underline font-medium">
                  Sign Up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}