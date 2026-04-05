'use client'

import { useState } from 'react'
import { Dialog } from 'radix-ui'
import { X } from 'lucide-react'

export function ClaimModal({ venueName, venueId }: { venueName: string; venueId: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venueId, venueName, name, email, role }),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        const data = await res.json()
        setErrorMsg(data.error ?? 'Something went wrong')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Network error — please try again')
      setStatus('error')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="border-2 border-[#1A1A1A] px-4 py-2 text-sm font-bold uppercase hover:bg-[#CDEA2D]/10 transition-colors">
          Claim this venue
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A] p-6 w-full max-w-md">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Dialog.Title className="font-display font-extrabold uppercase text-xl text-[#1A1A1A]">
                Claim {venueName}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-[#6B5068] mt-1">
                Verified venue owners get a badge on their listing.
              </Dialog.Description>
            </div>
            <Dialog.Close className="border-2 border-[#1A1A1A] p-1 hover:bg-[#CDEA2D]/20 transition-colors ml-4 flex-shrink-0">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          {status === 'success' ? (
            <p className="text-sm font-medium text-green-700 bg-green-50 border-2 border-green-600 p-4">
              Thanks — we&apos;ll verify your details and be in touch within 24 hours.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  Your name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border-2 border-[#1A1A1A] px-3 py-2 text-sm focus:outline-none focus:border-[#CDEA2D] bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  Your email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border-2 border-[#1A1A1A] px-3 py-2 text-sm focus:outline-none focus:border-[#CDEA2D] bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  Your role at this venue
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="Owner, Manager, Events coordinator..."
                  className="w-full border-2 border-[#1A1A1A] px-3 py-2 text-sm focus:outline-none focus:border-[#CDEA2D] bg-white placeholder:text-[#6B5068]/60"
                />
              </div>
              {status === 'error' && (
                <p className="text-sm text-red-600 bg-red-50 border-2 border-red-400 p-3">{errorMsg}</p>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#CDEA2D] text-[#1A1A1A] border-2 border-[#1A1A1A] font-bold uppercase px-6 py-2 hover:bg-[#b8d128] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Sending...' : 'Submit claim'}
              </button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
