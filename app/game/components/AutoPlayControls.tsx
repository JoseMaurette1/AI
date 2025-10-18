import React from 'react'
import { Button } from '@/components/ui/button'

type Props = {
  enabled: boolean
  paused: boolean
  speedMs: number
  onToggleEnabled: () => void
  onTogglePaused: () => void
  onSpeedChange: (ms: number) => void
}

export const AutoPlayControls: React.FC<Props> = ({ enabled, paused, speedMs, onToggleEnabled, onTogglePaused, onSpeedChange }) => {
  return (
    <div className="flex items-center gap-2">
      <Button onClick={onToggleEnabled} variant="outline" size="sm">
        {enabled ? 'Disable Auto-play' : 'Enable Auto-play'}
      </Button>
      <Button onClick={onTogglePaused} variant="outline" size="sm" disabled={!enabled}>
        {paused ? 'Resume' : 'Pause'}
      </Button>
      <label className="ml-2 text-sm text-muted-foreground">Speed</label>
      <select
        className="rounded-md border border-input bg-background text-foreground px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        disabled={!enabled}
        value={speedMs}
        onChange={(e) => onSpeedChange(parseInt(e.target.value))}
      >
        <option value={200}>Fast</option>
        <option value={400}>Normal</option>
        <option value={800}>Slow</option>
      </select>
    </div>
  )
}


