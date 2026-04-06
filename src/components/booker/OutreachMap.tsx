'use client'

import { useState } from 'react'
import type { BookerEnquiry } from '@/types'
import { LONDON_NEIGHBOURHOODS } from '@/data/booker-mock'

interface OutreachMapProps {
  enquiries: BookerEnquiry[]
}

const STATUS_COLORS: Record<string, string> = {
  sent: '#CDEA2D',      // primary — awaiting response
  viewed: '#C9A4C3',    // base-deep — seen but no reply
  replied: '#FF2D9B',   // secondary — has response
  declined: '#6B5068',  // text-muted — declined
}

const STATUS_LABELS: Record<string, string> = {
  sent: 'Sent',
  viewed: 'Viewed',
  replied: 'Replied',
  declined: 'Declined',
}

export default function OutreachMap({ enquiries }: OutreachMapProps) {
  const [hoveredPin, setHoveredPin] = useState<string | null>(null)

  // Group enquiries by neighbourhood
  const pinsByNeighbourhood = enquiries.reduce<
    Record<string, { enquiries: BookerEnquiry[]; x: number; y: number }>
  >((acc, enq) => {
    const coords = LONDON_NEIGHBOURHOODS[enq.venue_neighbourhood]
    if (!coords) return acc
    if (!acc[enq.venue_neighbourhood]) {
      acc[enq.venue_neighbourhood] = { enquiries: [], ...coords }
    }
    acc[enq.venue_neighbourhood].enquiries.push(enq)
    return acc
  }, {})

  return (
    <div className="bg-card border-2 border-dark rounded-md overflow-hidden">
      <div className="p-5 border-b-2 border-dark flex items-center justify-between">
        <h2 className="font-display font-extrabold text-xl uppercase text-dark">
          Outreach Map
        </h2>
        <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
          {enquiries.length} {enquiries.length === 1 ? 'enquiry' : 'enquiries'} sent
        </span>
      </div>

      <div className="relative">
        {/* SVG Map of central London */}
        <svg
          viewBox="0 0 400 450"
          className="w-full h-auto"
          style={{ background: '#E0C5DA' }}
        >
          {/* Thames river path (simplified) */}
          <path
            d="M 0 260 Q 80 240 150 255 Q 200 265 240 250 Q 300 235 350 245 Q 380 250 400 245"
            fill="none"
            stroke="#C9A4C3"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Area labels for context */}
          <text x="120" y="100" className="fill-base-deep text-[8px] uppercase tracking-widest font-bold opacity-40">
            North
          </text>
          <text x="120" y="390" className="fill-base-deep text-[8px] uppercase tracking-widest font-bold opacity-40">
            South
          </text>
          <text x="30" y="230" className="fill-base-deep text-[8px] uppercase tracking-widest font-bold opacity-40">
            West
          </text>
          <text x="340" y="230" className="fill-base-deep text-[8px] uppercase tracking-widest font-bold opacity-40">
            East
          </text>

          {/* Neighbourhood pins */}
          {Object.entries(pinsByNeighbourhood).map(([neighbourhood, data]) => {
            const isHovered = hoveredPin === neighbourhood
            const mainStatus = data.enquiries[0].status
            const pinColor = STATUS_COLORS[mainStatus]
            const pinSize = Math.min(8 + data.enquiries.length * 3, 18)

            return (
              <g
                key={neighbourhood}
                onMouseEnter={() => setHoveredPin(neighbourhood)}
                onMouseLeave={() => setHoveredPin(null)}
                className="cursor-pointer"
              >
                {/* Pulse ring for sent/viewed */}
                {(mainStatus === 'sent' || mainStatus === 'viewed') && (
                  <circle
                    cx={data.x}
                    cy={data.y}
                    r={pinSize + 4}
                    fill={pinColor}
                    opacity={0.2}
                  >
                    <animate
                      attributeName="r"
                      from={pinSize + 2}
                      to={pinSize + 10}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.3"
                      to="0"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Pin dot */}
                <circle
                  cx={data.x}
                  cy={data.y}
                  r={isHovered ? pinSize + 2 : pinSize}
                  fill={pinColor}
                  stroke="#1A1A1A"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />

                {/* Count badge */}
                {data.enquiries.length > 1 && (
                  <>
                    <circle
                      cx={data.x}
                      cy={data.y}
                      r={6}
                      fill="#1A1A1A"
                    />
                    <text
                      x={data.x}
                      y={data.y + 1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#FFFFFF"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      {data.enquiries.length}
                    </text>
                  </>
                )}

                {/* Neighbourhood label */}
                <text
                  x={data.x}
                  y={data.y - pinSize - 6}
                  textAnchor="middle"
                  fill="#1A1A1A"
                  fontSize="9"
                  fontWeight="700"
                  className="uppercase"
                  style={{ letterSpacing: '0.05em' }}
                >
                  {neighbourhood}
                </text>

                {/* Tooltip on hover */}
                {isHovered && (
                  <foreignObject
                    x={data.x - 100}
                    y={data.y + pinSize + 8}
                    width={200}
                    height={80}
                  >
                    <div className="bg-dark text-white rounded-md p-2.5 text-[10px] shadow-lg">
                      {data.enquiries.map((enq) => (
                        <div key={enq.id} className="flex items-center justify-between gap-2 mb-1 last:mb-0">
                          <span className="font-bold truncate">{enq.venue_name}</span>
                          <span
                            className="uppercase tracking-widest font-bold px-1.5 py-0.5 rounded text-[8px]"
                            style={{ backgroundColor: STATUS_COLORS[enq.status], color: '#1A1A1A' }}
                          >
                            {STATUS_LABELS[enq.status]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </foreignObject>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="p-4 border-t-2 border-dark flex flex-wrap gap-4">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full border border-dark"
              style={{ backgroundColor: STATUS_COLORS[key] }}
            />
            <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
