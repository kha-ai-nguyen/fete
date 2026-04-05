// PHASE 2 — not yet wired to routing
'use client'

import type { TimeSavedData } from '@/types'
import { Zap, Clock, MessageSquare, Send } from 'lucide-react'

function GaugeArc({ percentage }: { percentage: number }) {
  // SVG arc for the gauge — 180-degree semicircle
  const radius = 80
  const strokeWidth = 12
  const cx = 100
  const cy = 95
  const startAngle = Math.PI
  const endAngle = startAngle + Math.PI * (percentage / 100)

  const startX = cx + radius * Math.cos(startAngle)
  const startY = cy + radius * Math.sin(startAngle)
  const endX = cx + radius * Math.cos(endAngle)
  const endY = cy + radius * Math.sin(endAngle)

  const largeArc = percentage > 50 ? 1 : 0

  const bgStartX = cx + radius * Math.cos(startAngle)
  const bgStartY = cy + radius * Math.sin(startAngle)
  const bgEndX = cx + radius * Math.cos(startAngle + Math.PI)
  const bgEndY = cy + radius * Math.sin(startAngle + Math.PI)

  return (
    <svg viewBox="0 0 200 110" className="w-full max-w-[240px]">
      {/* Background track */}
      <path
        d={`M ${bgStartX} ${bgStartY} A ${radius} ${radius} 0 1 1 ${bgEndX} ${bgEndY}`}
        fill="none"
        stroke="#C9A4C3"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Active arc */}
      {percentage > 0 && (
        <path
          d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`}
          fill="none"
          stroke="#CDEA2D"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

export default function TimeSavedMeter({ data }: { data: TimeSavedData }) {
  const maxHours = 40
  const gaugePercentage = Math.min((data.total_hours_saved / maxHours) * 100, 100)
  const speedupFactor = data.manual_avg_response_time_minutes > 0
    ? Math.round(data.manual_avg_response_time_minutes / data.avg_response_time_minutes)
    : 0

  return (
    <div className="space-y-4">
      <h2 className="font-display font-extrabold text-xl uppercase text-dark">
        Time Saved
      </h2>

      {/* Gauge card */}
      <div className="bg-card border-2 border-dark rounded-md p-6">
        <div className="flex flex-col items-center">
          <div className="relative">
            <GaugeArc percentage={gaugePercentage} />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
              <span className="font-display font-extrabold text-3xl text-dark">
                {data.total_hours_saved}h
              </span>
              <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
                Total Saved
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t-2 border-dark/10 text-center">
          <span className="text-sm text-text-muted font-medium">
            <span className="font-display font-extrabold text-dark">{data.hours_this_month}h</span> saved this month
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border-2 border-dark rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 flex items-center justify-center bg-primary border-2 border-dark rounded">
              <Zap className="w-3.5 h-3.5 text-dark" />
            </div>
            <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
              Response Speed
            </span>
          </div>
          <span className="font-display font-extrabold text-2xl text-dark">
            {speedupFactor}x
          </span>
          <span className="text-xs text-text-muted font-medium block">
            faster than manual
          </span>
        </div>

        <div className="bg-card border-2 border-dark rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 flex items-center justify-center bg-primary border-2 border-dark rounded">
              <Clock className="w-3.5 h-3.5 text-dark" />
            </div>
            <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
              Avg Response
            </span>
          </div>
          <span className="font-display font-extrabold text-2xl text-dark">
            {data.avg_response_time_minutes}m
          </span>
          <span className="text-xs text-text-muted font-medium block">
            vs {data.manual_avg_response_time_minutes}m manual
          </span>
        </div>

        <div className="bg-card border-2 border-dark rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 flex items-center justify-center bg-secondary border-2 border-dark rounded">
              <MessageSquare className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
              Auto-Processed
            </span>
          </div>
          <span className="font-display font-extrabold text-2xl text-dark">
            {data.enquiries_auto_processed}
          </span>
          <span className="text-xs text-text-muted font-medium block">
            enquiries handled
          </span>
        </div>

        <div className="bg-card border-2 border-dark rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 flex items-center justify-center bg-secondary border-2 border-dark rounded">
              <Send className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
              Auto-Proposals
            </span>
          </div>
          <span className="font-display font-extrabold text-2xl text-dark">
            {data.proposals_auto_generated}
          </span>
          <span className="text-xs text-text-muted font-medium block">
            proposals generated
          </span>
        </div>
      </div>
    </div>
  )
}
