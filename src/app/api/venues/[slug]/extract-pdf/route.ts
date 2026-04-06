import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ExtractedVenueData } from '@/types'

// pdf-parse has no ESM default export — use require
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string; numpages: number }>

const client = new Anthropic()

const FELICITY_SYSTEM_PROMPT = `You are Felicity, an expert event venue data extraction assistant. You will read event brochure PDFs and extract structured venue information.

Extract and return ONLY valid JSON (no markdown, no explanation) with this structure:
{
  "venue_name": "string or null",
  "venue_description": "string or null",
  "contact_email": "string or null",
  "contact_phone": "string or null",
  "spaces": [
    {
      "name": "string (space/room name)",
      "capacity": number or null (max capacity as a single number),
      "base_price": number or null (price per head in £, numeric only),
      "min_spend": number or null (minimum spend in £, numeric only),
      "payment_deposit_pct": number or null (0-100),
      "payment_pay_ahead": boolean,
      "photos": [],
      "description": "string or null (room description)"
    }
  ]
}

Rules:
- Be conservative: only extract data you are confident about
- For capacity: look for "up to X guests" or "accommodates X-Y people" — use the max number
- For pricing: look for "£X per head" or "from £X" — extract numbers only
- For payment terms: look for "deposit", "pay in advance", "%"
- If a field is not found, use null
- If multiple spaces are listed, create one object per space
- Return ONLY JSON, nothing else`

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await params // slug available if needed for logging

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 10MB' }, { status: 400 })
    }

    // Extract text from PDF
    const buffer = Buffer.from(await file.arrayBuffer())
    let pdfText = ''
    try {
      const parsed = await pdfParse(buffer)
      pdfText = parsed.text
    } catch {
      return NextResponse.json(
        { error: "Felicity couldn't read this PDF. Try uploading a clearer scan or fill in manually." },
        { status: 422 }
      )
    }

    if (!pdfText.trim()) {
      return NextResponse.json(
        { error: "Felicity couldn't read this PDF. The file may be image-only. Try uploading a text-based PDF." },
        { status: 422 }
      )
    }

    // Call Anthropic
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: FELICITY_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Extract venue information from this brochure text:\n\n${pdfText.slice(0, 15000)}`,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    let extracted: ExtractedVenueData
    try {
      extracted = JSON.parse(responseText)
    } catch {
      return NextResponse.json(
        { error: "Felicity couldn't parse the brochure. Try uploading a clearer PDF." },
        { status: 422 }
      )
    }

    return NextResponse.json({ data: extracted })
  } catch (err) {
    console.error('extract-pdf error:', err)
    return NextResponse.json({ error: 'Extraction failed. Please try again.' }, { status: 500 })
  }
}
