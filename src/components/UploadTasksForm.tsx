import { useState } from 'react'
import { ChevronLeft, Upload } from 'lucide-react'
import { DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card } from './ui/card'
import { Checkbox } from './ui/checkbox'
import { AIUploadView } from './AIUploadView'

interface UploadTasksFormProps {
  onBack: () => void
  existingClasses: any[]
  onCreateTask: (taskData: any) => void
}

export function UploadTasksForm({ onBack, existingClasses, onCreateTask }: UploadTasksFormProps) {
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)

  // When AIUploadView completes, it calls this with { items }
  const handleAIComplete = (data: any) => {
    // For tasks upload we simulate friendly parsed tasks if the analyzer returns empty
    const items = data?.items || []
    if (items.length > 0) {
      // Map incoming items to task-like suggestions if needed
      const mapped = items.map((it: any, i:number) => ({ id: `ai-${i}`, title: it.title || it.summary || 'Task', dueDate: it.date || null, notes: it.description || '', selected: true }))
      setAnalysisResults(mapped)
      return
    }

    // Fallback simulated results for demo
    setLoading(true)
    setTimeout(() => {
      const sample = [
        { id: 't1', title: 'Read Chapter 1 - Intro', dueDate: new Date().toISOString().slice(0,10), notes: 'Pages 1-20', selected: true },
        { id: 't2', title: 'Solve problem set 1', dueDate: new Date(Date.now()+3*24*3600*1000).toISOString().slice(0,10), notes: 'Problems 1-10', selected: true },
        { id: 't3', title: 'Group meeting notes upload', dueDate: '', notes: 'Discuss project', selected: true }
      ]
      setAnalysisResults(sample)
      setLoading(false)
    }, 600)
  }

  const toggleSelect = (id: string) => {
    setAnalysisResults((prev:any) => prev?.map((r:any)=> r.id===id ? { ...r, selected: !r.selected } : r) || prev)
  }

  const updateItem = (id: string, field: string, value: string) => {
    setAnalysisResults((prev:any) => prev?.map((r:any)=> r.id===id ? { ...r, [field]: value } : r) || prev)
  }

  const handleSubmit = () => {
    if (!analysisResults) return
    const selected = analysisResults.filter(r=>r.selected)
    // Call onCreateTask for each simulated task
    selected.forEach(task => {
      const payload = {
        title: task.title,
        dueDate: task.dueDate || null,
        notes: task.notes,
        classId: selectedClass,
      }
      onCreateTask(payload)
    })
    // Optionally reset
    setAnalysisResults(null)
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <DialogTitle>Upload Tasks</DialogTitle>
            <DialogDescription>Upload a file (pdf, docx, txt) and attach tasks to a class</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="mt-4 space-y-4">
        <div>
          <Label>Link to Class <span className="text-destructive">*</span></Label>
          <div className="flex items-center gap-2">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue>
                  {/* When a class is selected, Radix will render the selected item's content here (including color dot from SelectItem) */}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {existingClasses.map((c:any)=> (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                      <div>{c.title}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground mt-1">You must select the class related to the uploaded tasks.</p>
        </div>

        <div>
          <Label>File</Label>
          <AIUploadView analysisType="activity" onAnalysisComplete={handleAIComplete} description="Upload a file to extract tasks (demo)" />
          <p className="text-xs text-muted-foreground mt-2">Supported formats: pdf, docx, doc, txt. The analyzer will run after you add a file. Class selection is required.</p>
        </div>

        {analysisResults && (
          <div className="space-y-2 mt-2 max-h-[50vh] overflow-y-auto pr-2">
            {analysisResults.map(item => (
              <Card key={item.id} className="p-3">
                <div className="flex items-start gap-3">
                  <Checkbox checked={item.selected} onCheckedChange={() => toggleSelect(item.id)} className="mt-1" />
                  <div className="flex-1">
                    <input value={item.title} onChange={(e)=> updateItem(item.id, 'title', e.target.value)} className="w-full bg-transparent font-medium focus:outline-none" />
                    <div className="mt-2 flex gap-2 text-sm text-muted-foreground">
                      <input type="date" value={item.dueDate || ''} onChange={(e)=> updateItem(item.id, 'dueDate', e.target.value)} className="bg-transparent" />
                      <input value={item.notes} onChange={(e)=> updateItem(item.id, 'notes', e.target.value)} placeholder="Notes" className="bg-transparent flex-1" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-background border-t mt-4 -mx-2 px-2 py-3">
              <Button variant="outline" onClick={onBack}>Back</Button>
              <Button onClick={handleSubmit} className="bg-[#7B61FF] hover:bg-[#6B51EF]">Create Tasks</Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default UploadTasksForm
