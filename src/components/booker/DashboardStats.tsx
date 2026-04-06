'use client'

import type { BookerEnquiry, Proposal } from '@/types'
import { Send, MessageSquare, Eye, XCircle } from 'lucide-react'

interface DashboardStatsProps {
  enquiries: BookerEnquiry[]
  proposals: Proposal[]
  shortlistCount: number
}

export default function DashboardStats({ enquiries, proposals, shortlistCount }: DashboardStatsProps) {
  const totalEnquiries = enquiries.length
  const repliedCount = enquiries.filter((e) => e.status === 'replied').length
  const responseRate = totalEnquiries > 0 ? Math.round((repliedCount / totalEnquiries) * 100) : 0
  const activeProposals = proposals.filter((p) => p.status === 'submitted').length

  const stats = [
    {
      label: 'Enquiries Sent',
      value: totalEnquiries,
      icon: Send,
      accent: 'bg-primary',
    },
    {
      label: 'Response Rate',
      value: `${responseRate}%`,
      icon: Eye,
      accent: 'bg-secondary',
    },
    {
      label: 'Active Proposals',
      value: activeProposals,
      icon: MessageSquare,
      accent: 'bg-primary',
    },
    {
      label: 'Shortlisted',
      value: shortlistCount,
      icon: XCircle,
      accent: 'bg-base-deep',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card border-2 border-dark rounded-md p-4 flex items-center gap-3"
        >
          <div className={`w-10 h-10 flex items-center justify-center ${stat.accent} border-2 border-dark rounded-md`}>
            <stat.icon className="w-4 h-4 text-dark" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold block">
              {stat.label}
            </span>
            <span className="font-display font-extrabold text-2xl text-dark">
              {stat.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
