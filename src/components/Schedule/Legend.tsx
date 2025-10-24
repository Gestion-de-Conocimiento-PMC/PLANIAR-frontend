export function ScheduleLegend() {
  return (
    <div className="flex flex-wrap items-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded border-2 border-[#7B61FF] bg-[#7B61FF]/20" />
        <span className="text-foreground">Fixed Classes</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded border-2 border-dashed border-[#7B61FF] bg-[#7B61FF]/15" />
        <span className="text-foreground">Scheduled Tasks</span>
      </div>
    </div>
  )
}
