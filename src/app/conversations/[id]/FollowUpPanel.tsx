'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FOLLOW_UP_QUESTIONS } from '@/types'

export default function FollowUpPanel({
  conversationId,
  eventType,
}: {
  conversationId: string
  eventType: string
}) {
  const router = useRouter()
  const [selectedQuestion, setSelectedQuestion] = useState('')
  const [freeText, setFreeText] = useState('')
  const [sending, setSending] = useState(false)

  const questions = FOLLOW_UP_QUESTIONS[eventType] ?? FOLLOW_UP_QUESTIONS['Other']

  async function send(text: string) {
    if (!text.trim()) return
    setSending(true)

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: conversationId,
        from_type: 'booker',
        message_text: text.trim(),
      }),
    })

    setSelectedQuestion('')
    setFreeText('')
    setSending(false)
    router.refresh()
  }

  return (
    <div className="bg-white border-2 border-dark rounded-2xl p-5">
      <h3 className="font-display font-bold text-lg uppercase text-dark mb-4">
        Ask a question
      </h3>

      {/* Pre-defined questions */}
      <div className="space-y-2 mb-4">
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => setSelectedQuestion(q === selectedQuestion ? '' : q)}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
              selectedQuestion === q
                ? 'border-secondary bg-secondary/10 text-dark'
                : 'border-dark/30 bg-white text-dark hover:border-dark hover:bg-base'
            }`}
          >
            {q}
          </button>
        ))}
      </div>

      {selectedQuestion && (
        <div className="mb-4 p-3 bg-base rounded-xl border-2 border-dark/20 text-sm text-dark">
          <span className="font-medium">Selected: </span>{selectedQuestion}
        </div>
      )}

      {/* Free text */}
      <div className="mb-4">
        <textarea
          value={freeText}
          onChange={(e) => { setFreeText(e.target.value); setSelectedQuestion('') }}
          placeholder="Or type your own question…"
          rows={3}
          className="w-full border-2 border-dark/30 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-dark text-sm"
        />
      </div>

      <button
        onClick={() => send(freeText.trim() || selectedQuestion)}
        disabled={sending || (!selectedQuestion && !freeText.trim())}
        className="w-full bg-dark text-white font-display font-bold uppercase py-3.5 rounded-xl hover:bg-secondary transition-colors disabled:opacity-40"
      >
        {sending ? 'Sending…' : 'Send question →'}
      </button>

      <p className="text-xs text-text-muted text-center mt-3">
        Felicity will follow up with the venue on your behalf.
      </p>
    </div>
  )
}
