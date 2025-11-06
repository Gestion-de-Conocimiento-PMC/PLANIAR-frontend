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
    const startTs = Date.now()
    const ensureMin = async (ms: number) => {
      const diff = Date.now() - startTs
      if (diff < ms) await new Promise(r => setTimeout(r, ms - diff))
    }
    try {
      if (analysisType === 'schedule') {
        // parse ICS using ical.js dynamically
        const text = await fileToAnalyze.text()
        let ICAL: any = null
        try {
          const mod = await import('ical.js')
          ICAL = mod && (mod.default || mod)
        } catch (e) {
          throw new Error("Missing dependency 'ical.js'. Please run 'npm i ical.js' to enable .ics parsing.")
        }

        const jcalData = ICAL.parse(text)
        const comp = new ICAL.Component(jcalData)
        const events = comp.getAllSubcomponents('vevent')

        const items = events.map((ev: any, i: number) => {
          const vevent = new ICAL.Event(ev)
          const start = vevent.startDate.toJSDate()
          const end = vevent.endDate.toJSDate()
          const title = vevent.summary || vevent.description || 'Untitled Event'
          const locationRaw = vevent.location || ''
          // Extract the room after 'Salón:' or 'Salon:' (case-insensitive, accents)
          let location = ''
          try {
            const m = String(locationRaw).match(/Sal[oó]n:\s*([^\n\r]+)/i)
            if (m && m[1]) location = m[1].trim()
            else location = locationRaw.toString().trim()
          } catch (e) {
            location = locationRaw.toString().trim()
          }
          const description = vevent.description || ''

          // Robust instructor extraction: prefer the 'Instructor:' line and parse multiple entries
          let instructor = ''
          const descStr = String(description || '')

          // Try to extract the whole Instructor: line first
          const instLineMatch = descStr.match(/Instructor:\s*([^\n\r]+)/i)
          if (instLineMatch && instLineMatch[1]) {
            const instRaw = instLineMatch[1].trim()

            // Simpler pairwise parser: split on escaped commas and pair surname parts with following token(s)
            const splitParts = instRaw.split(/\\,\s*/)
            const partsOut: string[] = []
            let j = 0
            while (j < splitParts.length - 1) {
              const rawLast = splitParts[j].replace(/\\n/g, ' ').replace(/\\r/g, ' ').replace(/\\/g, '').trim()
              let next = splitParts[j + 1]
              next = next.replace(/\\n/g, ' ').replace(/\\r/g, ' ').trim()

              let firstCandidate = ''
              let leftover = ''
              const parenIdx = next.indexOf(')')
              if (parenIdx !== -1) {
                const before = next.slice(0, parenIdx + 1).trim()
                firstCandidate = before
                leftover = next.slice(parenIdx + 1).trim()
              } else {
                const toks = next.split(/\s+/)
                firstCandidate = toks[0] || ''
                leftover = toks.slice(1).join(' ')
              }

              if (leftover) {
                splitParts[j + 1] = leftover
              } else {
                j = j + 1
              }

              const lastClean = rawLast.replace(/,+$/g, '').trim()
              let firstClean = firstCandidate.replace(/\([^)]*\)/g, '').trim()
              const principal = /\(\s*Principal\s*\)/i.test(firstCandidate)
              const lastParts = lastClean.split(/\s+/).filter(Boolean)
              const surnameDisplay = (principal && lastParts.length > 1) ? lastParts.slice().reverse().join(' ') : lastClean
              if (firstClean) partsOut.push(`${firstClean} ${surnameDisplay}`.trim())

              j = j + 1
            }

            if (partsOut.length > 0) instructor = partsOut.join(', ')
            else instructor = instRaw.replace(/\\/g, '').trim()
          }

          // Helper to clean common organizer/attendee values and remove emails
          const cleanName = (raw: any) => {
            if (!raw) return ''
            let s = String(raw)
            // If value contains CN=... extract it
            const mcn = s.match(/CN=([^:;\n\r]+)/i)
            if (mcn && mcn[1]) s = mcn[1].trim()
            // Remove mailto: and email parts
            s = s.replace(/mailto:/i, '')
            // If contains ':' separate parts and pick the human-friendly one
            if (s.includes(':')) {
              const parts = s.split(':').map(p => p.trim())
              const candidate = parts.find(p => /[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(p) && !/@/.test(p))
              if (candidate) s = candidate
              else s = parts[0]
            }
            // Remove angle-bracket emails and trailing emails
            s = s.replace(/<[^>]+>/g, '').replace(/\s*[^\s@]+@[^\s@]+\.[^\s@]+/g, '').trim()
            // Convert "Last, First" -> "First Last"
            const commaMatch = s.match(/^([^,]+),\s*(.+)$/)
            if (commaMatch) s = `${commaMatch[2].trim()} ${commaMatch[1].trim()}`
            return s.trim()
          }

          // If we didn't get instructor from the Instructor: line, fallback to previous heuristics
          if (!instructor) {
            const tryPatterns = [
              /Instructor:\s*([^\n\r]+)/i,
              /Profesor?:\s*([^\n\r]+)/i,
              /Prof:\s*([^\n\r]+)/i,
              /Docente:\s*([^\n\r]+)/i,
            ]

            for (const p of tryPatterns) {
              const mm = descStr.match(p)
              if (mm && mm[1]) {
                instructor = mm[1].trim()
                break
              }
            }
          }

          // If not found yet, try organizer / attendee / summary
          if (!instructor) {
            try {
              const orgVal = (vevent as any).organizer || (ev && typeof ev.getFirstPropertyValue === 'function' && ev.getFirstPropertyValue('organizer'))
              if (orgVal) instructor = cleanName(orgVal)
            } catch (e) {
              // ignore
            }
          }

          if (!instructor) {
            try {
              const att = (ev && typeof ev.getAllProperties === 'function') ? ev.getAllProperties('attendee') : null
              if (att && att.length > 0) {
                for (const a of att) {
                  const v = typeof a.getParameters === 'function' ? a.getParameters().cn || a.getValue() : (a && a.toString ? a.toString() : '')
                  const cleaned = cleanName(v)
                  if (cleaned) { instructor = cleaned; break }
                }
              }
            } catch (e) {
              // ignore
            }
          }

          if (!instructor) {
            const mparen = String(title || '').match(/\(([^)]+)\)/)
            if (mparen && mparen[1]) instructor = cleanName(mparen[1])
          }

          instructor = cleanName(instructor)

          const startDay = start.getDay() // 0=Sun..6=Sat
          const startTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          const endTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

          // Try to detect RRULE in the raw VEVENT text to extract BYDAY and UNTIL
          let byday: number[] | null = null
          let untilDateStr: string | null = null
          try {
            const rawComp = ev.toString()
            const rruleMatch = rawComp.match(/RRULE:([^\r\n]+)/i)
            if (rruleMatch && rruleMatch[1]) {
              const params = rruleMatch[1].split(';')
              for (const p of params) {
                const [k, v] = p.split('=')
                if (!k || !v) continue
                const key = k.toUpperCase()
                if (key === 'BYDAY') {
                  const codes = v.split(',').map((s: string) => s.trim()).filter(Boolean) as string[]
                  const map: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 }
                  byday = codes.map((c: string) => map[c] ?? -1).filter((n: number) => n >= 0)
                }
                if (key === 'UNTIL') {
                  // UNTIL often appears as YYYYMMDD or YYYYMMDDTHHMMSSZ
                  const m = v.match(/^(\d{4})(\d{2})(\d{2})/)
                  if (m) untilDateStr = `${m[1]}-${m[2]}-${m[3]}`
                }
              }
            }
          } catch (e) {
            // ignore parsing errors and fall back to single-event dates
          }

          return {
            id: `ics-${i}`,
            type: 'class',
            title,
            summary: title,
            location,
            description,
            instructor,
            start,
            end,
            // prefer BYDAY array when available; otherwise fallback to the start day
            byday: byday || undefined,
            day: startDay,
            startTime,
            endTime,
            dateFrom: start.toISOString().slice(0,10),
            // prefer UNTIL from RRULE when present (end of recurrence series)
            dateTo: untilDateStr || end.toISOString().slice(0,10),
          }
        })
  await ensureMin(1200)
        onAnalysisComplete({ items })
      } else {
        // keep previous simulated behavior for non-schedule types
        // ensure the analyzing indicator is visible for at least 900ms for UX
        setTimeout(async () => {
          await ensureMin(900)
          onAnalysisComplete({ items: [] })
          setIsAnalyzing(false)
        }, 200)
      }
    } catch (err: any) {
      setIsAnalyzing(false)
      onAnalysisComplete({ items: [] })
      console.error(err)
    } finally {
      setIsAnalyzing(false)
    }
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
                    {analysisType === 'schedule' ? 'Supported: .ics files only' : 'Supported: PDF, DOCX, XLSX, Images (max 10MB)'}
                  </p>
                </div>
              </div>
            )}
          </label>
          
          {file && !isAnalyzing && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
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
