import { useState } from 'react'
import { ChevronLeft, Check } from 'lucide-react'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Checkbox } from './ui/checkbox'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import { AIUploadView } from './AIUploadView'

interface UploadScheduleFormProps {
  onSubmit: (data: any) => void
  onBack: () => void
  existingClasses: any[]
}

interface AISuggestion {
  id: string
  type: 'task' | 'class' | 'activity'
  title: string
  dueDate?: string
  subject?: string
  days?: string[]
  dateFrom?: string
  dateTo?: string
  times?: { start: string; end: string }
  color?: string
  selected: boolean
}

export function UploadScheduleForm({ onSubmit, onBack, existingClasses }: UploadScheduleFormProps) {
  const [parentClass, setParentClass] = useState('')
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleAIAnalysis = (aiSuggestions: any) => {
    // Convert AI suggestions to internal format
    const formattedSuggestions: AISuggestion[] = (aiSuggestions.items || []).map((item: any, index: number) => ({
      id: `suggestion-${index}`,
      ...item,
      selected: true
    }))
    
    setSuggestions(formattedSuggestions)
    setShowSuggestions(true)
    
    // Auto-select linked class if provided
    if (aiSuggestions.linkedClass) {
      setParentClass(aiSuggestions.linkedClass)
    }
  }

  const toggleSuggestion = (id: string) => {
    setSuggestions(suggestions.map(s => 
      s.id === id ? { ...s, selected: !s.selected } : s
    ))
  }

  const handleSubmit = () => {
    if (!parentClass) {
      alert('Please select a class to link this schedule to')
      return
    }

    const selectedSuggestions = suggestions.filter(s => s.selected)
    
    onSubmit({
      parentClass,
      suggestions: selectedSuggestions
    })
  }

  if (!showSuggestions) {
    return (
      <>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <DialogTitle>Upload Schedule</DialogTitle>
              <DialogDescription>Import and analyze your schedule with AI</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Link to Class - Required */}
          <div className="space-y-2">
            <Label>
              Link to Class <span className="text-destructive">*</span>
            </Label>
            <Select value={parentClass} onValueChange={setParentClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class..." />
              </SelectTrigger>
              <SelectContent>
                {existingClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cls.color }}
                      />
                      {cls.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose which class this schedule belongs to
            </p>
          </div>

          {/* AI Upload View */}
          <AIUploadView
            onAnalysisComplete={handleAIAnalysis}
            analysisType="schedule"
            description="Upload your syllabus, assignment sheet, or schedule"
          />
        </div>
      </>
    )
  }

  // Suggestions view
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowSuggestions(false)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <DialogTitle>Review AI Suggestions</DialogTitle>
            <DialogDescription>
              Select the items you want to add to your schedule
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="mt-4 space-y-4 max-h-[50vh] overflow-y-auto pr-2" style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        <style>{`
          .space-y-4::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Summary */}
        <Card className="p-4 bg-[#7B61FF]/5 border-[#7B61FF]">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">AI Analysis Complete</p>
              <p className="text-sm text-muted-foreground">
                Found {suggestions.length} items in your schedule
              </p>
            </div>
            <Badge className="bg-[#7B61FF]">
              {suggestions.filter(s => s.selected).length} selected
            </Badge>
          </div>
        </Card>

        {/* Linked Class Display */}
        {parentClass && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Linked to:</span>
            <Badge variant="secondary">
              {existingClasses.find(c => c.id === parentClass)?.title || 'Unknown Class'}
            </Badge>
          </div>
        )}

        {/* Suggestions List */}
        <div className="space-y-2">
          {suggestions.map((suggestion) => (
            <Card
              key={suggestion.id}
              className={`p-4 cursor-pointer transition-all ${
                suggestion.selected 
                  ? 'border-[#7B61FF] bg-[#7B61FF]/5' 
                  : 'border-border hover:border-[#7B61FF]/50'
              }`}
              onClick={() => toggleSuggestion(suggestion.id)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={suggestion.selected}
                  onCheckedChange={() => toggleSuggestion(suggestion.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{suggestion.title}</p>
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.type}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                    {suggestion.subject && <span>Subject: {suggestion.subject}</span>}
                    {suggestion.dueDate && <span>Due: {new Date(suggestion.dueDate).toLocaleDateString()}</span>}
                    {suggestion.days && <span>Days: {suggestion.days.join(', ')}</span>}
                  </div>
                </div>
                {suggestion.selected && (
                  <Check className="w-5 h-5 text-[#7B61FF]" />
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-background border-t mt-4 -mx-2 px-2 py-3">
          <Button variant="outline" onClick={() => setShowSuggestions(false)}>
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#7B61FF] hover:bg-[#6B51EF]"
            disabled={suggestions.filter(s => s.selected).length === 0}
          >
            Add {suggestions.filter(s => s.selected).length} Items
          </Button>
        </div>
      </div>
    </>
  )
}
