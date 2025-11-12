import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { X } from 'lucide-react'
import { APIPATH } from '../lib/api'

interface SurveyBannerProps {
  userId?: string | number | null
}

const SurveyBanner: React.FC<SurveyBannerProps> = ({ userId }) => {
  const [showSurvey, setShowSurvey] = useState(true)
  const [surveyValue, setSurveyValue] = useState<number | null>(null)

  const colors = [
    '#DC2626', // red (7)
    '#F97316', // orange (6)
    '#F59E0B', // amber (5)
    '#FACC15', // yellow (4)
    '#86EFAC', // light green (3)
    '#34D399', // green (2)
    '#10B981' // emerald (1)
  ]

  const submitAnswer = async (value: number) => {
    setSurveyValue(value)
    // try to POST to backend if userId available
    if (!userId) {
      // no user id: just close and notify
      window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: 'Answer saved locally (no user).' } }))
      setTimeout(() => setShowSurvey(false), 200)
      return
    }

    try {
      const url = APIPATH(`/surveys/user/${userId}`)
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: value })
      })
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: 'Thank you for answering the survey.' } }))
        // persist a quick marker locally to avoid re-showing immediately
        try {
          const today = new Date()
          const yyyy = today.getFullYear()
          const mm = String(today.getMonth() + 1).padStart(2, '0')
          const dd = String(today.getDate()).padStart(2, '0')
          const todayISO = `${yyyy}-${mm}-${dd}`
          const key = `planiar:surveyAnswered:${userId ?? 'anon'}`
          localStorage.setItem(key, todayISO)
        } catch (e) {}
      } else {
  let errMsg = 'No se pudo guardar la respuesta. / Could not save the answer.'
        try {
          const body = await res.json()
          errMsg = body?.error || body?.message || errMsg
        } catch (e) {}
        window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: errMsg } }))
      }
    } catch (e: any) {
  window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message:'Error sending survey: ' + (e?.message || e) } }))
    } finally {
      // show a brief selection feedback then close
      setTimeout(() => setShowSurvey(false), 250)
    }
  }

  // Ensure user can only answer once per day
  useEffect(() => {
    const checkAnsweredToday = async () => {
      const today = new Date()
      const yyyy = today.getFullYear()
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const dd = String(today.getDate()).padStart(2, '0')
      const todayISO = `${yyyy}-${mm}-${dd}`

      // If userId provided, query backend for user's surveys and check dates
      if (userId) {
        try {
          const res = await fetch(APIPATH(`/surveys/user/${userId}`))
          if (res.ok) {
            const list = await res.json()
            if (Array.isArray(list)) {
              const answeredToday = list.some((s: any) => {
                if (!s) return false
                const d = s.date || s.createdAt || s.created_at || s.dateSubmitted || ''
                if (!d) return false
                // expect backend LocalDate 'YYYY-MM-DD' or ISO string
                return String(d).startsWith(todayISO)
              })
              if (answeredToday) {
                setShowSurvey(false)
                return
              }
            }
          }
        } catch (e) {
          // ignore backend error and fallback to local storage check
        }
      }

      // Fallback: check localStorage (for anonymous users or failed backend calls)
      try {
        const key = `planiar:surveyAnswered:${userId ?? 'anon'}`
        const stored = localStorage.getItem(key)
        if (stored === todayISO) {
          setShowSurvey(false)
        }
      } catch (e) {
        // ignore storage errors
      }
    }

    checkAnsweredToday()
  }, [userId])

  if (!showSurvey) return null

  return (
    <div key="survey" className="overflow-hidden bg-purple-100 border-b border-purple-300 transition-all duration-300 ease-in-out">
      <div
        className="mx-auto px-4 py-3 md:py-4"
        style={{
          overflow: 'hidden',
          background:
            'linear-gradient(90deg, rgba(134,110,255,0.95) 0%, rgba(255,255,255,0.0) 10%, rgba(255,255,255,0.0) 90%, rgba(134,110,255,0.95) 100%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          <div className="flex items-center justify-center relative">
            <Button
              onClick={() => setShowSurvey(false)}
              className="absolute left-2 top-2 text-gray-500 hover:text-gray-700 transition-colors rounded-md p-2 z-10"
              title="Cerrar encuesta"
              style={{ background: 'transparent', boxShadow: 'none', minHeight: 'auto', height: 'auto' }}
            >
              <X size={18} strokeWidth={2} />
            </Button>
            <div className="text-center max-w-full md:max-w-4xl mx-auto px-2 leading-tight">
              <h5 className="text-sm md:text-base lg:text-lg text-purple-800 font-bold">
                Today it was easy to use the app to organize my tasks and it helps me improve my performance.
              </h5>
            </div>
          </div>

          <div className="mt-3 md:mt-4">
            <div className="max-w-lg mx-auto">
              {/* Numbers row */}
              <div className="flex text-center text-xs md:text-sm font-semibold mb-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-1 select-none">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Color bar with 7 selectable segments laid out horizontally */}
              <div className="flex rounded-md overflow-hidden flex-nowrap" role="radiogroup" aria-label="Encuesta de satisfacción / Satisfaction survey">
                {colors.map((c, idx) => {
                  const value = idx + 1
                  const selected = surveyValue === value
                  return (
                    <button
                      key={idx}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => submitAnswer(value)}
                      className={`flex-1 h-6 lg:h-5 focus:outline-none transform transition duration-150 ease-out hover:scale-105 hover:shadow-lg ${idx === 0 ? 'rounded-l-md' : ''} ${idx === 6 ? 'rounded-r-md' : ''} relative`}
                      style={{ backgroundColor: c, minWidth: 0 }}
                      title={`${value} - ${value === 1 ? 'Strongly disagree' : value === 7 ? 'Strongly agree' : ''}`}
                    >
                      {selected && <span className="absolute inset-0 ring-2 ring-white/60" aria-hidden />}
                    </button>
                  )
                })}
              </div>

              {/* Labels below bar - added extra bottom spacing */}
              <div className="flex justify-between text-xs md:text-sm mt-3 md:mt-4 mb-2 md:mb-4 font-bold text-purple-800">
                <div className="max-w-[45%] truncate">Strongly disagree</div>
                <div className="max-w-[45%] text-right truncate">Strongly agree</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SurveyBanner
