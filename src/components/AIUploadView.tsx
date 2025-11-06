import React, { useState, useEffect } from 'react'
import { Upload as UploadIcon, Sparkles, X } from 'lucide-react'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import ICAL from 'ical.js'

interface AIUploadViewProps {
  onAnalysisComplete: (data: any) => void
  analysisType: 'class' | 'activity' | 'schedule'
  description?: string
  existingClasses?: { id: string; title: string; color?: string }[]
}

export function AIUploadView({ onAnalysisComplete, analysisType, description, existingClasses = [] }: AIUploadViewProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // --- Efecto de progreso simulado ---
  useEffect(() => {
    let interval: any
    if (isAnalyzing) {
      setProgress(0)
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + Math.random() * 10 // Incremento variable para hacerlo más natural
        })
      }, 200)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isAnalyzing])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      analyzeFile(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      analyzeFile(selectedFile)
    }
  }

  const analyzeFile = async (fileToAnalyze: File) => {
    setError(null)
    setIsAnalyzing(true)

    try {
      if (analysisType === 'schedule') {
        await analyzeICS(fileToAnalyze)
      } else {
        // Simulación de análisis para los otros tipos
        await new Promise((res) => setTimeout(res, 3000))
        onAnalysisComplete({ success: true })
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error analyzing file')
    } finally {
      setTimeout(() => setIsAnalyzing(false), 500)
    }
  }

  const analyzeICS = async (file: File) => {
    if (!file.name.endsWith('.ics')) throw new Error('Invalid file type. Only .ics supported')

    const text = await file.text()
    const jcalData = ICAL.parse(text)
    const comp = new ICAL.Component(jcalData)
    const events = comp.getAllSubcomponents('vevent')

    const items = events.map((ev: any, i: number) => {
      const vevent = new ICAL.Event(ev)
      const start = vevent.startDate.toJSDate()
      const end = vevent.endDate.toJSDate()
      const title = vevent.summary || 'Untitled Event'
      const location = vevent.location || 'N/A'
      const startDay = start.toLocaleDateString(undefined, { weekday: 'long' })
      const startTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const endTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      const match = existingClasses.find(cls =>
        title.toLowerCase().includes(cls.title.toLowerCase())
      )

      return {
        id: `ics-${i}`,
        type: 'class',
        title,
        subject: location,
        days: [startDay],
        dateFrom: start,
        dateTo: end,
        times: { start: startTime, end: endTime },
        color: match?.color || '#7B61FF',
        selected: true,
        linkedClass: match ? match.id : null
      }
    })

    onAnalysisComplete({ linkedClass: null, items })
  }

  const removeFile = () => {
    setFile(null)
    setError(null)
    setIsAnalyzing(false)
  }

  return (
    <div className="space-y-4">
      {description && <Label className="text-sm text-muted-foreground">{description}</Label>}

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
          isDragging
            ? 'border-[#7B61FF] bg-[#7B61FF]/5 scale-105'
            : file
              ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
              : 'border-border hover:border-[#7B61FF]/50 hover:bg-muted/30'
        }`}
      >
        <input
          id="ai-file-upload"
          type="file"
          accept={analysisType === 'schedule' ? '.ics' : '.pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg'}
          onChange={handleFileChange}
          className="hidden"
        />

        <label htmlFor="ai-file-upload" className="cursor-pointer block">
          {file ? (
            <div className="space-y-3">
              <UploadIcon className="w-16 h-16 mx-auto text-green-500" />
              <div>
                <p className="font-medium text-green-600 dark:text-green-400">{file.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <UploadIcon className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Drag your file here</p>
                <p className="text-sm text-muted-foreground mt-2">or click to browse</p>
              </div>
              <div className="mt-4 pt-4 border-t border-dashed border-muted-foreground/20">
                <p className="text-xs text-muted-foreground">
                  {analysisType === 'schedule' ? 'Supported: .ics files only' : 'Supported: PDF, DOCX, XLSX, Images'}
                </p>
              </div>
            </div>
          )}
        </label>

        {file && !isAnalyzing && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault()
              removeFile()
            }}
            className="mt-4"
          >
            <X className="w-4 h-4 mr-1" />
            Remove File
          </Button>
        )}
      </div>

      {/* --- Estado de análisis con barra de progreso --- */}
      {isAnalyzing && (
        <Alert className="border-[#7B61FF] bg-[#7B61FF]/5">
          <Sparkles className="h-4 w-4 text-[#7B61FF] animate-pulse" />
          <AlertDescription>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-sm">Analyzing file with AI...</span>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7B61FF] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
