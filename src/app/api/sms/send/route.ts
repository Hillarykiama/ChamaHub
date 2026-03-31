import { NextResponse } from 'next/server'
import { sendSMS } from '@/lib/mpesa/sms'

export async function POST(req: Request) {
  try {
    const { to, message } = await req.json()

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // to must be an array e.g. ['+254712345678']
    const recipients = Array.isArray(to) ? to : [to]

    const result = await sendSMS(recipients, message)

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error: any) {
    console.error('SMS error:', error)
    return NextResponse.json(
      { error: error.message || 'SMS failed' },
      { status: 500 }
    )
  }
}