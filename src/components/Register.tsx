import { useState } from 'react'
import { APIPATH } from '../lib/api'
import { CheckCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { ImageWithFallback } from './figma/ImageWithFallback'

interface RegisterProps {
  onShowLogin: () => void
}

export function Register({ onShowLogin }: RegisterProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!username || !email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
  const response = await fetch(APIPATH('/users'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          admin: false
        })
      })

      if (response.ok) {
        setShowSuccess(true)
        setTimeout(() => onShowLogin(), 1500)
      } else {
        const data = await response.json()
        setError(data.error || 'Error creating account')
      }
    } catch (err) {
      console.error('Register error:', err)
      setError('Network error. Please try again.')
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
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Sign up to start organizing your tasks with AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {showSuccess && (
              <div className="animate-alert">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <h4 className="font-medium text-green-900 dark:text-green-100">
                      Account created successfully!
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-200">
                      Redirecting to login...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="animate-alert">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="JohnDoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 6 characters
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#7B61FF] hover:bg-[#6B51EF] shadow-lg"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  onClick={onShowLogin}
                  className="text-[#7B61FF] hover:underline font-medium"
                >
                  Sign In
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}