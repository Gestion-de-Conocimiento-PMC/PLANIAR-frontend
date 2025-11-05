import React, { useState } from 'react'
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
      window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: 'Respuesta guardada localmente (usuario no identificado).' } }))
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
        window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: 'Gracias por contestar la encuesta.' } }))
      } else {
        let errMsg = 'No se pudo guardar la respuesta.'
        try {
          const body = await res.json()
          errMsg = body?.error || body?.message || errMsg
        } catch (e) {}
        window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: errMsg } }))
      }
    } catch (e: any) {
      window.dispatchEvent(new CustomEvent('planiar:notify', { detail: { message: 'Error al enviar la encuesta: ' + (e?.message || e) } }))
    } finally {
      // show a brief selection feedback then close
      setTimeout(() => setShowSurvey(false), 250)
    }
  }

  if (!showSurvey) return null

  return (
    <div key="survey" className="overflow-hidden bg-purple-100 border-b border-purple-300 transition-all duration-300 ease-in-out">
      <div
        className=" mx-auto px-4"
        style={{
          overflow: 'hidden',
          background:
            'linear-gradient(90deg, rgba(134,110,255,0.95) 0%, rgba(255,255,255,0.0) 10%, rgba(255,255,255,0.0) 90%, rgba(134,110,255,0.95) 100%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4" style={{ height: '85px' }}>
          <div className="flex items-center justify-center h-full relative">
            <Button
              onClick={() => setShowSurvey(false)}
              className="absolute left-2 top-2 text-gray-500 hover:text-gray-700 transition-colors rounded-md p-1 z-10"
              title="Cerrar encuesta"
              style={{ background: 'transparent', boxShadow: 'none', minHeight: 'auto', height: 'auto' }}
            >
              <X size={20} strokeWidth={2} />
            </Button>
            <h5 className="text-lg text-purple-800 text-center max-w-4xl mx-auto px-4">
              Hoy me resultó fácil usar la aplicación para organizar mis tareas y contribuyo positivamente a mejorar mi desempeño.
            </h5>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4" style={{ height: '70px' }}>
          <div className="max-w-xl mx-auto">
            {/* Numbers row */}
            <div className="flex text-center text-sm font-semibold mb-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 select-none">
                  {7 - i}
                </div>
              ))}
            </div>

            {/* Color bar with 7 selectable segments laid out horizontally */}
            <div className="flex rounded-md overflow-hidden flex-nowrap" role="radiogroup" aria-label="Encuesta de satisfacción">
              {colors.map((c, idx) => {
                const value = 7 - idx
                const selected = surveyValue === value
                return (
                  <button
                    key={idx}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => submitAnswer(value)}
                    className={`flex-1 h-5 focus:outline-none transform transition duration-150 ease-out hover:scale-105 hover:shadow-lg ${idx === 0 ? 'rounded-l-md' : ''} ${idx === 6 ? 'rounded-r-md' : ''} relative`}
                    style={{ backgroundColor: c, minWidth: 0 }}
                    title={`${value} - ${idx === 0 ? 'Nada satisfecho' : idx === 6 ? 'Muy satisfecho' : ''}`}
                  >
                    {selected && <span className="absolute inset-0 ring-2 ring-white/60" aria-hidden />}
                  </button>
                )
              })}
            </div>

            {/* Labels below bar - added extra bottom spacing */}
            <div className="flex justify-between text-xs mt-3 mb-4 font-bold text-purple-800">
              <div>Totalmente en desacuerdo</div>
              <div>Totalmente de acuerdo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SurveyBanner
