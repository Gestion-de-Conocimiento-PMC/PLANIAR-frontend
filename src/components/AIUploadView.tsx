import { useState } from 'react'
import { Upload as UploadIcon, Sparkles, X } from 'lucide-react'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'

interface AIUploadViewProps {
  onAnalysisComplete: (suggestions: any) => void
  analysisType: 'class' | 'activity' | 'schedule'
  description?: string
}

export function AIUploadView({ onAnalysisComplete, analysisType, description }: AIUploadViewProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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
    setIsAnalyzing(true)
    
    // Simulate AI analysis with different results based on type
    setTimeout(() => {
      let suggestions = {}
      
      if (analysisType === 'class') {
        suggestions = {
          title: 'Advanced Mathematics',
          days: ['monday', 'wednesday', 'friday'],
          daySchedule: {
            monday: { start: '09:00', end: '10:30', room: 'Room 305', professor: 'Dr. Smith' },
            wednesday: { start: '09:00', end: '10:30', room: 'Room 305', professor: 'Dr. Smith' },
            friday: { start: '09:00', end: '10:30', room: 'Lab 201', professor: 'Dr. Johnson' }
          },
          color: '#3B82F6',
          dateFrom: '2025-10-01',
          dateTo: '2025-12-20'
        }
      } else if (analysisType === 'activity') {
        suggestions = {
          title: 'Yoga & Meditation Sessions',
          days: ['monday', 'wednesday', 'friday'],
          dayTimes: {
            monday: { start: '18:00', end: '19:30' },
            wednesday: { start: '18:00', end: '19:30' },
            friday: { start: '18:00', end: '19:30' }
          },
          description: 'Evening relaxation and mindfulness practice',
          color: '#10B981'
        }
      } else if (analysisType === 'schedule') {
        suggestions = {
          linkedClass: 'class-1',
          items: [
            {
              type: 'task',
              title: 'Math Homework - Chapter 5',
              subject: 'Mathematics',
              dueDate: '2025-10-15',
              priority: 'high',
              estimatedTime: 90
            },
            {
              type: 'task',
              title: 'Chemistry Lab Report',
              subject: 'Chemistry',
              dueDate: '2025-10-16',
              priority: 'high',
              estimatedTime: 120
            }
          ]
        }
      }
      
      setIsAnalyzing(false)
      onAnalysisComplete(suggestions)
    }, 2500)
  }

  const removeFile = () => {
    setFile(null)
    setIsAnalyzing(false)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="space-y-2">
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
            accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg"
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
                    Supported: PDF, DOCX, XLSX, Images (max 10MB)
                  </p>
                </div>
              </div>
            )}
          </label>
          
          {file && !isAnalyzing && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e: React.FormEvent<HTMLFormElement>) => {
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
      </div>

      {/* Analyzing State */}
      {isAnalyzing && (
        <Alert className="border-[#7B61FF] bg-[#7B61FF]/5">
          <Sparkles className="h-4 w-4 text-[#7B61FF] animate-pulse" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Analyzing with AI...</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#7B61FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[#7B61FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[#7B61FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
