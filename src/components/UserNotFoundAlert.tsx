import { AlertCircle } from 'lucide-react'
import { Button } from './ui/button'

interface UserNotFoundAlertProps {
  onRegister: () => void
}

// Modal/UserNotFound - Alert for user not found
export function UserNotFoundAlert({ onRegister }: UserNotFoundAlertProps) {
  return (
    <div className="animate-alert mb-4">
      <div className="bg-[#EDE6FF] dark:bg-[#2D2545] border border-[#7B61FF]/30 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#7B61FF] flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-[#3A3A3A] dark:text-white mb-1">
            User not found
          </h4>
          <p className="text-sm text-[#3A3A3A]/80 dark:text-white/80 mb-3">
            We couldn't find an account with these credentials. Please create an account to continue.
          </p>
          <Button
            onClick={onRegister}
            className="bg-[#7B61FF] hover:bg-[#6B51EF] text-white h-9"
          >
            Register User
          </Button>
        </div>
      </div>
    </div>
  )
}
