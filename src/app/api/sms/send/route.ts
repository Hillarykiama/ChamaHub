import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { to, message } = await req.json()

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const apiKey = process.env.AT_API_KEY
    const username = process.env.AT_USERNAME

    if (!apiKey || !username) {
      return NextResponse.json(
        { error: 'SMS service not configured' },
        { status: 503 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AfricasTalking = require('africastalking')
    const at = AfricasTalking({ apiKey, username })

    const recipients = Array.isArray(to) ? to : [to]
    const result = await at.SMS.send({
      to: recipients,
      message,
      from: process.env.AT_SENDER_ID,
    })

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error('SMS error:', error)
    return NextResponse.json(
      { error: error.message || 'SMS failed' },
      { status: 500 }
    )
  }
}